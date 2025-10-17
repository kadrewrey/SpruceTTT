import React, { useState } from 'react';
import { apiService } from './apiService';
import { styles } from './styles';

interface AuthProps {
  onLogin: (username: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || (!isLogin && !nickname.trim())) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await apiService.login(username, password);
      } else {
        await apiService.register(username, password, nickname);
      }
      onLogin(username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
    color: '#2d5a3d',
    fontSize: '16px',
    marginBottom: '1rem',
    outline: 'none',
    backdropFilter: 'blur(10px)',
    fontFamily: 'inherit',
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

  const switchButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#4a7c59',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
  };

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
        {isLogin ? 'Sign in to save your game progress' : 'Create an account to track your wins'}
      </p>

      <form onSubmit={handleSubmit} style={authFormStyle}>
        <h2 style={{ 
          color: '#2d5a3d', 
          marginBottom: '1.5rem', 
          textAlign: 'center',
          fontFamily: 'Literata, serif' 
        }}>
          {isLogin ? 'Sign In' : 'Create Account'}
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          disabled={loading}
        />

        {!isLogin && (
          <input
            type="text"
            placeholder="Nickname (required, max 15 chars)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 15))}
            style={inputStyle}
            disabled={loading}
            maxLength={15}
            required
          />
        )}

        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              ...inputStyle,
              paddingRight: '40px'
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px'
            }}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>

        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#2d5a3d', fontSize: '14px' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={switchButtonStyle}
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
};