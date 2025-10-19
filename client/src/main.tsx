import React, { useState } from 'react';
import { makeBoard, isFull, nextPlayer, checkWinFromLastMove, Cell, Result, Player } from './utils/gameUtils';
import { styles, colors } from './utils/styles';
import { PlayerState, createDefaultPlayerState } from './utils/types';
import { 
  updatePlayerState, 
  updatePlayerAuth as updatePlayerAuthUtil,
  saveGameResult as saveGameResultUtil,
  refreshPlayerStats
} from './utils/gameLogic';
import { PlayerSidebar } from './components/PlayerSidebar';
import { Board } from './components/Board';
import { GameStatus } from './components/GameStatus';
import { useResponsiveBreakpoints } from './hooks/useResponsiveBreakpoints';



export const Main = () => {
  const { isMobile, isTablet } = useResponsiveBreakpoints();

  const [players, setPlayers] = useState<{ X: PlayerState; O: PlayerState }>({
    X: createDefaultPlayerState(),
    O: createDefaultPlayerState()
  });

  // Helper functions for cleaner code
  const updatePlayer = (playerType: 'X' | 'O', updates: Partial<PlayerState>) => {
    setPlayers(prev => updatePlayerState(prev, playerType, updates));
  };

  const updatePlayerAuth = (playerType: 'X' | 'O', authUpdates: Partial<any>) => {
    setPlayers(prev => updatePlayerAuthUtil(prev, playerType, authUpdates));
  };


  const [size, setSize] = useState(3);
  const [winLen, setWinLen] = useState(3);
  const [board, setBoard] = useState<Cell[][]>(() => makeBoard(3));
  const [player, setPlayer] = useState<Player>('X');
  const [result, setResult] = useState<Result>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [totalMoves, setTotalMoves] = useState(0);
  const [gameSaved, setGameSaved] = useState(false);

  const reset = (n = size, k = winLen) => {
    setBoard(makeBoard(n));
    setPlayer('X');
    setResult(null);
    setSize(n);
    setWinLen(Math.min(k, n));
    setGameStartTime(Date.now());
    setTotalMoves(0);
    setGameSaved(false);
  };

  const handleRefreshStats = () => refreshPlayerStats(players.X.player, players.O.player, updatePlayer);

  const handleSaveGameResult = async (gameResult: Result, moves: number, duration: number) => {
    const saved = await saveGameResultUtil(gameResult, moves, duration, size, players.X.player, players.O.player, gameSaved);
    if (saved) {
      setGameSaved(true);
      await handleRefreshStats();
    }
  };

  const play = (r: number, c: number) => {
    // Don't allow play if game is over, cell is occupied, or players aren't ready
    if (result || board[r][c] || !players.X.player || !players.O.player) return;

    const b = board.map(row => row.slice());
    b[r][c] = player;
    const newMoves = totalMoves + 1;
    
    setBoard(b);
    setTotalMoves(newMoves);

    const win = checkWinFromLastMove(b, r, c, winLen);
    if (win) {
      setResult(win);
      const gameDuration = Date.now() - gameStartTime;
      handleSaveGameResult(win, newMoves, gameDuration);
    } else if (isFull(b)) {
      setResult('Draw');
      const gameDuration = Date.now() - gameStartTime;
      handleSaveGameResult('Draw', newMoves, gameDuration);
    } else {
      setPlayer(nextPlayer(player));
    }
  };



  return (
    <div style={styles.container}>
      {/* Header with Logo and Title */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '1rem'
      }}>
        <img 
          src="https://framerusercontent.com/images/23WDendG9hOpLPQyYHHOoDAk2Y.svg?width=500&height=104"
          alt="Spruce Logo"
          style={{
            width: '100px',
            height: 'auto',
            marginBottom: 0
          }}
        />
        <h1 style={{
          ...styles.title,
          margin: 0
        }}>Tic Tac Toe</h1>
      </div>

      {/* Instructions */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        maxWidth: '600px',
        margin: '0 auto 20px auto'
      }}>
        <div style={styles.subheader}>How to play:</div>
        <div style={styles.bodyText}>
          1. Log in, register, or choose to play as a guest.<br/>
          2. Select your board size, and the number of items in a row you need for a win.<br/>
          3. Click on a square to make your selection.
        </div>
      </div>

      {/* Horizontal Divider */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        height: '1px',
        background: `linear-gradient(to right, transparent, ${colors.border}, transparent)`,
        margin: '12px auto',
        opacity: 0.6
      }} />

      <GameStatus
        result={result}
        player={player}
        totalMoves={totalMoves}
        playerX={players.X.player}
        playerO={players.O.player}
        gameSaved={gameSaved}
      />

      {/* Game Layout Container */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: 'center',
        gap: isMobile ? '1rem' : isTablet ? '1.2rem' : '1.5rem',
        width: '100%',
        maxWidth: isMobile ? '100%' : isTablet ? '1000px' : '1200px',
        marginTop: '20px',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        padding: isMobile ? '0 10px' : '0 20px'
      }}>
        
        {/* Player X Sidebar */}
        <PlayerSidebar
          playerState={players.X}
          isPlayerX={true}
          updatePlayer={updatePlayer}
          updatePlayerAuth={updatePlayerAuth}
          reset={reset}
          currentPlayer={player}
        />

        {/* Main Game Board */}
        <Board
          board={board}
          size={size}
          winLen={winLen}
          player={player}
          result={result}
          playerX={players.X.player}
          playerO={players.O.player}
          totalMoves={totalMoves}
          onPlay={play}
          onReset={reset}
          onSizeChange={(newSize) => reset(newSize, winLen)}
          onWinLenChange={(newWinLen) => setWinLen(Math.min(newWinLen, size))}
        />

        {/* Player O Sidebar */}
        <PlayerSidebar
          playerState={players.O}
          isPlayerX={false}
          updatePlayer={updatePlayer}
          updatePlayerAuth={updatePlayerAuth}
          reset={reset}
          currentPlayer={player}
        />
      </div>
    </div>
  );
};
