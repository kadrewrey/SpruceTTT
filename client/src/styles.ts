// Design system
export const colors = {
  primary: '#103930',
  accent: '#79DB8E',
  accentHover: '#6BC77E',
  white: '#ffffff',
  playerX: 'rgba(239, 68, 68, 0.8)', // red with opacity
  playerO: 'rgba(59, 130, 246, 0.8)', // blue with opacity
  whiteTransparent: 'rgba(255, 255, 255, 0.7)',
} as const;

// Reusable patterns
const glassMorphism = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
} as const;

const button = {
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: 600,
} as const;

const input = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 12,
  padding: '8px 12px',
  color: colors.white,
  outline: 'none',
} as const;

// Component styles
export const styles = {
  // Layout
  container: {
    minHeight: '100vh',
    backgroundColor: colors.primary,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
    alignItems: 'center',
    padding: 32,
    color: colors.white,
  },

  // Typography
  logo: {
    width: '200px',
    height: 'auto',
    marginBottom: '1rem',
  },

  title: {
    fontSize: 48,
    fontWeight: 700,
    fontFamily: "'Literata', serif",
    color: colors.white,
    margin: 0,
  },

  instructions: {
    textAlign: 'center' as const,
    color: colors.whiteTransparent,
    maxWidth: '28rem',
    fontSize: 14,
  },

  statusNormal: {
    fontSize: 24,
    fontWeight: 500,
    color: colors.white,
  },

  statusWin: {
    fontSize: 30,
    fontWeight: 700,
    color: colors.white,
  },

  // Panels
  controlPanel: {
    ...glassMorphism,
    display: 'flex',
    gap: 16,
    padding: 24,
  },

  gameBoard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    border: 'none',
    borderRadius: 0,
    display: 'grid',
    gap: 8,
    padding: 24,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Inputs
  select: {
    ...input,
  },

  selectOption: {
    backgroundColor: colors.primary,
    color: colors.white,
  },

  // Buttons
  resetButton: {
    ...button,
    backgroundColor: colors.accent,
    color: colors.primary,
    padding: '8px 24px',
  },

  resetButtonHover: {
    backgroundColor: colors.accentHover,
  },

  // Game cells
  cellBase: {
    ...button,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },

  cellEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: colors.white,
  },

  cellEmptyHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'scale(1.05)',
  },

  cellX: {
    backgroundColor: colors.playerX,
    color: colors.white,
  },

  cellO: {
    backgroundColor: colors.playerO,
    color: colors.white,
  },

  cellDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
} as const;

import { Cell } from './gameUtils';

// Utility functions
export const getCellStyle = (
  cell: Cell,
  cellPx: number,
  fontPx: number,
  isDisabled: boolean,
  isHovered: boolean = false
) => ({
  ...styles.cellBase,
  width: cellPx,
  height: cellPx,
  fontSize: fontPx,
  ...(cell === 'X' ? styles.cellX : 
      cell === 'O' ? styles.cellO : 
      styles.cellEmpty),
  ...(isDisabled ? styles.cellDisabled : {}),
  ...(isHovered && !cell && !isDisabled ? styles.cellEmptyHover : {}),
});

export const getGridStyle = (size: number, cellPx: number) => ({
  ...styles.gameBoard,
  gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
});