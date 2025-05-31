import { writable } from 'svelte/store';
import { isBrowser } from '../utils/browser';
import { gamificationStore } from './gamificationStore';
import { progressStore } from './progressStore';
import { achievementStore } from './achievementStore';

const USERS_STORAGE_KEY = 'jugglelog_users';
const CURRENT_USER_KEY = 'jugglelog_current_user';

export interface User {
  id: string;
  username: string;
  createdAt: number;
  lastLogin: number;
}

interface UserState {
  users: User[];
  currentUserId: string | null;
}

const defaultState: UserState = {
  users: [],
  currentUserId: null
};

function generateUserId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function createUserStore() {
  const { subscribe, update, set } = writable<UserState>(defaultState);
  
  // Initialize from localStorage when in browser
  if (isBrowser) {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        update(state => ({ ...state, users: parsedUsers }));
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    
    if (currentUser) {
      update(state => ({ ...state, currentUserId: currentUser }));
    }
  }
  
  // Save state to localStorage on changes
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

  // Function to prefix localStorage keys with user ID
  function getUserPrefix(userId: string): string {
    return `user_${userId}_`;
  }

  // Function to update all storage keys when switching users
  function updateStoragePrefixes(userId: string | null) {
    if (!isBrowser) return;
    
    // First, save current data to the old user's storage
    const currentPrefix = getCurrentUserPrefix();
    
    // Then clear the unprefixed keys as they're no longer needed
    if (currentPrefix) {
      // The stores will handle saving their data with the right prefix
      gamificationStore.saveWithPrefix(currentPrefix);
      progressStore.saveWithPrefix(currentPrefix);
      achievementStore.saveWithPrefix(currentPrefix);
    }
    
    // Set the new prefix and load data
    if (userId) {
      const newPrefix = getUserPrefix(userId);
      gamificationStore.loadWithPrefix(newPrefix);
      progressStore.loadWithPrefix(newPrefix);
      achievementStore.loadWithPrefix(newPrefix);
    }
  }

  function getCurrentUserPrefix(): string | null {
    let prefix: string | null = null;
    
    subscribe(state => {
      if (state.currentUserId) {
        prefix = getUserPrefix(state.currentUserId);
      }
    })();
    
    return prefix;
  }

  return {
    subscribe,
    
    // Get current user data
    getCurrentUser: (): User | null => {
      let currentUser: User | null = null;
      
      subscribe(state => {
        if (state.currentUserId) {
          currentUser = state.users.find(user => user.id === state.currentUserId) || null;
        }
      })();
      
      return currentUser;
    },
    
    // Create a new user
    createUser: (username: string) => {
      let newUser: User | null = null;
      
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
          users: [...state.users, newUser],
          currentUserId: newUser.id
        };
      });
      
      if (newUser) {
        updateStoragePrefixes(newUser.id);
      }
      
      return newUser;
    },
    
    // Login as existing user
    loginUser: (userId: string) => {
      let success = false;
      
      update(state => {
        const user = state.users.find(u => u.id === userId);
        
        if (!user) {
          return state;
        }
        
        success = true;
        
        // Update the user's last login time
        const updatedUsers = state.users.map(u => 
          u.id === userId ? { ...u, lastLogin: Date.now() } : u
        );
        
        return {
          users: updatedUsers,
          currentUserId: userId
        };
      });
      
      if (success) {
        updateStoragePrefixes(userId);
      }
      
      return success;
    },
    
    // Logout current user
    logout: () => {
      update(state => {
        updateStoragePrefixes(null);
        return { ...state, currentUserId: null };
      });
    },
    
    // Delete a user and all their data
    deleteUser: (userId: string) => {
      update(state => {
        // Cannot delete the currently active user
        if (state.currentUserId === userId) {
          throw new Error('Cannot delete active user. Logout first.');
        }
        
        // Remove all data for this user
        if (isBrowser) {
          const prefix = getUserPrefix(userId);
          const keysToRemove = [];
          
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
              keysToRemove.push(key);
            }
          }
          
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        return {
          users: state.users.filter(u => u.id !== userId),
          currentUserId: state.currentUserId
        };
      });
    },
    
    // Reset data for the current user
    resetUserData: () => {
      const currentUserId = getCurrentUserPrefix();
      
      if (!currentUserId) {
        return false;
      }
      
      gamificationStore.reset();
      progressStore.reset();
      achievementStore.reset();
      
      return true;
    },
    
    // Get user-specific storage key prefix
    getUserPrefix: getCurrentUserPrefix
  };
}

export const userStore = createUserStore();