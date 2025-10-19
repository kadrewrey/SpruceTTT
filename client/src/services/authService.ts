import { apiService } from './apiService';
import { GamePlayer, PlayerAuthState, PlayerState, createDefaultPlayerState } from '../utils/types';

export interface AuthServiceCallbacks {
  updatePlayer: (playerType: 'X' | 'O', updates: Partial<PlayerState>) => void;
  updatePlayerAuth: (playerType: 'X' | 'O', authUpdates: Partial<PlayerAuthState>) => void;
  reset: () => void;
}

export const authService = {
  async handlePlayerAuth(
    isPlayerX: boolean, 
    authData: PlayerAuthState, 
    callbacks: AuthServiceCallbacks
  ) {
    const playerType = isPlayerX ? 'X' : 'O';
    
    callbacks.updatePlayerAuth(playerType, { isLoading: true, error: '' });

    try {
      const response = authData.isLoginMode 
        ? await apiService.login(authData.username, authData.password)
        : await apiService.register(authData.username, authData.password, authData.nickname);

      const player: GamePlayer = {
        id: response.user.id,
        name: response.user.username,
        nickname: response.user.nickname,
        isAuthenticated: true,
        isGuest: false,
      };

      if (isPlayerX) {
        callbacks.updatePlayer('X', { player });
        const profileX = await apiService.getProfile();
        callbacks.updatePlayer('X', { stats: profileX.stats });
        callbacks.updatePlayerAuth('X', { isLoggedIn: true, isLoading: false, showLogin: false });
      } else {
        callbacks.updatePlayer('O', { player });
        // For Player O, we'll fetch their guest stats if they're a guest, otherwise default stats
        callbacks.updatePlayer('O', { stats: { totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 } });
        callbacks.updatePlayerAuth('O', { isLoggedIn: true, isLoading: false, showLogin: false });
      }
    } catch (error) {
      callbacks.updatePlayerAuth(playerType, { 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  },

  async handleGuestLogin(
    isPlayerX: boolean, 
    callbacks: AuthServiceCallbacks
  ) {
    const playerType = isPlayerX ? 'X' : 'O';
    
    try {
      // Get a random guest account from the database
      const guestAccountsResponse = await apiService.getGuestAccounts();
      const guestAccounts = guestAccountsResponse.guestAccounts;
      
      if (!guestAccounts || guestAccounts.length === 0) {
        throw new Error('No guest accounts available');
      }
      
      const randomGuestName = guestAccounts[Math.floor(Math.random() * guestAccounts.length)];
      const guestResponse = await apiService.guestLogin(randomGuestName);
      const player: GamePlayer = {
        id: guestResponse.user.id,
        name: guestResponse.user.username,
        nickname: guestResponse.user.nickname || guestResponse.user.username,
        isAuthenticated: true,
        isGuest: true,
      };

      // Fetch stats for the guest player using unified approach
      try {
        const statsResponse = await apiService.getUserStats(player.id);
        const stats = statsResponse.stats;

        callbacks.updatePlayer(playerType, { player, stats });
        callbacks.updatePlayerAuth(playerType, { isLoggedIn: true });
      } catch (error) {
        // If stats fetch fails, use default stats
        const defaultStats = { totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0 };
        callbacks.updatePlayer(playerType, { player, stats: defaultStats });
        callbacks.updatePlayerAuth(playerType, { isLoggedIn: true });
      }
    } catch (error) {
      console.error('Error logging in as guest:', error);
      callbacks.updatePlayerAuth(playerType, { error: 'Failed to login as guest', isLoading: false });
    }
  },

  handleLogout(
    isPlayerX: boolean, 
    callbacks: AuthServiceCallbacks
  ) {
    const playerType = isPlayerX ? 'X' : 'O';
    
    if (isPlayerX) {
      apiService.logout();
    }
    
    callbacks.updatePlayer(playerType, createDefaultPlayerState());
    callbacks.reset();
  }
};