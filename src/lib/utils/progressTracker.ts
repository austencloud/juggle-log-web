// src/lib/utils/progressTracker.ts
import type { ProgressData } from '../types/types';
import { safeLocalStorage, isBrowser } from './browser';

export class ProgressTracker {
  private static readonly MAX_PATTERN_LENGTH = 6;
  private static readonly STORAGE_KEY = 'juggleLogProgress';
  
  /**
   * Extract the repeating base of a pattern
   */
  public static extractRepeatingBase(pattern: string): string {
    for (let length = 1; length <= Math.floor(pattern.length / 2); length++) {
      const base = pattern.substring(0, length);
      if (pattern === base.repeat(Math.floor(pattern.length / length))) {
        return base;
      }
    }
    return pattern;
  }
  
  /**
   * Check if a pattern consists of repeating substrings
   */
  public static isRepeatingPattern(pattern: string): boolean {
    const base = this.extractRepeatingBase(pattern);
    return pattern.length > base.length && 
           pattern === base.repeat(Math.floor(pattern.length / base.length));
  }
  
  /**
   * Get all related patterns with the same base sequence
   */
  public static getRelatedPatterns(pattern: string): string[] {
    const base = this.extractRepeatingBase(pattern);
    const relatedPatterns: string[] = [];
    
    for (let length = 1; length <= this.MAX_PATTERN_LENGTH; length++) {
      relatedPatterns.push(base.repeat(length));
    }
    
    return relatedPatterns;
  }
  
  /**
   * Format the current date in M-D-YYYY format
   */
  public static getCurrentDate(): string {
    if (!isBrowser) return '';
    
    const now = new Date();
    const month = (now.getMonth() + 1).toString();
    const day = now.getDate().toString();
    const year = now.getFullYear().toString();
    
    return `${month}-${day}-${year}`;
  }
  
  /**
   * Save progress data to local storage
   */
  public static saveProgress(data: ProgressData): void {
    try {
      const jsonData = JSON.stringify(data);
      safeLocalStorage.setItem(this.STORAGE_KEY, jsonData);
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }
  
  /**
   * Load progress data from local storage
   */
  public static loadProgress(): ProgressData {
    // Default empty data with the new field name
    const defaultData: ProgressData = {
      completedPatterns: [],
      maxCatches: {},
      lastUpdatedDates: {} // Use new field name
    };
    
    try {
      const storedData = safeLocalStorage.getItem(this.STORAGE_KEY);
      
      if (storedData) {
        let parsedData = JSON.parse(storedData) as ProgressData & { completionDates?: Record<string, string> }; // Allow checking for old key

        // --- Migration Logic --- 
        // If the new key doesn't exist but the old one does, migrate the data
        if (!parsedData.lastUpdatedDates && parsedData.completionDates) {
          console.log("Migrating completionDates to lastUpdatedDates...");
          parsedData.lastUpdatedDates = parsedData.completionDates;
          delete parsedData.completionDates; // Remove the old key
          // Optionally re-save immediately after migration
          // this.saveProgress(parsedData);
        }
        // Ensure the target field exists even if migration didn't happen (e.g., very old/corrupt data)
        if (!parsedData.lastUpdatedDates) {
            parsedData.lastUpdatedDates = {};
        }
        // --- End Migration Logic ---

        // Ensure all expected fields exist, falling back to defaults if necessary
        return {
          completedPatterns: parsedData.completedPatterns || [],
          maxCatches: parsedData.maxCatches || {},
          lastUpdatedDates: parsedData.lastUpdatedDates // Already ensured to exist
        };
      }
    } catch (error) {
      console.error('Error loading or migrating progress data:', error);
      // Clear potentially corrupted data on parse error?
      // this.clearProgress(); 
    }
    
    return defaultData;
  }

  /**
   * Clear all progress data
   */
  public static clearProgress(): void {
    safeLocalStorage.removeItem(this.STORAGE_KEY);
  }
}