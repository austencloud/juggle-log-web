import type { Achievement } from '../types/achievements';
import { ACHIEVEMENTS, AchievementCategory } from '../types/achievements';
import { writable } from 'svelte/store';
import { isBrowser } from '../utils/browser';
import { gamificationStore } from './gamificationStore';
import { ExperienceType } from '../types/gamification';

const STORAGE_KEY = 'jugglelog_achievements';

export const createAchievementStore = () => {
  const { subscribe, update, set } = writable<{
    achievements: Record<string, Achievement>;
    recentlyEarned: string[];
  }>({
    achievements: {},
    recentlyEarned: []
  });

  // Initialize achievements
  const initAchievements = () => {
    let savedState = null;
    
    if (isBrowser) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          savedState = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved achievements', e);
        }
      }
    }
    
    // Create a map of achievements with saved progress or defaults
    const achievementsMap: Record<string, Achievement> = {};
    
    ACHIEVEMENTS.forEach(achievement => {
      const savedAchievement = savedState?.achievements?.[achievement.id];
      
      achievementsMap[achievement.id] = savedAchievement || { ...achievement };
    });
    
    set({
      achievements: achievementsMap,
      recentlyEarned: []
    });
  };
  
  // Save achievements to localStorage
  subscribe((state) => {
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  });
  
  // Check for completed achievements by category
  const checkAchievements = (category: AchievementCategory | string, data?: any): string[] => {
    const earnedAchievements: string[] = [];
    
    update(state => {
      const updatedAchievements = { ...state.achievements };
      
      // Filter achievements by category
      const categoryAchievements = Object.values(updatedAchievements)
        .filter(a => a.category === category && !a.completed);
      
      for (const achievement of categoryAchievements) {
        let isCompleted = false;
        let newValue = achievement.currentValue;
        
        // Check completion logic based on category
        switch(category) {
          case AchievementCategory.PATTERN_MASTERY:
            if (data?.completedPatternsCount !== undefined) {
              newValue = data.completedPatternsCount;
              isCompleted = newValue >= achievement.requiredValue;
            }
            break;
            
          case AchievementCategory.CONSISTENCY:
            if (data?.streakDays !== undefined) {
              newValue = data.streakDays;
              isCompleted = newValue >= achievement.requiredValue;
            }
            break;
            
          case AchievementCategory.MILESTONE:
            if (data?.maxCatches !== undefined) {
              newValue = data.maxCatches;
              isCompleted = newValue >= achievement.requiredValue;
            }
            break;
            
          case AchievementCategory.TECHNIQUE:
            // Technique achievements have specific logic
            if (data?.techniqueId === achievement.id && data?.completed) {
              isCompleted = true;
            }
            break;
        }
        
        // Update achievement if progress has been made
        if (newValue > achievement.currentValue || isCompleted) {
          updatedAchievements[achievement.id] = {
            ...achievement,
            currentValue: newValue,
            completed: isCompleted,
            completionDate: isCompleted ? new Date().toISOString() : achievement.completionDate
          };
          
          // Add to earned list if newly completed
          if (isCompleted && !achievement.completed) {
            earnedAchievements.push(achievement.id);
            
            // Award XP for achievement completion
            gamificationStore.addExperience({
              type: ExperienceType.ACHIEVEMENT,
              amount: achievement.xpReward
            });
          }
        }
      }
      
      return {
        achievements: updatedAchievements,
        recentlyEarned: [...state.recentlyEarned, ...earnedAchievements]
      };
    });
    
    return earnedAchievements;
  };
  
  // Award a specific achievement directly
  const awardAchievement = (achievementId: string): boolean => {
    let wasAwarded = false;
    
    update(state => {
      const achievement = state.achievements[achievementId];
      if (!achievement || achievement.completed) {
        return state;
      }
      
      wasAwarded = true;
      
      // Update the achievement
      const updatedAchievement = {
        ...achievement,
        currentValue: achievement.requiredValue,
        completed: true,
        completionDate: new Date().toISOString()
      };
      
      // Award XP
      gamificationStore.addExperience({
        type: ExperienceType.ACHIEVEMENT,
        amount: achievement.xpReward
      });
      
      return {
        achievements: {
          ...state.achievements,
          [achievementId]: updatedAchievement
        },
        recentlyEarned: [...state.recentlyEarned, achievementId]
      };
    });
    
    return wasAwarded;
  };
  
  const getCompletedCount = (): number => {
    let count = 0;
    
    subscribe(state => {
      count = Object.values(state.achievements).filter(a => a.completed).length;
    })();
    
    return count;
  };
  
  return {
    subscribe,
    
    init: () => initAchievements(),
    
    checkAchievements,
    
    awardAchievement,
    
    clearRecentlyEarned: () => {
      update(state => ({
        ...state,
        recentlyEarned: []
      }));
    },
    
    getCompletedCount,
    
    reset: () => {
      initAchievements();
    },
    
    // Save state with user prefix
    saveWithPrefix: (prefix: string) => {
      let currentState: {
        achievements: Record<string, Achievement>;
        recentlyEarned: string[];
      } | null = null;
      
      subscribe(state => { currentState = state; })();
      
      if (currentState && isBrowser) {
        const prefixedKey = prefix + STORAGE_KEY;
        localStorage.setItem(prefixedKey, JSON.stringify(currentState));
      }
    },
    
    // Load state with user prefix
    loadWithPrefix: (prefix: string) => {
      if (isBrowser) {
        const prefixedKey = prefix + STORAGE_KEY;
        const savedState = localStorage.getItem(prefixedKey);
        
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            set(parsedState);
          } catch (e) {
            console.error('Failed to parse saved achievement state', e);
            initAchievements();
          }
        } else {
          // No saved state for this user, use defaults
          initAchievements();
        }
      }
    }
  };
};

export const achievementStore = createAchievementStore();