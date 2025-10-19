import React from 'react';
import { GameSelect, Button } from './UIComponents';
import { getCellStyle, getGridStyle, colors } from '../utils/styles';
import { Cell, Player, Result } from '../utils/gameUtils';
import { useResponsiveBreakpoints } from '../hooks/useResponsiveBreakpoints';

interface BoardProps {
  board: Cell[][];
  size: number;
  winLen: number;
  player: Player;
  result: Result;
  playerX: any;
  playerO: any;
  totalMoves: number;
  onPlay: (r: number, c: number) => void;
  onReset: (newSize?: number, newWinLen?: number) => void;
  onSizeChange: (newSize: number) => void;
  onWinLenChange: (newWinLen: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  size,
  winLen,
  result,
  playerX,
  playerO,
  totalMoves,
  onPlay,
  onReset,
  onSizeChange,
  onWinLenChange
}) => {
  const { isMobile, isTablet } = useResponsiveBreakpoints();

  // Calculate cell size
  const calculateCellSize = (size: number) => {
    const baseSize = isMobile ? 35 : isTablet ? 40 : 45;
    const cellPx = Math.max(25, Math.min(baseSize, Math.floor(300 / size)));
    const fontPx = Math.max(12, Math.floor(cellPx * 0.6));
    return { cellPx, fontPx };
  };

  const { cellPx, fontPx } = calculateCellSize(size);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      flex: isMobile ? '1 1 auto' : 'none',
      width: isMobile ? '100%' : 'auto'
    }}>
      
      {/* Integrated Game Board with Header */}
      <div style={{
        background: colors.glassMorphismLight,
        backdropFilter: 'blur(10px)',
        borderRadius: '8px', // Reduced from 16px (50% less)
        border: 'none',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        width: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? '400px' : 'none'
      }}>
        
        {/* Board Header with Controls */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? '20px' : isTablet ? '30px' : '40px',
          padding: isMobile ? '12px 16px' : '16px 24px',
          background: colors.glassMorphismMedium,
          borderBottom: `1px solid ${colors.borderLight}`,
          backdropFilter: 'blur(15px)'
        }}>
          <GameSelect
            value={size}
            onChange={onSizeChange}
            disabled={!playerX || !playerO || totalMoves > 0}
            label="Board Size"
            options={Array.from({ length: 13 }, (_, i) => i + 3).map(n => ({
              value: n,
              label: `${n}×${n}`
            }))}
            minWidth="70px"
          />

          <GameSelect
            value={winLen}
            onChange={onWinLenChange}
            disabled={!playerX || !playerO || totalMoves > 0}
            label="Win Mode"
            options={Array.from({ length: Math.min(size, 10) - 2 }, (_, i) => i + 3).map(k => ({
              value: k,
              label: `${k} to win`
            }))}
            minWidth="85px"
          />
        </div>

        {/* Game Board Grid */}
        <div style={{
          ...getGridStyle(size, cellPx),
          padding: isMobile ? '10px' : isTablet ? '15px' : '20px',
          background: 'transparent'
        }}>
          {board.map((row, i) =>
            row.map((cell, j) => {
              const cellKey = `${i}-${j}`;
              const disabled = !!result || !playerX || !playerO;
              const isEmptyAndActive = !cell && !disabled;
              
              return (
                <button
                  key={cellKey}
                  onClick={() => onPlay(i, j)}
                  disabled={disabled}
                  className={isEmptyAndActive ? 'cell-hoverable' : ''}
                  style={{
                    ...getCellStyle(cell, cellPx, fontPx, disabled),
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cell}
                </button>
              );
            })
          )}
        </div>
      </div>
      
      {/* New Game Button below board */}
      <button
        onClick={() => onReset()} 
        className="new-game-button"
        style={{
          marginTop: '20px',
          background: 'white',
          color: 'black',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          minHeight: '36px',
          minWidth: '80px'
        }}
      >
        New Game
      </button>
    </div>
  );
};