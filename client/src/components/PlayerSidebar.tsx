import React from 'react';
import { FormInput, PasswordInput, Button, ErrorMessage } from './UIComponents';
import { authService, AuthServiceCallbacks } from '../services/authService';
import { PlayerState, PlayerAuthState } from '../utils/types';
import { colors } from '../utils/styles';
import { GameStats } from '../services/apiService';
import { GamePlayer } from '../utils/types';
import { useResponsiveBreakpoints } from '../hooks/useResponsiveBreakpoints';

interface PlayerSidebarProps {
  playerState: PlayerState;
  isPlayerX: boolean;
  updatePlayer: (playerType: 'X' | 'O', updates: Partial<PlayerState>) => void;
  updatePlayerAuth: (playerType: 'X' | 'O', authUpdates: Partial<PlayerAuthState>) => void;
  reset: () => void;
  currentPlayer: 'X' | 'O';
}

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({
  playerState,
  isPlayerX,
  updatePlayer,
  updatePlayerAuth,
  reset,
  currentPlayer
}) => {
  const playerType = isPlayerX ? 'X' : 'O';
  const { player, stats, auth } = playerState;
  const isCurrentPlayer = currentPlayer === playerType;
  const { isMobile, isTablet } = useResponsiveBreakpoints();

  // Auth service callbacks
  const authCallbacks: AuthServiceCallbacks = {
    updatePlayer,
    updatePlayerAuth,
    reset
  };

  const handlePlayerAuth = (authData: PlayerAuthState) => 
    authService.handlePlayerAuth(isPlayerX, authData, authCallbacks);

  const handleGuestLogin = () => 
    authService.handleGuestLogin(isPlayerX, authCallbacks);

  const handleLogout = () => 
    authService.handleLogout(isPlayerX, authCallbacks);

  const renderPlayerTitle = () => (
    <div style={{
      fontSize: '20px',
      fontWeight: 'bold',
      color: colors.white,
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontFamily: "'Literata', serif"
    }}>
      Player 
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '4px',
        fontSize: '18px',
        fontWeight: '700',
        backgroundColor: playerType === 'X' ? colors.playerX : colors.playerO,
        color: colors.white,
        border: `2px solid ${colors.borderMedium}`,
        fontFamily: "'Manrope', sans-serif"
      }}>
        {playerType}
      </span>
    </div>
  );

  const renderPlayerAuth = () => {
    if (!auth.showLogin) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          {renderPlayerTitle()}
          <Button
            onClick={() => updatePlayerAuth(playerType, { showLogin: true, isLoginMode: true, username: '', password: '', nickname: '', error: '' })}
            variant="primary"
            style={{ marginBottom: '0.5rem' }}
          >
            Login
          </Button>
          <div style={{ color: 'white', fontSize: '12px', marginBottom: '0.25rem' }}>Or</div>
          <Button
            onClick={() => updatePlayerAuth(playerType, { showLogin: true, isLoginMode: false, username: '', password: '', nickname: '', error: '' })}
            variant="link"
            style={{ marginBottom: '0.25rem' }}
          >
            Register
          </Button>
          <Button
            onClick={handleGuestLogin}
            variant="link"
          >
            Play as guest
          </Button>
        </div>
      );
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
          {auth.isLoginMode ? 'Login' : 'Register'}
        </div>

        <FormInput
          type="text"
          placeholder="Email address"
          value={auth.username}
          onChange={(value) => updatePlayerAuth(playerType, { username: value, error: '' })}
        />

        {!auth.isLoginMode && (
          <FormInput
            type="text"
            placeholder="Nickname (required, max 15 chars)"
            value={auth.nickname}
            onChange={(value) => updatePlayerAuth(playerType, { nickname: value.slice(0, 15), error: '' })}
            maxLength={15}
            required
          />
        )}

        <PasswordInput
          placeholder="Password"
          value={auth.password}
          onChange={(value) => updatePlayerAuth(playerType, { password: value, error: '' })}
          showPassword={auth.showPassword}
          onTogglePassword={() => updatePlayerAuth(playerType, { showPassword: !auth.showPassword })}
        />

        {auth.error && (
          <ErrorMessage message={auth.error} />
        )}

        <Button
          onClick={() => handlePlayerAuth(auth)}
          disabled={auth.isLoading || !auth.username || !auth.password || (!auth.isLoginMode && !auth.nickname)}
          loading={auth.isLoading}
          variant="primary"
        >
          {auth.isLoginMode ? 'Login' : 'Register'}
        </Button>

        <div style={{ color: 'white', fontSize: '12px', textAlign: 'center', marginTop: '0.5rem' }}>Or</div>
        
        <Button
          onClick={() => updatePlayerAuth(playerType, { isLoginMode: !auth.isLoginMode, username: '', password: '', nickname: '', error: '' })}
          variant="link"
          style={{ marginBottom: '0.25rem' }}
        >
          {auth.isLoginMode ? 'Register' : 'Login'}
        </Button>

        <Button
          onClick={() => {
            handleGuestLogin();
            updatePlayerAuth(playerType, { showLogin: false, username: '', password: '', error: '' });
          }}
          variant="link"
        >
          Play as guest
        </Button>
      </div>
    );
  };

  return (
    <div style={{
      background: colors.glassMorphismLight,
      backdropFilter: 'blur(20px)',
      border: isCurrentPlayer ? `3px solid ${colors.borderStrong}` : '3px solid transparent',
      borderRadius: '10px',
      padding: '1.5rem 1rem',
      textAlign: 'center',
      width: isMobile ? '280px' : isTablet ? '270px' : '270px',
      minWidth: isMobile ? '260px' : '250px',
      maxWidth: isMobile ? '320px' : '300px',
      transition: 'all 0.3s ease',
      boxShadow: isCurrentPlayer ? `0 0 20px ${colors.borderMedium}` : '0 8px 32px rgba(0, 0, 0, 0.1)',
      margin: '10px',
      flex: isMobile ? '1 1 auto' : 'none',
    }}>
      {player ? (
        <>
          {renderPlayerTitle()}
          <div style={{ fontSize: '16px', color: colors.white, marginBottom: '12px' }}>
            {player.nickname || player.name}
            {player.isGuest && <div style={{ fontSize: '12px', opacity: 0.7 }}>(Guest)</div>}
          </div>
          {stats && (
            <div style={{ 
              fontSize: '12px', 
              color: colors.textSecondary, 
              marginBottom: '12px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '2px 8px',
              textAlign: 'left',
              fontFamily: 'monospace'
            }}>
              <span>Won:</span>
              <span style={{ textAlign: 'right' }}>{stats.wins}</span>
              <span>Drawn:</span>
              <span style={{ textAlign: 'right' }}>{stats.draws}</span>
              <span>Lost:</span>
              <span style={{ textAlign: 'right' }}>{stats.losses}</span>
              <span>Win Ratio:</span>
              <span style={{ textAlign: 'right' }}>{stats.winRate.toFixed(0)}%</span>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="primary"
            style={{
              fontSize: '12px',
              padding: '6px 12px',
            }}
          >
            {player.isGuest ? 'Logout Guest' : 'Logout'}
          </Button>
        </>
      ) : (
        renderPlayerAuth()
      )}
    </div>
  );
};