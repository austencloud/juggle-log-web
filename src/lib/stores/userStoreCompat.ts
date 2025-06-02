// src/lib/stores/userStoreCompat.ts - Compatibility layer for userStore
// Provides the same API as the old Svelte 4 store but uses the new runes-based UserState

import { simpleUserState } from './simpleUserState';
import type { User } from './simpleUserState';

/**
 * Compatibility layer for userStore
 * Maintains the exact same API as the original userStore for zero-breaking-change migration
 */
export function createUserStoreCompat() {
  return {
    // Subscribe method for Svelte 4 compatibility
    subscribe: simpleUserState.subscribe,

    // Create a new user
    createUser: async (username: string): Promise<User> => {
      return await simpleUserState.createUser(username);
    },

    // Login user
    login: async (userId: string): Promise<void> => {
      return await simpleUserState.login(userId);
    },

    // Logout current user
    logout: async (): Promise<void> => {
      return await simpleUserState.logout();
    },

    // Delete a user
    deleteUser: async (userId: string): Promise<void> => {
      return await simpleUserState.deleteUser(userId);
    },

    // Get current user
    getCurrentUser: (): User | null => {
      return simpleUserState.getCurrentUser();
    },

    // Get current user ID
    getCurrentUserId: (): string | null => {
      return simpleUserState.getCurrentUserId();
    },

    // Get user prefix for localStorage
    getCurrentUserPrefix: (): string => {
      let prefix = '';
      simpleUserState.userPrefix.subscribe(p => prefix = p)();
      return prefix;
    },

    // Get user prefix by ID
    getUserPrefix: (userId?: string): string => {
      return simpleUserState.getUserPrefix(userId);
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
      let authenticated = false;
      simpleUserState.isAuthenticated.subscribe(a => authenticated = a)();
      return authenticated;
    },

    // Get all users
    getUsers: (): User[] => {
      return simpleUserState.getUsers();
    },

    // Clear error
    clearError: (): void => {
      simpleUserState.clearError();
    },

    // Reset store
    reset: (): void => {
      simpleUserState.reset();
    },

    // Get loading state
    isLoading: (): boolean => {
      return simpleUserState.isLoading();
    },

    // Get error state
    getError: (): string | null => {
      return simpleUserState.getError();
    }
  };
}

// Export the compatibility store
export const userStore = createUserStoreCompat();
