// src/lib/stores/enhancedUserStore.ts
import { writable, derived } from 'svelte/store';
import { isBrowser } from '../utils/browser';
import { gamificationStore } from './gamificationStore';
import { progressStore } from './progressStore';
import { achievementStore } from './achievementStore';
import { supabase, getCurrentUser, ensureUserProfile } from '../supabase';
import { DataMigration } from '../utils/dataMigration';
import type { Database } from '../types/database';

const USERS_STORAGE_KEY = 'jugglelog_users';
const CURRENT_USER_KEY = 'jugglelog_current_user';

// Legacy localStorage user interface
export interface LegacyUser {
  id: string;
  username: string;
  createdAt: number;
  lastLogin: number;
}

// Enhanced user interface with Supabase fields
export interface User {
  id: string;
  username: string;
  email?: string | null;
  display_name?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  youtube_channel?: string | null;
  instagram_handle?: string | null;
  verification_level: 'basic' | 'verified' | 'moderator' | 'admin';
  reputation_score: number;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

interface UserState {
  users: LegacyUser[]; // Keep legacy users for backward compatibility
  currentUserId: string | null;
  currentUser: User | null; // Enhanced user from Supabase
  isAuthenticated: boolean;
  isLoading: boolean;
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'error';
}

const defaultState: UserState = {
  users: [],
  currentUserId: null,
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  migrationStatus: 'pending'
};

function generateUserId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function createEnhancedUserStore() {
  const { subscribe, update, set } = writable<UserState>(defaultState);
  
  // Initialize from localStorage when in browser (legacy support)
  if (isBrowser) {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    
    if (savedUsers) {
      try {
        const users = JSON.parse(savedUsers);
        update(state => ({
          ...state,
          users,
          currentUserId
        }));
      } catch (error) {
        console.error('Failed to parse saved users', error);
      }
    }
    
    // Initialize Supabase auth listener
    initializeAuth();
  }
  
  // Initialize Supabase authentication
  async function initializeAuth() {
    try {
      update(state => ({ ...state, isLoading: true }));
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await handleAuthUser(session.user);
      } else {
        update(state => ({ ...state, isLoading: false }));
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleAuthUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          await handleSignOut();
        }
      });
      
    } catch (error) {
      console.error('Error initializing auth:', error);
      update(state => ({ 
        ...state, 
        isLoading: false,
        migrationStatus: 'error'
      }));
    }
  }
  
  // Handle authenticated user
  async function handleAuthUser(authUser: any) {
    try {
      update(state => ({ ...state, isLoading: true }));
      
      // Ensure user profile exists in database
      const userProfile = await ensureUserProfile(authUser);
      
      // Check if migration is needed
      const needsMigration = !DataMigration.isMigrationComplete(authUser.id);
      
      if (needsMigration) {
        update(state => ({ ...state, migrationStatus: 'in_progress' }));
        await DataMigration.migrateUserData(authUser.id);
        update(state => ({ ...state, migrationStatus: 'completed' }));
      }
      
      update(state => ({
        ...state,
        currentUser: userProfile,
        currentUserId: authUser.id,
        isAuthenticated: true,
        isLoading: false,
        migrationStatus: needsMigration ? 'completed' : state.migrationStatus
      }));
      
      // Update storage prefixes for legacy stores
      updateStoragePrefixes(authUser.id);
      
    } catch (error) {
      console.error('Error handling auth user:', error);
      update(state => ({ 
        ...state, 
        isLoading: false,
        migrationStatus: 'error'
      }));
    }
  }
  
  // Handle sign out
  async function handleSignOut() {
    update(state => ({
      ...state,
      currentUser: null,
      currentUserId: null,
      isAuthenticated: false,
      isLoading: false
    }));
  }
  
  // Save legacy users to localStorage whenever state changes
  subscribe(state => {
    if (isBrowser && state.users.length > 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(state.users));
      if (state.currentUserId) {
        localStorage.setItem(CURRENT_USER_KEY, state.currentUserId);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  });

  // Function to update storage prefixes for all stores when user changes
  function updateStoragePrefixes(userId: string) {
    // Update gamification store prefix
    gamificationStore.saveWithPrefix(`user_${userId}_`);
    
    // Update progress store prefix
    progressStore.saveWithPrefix(`user_${userId}_`);
    
    // Update achievement store prefix
    achievementStore.saveWithPrefix(`user_${userId}_`);
  }

  return {
    subscribe,
    
    // Get current user (enhanced)
    getCurrentUser: () => {
      let currentUser: User | null = null;
      
      subscribe(state => {
        currentUser = state.currentUser;
      })();
      
      return currentUser;
    },
    
    // Get current legacy user (for backward compatibility)
    getCurrentLegacyUser: () => {
      let currentUser: LegacyUser | null = null;
      
      subscribe(state => {
        if (state.currentUserId) {
          currentUser = state.users.find(user => user.id === state.currentUserId) || null;
        }
      })();
      
      return currentUser;
    },
    
    // Create a new legacy user (for backward compatibility)
    createUser: (username: string) => {
      let newUser: LegacyUser | null = null;
      
      update(state => {
        // Check if username is already taken
        if (state.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          throw new Error('Username already exists');
        }
        
        newUser = {
          id: generateUserId(),
          username,
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
        
        return {
          ...state,
          users: [...state.users, newUser],
          currentUserId: newUser.id
        };
      });
      
      if (newUser) {
        updateStoragePrefixes(newUser.id);
      }
      
      return newUser;
    },
    
    // Login an existing legacy user
    loginUser: (userId: string) => {
      let success = false;
      
      update(state => {
        const user = state.users.find(u => u.id === userId);
        
        if (!user) {
          return state;
        }
        
        // Update last login time
        user.lastLogin = Date.now();
        
        success = true;
        
        return {
          ...state,
          currentUserId: userId
        };
      });
      
      if (success) {
        updateStoragePrefixes(userId);
      }
      
      return success;
    },
    
    // Logout current user
    logoutUser: async () => {
      // Sign out from Supabase if authenticated
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Also handle legacy logout
      update(state => ({
        ...state,
        currentUserId: null,
        currentUser: null,
        isAuthenticated: false
      }));
    },
    
    // Update user profile (Supabase)
    updateProfile: async (updates: Partial<User>) => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          throw new Error('No authenticated user');
        }
        
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', currentUser.id)
          .select()
          .single();
          
        if (error) throw error;
        
        update(state => ({
          ...state,
          currentUser: data
        }));
        
        return data;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },
    
    // Check if user is authenticated
    isAuthenticated: () => {
      let authenticated = false;
      subscribe(state => {
        authenticated = state.isAuthenticated;
      })();
      return authenticated;
    },
    
    // Get migration status
    getMigrationStatus: () => {
      let status = 'pending';
      subscribe(state => {
        status = state.migrationStatus;
      })();
      return status;
    }
  };
}

export const enhancedUserStore = createEnhancedUserStore();
