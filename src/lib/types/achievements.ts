export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requiredValue: number;
  currentValue: number;
  completed: boolean;
  completionDate?: string;
  xpReward: number;
  hidden: boolean;
}

export enum AchievementCategory {
  PATTERN_MASTERY = 'pattern_mastery',
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  TECHNIQUE = 'technique',
  SPECIAL = 'special'
}

export const ACHIEVEMENTS: Achievement[] = [
  // Pattern Mastery Achievements
  {
    id: 'first_pattern',
    name: 'First Steps',
    description: 'Master your first pattern',
    icon: 'trophy',
    category: AchievementCategory.PATTERN_MASTERY,
    requiredValue: 1,
    currentValue: 0,
    completed: false,
    xpReward: 100,
    hidden: false
  },
  {
    id: 'pattern_collector',
    name: 'Pattern Collector',
    description: 'Master 5 different patterns',
    icon: 'collection',
    category: AchievementCategory.PATTERN_MASTERY,
    requiredValue: 5,
    currentValue: 0,
    completed: false,
    xpReward: 250,
    hidden: false
  },
  {
    id: 'pattern_expert',
    name: 'Pattern Expert',
    description: 'Master 15 different patterns',
    icon: 'star',
    category: AchievementCategory.PATTERN_MASTERY,
    requiredValue: 15,
    currentValue: 0,
    completed: false,
    xpReward: 500,
    hidden: false
  },
  
  // Consistency Achievements
  {
    id: 'first_streak',
    name: 'Consistent',
    description: 'Practice for 3 days in a row',
    icon: 'calendar',
    category: AchievementCategory.CONSISTENCY,
    requiredValue: 3,
    currentValue: 0,
    completed: false,
    xpReward: 150,
    hidden: false
  },
  {
    id: 'week_streak',
    name: 'Weekly Warrior',
    description: 'Practice for 7 days in a row',
    icon: 'fire',
    category: AchievementCategory.CONSISTENCY,
    requiredValue: 7,
    currentValue: 0,
    completed: false,
    xpReward: 300,
    hidden: false
  },
  {
    id: 'month_streak',
    name: 'Monthly Master',
    description: 'Practice for 30 days in a row',
    icon: 'crown',
    category: AchievementCategory.CONSISTENCY,
    requiredValue: 30,
    currentValue: 0,
    completed: false,
    xpReward: 1000,
    hidden: false
  },
  
  // Milestone Achievements
  {
    id: 'catch_milestone_50',
    name: 'Half-Century',
    description: 'Reach 50 catches on any pattern',
    icon: 'target',
    category: AchievementCategory.MILESTONE,
    requiredValue: 50,
    currentValue: 0,
    completed: false,
    xpReward: 200,
    hidden: false
  },
  {
    id: 'catch_milestone_100',
    name: 'Century Catcher',
    description: 'Reach 100 catches on any pattern',
    icon: 'medal',
    category: AchievementCategory.MILESTONE,
    requiredValue: 100,
    currentValue: 0,
    completed: false,
    xpReward: 350,
    hidden: false
  },
  {
    id: 'catch_milestone_500',
    name: 'Endurance Champion',
    description: 'Reach 500 catches on any pattern',
    icon: 'trophy-gold',
    category: AchievementCategory.MILESTONE,
    requiredValue: 500,
    currentValue: 0,
    completed: false,
    xpReward: 800,
    hidden: false
  }
];