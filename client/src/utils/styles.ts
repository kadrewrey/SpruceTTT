// Ultra-minimal colors - consolidated from 25+ to 12 essential colors
export const colors = {
  primary: '#103930',
  accent: '#79DB8E',
  white: '#fff',
  red: '#ef4444',
  blue: '#3b82f6',
  
  // Player colors
  playerX: 'rgba(239, 68, 68, 0.8)',
  playerO: 'rgba(59, 130, 246, 0.8)',
  
  // Glass effects - only 2 opacity levels
  glass: 'rgba(255, 255, 255, 0.1)',      
  glassDark: 'rgba(255, 255, 255, 0.2)',  
  
  // Text - only 2 opacity levels  
  text: 'rgba(255, 255, 255, 0.9)',       
  textSoft: 'rgba(255, 255, 255, 0.7)',   
  
  // Border - only 1 opacity level
  border: 'rgba(255, 255, 255, 0.3)',
  
  // Error - only 1 background
  errorBg: 'rgba(239, 68, 68, 0.1)',
  
  // Backward compatibility aliases (will be removed when components are updated)
  accentHover: '#6BC77E',
  glassMorphismLight: 'rgba(255, 255, 255, 0.1)',
  glassMorphismMedium: 'rgba(255, 255, 255, 0.15)', 
  glassMorphismDark: 'rgba(255, 255, 255, 0.2)',
  glassMorphismInput: 'rgba(255, 255, 255, 0.2)',
  textPrimary: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textTertiary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  borderLight: 'rgba(255, 255, 255, 0.2)', 
  borderMedium: 'rgba(255, 255, 255, 0.3)',
  borderStrong: 'rgba(255, 255, 255, 0.8)',
  error: '#ef4444',
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',
  success: '#22c55e',
  whiteTransparent: 'rgba(255, 255, 255, 0.7)',
} as const;

// Ultra-minimal styles using only essential colors
export const styles = {
  container: { minHeight: '100vh', backgroundColor: colors.primary, display: 'flex', flexDirection: 'column' as const, gap: 24, alignItems: 'center', padding: 32, color: colors.white, fontFamily: "'Manrope', sans-serif" },
  title: { fontSize: 48, fontWeight: 700, fontFamily: "'Literata', serif", color: colors.white, margin: 0 },
  subheader: { fontFamily: "'Literata', serif", fontWeight: 'bold', color: colors.textSoft, fontSize: 16 },
  bodyText: { fontFamily: "'Manrope', sans-serif", color: colors.textSoft, fontSize: 16, lineHeight: 1.4 },
  labelText: { fontFamily: "'Manrope', sans-serif", color: colors.text, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px', opacity: 0.9 },
  instructions: { textAlign: 'center' as const, color: colors.textSoft, maxWidth: '28rem', fontSize: 14 },
  statusNormal: { fontSize: 24, fontWeight: 500, color: colors.white },
  statusWin: { fontSize: 30, fontWeight: 700, color: colors.white },
  gameBoard: { backgroundColor: colors.glass, backdropFilter: 'blur(8px)', border: 'none', borderRadius: 0, display: 'grid', gap: 8, padding: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  resetButton: { border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, backgroundColor: colors.accent, color: colors.primary, padding: '8px 24px' },
  cellBase: { border: `2px solid ${colors.border}`, borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cellEmpty: { backgroundColor: colors.glassDark, color: colors.white },
  cellEmptyHover: { backgroundColor: colors.border, transform: 'scale(1.05)' },
  cellX: { backgroundColor: colors.playerX, color: colors.white },
  cellO: { backgroundColor: colors.playerO, color: colors.white },
  cellDisabled: { opacity: 0.7, cursor: 'not-allowed' },
  logo: { width: '200px', height: 'auto', marginBottom: '1rem' },
  authForm: { background: colors.glass, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '2rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', maxWidth: '400px', width: '100%', margin: '0 auto' },
  authTitle: { color: colors.primary, marginBottom: '1.5rem', textAlign: 'center' as const, fontFamily: "'Literata', serif", fontSize: 24, fontWeight: 600 },
  authInput: { width: '100%', padding: '12px 16px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.glass, color: colors.primary, fontSize: '16px', marginBottom: '1rem', outline: 'none', backdropFilter: 'blur(10px)', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  authInputWithButton: { paddingRight: '40px' },
  authPasswordToggle: { position: 'absolute' as const, right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: colors.textSoft, cursor: 'pointer', fontSize: '14px', padding: '4px' },
  authButton: { width: '100%', padding: '12px 24px', borderRadius: '6px', border: 'none', background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`, color: colors.white, fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '1rem', fontFamily: 'inherit' },
  authButtonDisabled: { cursor: 'not-allowed', opacity: 0.6 },
  authError: { background: colors.errorBg, color: colors.red, padding: '12px', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' as const, fontSize: '14px' },
  authSwitchContainer: { textAlign: 'center' as const },
  authSwitchText: { color: colors.primary, fontSize: '14px' },
  authSwitchButton: { background: 'none', border: 'none', color: colors.accent, textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' },
} as const;

import { Cell } from './gameUtils';

// Utility functions
export const getCellStyle = (
  cell: Cell,
  cellPx: number,
  fontPx: number,
  isDisabled: boolean
) => ({
  ...styles.cellBase,
  width: cellPx,
  height: cellPx,
  fontSize: fontPx,
  ...(cell === 'X' ? styles.cellX : 
      cell === 'O' ? styles.cellO : 
      styles.cellEmpty),
  ...(isDisabled ? styles.cellDisabled : {}),
});

export const getGridStyle = (size: number, cellPx: number) => ({
  ...styles.gameBoard,
  gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
  justifyContent: 'center',
  justifyItems: 'center',
});