// Modified progressTracker.ts to handle both server and browser environments
import type { ProgressData } from '../types/types';

export class ProgressTracker {
  private static readonly MAX_PATTERN_LENGTH = 6;
  
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
    const now = new Date();
    const month = (now.getMonth() + 1).toString();
    const day = now.getDate().toString();
    const year = now.getFullYear().toString();
    
    return `${month}-${day}-${year}`;
  }
  
  /**
   * Check if code is running in browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  
  /**
   * Save progress data to local storage
   */
  public static saveProgress(data: ProgressData): void {
    if (this.isBrowser()) {
      localStorage.setItem('juggleLogProgress', JSON.stringify(data));
    }
  }
  
  /**
   * Load progress data from local storage
   */
  public static loadProgress(): ProgressData {
    // Default empty data
    const defaultData: ProgressData = {
      completedPatterns: [],
      maxCatches: {},
      completionDates: {}
    };
    
    if (!this.isBrowser()) {
      return defaultData;
    }
    
    const storedData = localStorage.getItem('juggleLogProgress');
    
    if (storedData) {
      try {
        return JSON.parse(storedData) as ProgressData;
      } catch (e) {
        console.error('Error parsing stored progress data', e);
        return defaultData;
      }
    }
    
    return defaultData;
  }
}