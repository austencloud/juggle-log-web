// src/lib/stores/achievementState.ts - Achievement State Management
import type { Achievement } from '../types/achievements';
import { ACHIEVEMENTS, AchievementCategory } from '../types/achievements';
import { isBrowser } from '../utils/browser';
import { ExperienceType } from '../types/gamification';
import type { GamificationState } from '../types/gamification';

const STORAGE_KEY = 'jugglelog_achievements';

interface AchievementStateData {
  achievements: Record<string, Achievement>;
  recentlyEarned: string[];
}

const defaultState: AchievementStateData = {
  achievements: {},
  recentlyEarned: []
};

/**
 * Achievement State Management
 * Manages achievement tracking, progress, and localStorage persistence with user prefixes
 */
export class AchievementState {
  private achievements: Record<string, Achievement> = {};
  private recentlyEarned: string[] = [];
  private isLoading = false;
  private error: string | null = null;

  // Derived state
  readonly availableAchievements = () => {
    return Object.values(this.achievements).filter((achievement: Achievement) => !achievement.completed);
  };

  readonly completedAchievements = () => {
    return Object.values(this.achievements).filter((achievement: Achievement) => achievement.completed);
  };

  readonly completionPercentage = () => {
    const total = Object.keys(this.achievements).length;
    const completed = Object.values(this.achievements).filter((achievement: Achievement) => achievement.completed).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  readonly nextTargets = () => {
    return Object.values(this.achievements)
      .filter((achievement: Achievement) => !achievement.completed)
      .filter((achievement: Achievement) => {
        const progress = achievement.requiredValue > 0 
          ? (achievement.currentValue / achievement.requiredValue) * 100 
          : 0;
        return progress >= 50;
      })
      .sort((a: Achievement, b: Achievement) => {
        const progressA = a.requiredValue > 0 ? (a.currentValue / a.requiredValue) : 0;
        const progressB = b.requiredValue > 0 ? (b.currentValue / b.requiredValue) : 0;
        return progressB - progressA;
      });
  };

  readonly achievementsByCategory = () => {
    const grouped: Record<AchievementCategory, Achievement[]> = {
      [AchievementCategory.PATTERN_MASTERY]: [],
      [AchievementCategory.CONSISTENCY]: [],
      [AchievementCategory.MILESTONE]: [],
      [AchievementCategory.TECHNIQUE]: [],
      [AchievementCategory.SPECIAL]: []
    };

    Object.values(this.achievements).forEach(achievement => {
      if (grouped[achievement.category]) {
        grouped[achievement.category].push(achievement);
      }
    });

    return grouped;
  };

  readonly recentNotifications = () => {
    return this.recentlyEarned.map(id => this.achievements[id]).filter(Boolean);
  };

  constructor() {
    // Initialize achievements
    this.initializeAchievements();

    // Initialize from localStorage when in browser
    if (isBrowser) {
      this.initializeFromStorage();
    }
  }

  /**
   * Initialize achievements from definitions
   */
  private initializeAchievements(): void {
    const initialAchievements: Record<string, Achievement> = {};
    
    ACHIEVEMENTS.forEach((definition) => {
      initialAchievements[definition.id] = {
        ...definition,
        completed: false,
        completionDate: undefined,
        currentValue: 0
      };
    });

    this.achievements = initialAchievements;
  }

  /**
   * Initialize state from localStorage
   */
  private initializeFromStorage(): void {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.setState(parsedState);
      }
    } catch (error) {
      console.error('Failed to initialize achievement state from storage:', error);
      this.error = 'Failed to load achievement data';
    }
  }

  /**
   * Save current state to localStorage
   */
  private saveToStorage(): void {
    if (!isBrowser) return;
    try {
      const state: AchievementStateData = {
        achievements: this.achievements,
        recentlyEarned: this.recentlyEarned
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save achievement state to storage:', error);
    }
  }

  /**
   * Set state from data object
   */
  private setState(data: Partial<AchievementStateData>): void {
    if (data.achievements) {
      // Merge with existing achievements to ensure new achievements are included
      const mergedAchievements = { ...this.achievements };
      
      Object.entries(data.achievements).forEach(([id, savedAchievement]) => {
        if (mergedAchievements[id]) {
          mergedAchievements[id] = {
            ...mergedAchievements[id],
            ...savedAchievement
          };
        }
      });
      
      this.achievements = mergedAchievements;
    }
    
    this.recentlyEarned = data.recentlyEarned || [];
  }

  /**
   * Check achievements by category
   */
  checkAchievements(category: AchievementCategory | string, data?: any): string[] {
    const earnedAchievements: string[] = [];
    
    // Filter achievements by category
    const categoryAchievements = Object.values(this.achievements)
      .filter(a => a.category === category && !a.completed);
    
    for (const achievement of categoryAchievements) {
      let isCompleted = false;
      let newValue = achievement.currentValue;
      
      // Check completion based on achievement type and data
      switch (achievement.category) {
        case AchievementCategory.PATTERN_MASTERY:
          if (data?.completedPatterns) {
            newValue = data.completedPatterns.length;
            isCompleted = newValue >= achievement.requiredValue;
          }
          break;
          
        case AchievementCategory.MILESTONE:
          if (data?.maxCatches) {
            const maxCatch = Math.max(...Object.values(data.maxCatches).map(Number));
            newValue = maxCatch;
            isCompleted = newValue >= achievement.requiredValue;
          }
          break;
          
        case AchievementCategory.CONSISTENCY:
          if (data?.level) {
            newValue = data.level;
            isCompleted = newValue >= achievement.requiredValue;
          }
          break;
          
        case AchievementCategory.TECHNIQUE:
          if (data?.totalPatterns) {
            newValue = data.totalPatterns;
            isCompleted = newValue >= achievement.requiredValue;
          }
          break;
      }
      
      // Update achievement
      this.achievements[achievement.id] = {
        ...achievement,
        currentValue: newValue,
        completed: isCompleted,
        completionDate: isCompleted ? new Date().toISOString() : undefined
      };
      
      if (isCompleted) {
        earnedAchievements.push(achievement.id);
        this.recentlyEarned = [...this.recentlyEarned, achievement.id];
        
        // Award XP for achievement
        if (this.gamificationState) {
          this.gamificationState.addXP(achievement.xpReward, `achievement_${achievement.id}`);
        }
      }
    }
    
    this.saveToStorage();
    return earnedAchievements;
  }

  /**
   * Award achievement manually
   */
  async awardAchievement(achievementId: string): Promise<void> {
    const achievement = this.achievements[achievementId];
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    if (achievement.completed) {
      return; // Already completed
    }

    this.isLoading = true;
    this.error = null;

    try {
      this.achievements[achievementId] = {
        ...achievement,
        completed: true,
        completionDate: new Date().toISOString(),
        currentValue: achievement.requiredValue
      };

      this.recentlyEarned = [...this.recentlyEarned, achievementId];

      // Award XP
      if (this.gamificationState) {
        await this.gamificationState.addXP(achievement.xpReward, `achievement_${achievementId}`);
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to award achievement';
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Clear recently earned achievements
   */
  clearRecentlyEarned(): void {
    this.recentlyEarned = [];
    this.saveToStorage();
  }

  /**
   * Get completed count
   */
  getCompletedCount(): number {
    return this.completedAchievements().length;
  }

  /**
   * Save state with user prefix
   */
  saveWithPrefix(prefix: string): void {
    if (!isBrowser) return;

    try {
      const state: AchievementStateData = {
        achievements: this.achievements,
        recentlyEarned: this.recentlyEarned
      };
      
      const prefixedKey = prefix + STORAGE_KEY;
      localStorage.setItem(prefixedKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save achievement state with prefix:', error);
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
        // No saved state for this user, reinitialize
        this.initializeAchievements();
      }
    } catch (error) {
      console.error('Failed to load achievement state with prefix:', error);
      this.initializeAchievements();
    }
  }

  /**
   * Clear any errors
   */
  clearError(): void {
    this.error = null;
  }

  /**
   * Reset state to defaults
   */
  reset(): void {
    this.initializeAchievements();
    this.recentlyEarned = [];
    this.isLoading = false;
    this.error = null;
    this.saveToStorage();
  }

  /**
   * Get current state as plain object
   */
  getState(): AchievementStateData {
    return {
      achievements: { ...this.achievements },
      recentlyEarned: [...this.recentlyEarned]
    };
  }

  /**
   * Get achievements
   */
  getAchievements() {
    return this.achievements;
  }

  /**
   * Get completed achievements
   */
  getCompletedAchievements() {
    return Object.values(this.achievements).filter(a => a.completed);
  }
}

// Create and export the singleton instance
export const achievementState = new AchievementState();
