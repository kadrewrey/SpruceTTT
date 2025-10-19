import { PlayerState } from './types';
import { Result, Player } from './gameUtils';
import { apiService } from '../services/apiService';

// Utility functions for game state management
export const updatePlayerState = (
  players: { X: PlayerState; O: PlayerState },
  playerType: 'X' | 'O',
  updates: Partial<PlayerState>
) => ({
  ...players,
  [playerType]: { ...players[playerType], ...updates }
});

export const updatePlayerAuth = (
  players: { X: PlayerState; O: PlayerState },
  playerType: 'X' | 'O',
  authUpdates: Partial<any>
) => ({
  ...players,
  [playerType]: {
    ...players[playerType],
    auth: { ...players[playerType].auth, ...authUpdates }
  }
});

// Game result saving logic
export const saveGameResult = async (
  gameResult: Result,
  moves: number,
  duration: number,
  size: number,
  playerX: any,
  playerO: any,
  gameSaved: boolean
): Promise<boolean> => {
  if (gameSaved || !playerX || !playerO) return false;

  try {
    const winner = gameResult === 'Draw' ? null : gameResult;
    
    console.log('Saving game result:', {
      gameResult,
      winner,
      winnerName: winner === 'X' ? playerX.name : winner === 'O' ? playerO.name : null,
      playerXName: playerX.name,
      playerOName: playerO.name
    });
    
    await apiService.saveGame({
      boardSize: size,
      isWin: gameResult !== 'Draw' && gameResult !== null,
      moves,
      duration: Math.floor(duration / 1000),
      winnerId: winner === 'X' ? playerX.id : winner === 'O' ? playerO.id : undefined,
      playerXId: playerX.id,
      playerOId: playerO.id,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

// Stats refreshing logic
export const refreshPlayerStats = async (
  playerX: any,
  playerO: any,
  updatePlayer: (playerType: 'X' | 'O', updates: Partial<PlayerState>) => void
) => {
  if (!playerX || !playerO) return;

  const refreshPlayerTypeStats = async (player: any, playerType: 'X' | 'O') => {
    try {
      const statsResponse = await apiService.getUserStats(player.id);
      updatePlayer(playerType, { stats: statsResponse.stats });
    } catch (error) {
      console.error(`Error refreshing Player ${playerType} stats:`, error);
    }
  };

  await Promise.all([
    refreshPlayerTypeStats(playerX, 'X'),
    refreshPlayerTypeStats(playerO, 'O')
  ]);
};

// Current player helpers
export const getCurrentPlayerInfo = (
  player: Player,
  playerX: any,
  playerO: any
) => {
  const currentPlayerData = player === 'X' ? playerX : playerO;
  return {
    name: currentPlayerData?.nickname || currentPlayerData?.name,
    isGuest: currentPlayerData?.isGuest
  };
};

// Game status helpers
export const getGameStatusInfo = (
  result: Result,
  playerX: any,
  playerO: any,
  gameSaved: boolean
) => {
  if (result) {
    return {
      isGameOver: true,
      message: result === 'Draw' 
        ? '🤝 Draw!' 
        : `🎉 ${result === 'X' ? (playerX?.name || 'Player X') : (playerO?.name || 'Player O')} Wins!`,
      saveStatus: (playerX && playerO) ? (gameSaved ? '✅ Game saved!' : 'Saving game...') : ''
    };
  }
  
  if (!playerX || !playerO) {
    return {
      isGameOver: false,
      message: '⏳ Waiting for players...',
      subMessage: 'Both players must login or select guest to start'
    };
  }
  
  return {
    isGameOver: false,
    playersReady: true
  };
};