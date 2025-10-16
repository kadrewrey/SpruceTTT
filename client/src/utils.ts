import { Cell } from './types';

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