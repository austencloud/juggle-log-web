import { writable, derived } from 'svelte/store';
import type { GamificationState, ExperienceEvent, LevelUpEvent } from '../types/gamification';
import { 
  calculateLevelFromXP, 
  calculateXPForNextLevel, 
  getXPRequiredForLevel, 
  calculateXPGain,
  applyStreakBonus,
  applyDifficultyModifier
} from '../utils/experienceCalculator';
import { isBrowser } from '../utils/browser';

const STORAGE_KEY = 'jugglelog_gamification_state';

const defaultState: GamificationState = {
  level: 1,
  totalXP: 0,
  currentLevelXP: 0,
  xpToNextLevel: 400, // XP needed for level 2
  lastLevelUp: null
};

export const createGamificationStore = () => {
  const { subscribe, update, set } = writable<GamificationState>(defaultState);
  
  // Initialize from localStorage when in browser
  if (isBrowser) {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        set(parsedState);
      } catch (e) {
        console.error('Failed to parse saved gamification state', e);
      }
    }
  }
  
  // Save state to localStorage on changes
  subscribe((state) => {
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  });

  // Function to add experience and handle level ups
  const addExperience = (event: ExperienceEvent): { xp: number, levelUp: boolean } => {
    let xpGained = calculateXPGain(event);
    let leveledUp = false;
    
    update(state => {
      // Add XP to total
      const newTotalXP = state.totalXP + xpGained;
      
      // Calculate new level
      const newLevel = calculateLevelFromXP(newTotalXP);
      const levelUp = newLevel > state.level;
      
      if (levelUp) {
        leveledUp = true;
      }
      
      // Calculate XP within current level
      const levelXPRequirement = getXPRequiredForLevel(newLevel);
      const nextLevelXPRequirement = getXPRequiredForLevel(newLevel + 1);
      const currentLevelXP = newTotalXP - levelXPRequirement;
      const xpToNextLevel = nextLevelXPRequirement - levelXPRequirement - currentLevelXP;
      
      return {
        level: newLevel,
        totalXP: newTotalXP,
        currentLevelXP,
        xpToNextLevel,
        lastLevelUp: levelUp ? Date.now() : state.lastLevelUp
      };
    });
    
    return { xp: xpGained, levelUp: leveledUp };
  };
  
  // Get current level progress as a percentage
  const getProgress = (): number => {
    let progress = 0;
    
    subscribe(state => {
      const totalLevelXP = state.currentLevelXP + state.xpToNextLevel;
      progress = totalLevelXP > 0 ? (state.currentLevelXP / totalLevelXP) * 100 : 0;
    })();
    
    return progress;
  };
  
  return {
    subscribe,
    
    init: () => {
      // Any initialization logic if needed
    },
    
    reset: () => {
      set(defaultState);
    },
    
    addExperience,
    
    calculateLevel: (xp: number) => calculateLevelFromXP(xp),
    
    getRequiredXP: (level: number) => getXPRequiredForLevel(level),
    
    getProgress,
    
    checkLevelUp: (oldXP: number, newXP: number): LevelUpEvent | null => {
      const oldLevel = calculateLevelFromXP(oldXP);
      const newLevel = calculateLevelFromXP(newXP);
      
      if (newLevel > oldLevel) {
        return {
          level: newLevel,
          xpGained: newXP - oldXP,
          timestamp: Date.now()
        };
      }
      
      return null;
    },
    
    applyXPModifiers: (baseXP: number, modifiers: { streakDays?: number, difficulty?: number }) => {
      let modifiedXP = baseXP;
      
      if (modifiers.streakDays) {
        modifiedXP = applyStreakBonus(modifiedXP, modifiers.streakDays);
      }
      
      if (modifiers.difficulty) {
        modifiedXP = applyDifficultyModifier(modifiedXP, modifiers.difficulty);
      }
      
      return modifiedXP;
    }
  };
};

export const gamificationStore = createGamificationStore();