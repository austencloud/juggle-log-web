import type { ExperienceEvent } from '../types/gamification';

export function calculateSessionXP(duration: number, patterns: number): number {
  // Base XP for practice session
  const baseXP = 10;
  // Bonus for longer sessions
  const durationBonus = Math.floor(duration / 5) * 2;
  // Bonus for variety
  const varietyBonus = patterns * 5;
  
  return baseXP + durationBonus + varietyBonus;
}

export function calculatePatternXP(pattern: string, catches: number): number {
  // Base XP for tracking a pattern
  const baseXP = 15;
  
  // Calculate difficulty modifier based on pattern
  // More complex patterns (more digits) earn more XP
  const complexity = pattern.split('').filter(char => /\d/.test(char)).length;
  const complexityModifier = Math.max(1, complexity * 0.5);
  
  // Calculate catch bonus
  const catchBonus = Math.floor(catches / 10) * 5;
  
  return Math.round((baseXP + catchBonus) * complexityModifier);
}

export function applyStreakBonus(baseXP: number, streakDays: number): number {
  // No streak bonus for streaks less than 2 days
  if (streakDays < 2) return baseXP;
  
  // Calculate streak multiplier
  // 5% bonus per day of streak, capped at 50%
  const streakMultiplier = Math.min(1.5, 1 + (streakDays * 0.05));
  
  return Math.round(baseXP * streakMultiplier);
}

export function applyDifficultyModifier(baseXP: number, difficulty: number): number {
  // Difficulty is a scale from 1 to 10
  // 1 = 100% XP, 10 = 200% XP
  const difficultyMultiplier = 1 + ((difficulty - 1) / 10);
  
  return Math.round(baseXP * difficultyMultiplier);
}

export function calculateLevelFromXP(totalXP: number): number {
  // Level formula: level = Math.floor(1 + sqrt(totalXP / 100))
  // Level 1: 0-399 XP
  // Level 2: 400-899 XP
  // Level 3: 900-1599 XP, etc.
  return Math.floor(1 + Math.sqrt(totalXP / 100));
}

export function getXPRequiredForLevel(level: number): number {
  // Inverse of the level formula
  if (level <= 1) return 0;
  return (level - 1) * (level - 1) * 100;
}

export function calculateXPForNextLevel(currentLevel: number): number {
  return getXPRequiredForLevel(currentLevel + 1);
}

export function calculateXPGain(event: ExperienceEvent): number {
  switch(event.type) {
    case 'PATTERN_MASTERY':
      return event.catches ? calculatePatternXP(event.pattern || '', event.catches) : 15;
    
    case 'PRACTICE':
      if (event.catchImprovement && event.pattern) {
        // XP for improving a pattern
        return Math.floor(event.catchImprovement * 2);
      } else if (event.amount) {
        // General practice
        return event.amount;
      }
      return 10;
    
    case 'STREAK_BONUS':
      return event.amount || 25;
    
    case 'QUEST_COMPLETION':
      return event.amount || 50;
    
    case 'ACHIEVEMENT':
      return event.amount || 100;
    
    default:
      return 10;
  }
}