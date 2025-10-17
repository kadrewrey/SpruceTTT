import React, { useState } from 'react';
import { apiService } from './apiService';
import { styles } from './styles';

interface Player {
  name: string;
  isAuthenticated: boolean;
  isGuest: boolean;
}

interface TwoPlayerAuthProps {
  onPlayersReady: (playerX: Player, playerO: Player) => void;
}

const generateGuestName = (): string => {
  const adjectives = ['Quick', 'Smart', 'Cool', 'Fast', 'Clever', 'Sharp', 'Bold', 'Swift', 'Bright', 'Wise'];
  const nouns = ['Player', 'Gamer', 'Champion', 'Pro', 'Star', 'Hero', 'Master', 'Ace', 'Expert', 'Wizard'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`;
};

export const TwoPlayerAuth: React.FC<TwoPlayerAuthProps> = ({ onPlayersReady }) => {
  const [step, setStep] = useState<'player1' | 'player2'>('player1');
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player1Auth, setPlayer1Auth] = useState({ username: '', password: '', isLogin: true });
  const [player2Auth, setPlayer2Auth] = useState({ username: '', password: '', isLogin: true });
  const [showPlayer1Password, setShowPlayer1Password] = useState(false);
  const [showPlayer2Password, setShowPlayer2Password] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authFormStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    margin: '0 auto',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '16px',
    marginBottom: '1rem',
    outline: 'none',
    backdropFilter: 'blur(10px)',
    fontFamily: 'inherit',
  };

  const passwordContainerStyle = {
    position: 'relative' as const,
    width: '100%',
    marginBottom: '1rem',
  };

  const passwordInputStyle = {
    ...inputStyle,
    paddingRight: '45px',
    marginBottom: '0',
  };

  const eyeButtonStyle = {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4a7c59 0%, #2d5a3d 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
    opacity: loading ? 0.6 : 1,
    fontFamily: 'inherit',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(74, 124, 89, 0.3)',
    marginBottom: '0.5rem',
  };

  const toggleButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
  };

  const handlePlayerAuth = async (playerData: typeof player1Auth, isLogin: boolean = playerData.isLogin) => {
    if (isLogin) {
      return await apiService.login(playerData.username, playerData.password);
    } else {
      return await apiService.register(playerData.username, playerData.password);
    }
  };

  const handlePlayer1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1Auth.username.trim() || !player1Auth.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await handlePlayerAuth(player1Auth);
      const newPlayer1: Player = {
        name: response.user.username,
        isAuthenticated: true,
        isGuest: false,
      };
      setPlayer1(newPlayer1);
      setStep('player2');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayer2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player2Auth.username.trim() || !player2Auth.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await handlePlayerAuth(player2Auth);
      const player2: Player = {
        name: response.user.username,
        isAuthenticated: true,
        isGuest: false,
      };

      if (player1) {
        onPlayersReady(player1, player2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestPlayer = async () => {
    if (!player1) return;

    setLoading(true);
    setError('');

    try {
      const guestName = generateGuestName();
      const guestResponse = await apiService.registerGuest(guestName);
      const player2: Player = {
        name: guestResponse.user.username,
        isAuthenticated: true,
        isGuest: true,
      };

      onPlayersReady(player1, player2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPlayer1 = () => {
    setStep('player1');
    setPlayer1(null);
    setError('');
  };

  if (step === 'player1') {
    return (
      <div style={styles.container}>
        <img 
          src="https://framerusercontent.com/images/23WDendG9hOpLPQyYHHOoDAk2Y.svg?width=500&height=104"
          alt="Spruce Logo"
          style={styles.logo}
        />

        <h1 style={styles.title}>
          Welcome to Spruce Tic Tac Toe
        </h1>

        <p style={styles.instructions}>
          Step 1: Player X (goes first) - Sign in or create an account
        </p>

        <form onSubmit={handlePlayer1Submit} style={authFormStyle}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '1.5rem', 
            textAlign: 'center',
            fontFamily: 'Literata, serif' 
          }}>
            Player X Login
          </h2>

          {error && (
            <div style={{
              background: 'rgba(220, 53, 69, 0.1)',
              color: '#dc3545',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Username"
            value={player1Auth.username}
            onChange={(e) => setPlayer1Auth({...player1Auth, username: e.target.value})}
            style={inputStyle}
            disabled={loading}
          />

          <div style={passwordContainerStyle}>
            <input
              type={showPlayer1Password ? "text" : "password"}
              placeholder="Password"
              value={player1Auth.password}
              onChange={(e) => setPlayer1Auth({...player1Auth, password: e.target.value})}
              style={passwordInputStyle}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPlayer1Password(!showPlayer1Password)}
              style={eyeButtonStyle}
              disabled={loading}
            >
              {showPlayer1Password ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Signing in...' : (player1Auth.isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>
              {player1Auth.isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setPlayer1Auth({...player1Auth, isLogin: !player1Auth.isLogin});
                setError('');
              }}
              style={toggleButtonStyle}
            >
              {player1Auth.isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Player 2 setup
  return (
    <div style={styles.container}>
      <img 
        src="https://framerusercontent.com/images/23WDendG9hOpLPQyYHHOoDAk2Y.svg?width=500&height=104"
        alt="Spruce Logo"
        style={styles.logo}
      />

      <h1 style={styles.title}>
        Welcome Back, {player1?.name}!
      </h1>

      <p style={styles.instructions}>
        Step 2: Choose Player O (goes second)
      </p>

      <div style={authFormStyle}>
        <h2 style={{ 
          color: 'white', 
          marginBottom: '1.5rem', 
          textAlign: 'center',
          fontFamily: 'Literata, serif' 
        }}>
          Player O Setup
        </h2>

        {error && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.1)',
            color: '#dc3545',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Guest Player Option */}
        <button 
          type="button"
          onClick={handleGuestPlayer}
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? 'Creating guest player...' : '🎲 Play Against Guest Player'}
        </button>

        <div style={{
          textAlign: 'center',
          margin: '1rem 0',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          OR
        </div>

        {/* Player 2 Login Form */}
        <form onSubmit={handlePlayer2Submit}>
          <input
            type="text"
            placeholder="Player 2 Username"
            value={player2Auth.username}
            onChange={(e) => setPlayer2Auth({...player2Auth, username: e.target.value})}
            style={inputStyle}
            disabled={loading}
          />

          <div style={passwordContainerStyle}>
            <input
              type={showPlayer2Password ? "text" : "password"}
              placeholder="Player 2 Password"
              value={player2Auth.password}
              onChange={(e) => setPlayer2Auth({...player2Auth, password: e.target.value})}
              style={passwordInputStyle}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPlayer2Password(!showPlayer2Password)}
              style={eyeButtonStyle}
              disabled={loading}
            >
              {showPlayer2Password ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" style={secondaryButtonStyle} disabled={loading}>
            {loading ? 'Signing in...' : (player2Auth.isLogin ? '👤 Sign In Player 2' : '✨ Create Player 2 Account')}
          </button>

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>
              {player2Auth.isLogin ? "Player 2 needs an account? " : "Player 2 has an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setPlayer2Auth({...player2Auth, isLogin: !player2Auth.isLogin});
                setError('');
              }}
              style={toggleButtonStyle}
            >
              {player2Auth.isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Back Button */}
        <button 
          type="button"
          onClick={handleBackToPlayer1}
          style={{
            ...secondaryButtonStyle,
            background: 'rgba(220, 53, 69, 0.1)',
            color: '#dc3545',
            border: '1px solid rgba(220, 53, 69, 0.3)',
          }}
          disabled={loading}
        >
          ← Back to Player X
        </button>
      </div>
    </div>
  );
};