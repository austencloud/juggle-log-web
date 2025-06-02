// src/lib/stores/achievementStoreCompat.ts - Compatibility layer for achievementStore
// Provides the same API as the old Svelte 4 store but uses the new runes-based AchievementState

import { achievementState } from './achievementState';
import type { Achievement } from '../types/achievements';
import { AchievementCategory } from '../types/achievements';

/**
 * Compatibility layer for achievementStore
 * Maintains the exact same API as the original achievementStore for zero-breaking-change migration
 */
export function createAchievementStoreCompat() {
  return {
    // Subscribe method for Svelte 4 compatibility
    subscribe: (callback: (value: { achievements: Record<string, Achievement>; recentlyEarned: string[] }) => void) => {
      // Create a reactive subscription using $effect
      let unsubscribe: (() => void) | undefined;
      
      if (typeof window !== 'undefined') {
        $effect(() => {
          const state = achievementState.getState();
          callback(state);
        });
        
        unsubscribe = () => {
          // Effect cleanup is handled automatically by Svelte 5
        };
      }
      
      return unsubscribe || (() => {});
    },

    // Initialize achievements
    init: (): void => {
      // Initialization is handled automatically in the constructor
    },

    // Check achievements by category
    checkAchievements: (category: AchievementCategory | string, data?: any): string[] => {
      return achievementState.checkAchievements(category, data);
    },

    // Award achievement manually
    awardAchievement: async (achievementId: string): Promise<void> => {
      return await achievementState.awardAchievement(achievementId);
    },

    // Clear recently earned achievements
    clearRecentlyEarned: (): void => {
      achievementState.clearRecentlyEarned();
    },

    // Get completed count
    getCompletedCount: (): number => {
      return achievementState.getCompletedCount();
    },

    // Save state with user prefix
    saveWithPrefix: (prefix: string): void => {
      achievementState.saveWithPrefix(prefix);
    },

    // Load state with user prefix
    loadWithPrefix: (prefix: string): void => {
      achievementState.loadWithPrefix(prefix);
    },

    // Get all achievements
    getAchievements: (): Record<string, Achievement> => {
      return achievementState.achievements;
    },

    // Get available achievements
    getAvailableAchievements: (): Achievement[] => {
      return achievementState.availableAchievements();
    },

    // Get completed achievements
    getCompletedAchievements: (): Achievement[] => {
      return achievementState.completedAchievements();
    },

    // Get completion percentage
    getCompletionPercentage: (): number => {
      return achievementState.completionPercentage();
    },

    // Get next targets
    getNextTargets: (): Achievement[] => {
      return achievementState.nextTargets();
    },

    // Get achievements by category
    getAchievementsByCategory: () => {
      return achievementState.achievementsByCategory;
    },

    // Get recently earned achievements
    getRecentlyEarned: (): string[] => {
      return achievementState.recentlyEarned;
    },

    // Get recent notifications
    getRecentNotifications: (): Achievement[] => {
      return achievementState.recentNotifications();
    },

    // Clear error
    clearError: (): void => {
      achievementState.clearError();
    },

    // Reset store
    reset: (): void => {
      achievementState.reset();
    },

    // Get loading state
    isLoading: (): boolean => {
      return achievementState.isLoading;
    },

    // Get error state
    getError: (): string | null => {
      return achievementState.error;
    },

    // Get current state
    getState: () => {
      return achievementState.getState();
    }
  };
}

// Export the compatibility store
export const achievementStore = createAchievementStoreCompat();
