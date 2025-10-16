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