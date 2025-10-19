import { apiService } from './apiService';
import { GamePlayer, PlayerAuthState, PlayerState, createDefaultPlayerState } from '../utils/types';

export interface AuthServiceCallbacks {
  updatePlayer: (playerType: 'X' | 'O', updates: Partial<PlayerState>) => void;
  updatePlayerAuth: (playerType: 'X' | 'O', authUpdates: Partial<PlayerAuthState>) => void;
  reset: () => void;
}

type PlayerType = 'X' | 'O';
type AuthType = 'login' | 'register' | 'guest';

const DEFAULT_STATS = { totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 };

export const authService = {
  // Helper: Create player object from API response
  _createPlayer(user: any, isGuest: boolean): GamePlayer {
    return {
      id: user.id,
      name: user.username,
      nickname: user.nickname || user.username,
      isAuthenticated: true,
      isGuest,
    };
  },

  // Helper: Fetch player stats with fallback
  async _fetchPlayerStats(playerId: string, isPlayerX: boolean) {
    try {
      const response = isPlayerX 
        ? await apiService.getProfile()
        : await apiService.getUserStats(playerId);
      return response.stats;
    } catch {
      return DEFAULT_STATS;
    }
  },

  // Helper: Handle guest authentication
  async _authenticateGuest() {
    const { guestAccounts } = await apiService.getGuestAccounts();
    
    if (!guestAccounts?.length) {
      throw new Error('No guest accounts available');
    }
    
    const randomGuestName = guestAccounts[Math.floor(Math.random() * guestAccounts.length)];
    return apiService.guestLogin(randomGuestName);
  },

  // Helper: Handle regular authentication
  async _authenticateUser(authType: 'login' | 'register', authData: PlayerAuthState) {
    const { username, password, nickname } = authData;
    
    return authType === 'login'
      ? apiService.login(username, password)
      : apiService.register(username, password, nickname);
  },

  // Main authentication method
  async authenticate(
    playerType: PlayerType,
    authType: AuthType,
    callbacks: AuthServiceCallbacks,
    authData?: PlayerAuthState
  ) {
    callbacks.updatePlayerAuth(playerType, { isLoading: true, error: '' });

    try {
      // Authenticate based on type
      let response;
      let isGuest: boolean;

      if (authType === 'guest') {
        response = await this._authenticateGuest();
        isGuest = true;
      } else {
        if (!authData) throw new Error('Auth data required for login/register');
        response = await this._authenticateUser(authType, authData);
        isGuest = false;
      }

      // Create player and fetch stats
      const player = this._createPlayer(response.user, isGuest);
      const stats = await this._fetchPlayerStats(player.id, playerType === 'X');

      // Update state
      callbacks.updatePlayer(playerType, { player, stats });
      callbacks.updatePlayerAuth(playerType, {
        isLoggedIn: true,
        isLoading: false,
        ...(authType !== 'guest' && { showLogin: false })
      });

    } catch (error) {
      const errorMessage = authType === 'guest' 
        ? 'Failed to login as guest'
        : (error instanceof Error ? error.message : 'Authentication failed');
        
      callbacks.updatePlayerAuth(playerType, { 
        isLoading: false, 
        error: errorMessage
      });
    }
  },

  // Public API methods
  async handlePlayerAuth(isPlayerX: boolean, authData: PlayerAuthState, callbacks: AuthServiceCallbacks) {
    const playerType: PlayerType = isPlayerX ? 'X' : 'O';
    const authType: AuthType = authData.isLoginMode ? 'login' : 'register';
    return this.authenticate(playerType, authType, callbacks, authData);
  },

  async handleGuestLogin(isPlayerX: boolean, callbacks: AuthServiceCallbacks) {
    const playerType: PlayerType = isPlayerX ? 'X' : 'O';
    return this.authenticate(playerType, 'guest', callbacks);
  },

  handleLogout(isPlayerX: boolean, callbacks: AuthServiceCallbacks) {
    const playerType: PlayerType = isPlayerX ? 'X' : 'O';
    
    if (isPlayerX) {
      apiService.logout();
    }
    
    callbacks.updatePlayer(playerType, createDefaultPlayerState());
    callbacks.reset();
  }
};