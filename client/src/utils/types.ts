// Import GameStats from apiService for the PlayerState interface
import { GameStats } from '../services/apiService';

export type XorO = 'X' | 'O'

export interface GamePlayer {
  id: string;
  name: string;
  nickname: string;
  isAuthenticated: boolean;
  isGuest: boolean;
}

export interface PlayerAuthState {
  isLoggedIn: boolean;
  showLogin: boolean;
  username: string;
  nickname: string;
  password: string;
  showPassword: boolean;
  isLoginMode: boolean;
  isLoading: boolean;
  error: string;
}

export interface PlayerState {
  player: GamePlayer | null;
  stats: GameStats | null;
  auth: PlayerAuthState;
}

export const createDefaultPlayerAuthState = (): PlayerAuthState => ({
  isLoggedIn: false,
  showLogin: false,
  username: '',
  nickname: '',
  password: '',
  showPassword: false,
  isLoginMode: true,
  isLoading: false,
  error: ''
});

export const createDefaultPlayerState = (): PlayerState => ({
  player: null,
  stats: null,
  auth: createDefaultPlayerAuthState()
});