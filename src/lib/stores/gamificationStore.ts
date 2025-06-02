import { writable, derived, get } from 'svelte/store';
import type { GamificationState, ExperienceEvent, LevelUpEvent } from '../types/gamification';
import { 
  calculateXPGain, 
  calculateLevelFromXP, 
  getXPRequiredForLevel,
  applyStreakBonus,
  applyDifficultyModifier
} from '../utils/experienceCalculator';
import { isBrowser } from '../utils/browser';

const STORAGE_KEY = 'jugglelog_gamification_state';

const defaultState: GamificationState = {
  level: 1,
  totalXP: 0,
  currentLevelXP: 0,
  xpToNextLevel: 400,
  lastLevelUp: null
};

function createGamificationStore() {
  const store = writable<GamificationState>(defaultState);
  const { subscribe, update, set } = store;
  
  const progress = derived(
    store,
    ($state) => {
      const totalLevelXP = $state.currentLevelXP + $state.xpToNextLevel;
      return totalLevelXP > 0 ? ($state.currentLevelXP / totalLevelXP) * 100 : 0;
    }
  );

  function saveToStorage(state: GamificationState, prefix: string = '') {
    if (!isBrowser) return;
    try {
      const key = prefix + STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save gamification state:', error);
    }
  }

  function loadFromStorage(prefix: string = ''): GamificationState {
    if (!isBrowser) return defaultState;
    try {
      const key = prefix + STORAGE_KEY;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultState;
    } catch (error) {
      console.error('Failed to load gamification state:', error);
      return defaultState;
    }
  }

  return {
    subscribe,
    progress,

    init() {
      const saved = loadFromStorage();
      set(saved);
    },

    addExperience(event: ExperienceEvent): { xp: number, levelUp: boolean } {
      let xpGained = calculateXPGain(event);
      let leveledUp = false;
      
      update(state => {
        const newTotalXP = state.totalXP + xpGained;
        const newLevel = calculateLevelFromXP(newTotalXP);
        const levelUp = newLevel > state.level;
        
        if (levelUp) leveledUp = true;
        
        const levelXPRequirement = getXPRequiredForLevel(newLevel);
        const nextLevelXPRequirement = getXPRequiredForLevel(newLevel + 1);
        const currentLevelXP = newTotalXP - levelXPRequirement;
        const xpToNextLevel = nextLevelXPRequirement - levelXPRequirement - currentLevelXP;
        
        const newState = {
          level: newLevel,
          totalXP: newTotalXP,
          currentLevelXP,
          xpToNextLevel,
          lastLevelUp: levelUp ? Date.now() : state.lastLevelUp
        };

        saveToStorage(newState);
        return newState;
      });
      
      return { xp: xpGained, levelUp: leveledUp };
    },

    saveWithPrefix(prefix: string) {
      const state = get(store);
      saveToStorage(state, prefix);
    },

    loadWithPrefix(prefix: string) {
      const state = loadFromStorage(prefix);
      set(state);
    },

    reset() {
      set(defaultState);
      saveToStorage(defaultState);
    },

    applyXPModifiers(baseXP: number, modifiers: { streakDays?: number, difficulty?: number }) {
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
}

export const gamificationStore = createGamificationStore();