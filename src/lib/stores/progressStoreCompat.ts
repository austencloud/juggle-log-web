// src/lib/stores/progressStoreCompat.ts - Compatibility layer for progressStore
// Provides the same API as the old Svelte 4 store but uses the new runes-based ProgressState

import { progressState } from './progressState';
import type { ProgressData, PatternData } from '../types/types';

/**
 * Compatibility layer for progressStore
 * Maintains the exact same API as the original progressStore for zero-breaking-change migration
 */
export function createProgressStoreCompat() {
  return {
    // Subscribe method for Svelte 4 compatibility
    subscribe: (callback: (value: ProgressData) => void) => {
      // Create a reactive subscription using $effect
      let unsubscribe: (() => void) | undefined;
      
      if (typeof window !== 'undefined') {
        $effect(() => {
          const state = progressState.getState();
          callback(state);
        });
        
        unsubscribe = () => {
          // Effect cleanup is handled automatically by Svelte 5
        };
      }
      
      return unsubscribe || (() => {});
    },

    // Update progress for a pattern
    updateProgress: async (pattern: string, catches: number): Promise<void> => {
      return await progressState.updateProgress(pattern, catches);
    },

    // Get pattern statistics
    getPatternStats: (pattern: string): PatternData => {
      return progressState.getPatternStats(pattern);
    },

    // Reset pattern progress
    resetPattern: async (pattern: string): Promise<void> => {
      return await progressState.resetPattern(pattern);
    },

    // Get all patterns with their data
    getAllPatterns: (): PatternData[] => {
      return progressState.getAllPatterns();
    },

    // Export progress data
    exportData: (): ProgressData => {
      return progressState.exportData();
    },

    // Import progress data
    importData: async (data: ProgressData): Promise<void> => {
      return await progressState.importData(data);
    },

    // Save state with user prefix
    saveWithPrefix: (prefix: string): void => {
      progressState.saveWithPrefix(prefix);
    },

    // Load state with user prefix
    loadWithPrefix: (prefix: string): void => {
      progressState.loadWithPrefix(prefix);
    },

    // Get completed patterns
    getCompletedPatterns: (): string[] => {
      return progressState.completedPatterns;
    },

    // Get max catches
    getMaxCatches: (): Record<string, number> => {
      return progressState.maxCatches;
    },

    // Get last updated dates
    getLastUpdatedDates: (): Record<string, string> => {
      return progressState.lastUpdatedDates;
    },

    // Get completion statistics
    getCompletionStats: () => {
      return progressState.completionStats;
    },

    // Get improvement trends
    getImprovementTrends: () => {
      return progressState.improvementTrends;
    },

    // Get recommended patterns
    getRecommendedPatterns: (): string[] => {
      return progressState.recommendedPatterns;
    },

    // Get recent activity
    getRecentActivity: () => {
      return progressState.recentActivity;
    },

    // Clear error
    clearError: (): void => {
      progressState.clearError();
    },

    // Reset store
    reset: (): void => {
      progressState.reset();
    },

    // Get loading state
    isLoading: (): boolean => {
      return progressState.isLoading;
    },

    // Get error state
    getError: (): string | null => {
      return progressState.error;
    },

    // Get current state
    getState: (): ProgressData => {
      return progressState.getState();
    }
  };
}

// Export the compatibility store
export const progressStore = createProgressStoreCompat();
