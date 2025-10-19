export type Player = 'X' | 'O';
export type Cell = Player | undefined;
export type Result = Player | 'Draw' | null;

export const makeBoard = (n: number): Cell[][] => 
  Array.from({ length: n }, () => Array<Cell>(n).fill(undefined));

export const isFull = (board: Cell[][]): boolean => 
  board.every(row => row.every(Boolean));

export const nextPlayer = (player: Player) => 
  player === 'X' ? 'O' : 'X';

export const calculateCellSize = (boardSize: number) => ({
  cellPx: Math.max(30, Math.min(60, 360 / boardSize)),
  fontPx: Math.max(12, Math.min(24, 150 / boardSize))
});

/**
 * Check if the last move at (row, column) wins.
 */
export function checkWinFromLastMove(
  board: Cell[][],
  row: number,
  column: number,
  targetInARow = 5
): 'X' | 'O' | null {
  const player = board[row][column];
  if (!player) return null;

  const size = board.length;
  const directions: Array<[number, number]> = [
    [0, 1],   // horizontal →
    [1, 0],   // vertical ↓
    [1, 1],   // diagonal ↘
    [1, -1],  // diagonal ↙
  ];

  for (const [rowStep, colStep] of directions) {
    let count = 1;

    // forward
    for (
      let r = row + rowStep, c = column + colStep;
      count < targetInARow && r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player;
      r += rowStep, c += colStep
    ) count++;

    // backward
    for (
      let r = row - rowStep, c = column - colStep;
      count < targetInARow && r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player;
      r -= rowStep, c -= colStep
    ) count++;

    if (count >= targetInARow) return player;
  }

  return null;
}