// src/lib/stores/simpleUserState.ts - Simple Svelte 5 Compatible User State
// This demonstrates the migration concept without complex runes usage

import { writable, derived } from 'svelte/store';
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
  isLoading: boolean;
  error: string | null;
}

const defaultState: UserStateData = {
  users: [],
  currentUserId: null,
  isLoading: false,
  error: null
};

function generateUserId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Simple Svelte 5 Compatible User State Management
 * Uses enhanced stores that work with Svelte 5 while maintaining compatibility
 */
function createUserState() {
  const { subscribe, update, set } = writable<UserStateData>(defaultState);

  // Initialize from localStorage when in browser
  if (isBrowser) {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    
    if (savedUsers || currentUserId) {
      update(state => ({
        ...state,
        users: savedUsers ? JSON.parse(savedUsers) : [],
        currentUserId: currentUserId || null
      }));
    }
  }

  // Auto-save to localStorage on changes
  subscribe((state) => {
    if (isBrowser) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(state.users));
      if (state.currentUserId) {
        localStorage.setItem(CURRENT_USER_KEY, state.currentUserId);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  });

  // Derived stores
  const currentUser = derived(
    { subscribe },
    ($state) => {
      if (!$state.currentUserId) return null;
      return $state.users.find(user => user.id === $state.currentUserId) || null;
    }
  );

  const isAuthenticated = derived(
    { subscribe },
    ($state) => $state.currentUserId !== null
  );

  const userPrefix = derived(
    { subscribe },
    ($state) => $state.currentUserId ? `user_${$state.currentUserId}_` : ''
  );

  return {
    subscribe,
    currentUser,
    isAuthenticated,
    userPrefix,

    // Actions
    async createUser(username: string): Promise<User> {
      if (!username.trim()) {
        throw new Error('Username is required');
      }

      return new Promise((resolve, reject) => {
        update(state => {
          // Check if username already exists
          const existingUser = state.users.find(user => 
            user.username.toLowerCase() === username.toLowerCase()
          );
          
          if (existingUser) {
            reject(new Error('Username already exists'));
            return state;
          }

          const newUser: User = {
            id: generateUserId(),
            username: username.trim(),
            createdAt: Date.now(),
            lastLogin: Date.now()
          };

          resolve(newUser);
          
          return {
            ...state,
            users: [...state.users, newUser],
            error: null
          };
        });
      });
    },

    async login(userId: string): Promise<void> {
      return new Promise((resolve, reject) => {
        update(state => {
          const user = state.users.find(u => u.id === userId);
          
          if (!user) {
            reject(new Error('User not found'));
            return state;
          }

          // Update user's last login
          const updatedUsers = state.users.map(u => 
            u.id === userId ? { ...u, lastLogin: Date.now() } : u
          );

          resolve();
          
          return {
            ...state,
            users: updatedUsers,
            currentUserId: userId,
            error: null
          };
        });
      });
    },

    async logout(): Promise<void> {
      update(state => ({
        ...state,
        currentUserId: null,
        error: null
      }));
    },

    async deleteUser(userId: string): Promise<void> {
      return new Promise((resolve, reject) => {
        update(state => {
          const user = state.users.find(u => u.id === userId);
          if (!user) {
            reject(new Error('User not found'));
            return state;
          }

          // If deleting current user, logout first
          const newCurrentUserId = state.currentUserId === userId ? null : state.currentUserId;

          // Clean up user's localStorage data
          if (isBrowser) {
            const prefix = `user_${userId}_`;
            const keysToRemove: string[] = [];
            
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
              }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }

          resolve();
          
          return {
            ...state,
            users: state.users.filter(u => u.id !== userId),
            currentUserId: newCurrentUserId,
            error: null
          };
        });
      });
    },

    getUserPrefix(userId?: string): string {
      let prefix = '';
      subscribe(state => {
        const id = userId || state.currentUserId;
        prefix = id ? `user_${id}_` : '';
      })();
      return prefix;
    },

    clearError(): void {
      update(state => ({ ...state, error: null }));
    },

    reset(): void {
      set(defaultState);
    },

    // Getters for compatibility
    getCurrentUser(): User | null {
      let user: User | null = null;
      currentUser.subscribe(u => user = u)();
      return user;
    },

    getCurrentUserId(): string | null {
      let id: string | null = null;
      subscribe(state => id = state.currentUserId)();
      return id;
    },

    getUsers(): User[] {
      let users: User[] = [];
      subscribe(state => users = state.users)();
      return users;
    },

    isLoading(): boolean {
      let loading = false;
      subscribe(state => loading = state.isLoading)();
      return loading;
    },

    getError(): string | null {
      let error: string | null = null;
      subscribe(state => error = state.error)();
      return error;
    }
  };
}

// Create and export the store
export const simpleUserState = createUserState();
