// src/lib/stores/worldRecordsStoreCompat.ts - Compatibility layer for worldRecordsStore
// Provides the same API as the old Svelte 4 store but uses the new runes-based WorldRecordsState

import { worldRecordsState } from './worldRecordsState';
import type { 
  WorldRecordWithHolders, 
  RecordFilters, 
  RecordSubmission 
} from './worldRecordsState';
import type { Database } from '../types/database';

type WorldRecord = Database['public']['Tables']['world_records']['Row'];

interface WorldRecordsStoreState {
  records: WorldRecordWithHolders[];
  isLoading: boolean;
  error: string | null;
  filters: RecordFilters;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Compatibility layer for worldRecordsStore
 * Maintains the exact same API as the original worldRecordsStore for zero-breaking-change migration
 */
export function createWorldRecordsStoreCompat() {
  return {
    // Subscribe method for Svelte 4 compatibility
    subscribe: (callback: (value: WorldRecordsStoreState) => void) => {
      // Create a reactive subscription using $effect
      let unsubscribe: (() => void) | undefined;
      
      if (typeof window !== 'undefined') {
        $effect(() => {
          const state: WorldRecordsStoreState = {
            records: worldRecordsState.records,
            isLoading: worldRecordsState.isLoading,
            error: worldRecordsState.error,
            filters: worldRecordsState.filters,
            totalCount: worldRecordsState.totalCount,
            currentPage: worldRecordsState.currentPage,
            pageSize: worldRecordsState.pageSize
          };
          callback(state);
        });
        
        unsubscribe = () => {
          // Effect cleanup is handled automatically by Svelte 5
        };
      }
      
      return unsubscribe || (() => {});
    },

    // Load world records with optional filters
    loadRecords: async (filters: RecordFilters = {}, page = 1, pageSize = 20): Promise<void> => {
      return await worldRecordsState.loadRecords(filters, page, pageSize);
    },

    // Submit a new world record
    submitRecord: async (submission: RecordSubmission): Promise<WorldRecord> => {
      return await worldRecordsState.submitRecord(submission);
    },

    // Get a single record by ID
    getRecord: async (recordId: string): Promise<WorldRecordWithHolders | null> => {
      return await worldRecordsState.getRecord(recordId);
    },

    // Update filters
    setFilters: (newFilters: RecordFilters): void => {
      worldRecordsState.setFilters(newFilters);
    },

    // Clear filters
    clearFilters: (): void => {
      worldRecordsState.clearFilters();
    },

    // Get current records (for derived stores)
    getCurrentRecords: (): WorldRecordWithHolders[] => {
      return worldRecordsState.records;
    },

    // Get loading state
    getLoadingState: (): boolean => {
      return worldRecordsState.isLoading;
    },

    // Get error state
    getError: (): string | null => {
      return worldRecordsState.error;
    },

    // Clear error
    clearError: (): void => {
      worldRecordsState.clearError();
    },

    // Reset store
    reset: (): void => {
      worldRecordsState.reset();
    },

    // Get filtered records
    getFilteredRecords: (): WorldRecordWithHolders[] => {
      return worldRecordsState.filteredRecords;
    },

    // Get records by pattern
    getRecordsByPattern: () => {
      return worldRecordsState.recordsByPattern;
    },

    // Get verified records
    getVerifiedRecords: (): WorldRecordWithHolders[] => {
      return worldRecordsState.verifiedRecords;
    },

    // Get pending records
    getPendingRecords: (): WorldRecordWithHolders[] => {
      return worldRecordsState.pendingRecords;
    },

    // Get records by category
    getRecordsByCategory: () => {
      return worldRecordsState.recordsByCategory;
    },

    // Get user records
    getUserRecords: (): WorldRecordWithHolders[] => {
      return worldRecordsState.userRecords;
    },

    // Get leaderboards
    getLeaderboards: () => {
      return worldRecordsState.leaderboards;
    },

    // Get current filters
    getFilters: (): RecordFilters => {
      return worldRecordsState.filters;
    },

    // Get total count
    getTotalCount: (): number => {
      return worldRecordsState.totalCount;
    },

    // Get current page
    getCurrentPage: (): number => {
      return worldRecordsState.currentPage;
    },

    // Get page size
    getPageSize: (): number => {
      return worldRecordsState.pageSize;
    }
  };
}

// Export the compatibility store
export const worldRecordsStore = createWorldRecordsStoreCompat();

// Export derived stores for backward compatibility
export const currentRecords = {
  subscribe: (callback: (value: WorldRecordWithHolders[]) => void) => {
    if (typeof window !== 'undefined') {
      $effect(() => {
        callback(worldRecordsState.records);
      });
    }
    return () => {};
  }
};

export const verifiedRecords = {
  subscribe: (callback: (value: WorldRecordWithHolders[]) => void) => {
    if (typeof window !== 'undefined') {
      $effect(() => {
        callback(worldRecordsState.verifiedRecords);
      });
    }
    return () => {};
  }
};

export const pendingRecords = {
  subscribe: (callback: (value: WorldRecordWithHolders[]) => void) => {
    if (typeof window !== 'undefined') {
      $effect(() => {
        callback(worldRecordsState.pendingRecords);
      });
    }
    return () => {};
  }
};

export const recordsByCategory = {
  subscribe: (callback: (value: Record<string, WorldRecordWithHolders[]>) => void) => {
    if (typeof window !== 'undefined') {
      $effect(() => {
        callback(worldRecordsState.recordsByCategory);
      });
    }
    return () => {};
  }
};
