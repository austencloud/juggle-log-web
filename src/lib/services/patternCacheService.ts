/**
 * Pattern Cache Service
 * Intelligent caching and loading strategy for siteswap patterns
 * Implements eager loading for essential patterns and lazy loading for others
 */

import type { AnimationResult, AnimationOptions } from './animationService';
import { AnimationService } from './animationService';

interface CachedPattern {
  pattern: string;
  animationResult: AnimationResult;
  lastAccessed: number;
  accessCount: number;
  isEssential: boolean;
}

interface LoadingState {
  pattern: string;
  promise: Promise<AnimationResult>;
  timestamp: number;
}

export class PatternCacheService {
  private static cache = new Map<string, CachedPattern>();
  private static loadingStates = new Map<string, LoadingState>();
  private static maxCacheSize = 100;
  private static maxAge = 30 * 60 * 1000; // 30 minutes
  
  // Essential patterns that should be pre-loaded
  private static essentialPatterns = [
    '3', '441', '531', '423', '552', '633', '744',
    '4', '534', '642', '753', '864',
    '5', '645', '756', '867',
    '6', '7', '8', '9',
    '(4,4)', '(6,2x)', '(4,2x)',
    '[33]', '[44]', '[55]'
  ];

  /**
   * Initialize the cache with essential patterns
   */
  static async initializeCache(): Promise<void> {
    console.log('🚀 [PatternCache] initializeCache() called');
    console.log('🚀 [PatternCache] Current cache size:', this.cache.size);
    console.log('🚀 [PatternCache] Essential patterns to load:', this.essentialPatterns.length);

    try {
      const defaultOptions: Partial<AnimationOptions> = {
        width: 500,
        height: 450,
        slowdown: 2.0,
        colors: 'mixed'
      };

      // Load essential patterns in batches to avoid overwhelming the system
      const batchSize = 3; // Reduced batch size for better stability
      let successCount = 0;

      for (let i = 0; i < this.essentialPatterns.length; i += batchSize) {
        const batch = this.essentialPatterns.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map(async (pattern) => {
            try {
              const result = await AnimationService.generateBestAnimation(pattern, defaultOptions);
              this.setCachedPattern(pattern, result, true);
              console.log(`✅ [PatternCache] Pre-loaded essential pattern: ${pattern}`);
              return true;
            } catch (error) {
              console.warn(`⚠️ [PatternCache] Failed to pre-load pattern ${pattern}:`, error);
              return false;
            }
          })
        );

        // Count successful loads
        successCount += results.filter(r => r.status === 'fulfilled' && r.value).length;

        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < this.essentialPatterns.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`✅ [PatternCache] Cache initialized with ${successCount}/${this.essentialPatterns.length} essential patterns`);
    } catch (error) {
      console.error('❌ [PatternCache] Cache initialization failed:', error);
      // Don't throw - allow the app to continue with empty cache
    }
  }

  /**
   * Get pattern animation with intelligent caching
   */
  static async getPatternAnimation(
    pattern: string, 
    options: Partial<AnimationOptions> = {}
  ): Promise<AnimationResult> {
    const cacheKey = this.getCacheKey(pattern, options);
    
    // Check if already in cache
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      cached.lastAccessed = Date.now();
      cached.accessCount++;
      console.log(`🎯 [PatternCache] Cache hit for pattern: ${pattern}`);
      return cached.animationResult;
    }

    // Check if currently loading
    const loading = this.loadingStates.get(cacheKey);
    if (loading) {
      console.log(`⏳ [PatternCache] Pattern ${pattern} already loading, waiting...`);
      return loading.promise;
    }

    // Start loading
    console.log(`🔄 [PatternCache] Loading pattern: ${pattern}`);
    const loadingPromise = this.loadPattern(pattern, options);
    
    this.loadingStates.set(cacheKey, {
      pattern,
      promise: loadingPromise,
      timestamp: Date.now()
    });

    try {
      const result = await loadingPromise;
      this.setCachedPattern(pattern, result, this.essentialPatterns.includes(pattern), options);
      return result;
    } finally {
      this.loadingStates.delete(cacheKey);
    }
  }

  /**
   * Load pattern animation
   */
  private static async loadPattern(
    pattern: string, 
    options: Partial<AnimationOptions>
  ): Promise<AnimationResult> {
    const defaultOptions: Partial<AnimationOptions> = {
      width: 500,
      height: 450,
      slowdown: 2.0,
      colors: 'mixed',
      ...options
    };

    return AnimationService.generateBestAnimation(pattern, defaultOptions);
  }

  /**
   * Set cached pattern
   */
  private static setCachedPattern(
    pattern: string, 
    animationResult: AnimationResult, 
    isEssential: boolean = false,
    options: Partial<AnimationOptions> = {}
  ): void {
    const cacheKey = this.getCacheKey(pattern, options);
    
    this.cache.set(cacheKey, {
      pattern,
      animationResult,
      lastAccessed: Date.now(),
      accessCount: 1,
      isEssential
    });

    // Clean up cache if it gets too large
    this.cleanupCache();
  }

  /**
   * Generate cache key
   */
  private static getCacheKey(pattern: string, options: Partial<AnimationOptions>): string {
    const optionsKey = JSON.stringify({
      width: options.width || 500,
      height: options.height || 450,
      slowdown: options.slowdown || 2.0,
      colors: options.colors || 'mixed'
    });
    return `${pattern}:${optionsKey}`;
  }

  /**
   * Check if cached pattern is expired
   */
  private static isExpired(cached: CachedPattern): boolean {
    return Date.now() - cached.lastAccessed > this.maxAge;
  }

  /**
   * Clean up cache by removing old and less frequently used patterns
   */
  private static cleanupCache(): void {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }

    console.log(`🧹 [PatternCache] Cleaning up cache (${this.cache.size} entries)`);

    // Convert to array and sort by priority (essential patterns first, then by access frequency and recency)
    const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => {
      // Essential patterns have highest priority
      if (a.isEssential && !b.isEssential) return -1;
      if (!a.isEssential && b.isEssential) return 1;
      
      // Then by access count and recency
      const scoreA = a.accessCount * 0.7 + (Date.now() - a.lastAccessed) * -0.3;
      const scoreB = b.accessCount * 0.7 + (Date.now() - b.lastAccessed) * -0.3;
      
      return scoreB - scoreA;
    });

    // Keep the top patterns
    const toKeep = entries.slice(0, Math.floor(this.maxCacheSize * 0.8));
    
    this.cache.clear();
    toKeep.forEach(([key, value]) => {
      this.cache.set(key, value);
    });

    console.log(`✅ [PatternCache] Cache cleaned up, kept ${this.cache.size} entries`);
  }

  /**
   * Preload patterns based on user interaction patterns
   */
  static async preloadSimilarPatterns(currentPattern: string): Promise<void> {
    const similarPatterns = this.getSimilarPatterns(currentPattern);
    
    // Preload in background without blocking
    setTimeout(async () => {
      for (const pattern of similarPatterns.slice(0, 3)) {
        if (!this.cache.has(this.getCacheKey(pattern, {}))) {
          try {
            await this.getPatternAnimation(pattern);
          } catch (error) {
            console.warn(`⚠️ [PatternCache] Failed to preload similar pattern ${pattern}:`, error);
          }
        }
      }
    }, 500);
  }

  /**
   * Get similar patterns for preloading
   */
  private static getSimilarPatterns(pattern: string): string[] {
    const similar: string[] = [];
    
    // For simple patterns, suggest variations
    if (/^\d+$/.test(pattern)) {
      const num = parseInt(pattern);
      if (num >= 3 && num <= 9) {
        similar.push(`${num - 1}`, `${num + 1}`);
        similar.push(`${num}${num}${num}`); // Repeated pattern
      }
    }
    
    // For 3-digit patterns, suggest common variations
    if (pattern.length === 3 && /^\d{3}$/.test(pattern)) {
      const digits = pattern.split('').map(Number);
      const avg = digits.reduce((a, b) => a + b) / 3;
      
      // Suggest patterns with same average
      if (avg === 3) {
        similar.push('441', '531', '423', '333');
      } else if (avg === 4) {
        similar.push('534', '642', '444');
      }
    }
    
    return similar.filter(p => p !== pattern && this.essentialPatterns.includes(p));
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    essentialCount: number;
    hitRate: number;
    loadingCount: number;
  } {
    const essentialCount = Array.from(this.cache.values()).filter(c => c.isEssential).length;
    const totalAccess = Array.from(this.cache.values()).reduce((sum, c) => sum + c.accessCount, 0);
    
    return {
      size: this.cache.size,
      essentialCount,
      hitRate: totalAccess > 0 ? (this.cache.size / totalAccess) * 100 : 0,
      loadingCount: this.loadingStates.size
    };
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
    this.loadingStates.clear();
    console.log('🗑️ [PatternCache] Cache cleared');
  }
}
