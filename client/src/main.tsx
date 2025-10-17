import React, { useState, useEffect } from 'react';
import { checkWinFromLastMove } from './utils';
import { makeBoard, isFull, nextPlayer, calculateCellSize, Cell, Result, Player } from './gameUtils';
import { styles, getCellStyle, getGridStyle } from './styles';
import { apiService, GameStats } from './apiService';

interface GamePlayer {
  name: string;
  isAuthenticated: boolean;
  isGuest: boolean;
}

interface PlayerAuthState {
  isLoggedIn: boolean;
  showLogin: boolean;
  username: string;
  password: string;
  showPassword: boolean;
  isLoginMode: boolean;
  isLoading: boolean;
  error: string;
}

export const Main = () => {
  const [playerX, setPlayerX] = useState<GamePlayer | null>(null);
  const [playerO, setPlayerO] = useState<GamePlayer | null>(null);
  const [playerXStats, setPlayerXStats] = useState<GameStats | null>(null);
  const [playerOStats, setPlayerOStats] = useState<GameStats | null>(null);
  const [playerXAuth, setPlayerXAuth] = useState<PlayerAuthState>({
    isLoggedIn: false,
    showLogin: false,
    username: '',
    password: '',
    showPassword: false,
    isLoginMode: true,
    isLoading: false,
    error: ''
  });
  const [playerOAuth, setPlayerOAuth] = useState<PlayerAuthState>({
    isLoggedIn: false,
    showLogin: false,
    username: '',
    password: '',
    showPassword: false,
    isLoginMode: true,
    isLoading: false,
    error: ''
  });
  const [size, setSize] = useState(3);
  const [winLen, setWinLen] = useState(3);
  const [board, setBoard] = useState<Cell[][]>(() => makeBoard(3));
  const [player, setPlayer] = useState<Player>('X');
  const [result, setResult] = useState<Result>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [totalMoves, setTotalMoves] = useState(0);
  const [gameSaved, setGameSaved] = useState(false);

  const { cellPx, fontPx } = calculateCellSize(size);

  const reset = (n = size, k = winLen) => {
    setBoard(makeBoard(n));
    setPlayer('X');
    setResult(null);
    setSize(n);
    setWinLen(Math.min(k, n));
    setGameStartTime(Date.now());
    setTotalMoves(0);
    setGameSaved(false);
  };

  const saveGameResult = async (gameResult: Result, moves: number, duration: number) => {
    if (gameSaved || !playerX || !playerO) return;

    try {
      const winner = gameResult === 'Draw' ? null : gameResult;
      const winnerName = winner === 'X' ? playerX.name : winner === 'O' ? playerO.name : null;
      
      await apiService.saveGame({
        boardSize: size,
        isWin: gameResult !== 'Draw' && gameResult !== null,
        moves,
        duration: Math.floor(duration / 1000),
        winner: winnerName || undefined,
        playerX: playerX.name,
        playerO: playerO.name,
      });
      setGameSaved(true);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  const play = (r: number, c: number) => {
    if (result || board[r][c]) return;

    const b = board.map(row => row.slice());
    b[r][c] = player;
    const newMoves = totalMoves + 1;
    
    setBoard(b);
    setTotalMoves(newMoves);

    const win = checkWinFromLastMove(b, r, c, winLen);
    if (win) {
      setResult(win);
      const gameDuration = Date.now() - gameStartTime;
      saveGameResult(win, newMoves, gameDuration);
    } else if (isFull(b)) {
      setResult('Draw');
      const gameDuration = Date.now() - gameStartTime;
      saveGameResult('Draw', newMoves, gameDuration);
    } else {
      setPlayer(nextPlayer(player));
    }
  };

  const handlePlayersReady = (pX: GamePlayer, pO: GamePlayer) => {
    setPlayerX(pX);
    setPlayerO(pO);
    
    // Fetch player stats
    fetchPlayerStats(pX, pO);
  };

  const handlePlayerAuth = async (isPlayerX: boolean, authData: PlayerAuthState) => {
    const setAuthState = isPlayerX ? setPlayerXAuth : setPlayerOAuth;
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const response = authData.isLoginMode 
        ? await apiService.login(authData.username, authData.password)
        : await apiService.register(authData.username, authData.password);

      const player: GamePlayer = {
        name: response.user.username,
        isAuthenticated: true,
        isGuest: false,
      };

      if (isPlayerX) {
        setPlayerX(player);
        const profileX = await apiService.getProfile();
        setPlayerXStats(profileX.stats);
        setPlayerXAuth(prev => ({ ...prev, isLoggedIn: true, isLoading: false, showLogin: false }));
      } else {
        setPlayerO(player);
        // For Player O, we'll fetch their guest stats if they're a guest, otherwise default stats
        setPlayerOStats({ totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });
        setPlayerOAuth(prev => ({ ...prev, isLoggedIn: true, isLoading: false, showLogin: false }));
      }
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }));
    }
  };

  const handleGuestLogin = async (isPlayerX: boolean) => {
    try {
      const guestName = generateGuestName();
      const guestResponse = await apiService.guestLogin(guestName);
      const player: GamePlayer = {
        name: guestResponse.user.username,
        isAuthenticated: true,
        isGuest: true,
      };

      // Fetch stats for the guest player
      try {
        const statsResponse = await apiService.getGuestStats(guestName);
        const stats = {
          totalGames: statsResponse.stats.totalGames,
          wins: statsResponse.stats.wins,
          losses: statsResponse.stats.losses,
          draws: statsResponse.stats.draws,
          winRate: statsResponse.stats.winRate
        };

        if (isPlayerX) {
          setPlayerX(player);
          setPlayerXStats(stats);
          setPlayerXAuth(prev => ({ ...prev, isLoggedIn: true }));
        } else {
          setPlayerO(player);
          setPlayerOStats(stats);
          setPlayerOAuth(prev => ({ ...prev, isLoggedIn: true }));
        }
      } catch (error) {
        // If stats fetch fails, use default stats
        const defaultStats = { totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 };
        if (isPlayerX) {
          setPlayerX(player);
          setPlayerXStats(defaultStats);
          setPlayerXAuth(prev => ({ ...prev, isLoggedIn: true }));
        } else {
          setPlayerO(player);
          setPlayerOStats(defaultStats);
          setPlayerOAuth(prev => ({ ...prev, isLoggedIn: true }));
        }
      }
    } catch (error) {
      console.error('Error logging in as guest:', error);
      const authState = isPlayerX ? setPlayerXAuth : setPlayerOAuth;
      authState(prev => ({ ...prev, error: 'Failed to login as guest', isLoading: false }));
    }
  };

  const generateGuestName = (): string => {
    const guestPlayers = [
      'EcoWarrior GreenHeart',
      'SolarPump Champion', 
      'GeothermalGuru',
      'HeatWave Hero',
      'EfficientEagle',
      'GreenEnergy Wizard',
      'ThermalThunder',
      'EcoFriendly Phoenix',
      'RenewableRanger',
      'SustainableSage'
    ];
    const randomIndex = Math.floor(Math.random() * guestPlayers.length);
    return guestPlayers[randomIndex];
  };

  const fetchPlayerStats = async (playerXData: GamePlayer, playerOData: GamePlayer) => {
    try {
      // Fetch stats for Player X
      if (playerXData.isGuest) {
        try {
          const statsResponse = await apiService.getGuestStats(playerXData.name);
          setPlayerXStats(statsResponse.stats);
        } catch (error) {
          console.error('Error fetching Player X guest stats:', error);
          setPlayerXStats({ totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });
        }
      } else {
        try {
          const profileX = await apiService.getProfile();
          setPlayerXStats(profileX.stats);
        } catch (error) {
          console.error('Error fetching Player X stats:', error);
          setPlayerXStats({ totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });
        }
      }
      
      // Fetch stats for Player O
      if (playerOData.isGuest) {
        try {
          const statsResponse = await apiService.getGuestStats(playerOData.name);
          setPlayerOStats(statsResponse.stats);
        } catch (error) {
          console.error('Error fetching Player O guest stats:', error);
          setPlayerOStats({ totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });
        }
      } else {
        // For non-guest Player O, we can't fetch their individual stats with current auth system
        setPlayerOStats({ totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });
      }
      
    } catch (error) {
      console.error('Error fetching player stats:', error);
      setPlayerXStats({ totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });
      setPlayerOStats({ totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });
    }
  };

  // Update stats after game ends
  const updateStatsAfterGame = async () => {
    if (!result) return;
    
    // Refresh Player X stats
    if (playerX) {
      try {
        if (playerX.isGuest) {
          const statsResponse = await apiService.getGuestStats(playerX.name);
          setPlayerXStats(statsResponse.stats);
        } else {
          const profileX = await apiService.getProfile();
          setPlayerXStats(profileX.stats);
        }
      } catch (error) {
        console.error('Error updating Player X stats:', error);
      }
    }

    // Refresh Player O stats
    if (playerO) {
      try {
        if (playerO.isGuest) {
          const statsResponse = await apiService.getGuestStats(playerO.name);
          setPlayerOStats(statsResponse.stats);
        } else {
          // For non-guest Player O, we can't fetch their stats since they have a different auth token
          // This would require a different approach in a real app
          console.log('Cannot fetch stats for authenticated Player O with current auth system');
        }
      } catch (error) {
        console.error('Error updating Player O stats:', error);
      }
    }
  };

  // Call updateStatsAfterGame when result changes
  useEffect(() => {
    if (result && gameSaved) {
      updateStatsAfterGame();
    }
  }, [result, gameSaved]);

  const handleLogout = (isPlayerX: boolean) => {
    if (isPlayerX) {
      apiService.logout();
      setPlayerX(null);
      setPlayerXStats(null);
      setPlayerXAuth({
        isLoggedIn: false,
        showLogin: false,
        username: '',
        password: '',
        showPassword: false,
        isLoginMode: true,
        isLoading: false,
        error: ''
      });
    } else {
      setPlayerO(null);
      setPlayerOStats(null);
      setPlayerOAuth({
        isLoggedIn: false,
        showLogin: false,
        username: '',
        password: '',
        showPassword: false,
        isLoginMode: true,
        isLoading: false,
        error: ''
      });
    }
    reset();
  };

  const handleNewGame = () => {
    setPlayerX(null);
    setPlayerO(null);
    setPlayerXStats(null);
    setPlayerOStats(null);
    setPlayerXAuth({
      isLoggedIn: false,
      showLogin: false,
      username: '',
      password: '',
      showPassword: false,
      isLoginMode: true,
      isLoading: false,
      error: ''
    });
    setPlayerOAuth({
      isLoggedIn: false,
      showLogin: false,
      username: '',
      password: '',
      showPassword: false,
      isLoginMode: true,
      isLoading: false,
      error: ''
    });
    reset();
  };

  // Check if both players are ready (either logged in or guests)
  const playersReady = playerX && playerO;

  const renderPlayerAuth = (isPlayerX: boolean) => {
    const authState = isPlayerX ? playerXAuth : playerOAuth;
    const setAuthState = isPlayerX ? setPlayerXAuth : setPlayerOAuth;
    const playerName = isPlayerX ? 'Player X' : 'Player O';

    if (!authState.showLogin) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            {playerName}
          </div>
          <button
            onClick={() => setAuthState({ ...authState, showLogin: true, isLoginMode: true })}
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '0.5rem'
            }}
          >
            Login
          </button>
          <button
            onClick={() => handleGuestLogin(isPlayerX)}
            style={{
              background: 'rgba(107, 114, 128, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Play as Guest
          </button>
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
          {playerName}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => setAuthState({ ...authState, isLoginMode: true, error: '' })}
            style={{
              background: authState.isLoginMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(107, 114, 128, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setAuthState({ ...authState, isLoginMode: false, error: '' })}
            style={{
              background: !authState.isLoginMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(107, 114, 128, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Register
          </button>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={authState.username}
          onChange={(e) => setAuthState({ ...authState, username: e.target.value, error: '' })}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}
        />

        <div style={{ position: 'relative' }}>
          <input
            type={authState.showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={authState.password}
            onChange={(e) => setAuthState({ ...authState, password: e.target.value, error: '' })}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              paddingRight: '40px',
              color: 'white',
              fontSize: '14px',
              width: '100%'
            }}
          />
          <button
            type="button"
            onClick={() => setAuthState({ ...authState, showPassword: !authState.showPassword })}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            {authState.showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        {authState.error && (
          <div style={{
            color: '#ef4444',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {authState.error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handlePlayerAuth(isPlayerX, authState)}
            disabled={authState.isLoading || !authState.username || !authState.password}
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: authState.isLoading || !authState.username || !authState.password ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              flex: 1,
              opacity: authState.isLoading || !authState.username || !authState.password ? 0.6 : 1
            }}
          >
            {authState.isLoading ? 'Loading...' : (authState.isLoginMode ? 'Login' : 'Register')}
          </button>
          <button
            onClick={() => setAuthState({ ...authState, showLogin: false, username: '', password: '', error: '' })}
            style={{
              background: 'rgba(107, 114, 128, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const currentPlayerName = player === 'X' ? playerX?.name : playerO?.name;
  const currentPlayerIsGuest = player === 'X' ? playerX?.isGuest : playerO?.isGuest;

  return (
    <div style={styles.container}>
      <img 
        src="https://framerusercontent.com/images/23WDendG9hOpLPQyYHHOoDAk2Y.svg?width=500&height=104"
        alt="Spruce Logo"
        style={styles.logo}
      />

      <h1 style={styles.title}>Tic Tac Toe</h1>

      {/* Game Layout with Side Player Lozenges */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '2rem',
        width: '100%',
        maxWidth: '1000px',
        justifyContent: 'center'
      }}>
        
        {/* Player X Lozenge */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: player === 'X' ? '3px solid rgba(255, 255, 255, 0.8)' : '3px solid transparent',
          borderRadius: '20px',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          width: '180px', // Fixed width for balance
          transition: 'all 0.3s ease',
          boxShadow: player === 'X' ? '0 0 20px rgba(255, 255, 255, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
          margin: '10px', // Add consistent margin to accommodate glow
          marginTop: '60px', // Align with game board (after control panel)
        }}>
          {playerX ? (
            <>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: 'white',
                marginBottom: '8px'
              }}>
                Player X
              </div>
              <div style={{ fontSize: '16px', color: 'white', marginBottom: '12px' }}>
                {playerX.name}
                {playerX.isGuest && <div style={{ fontSize: '12px', opacity: 0.7 }}>(Guest)</div>}
              </div>
              {playerXStats && (
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  marginBottom: '12px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '2px 8px',
                  textAlign: 'left',
                  fontFamily: 'monospace'
                }}>
                  <span>Won:</span>
                  <span style={{ textAlign: 'right' }}>{playerXStats.wins}</span>
                  <span>Drawn:</span>
                  <span style={{ textAlign: 'right' }}>{playerXStats.draws}</span>
                  <span>Lost:</span>
                  <span style={{ textAlign: 'right' }}>{playerXStats.losses}</span>
                  <span>Win Ratio:</span>
                  <span style={{ textAlign: 'right' }}>{playerXStats.winRate.toFixed(0)}%</span>
                </div>
              )}
              {!playerX.isGuest && (
                <button
                  onClick={() => handleLogout(true)}
                  style={{
                    background: 'rgba(220, 53, 69, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(220, 53, 69, 1)'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(220, 53, 69, 0.8)'}
                >
                  Logout
                </button>
              )}
            </>
          ) : (
            renderPlayerAuth(true)
          )}
        </div>

        {/* Main Game Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
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

            <select 
              value={winLen} 
              onChange={e => setWinLen(Math.min(+e.target.value, size))}
              style={styles.select}
            >
              {Array.from({ length: Math.min(size, 10) - 2 }, (_, i) => i + 3).map(k => (
                <option key={k} value={k} style={styles.selectOption}>{k} to win</option>
              ))}
            </select>
          </div>
          
          <div style={result ? styles.statusWin : styles.statusNormal}>
            {result ? (
              <div>
                {result === 'Draw' ? '🤝 Draw!' : `🎉 ${result === 'X' ? (playerX?.name || 'Player X') : (playerO?.name || 'Player O')} Wins!`}
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  {(playerX && playerO) ? (gameSaved ? '✅ Game saved!' : 'Saving game...') : ''}
                </div>
              </div>
            ) : (
              <div>
                Current Player: <strong>{currentPlayerName || `Player ${player}`}</strong> ({player})
                {currentPlayerIsGuest && <span style={{ fontSize: '12px', opacity: 0.8 }}> (Guest)</span>}
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  Moves: {totalMoves}
                </div>
              </div>
            )}
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
          
          {/* New Game Button below board */}
          <button 
            onClick={() => reset()} 
            style={{
              ...styles.resetButton,
              background: 'white',
              color: 'black',
              marginTop: '20px',
              ...(hoveredButton === 'newGame' ? { transform: 'translateY(-2px)', background: 'rgba(255, 255, 255, 0.9)' } : {})
            }}
            onMouseEnter={() => setHoveredButton('newGame')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            New Game
          </button>
        </div>

        {/* Player O Lozenge */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: player === 'O' ? '3px solid rgba(255, 255, 255, 0.8)' : '3px solid transparent',
          borderRadius: '20px',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          width: '180px', // Fixed width for balance
          transition: 'all 0.3s ease',
          boxShadow: player === 'O' ? '0 0 20px rgba(255, 255, 255, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
          margin: '10px', // Add consistent margin to accommodate glow
          marginTop: '60px', // Align with game board (after control panel)
        }}>
          {playerO ? (
            <>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: 'white',
                marginBottom: '8px'
              }}>
                Player O
              </div>
              <div style={{ fontSize: '16px', color: 'white', marginBottom: '12px' }}>
                {playerO.name}
                {playerO.isGuest && <div style={{ fontSize: '12px', opacity: 0.7 }}>(Guest)</div>}
              </div>
              {playerOStats && (
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  marginBottom: '12px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '2px 8px',
                  textAlign: 'left',
                  fontFamily: 'monospace'
                }}>
                  <span>Won:</span>
                  <span style={{ textAlign: 'right' }}>{playerOStats.wins}</span>
                  <span>Drawn:</span>
                  <span style={{ textAlign: 'right' }}>{playerOStats.draws}</span>
                  <span>Lost:</span>
                  <span style={{ textAlign: 'right' }}>{playerOStats.losses}</span>
                  <span>Win Ratio:</span>
                  <span style={{ textAlign: 'right' }}>{playerOStats.winRate.toFixed(0)}%</span>
                </div>
              )}
              {!playerO.isGuest && (
                <button
                  onClick={() => handleLogout(false)}
                  style={{
                    background: 'rgba(220, 53, 69, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(220, 53, 69, 1)'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(220, 53, 69, 0.8)'}
                >
                  Logout
                </button>
              )}
            </>
          ) : (
            renderPlayerAuth(false)
          )}
        </div>
      </div>
    </div>
  );
};
