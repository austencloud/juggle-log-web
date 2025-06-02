// src/lib/stores/userState.svelte.ts - Svelte 5 Runes-based User State Management
import { isBrowser } from '../utils/browser';

const USERS_STORAGE_KEY = 'jugglelog_users';
const CURRENT_USER_KEY = 'jugglelog_current_user';

export interface User {
  id: string;
  username: string;
  createdAt: number;
  lastLogin: number;
}

interface UserStateData {
  users: User[];
  currentUserId: string | null;
}

const defaultState: UserStateData = {
  users: [],
  currentUserId: null
};

function generateUserId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Svelte 5 Runes-based User State Management
 * Manages user authentication, profiles, and localStorage persistence
 */
export class UserState {
  // Core reactive state using $state()
  private _users = $state<User[]>([]);
  private _currentUserId = $state<string | null>(null);
  private _isLoading = $state(false);
  private _error = $state<string | null>(null);

  // Derived state using $derived()
  readonly currentUser = $derived(() => {
    if (!this._currentUserId) return null;
    return this._users.find(user => user.id === this._currentUserId) || null;
  });

  readonly isAuthenticated = $derived(() => this._currentUserId !== null);

  readonly userPrefix = $derived(() => {
    return this._currentUserId ? `user_${this._currentUserId}_` : '';
  });

  readonly isLegacyUser = $derived(() => {
    // Legacy users are those stored in localStorage without Supabase integration
    return this._currentUserId !== null && !this._currentUserId.includes('supabase');
  });

  // Getters for reactive state
  get users() { return this._users; }
  get currentUserId() { return this._currentUserId; }
  get isLoading() { return this._isLoading; }
  get error() { return this._error; }

  constructor() {
    // Initialize from localStorage when in browser
    if (isBrowser) {
      this.initializeFromStorage();
    }

    // Auto-save to localStorage on state changes
    $effect(() => {
      if (isBrowser) {
        this.saveToStorage();
      }
    });
  }

  /**
   * Initialize state from localStorage
   */
  private initializeFromStorage(): void {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const currentUserId = localStorage.getItem(CURRENT_USER_KEY);

      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        this._users = Array.isArray(parsedUsers) ? parsedUsers : [];
      }

      if (currentUserId) {
        this._currentUserId = currentUserId;
      }
    } catch (error) {
      console.error('Failed to initialize user state from storage:', error);
      this._error = 'Failed to load user data';
    }
  }

  /**
   * Save current state to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this._users));
      if (this._currentUserId) {
        localStorage.setItem(CURRENT_USER_KEY, this._currentUserId);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (error) {
      console.error('Failed to save user state to storage:', error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(username: string): Promise<User> {
    if (!username.trim()) {
      throw new Error('Username is required');
    }

    // Check if username already exists
    const existingUser = this._users.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingUser) {
      throw new Error('Username already exists');
    }

    this._isLoading = true;
    this._error = null;

    try {
      const newUser: User = {
        id: generateUserId(),
        username: username.trim(),
        createdAt: Date.now(),
        lastLogin: Date.now()
      };

      this._users = [...this._users, newUser];
      
      return newUser;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to create user';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Login user and switch storage contexts
   */
  async login(userId: string): Promise<void> {
    const user = this._users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    this._isLoading = true;
    this._error = null;

    try {
      // Update user's last login
      const userIndex = this._users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        this._users[userIndex] = {
          ...this._users[userIndex],
          lastLogin: Date.now()
        };
      }

      this._currentUserId = userId;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to login';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this._isLoading = true;
    this._error = null;

    try {
      this._currentUserId = null;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to logout';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Delete a user and their data
   */
  async deleteUser(userId: string): Promise<void> {
    const user = this._users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    this._isLoading = true;
    this._error = null;

    try {
      // If deleting current user, logout first
      if (this._currentUserId === userId) {
        await this.logout();
      }

      // Remove user from list
      this._users = this._users.filter(u => u.id !== userId);

      // Clean up user's localStorage data
      this.cleanupUserData(userId);
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to delete user';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Clean up user's localStorage data
   */
  private cleanupUserData(userId: string): void {
    if (!isBrowser) return;

    const prefix = `user_${userId}_`;
    const keysToRemove: string[] = [];

    // Find all keys with this user's prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove all user-specific keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get user prefix for localStorage keys
   */
  getUserPrefix(userId?: string): string {
    const id = userId || this._currentUserId;
    return id ? `user_${id}_` : '';
  }

  /**
   * Clear any errors
   */
  clearError(): void {
    this._error = null;
  }

  /**
   * Reset state to defaults
   */
  reset(): void {
    this._users = [];
    this._currentUserId = null;
    this._isLoading = false;
    this._error = null;
  }
}

// Create and export the singleton instance
export const userState = new UserState();
