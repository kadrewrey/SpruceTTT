import React from 'react';
import { styles, colors } from '../utils/styles';
import { Player, Result } from '../utils/gameUtils';
import { getCurrentPlayerInfo, getGameStatusInfo } from '../utils/gameLogic';

interface GameStatusProps {
  result: Result;
  player: Player;
  totalMoves: number;
  playerX: any;
  playerO: any;
  gameSaved: boolean;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  result,
  player,
  totalMoves,
  playerX,
  playerO,
  gameSaved
}) => {
  const currentPlayerInfo = getCurrentPlayerInfo(player, playerX, playerO);
  const gameStatusInfo = getGameStatusInfo(result, playerX, playerO, gameSaved);

  return (
    <div style={result ? styles.statusWin : styles.statusNormal}>
      {gameStatusInfo.isGameOver ? (
        <div style={{ textAlign: 'center' }}>
          {gameStatusInfo.message}
          {gameStatusInfo.saveStatus && (
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              {gameStatusInfo.saveStatus}
            </div>
          )}
        </div>
      ) : !gameStatusInfo.playersReady ? (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.subheader}>
            {gameStatusInfo.message}
          </div>
          {gameStatusInfo.subMessage && (
            <div style={{ ...styles.bodyText, marginTop: '4px' }}>
              {gameStatusInfo.subMessage}
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>{currentPlayerInfo.name || `Player ${player}`}'s turn</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: player === 'X' ? colors.playerX : colors.playerO,
              color: colors.white,
              border: `2px solid ${colors.borderMedium}`,
              fontFamily: "'Manrope', sans-serif"
            }}>
              {player}
            </span>
          </div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            Moves: {totalMoves}
          </div>
        </div>
      )}
    </div>
  );
};