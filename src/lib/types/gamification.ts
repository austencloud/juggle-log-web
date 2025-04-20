export interface GamificationState {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  lastLevelUp: number | null; // timestamp
}

export interface ExperienceEvent {
  type: ExperienceType;
  amount?: number;
  pattern?: string;
  catches?: number;
  catchImprovement?: number;
}

export enum ExperienceType {
  PATTERN_MASTERY = 'PATTERN_MASTERY',
  PRACTICE = 'PRACTICE',
  STREAK_BONUS = 'STREAK_BONUS',
  QUEST_COMPLETION = 'QUEST_COMPLETION',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

export interface LevelUpEvent {
  level: number;
  xpGained: number;
  timestamp: number;
}

export interface QuestProgress {
  type: QuestProgressType;
  pattern?: string;
  amount?: number;
}

export enum QuestProgressType {
  MASTER_PATTERN = 'MASTER_PATTERN',
  IMPROVE_CATCHES = 'IMPROVE_CATCHES',
  PRACTICE_SESSION = 'PRACTICE_SESSION',
  MAINTAIN_STREAK = 'MAINTAIN_STREAK'
}