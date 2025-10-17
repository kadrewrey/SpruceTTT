// API service for backend communication
const API_BASE_URL = 'http://localhost:3000/api';

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
  winnerId?: string; // UUID of the winner
  playerXId: string; // Player X UUID
  playerOId: string; // Player O UUID
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
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async registerGuest(username: string, nickname?: string): Promise<AuthResponse> {
    // Generate a random password for guest users
    const guestPassword = 'guest_' + Math.random().toString(36).substring(2, 15);
    // If no nickname provided, use username as nickname for guest users
    const guestNickname = nickname || username;
    
    const response = await this.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password: guestPassword, nickname: guestNickname }),
    });

    this.token = response.token;
    localStorage.setItem('authToken', this.token);
    return response;
  }

  async register(username: string, password: string, nickname: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname }),
    });

    this.token = response.token;
    localStorage.setItem('authToken', this.token);
    return response;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    this.token = response.token;
    localStorage.setItem('authToken', this.token);
    return response;
  }

  async saveGame(gameResult: GameResult): Promise<void> {
    await this.request('/games', {
      method: 'POST',
      body: JSON.stringify(gameResult),
    });
  }

  async getProfile(): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/profile');
  }

  async getGames(): Promise<{ games: any[] }> {
    return this.request<{ games: any[] }>('/games');
  }

  async getGuestStats(playerName: string): Promise<{ stats: GameStats }> {
    return this.request<{ stats: GameStats }>(`/guest-stats/${encodeURIComponent(playerName)}`);
  }

  async getUserStats(userId: string): Promise<{ stats: GameStats }> {
    return this.request<{ stats: GameStats }>(`/users/${userId}/stats`);
  }

  async getGuestAccounts(): Promise<{ guestAccounts: string[] }> {
    return this.request<{ guestAccounts: string[] }>('/guest-accounts');
  }

  async guestLogin(username: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/guest-login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });

    this.token = response.token;
    localStorage.setItem('authToken', this.token);
    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): User | null {
    if (!this.token) return null;
    
    try {
      // Decode JWT payload (basic decode, not verification)
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return { id: payload.userId, username: payload.username, nickname: payload.nickname };
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();