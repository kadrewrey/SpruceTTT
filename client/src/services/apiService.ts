// API service for backend communication
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'authToken';

export interface User {
  id: string;
  username: string;
  nickname: string;
}

export interface GameResult {
  boardSize: number;
  isWin: boolean;
  moves: number;
  duration?: number;
  winnerId?: string;
  playerXId: string;
  playerOId: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface ProfileResponse {
  user: User & { createdAt: string };
  stats: GameStats;
}

class ApiService {
  private token: string | null = localStorage.getItem(AUTH_TOKEN_KEY);

  // Generic request handler
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Helper: Store auth token
  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  // Helper: POST request with JSON body
  private post<T>(endpoint: string, body: object): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Authentication methods
  async register(username: string, password: string, nickname: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/register', { username, password, nickname });
    this.setToken(response.token);
    return response;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/login', { username, password });
    this.setToken(response.token);
    return response;
  }

  async guestLogin(username: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/guest-login', { username });
    this.setToken(response.token);
    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  // Game methods
  async saveGame(gameResult: GameResult): Promise<void> {
    await this.post('/games', gameResult);
  }

  async getGames(): Promise<{ games: any[] }> {
    return this.request('/games');
  }

  // User/Profile methods
  async getProfile(): Promise<ProfileResponse> {
    return this.request('/profile');
  }

  async getUserStats(userId: string): Promise<{ stats: GameStats }> {
    return this.request(`/users/${userId}/stats`);
  }

  async getGuestStats(playerName: string): Promise<{ stats: GameStats }> {
    return this.request(`/guest-stats/${encodeURIComponent(playerName)}`);
  }

  async getGuestAccounts(): Promise<{ guestAccounts: string[] }> {
    return this.request('/guest-accounts');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): User | null {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return { 
        id: payload.userId, 
        username: payload.username, 
        nickname: payload.nickname 
      };
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();