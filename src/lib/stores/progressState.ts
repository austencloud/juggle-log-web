// src/lib/stores/progressState.ts - Svelte 5 Runes-based Progress State Management
import type { ProgressData, PatternData } from '../types/types';
import { ProgressTracker } from '../utils/progressTracker';
import { isBrowser } from '../utils/browser';

const STORAGE_KEY = 'jugglelog_progress';

const defaultState: ProgressData = {
  completedPatterns: [],
  maxCatches: {},
  lastUpdatedDates: {}
};

/**
 * Svelte 5 Runes-based Progress State Management
 * Manages pattern progress, completion tracking, and localStorage persistence with user prefixes
 */
export class ProgressState {
  // Core reactive state using $state()
  private _completedPatterns = $state<string[]>([]);
  private _maxCatches = $state<Record<string, number>>({});
  private _lastUpdatedDates = $state<Record<string, string>>({});
  private _isLoading = $state(false);
  private _error = $state<string | null>(null);

  // Derived state using $derived()
  readonly completionStats = $derived(() => {
    const totalPatterns = Object.keys(this._maxCatches).length;
    const completedCount = this._completedPatterns.length;
    const completionRate = totalPatterns > 0 ? (completedCount / totalPatterns) * 100 : 0;

    return {
      totalPatterns,
      completedCount,
      completionRate: Math.round(completionRate * 100) / 100,
      inProgressCount: totalPatterns - completedCount
    };
  });

  readonly improvementTrends = $derived(() => {
    const trends: Record<string, { pattern: string; improvement: number; lastUpdate: string }> = {};
    
    Object.entries(this._maxCatches).forEach(([pattern, catches]) => {
      const lastUpdate = this._lastUpdatedDates[pattern];
      if (lastUpdate) {
        // Calculate improvement based on completion status and catch count
        const isCompleted = this._completedPatterns.includes(pattern);
        const improvement = isCompleted ? 100 : Math.min((catches / 100) * 100, 99);
        
        trends[pattern] = {
          pattern,
          improvement: Math.round(improvement * 100) / 100,
          lastUpdate
        };
      }
    });

    return trends;
  });

  readonly recommendedPatterns = $derived(() => {
    // Recommend patterns that are close to completion (80-99 catches)
    const recommendations: string[] = [];
    
    Object.entries(this._maxCatches).forEach(([pattern, catches]) => {
      if (catches >= 80 && catches < 100 && !this._completedPatterns.includes(pattern)) {
        recommendations.push(pattern);
      }
    });

    return recommendations.sort((a, b) => (this._maxCatches[b] || 0) - (this._maxCatches[a] || 0));
  });

  readonly recentActivity = $derived(() => {
    const activities: Array<{ pattern: string; catches: number; date: string; isCompleted: boolean }> = [];
    
    Object.entries(this._lastUpdatedDates).forEach(([pattern, date]) => {
      const catches = this._maxCatches[pattern] || 0;
      const isCompleted = this._completedPatterns.includes(pattern);
      
      activities.push({
        pattern,
        catches,
        date,
        isCompleted
      });
    });

    // Sort by date (most recent first)
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Getters for reactive state
  get completedPatterns() { return this._completedPatterns; }
  get maxCatches() { return this._maxCatches; }
  get lastUpdatedDates() { return this._lastUpdatedDates; }
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

    // Auto-save on window unload
    if (isBrowser) {
      $effect(() => {
        const handleBeforeUnload = () => {
          this.saveToStorage();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      });
    }
  }

  /**
   * Initialize state from localStorage
   */
  private initializeFromStorage(): void {
    try {
      const storedData = ProgressTracker.loadProgress();
      this.setState(storedData);
    } catch (error) {
      console.error('Failed to initialize progress state from storage:', error);
      this._error = 'Failed to load progress data';
    }
  }

  /**
   * Save current state to localStorage
   */
  private saveToStorage(): void {
    try {
      const data: ProgressData = {
        completedPatterns: this._completedPatterns,
        maxCatches: this._maxCatches,
        lastUpdatedDates: this._lastUpdatedDates
      };
      ProgressTracker.saveProgress(data);
    } catch (error) {
      console.error('Failed to save progress state to storage:', error);
    }
  }

  /**
   * Set state from data object
   */
  private setState(data: ProgressData): void {
    this._completedPatterns = data.completedPatterns || [];
    this._maxCatches = data.maxCatches || {};
    this._lastUpdatedDates = data.lastUpdatedDates || {};
  }

  /**
   * Update progress for a pattern
   */
  async updateProgress(pattern: string, catches: number): Promise<void> {
    if (catches < 0) {
      throw new Error('Catch count cannot be negative');
    }

    this._isLoading = true;
    this._error = null;

    try {
      const currentMax = this._maxCatches[pattern] || 0;
      
      // Only update if new catch count is higher or if setting to 0 (reset)
      if (catches > currentMax || catches === 0) {
        // Update max catches
        if (catches === 0) {
          delete this._maxCatches[pattern];
          delete this._lastUpdatedDates[pattern];
          this._completedPatterns = this._completedPatterns.filter(p => p !== pattern);
        } else {
          this._maxCatches = { ...this._maxCatches, [pattern]: catches };
          this._lastUpdatedDates = { ...this._lastUpdatedDates, [pattern]: new Date().toISOString() };
          
          // Update completion status
          if (catches >= 100) {
            if (!this._completedPatterns.includes(pattern)) {
              this._completedPatterns = [...this._completedPatterns, pattern];
            }
          } else {
            this._completedPatterns = this._completedPatterns.filter(p => p !== pattern);
          }
        }
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to update progress';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Get pattern statistics
   */
  getPatternStats(pattern: string): PatternData {
    const maxCatches = this._maxCatches[pattern] || 0;
    const isCompleted = this._completedPatterns.includes(pattern);
    const lastUpdated = this._lastUpdatedDates[pattern];

    return {
      pattern,
      maxCatches,
      isCompleted,
      lastUpdated: lastUpdated ? new Date(lastUpdated) : undefined
    };
  }

  /**
   * Reset pattern progress
   */
  async resetPattern(pattern: string): Promise<void> {
    await this.updateProgress(pattern, 0);
  }

  /**
   * Get all patterns with their data
   */
  getAllPatterns(): PatternData[] {
    const patterns = new Set([
      ...Object.keys(this._maxCatches),
      ...this._completedPatterns
    ]);

    return Array.from(patterns).map(pattern => this.getPatternStats(pattern));
  }

  /**
   * Export progress data
   */
  exportData(): ProgressData {
    return {
      completedPatterns: [...this._completedPatterns],
      maxCatches: { ...this._maxCatches },
      lastUpdatedDates: { ...this._lastUpdatedDates }
    };
  }

  /**
   * Import progress data
   */
  async importData(data: ProgressData): Promise<void> {
    this._isLoading = true;
    this._error = null;

    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      this.setState(data);
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to import data';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Save state with user prefix
   */
  saveWithPrefix(prefix: string): void {
    if (!isBrowser) return;

    try {
      const data: ProgressData = {
        completedPatterns: this._completedPatterns,
        maxCatches: this._maxCatches,
        lastUpdatedDates: this._lastUpdatedDates
      };
      
      const prefixedKey = prefix + STORAGE_KEY;
      localStorage.setItem(prefixedKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save progress state with prefix:', error);
    }
  }

  /**
   * Load state with user prefix
   */
  loadWithPrefix(prefix: string): void {
    if (!isBrowser) return;

    try {
      const prefixedKey = prefix + STORAGE_KEY;
      const savedState = localStorage.getItem(prefixedKey);
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.setState(parsedState);
      } else {
        // No saved state for this user, use default
        this.setState(defaultState);
      }
    } catch (error) {
      console.error('Failed to load progress state with prefix:', error);
      this.setState(defaultState);
    }
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
    this.setState(defaultState);
    this._isLoading = false;
    this._error = null;
  }

  /**
   * Get current state as plain object
   */
  getState(): ProgressData {
    return {
      completedPatterns: [...this._completedPatterns],
      maxCatches: { ...this._maxCatches },
      lastUpdatedDates: { ...this._lastUpdatedDates }
    };
  }
}

// Create and export the singleton instance
export const progressState = new ProgressState();
