import React, { useState } from 'react';
import { checkWinFromLastMove } from './utils';
import { makeBoard, isFull, nextPlayer, calculateCellSize, Cell, Result, Player } from './gameUtils';
import { styles, getCellStyle, getGridStyle } from './styles';

export const Main = () => {
  const [size, setSize] = useState(3);
  const [winLen, setWinLen] = useState(3);
  const [board, setBoard] = useState<Cell[][]>(() => makeBoard(3));
  const [player, setPlayer] = useState<Player>('X');
  const [result, setResult] = useState<Result>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const { cellPx, fontPx } = calculateCellSize(size);

  const reset = (n = size, k = winLen) => {
    setBoard(makeBoard(n));
    setPlayer('X');
    setResult(null);
    setSize(n);
    setWinLen(Math.min(k, n));
  };

  const play = (r: number, c: number) => {
    //If there is already a result or the cell is occupied, do nothing
    if (result || board[r][c]) return;

    // Make a copy of the board and play the move
    const b = board.map(row => row.slice());
    b[r][c] = player;
    // Update state
    setBoard(b);

    const win = checkWinFromLastMove(b, r, c, winLen);
    // Check for win or draw
    if (win) setResult(win);
    else if (isFull(b)) setResult('Draw');
    else setPlayer(nextPlayer(player));
  };

  return (
    <div style={styles.container}>
       {/* Add logo */}
      <img 
        src="https://framerusercontent.com/images/23WDendG9hOpLPQyYHHOoDAk2Y.svg?width=500&height=104"
        alt="Spruce Logo"
        style={styles.logo}
      />

{/* Add title */}
      <h1 style={styles.title}>
        Tic Tac Toe
      </h1>

{/* Add instructions */}
      <p style={styles.instructions}>
        Select board size (3×3 to 15×15) and win condition. Click cells to play!
      </p>


{/* Control panel */}
      <div style={styles.controlPanel}>
        <select 
          value={size} 
          onChange={e => reset(+e.target.value, winLen)}
          style={styles.select}
        >
          {Array.from({ length: 13 }, (_, i) => i + 3).map(n => (
            <option key={n} value={n} style={styles.selectOption}>{n}×{n}</option>
          ))}
        </select>


{/* Win condition */}
        <select 
          value={winLen} 
          onChange={e => setWinLen(Math.min(+e.target.value, size))}
          style={styles.select}
        >
          {Array.from({ length: Math.min(size, 10) - 2 }, (_, i) => i + 3).map(k => (
            <option key={k} value={k} style={styles.selectOption}>{k} to win</option>
          ))}
        </select>

        <button 
          onClick={() => reset()} 
          style={{
            ...styles.resetButton,
            ...(hoveredButton === 'reset' ? styles.resetButtonHover : {})
          }}
          onMouseEnter={() => setHoveredButton('reset')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Reset
        </button>
      </div>
{/* If there is a result show result  */}
      <div style={result ? styles.statusWin : styles.statusNormal}>
        {result ? (result === 'Draw' ? '🤝 Draw!' : `🎉 ${result} Wins!`) : <>Player: <strong>{player}</strong></>}
      </div>

      <div style={getGridStyle(size, cellPx)}>
        {board.map((row, i) =>
          row.map((cell, j) => {
            const cellKey = `${i}-${j}`;
            const isHovered = hoveredCell === cellKey;
            const disabled = !!result;
            
            return (
              <button
                key={cellKey}
                onClick={() => play(i, j)}
                disabled={disabled}
                style={getCellStyle(cell, cellPx, fontPx, disabled, isHovered)}
                onMouseEnter={() => !cell && !result && setHoveredCell(cellKey)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {cell}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
