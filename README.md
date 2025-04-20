# JuggleLog Gamification Plan

This document outlines the implementation plan for gamifying the JuggleLog app. It includes specific file locations, function names, and components to be created or modified.

## File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Gamification/                  # New folder for gamification components
│   │   │   ├── Achievement.svelte         # Achievement display component
│   │   │   ├── AchievementPopup.svelte    # Popup notification for achievements
│   │   │   ├── DailyQuest.svelte          # Daily quest component
│   │   │   ├── LevelProgressBar.svelte    # Level and XP progress visualization
│   │   │   ├── PointsDisplay.svelte       # Display for points and level
│   │   │   ├── QuestLog.svelte            # List of active quests
│   │   │   ├── Streak.svelte              # Streak tracking component
│   │   │   └── TrophyCase.svelte          # Display for earned achievements
│   │   ├── Profile/                       # User profile components
│   │   │   ├── ProfileCard.svelte         # User profile summary
│   │   │   ├── ProgressChart.svelte       # Progress visualization
│   │   │   └── Statistics.svelte          # User statistics
│   │   └── Social/                        # Social feature components
│   │       ├── Leaderboard.svelte         # Leaderboard display
│   │       ├── FriendActivity.svelte      # Friend activity feed
│   │       └── ChallengeCard.svelte       # Challenge display
│   ├── stores/
│   │   ├── achievementStore.ts            # Store for achievement system
│   │   ├── gamificationStore.ts           # Core gamification state store
│   │   ├── questStore.ts                  # Store for quests and challenges
│   │   ├── leaderboardStore.ts            # Store for leaderboards and rankings
│   │   └── streakStore.ts                 # Store for tracking practice streaks
│   ├── types/
│   │   ├── gamification.ts                # Types for gamification features
│   │   └── achievements.ts                # Achievement system types
│   └── utils/
│       ├── achievementUtils.ts            # Functions for achievement logic
│       ├── experienceCalculator.ts        # Functions for calculating XP
│       ├── streakTracker.ts               # Functions for tracking streaks
│       └── rewardGenerator.ts             # Functions for generating rewards
└── routes/
    ├── achievements/
    │   └── +page.svelte                   # Achievements page
    ├── profile/
    │   └── +page.svelte                   # User profile page
    ├── leaderboards/
    │   └── +page.svelte                   # Leaderboards page
    └── quests/
        └── +page.svelte                   # Daily quests and challenges page
```

## Core Gamification Components

### 1. Experience & Leveling System

#### Files:
- `src/lib/stores/gamificationStore.ts`

```typescript
// Core store for gamification state
export const createGamificationStore = () => {
  // Store implementation
  
  return {
    // Store functions
    addExperience,
    calculateLevel,
    getRequiredXP,
    getProgress,
    checkLevelUp,
    applyXPModifiers
  };
};

export const gamificationStore = createGamificationStore();
```

- `src/lib/utils/experienceCalculator.ts`

```typescript
// Calculate XP for various activities
export function calculateSessionXP(sessionData: SessionData): number { /* ... */ }
export function calculatePatternXP(pattern: string, catches: number): number { /* ... */ }
export function applyStreakBonus(baseXP: number, streakDays: number): number { /* ... */ }
export function applyDifficultyModifier(baseXP: number, difficulty: number): number { /* ... */ }
export function calculateLevelFromXP(totalXP: number): number { /* ... */ }
export function getXPRequiredForLevel(level: number): number { /* ... */ }
```

- `src/lib/components/Gamification/LevelProgressBar.svelte`

Displays the user's level, XP, and progress toward the next level.

#### Usage in MainWidget.svelte:

Add the level progress bar to the header:

```html
<div class="header-content">
  <h1 class="title" on:click={triggerConfetti}>Juggle Log</h1>
  <LevelProgressBar />
</div>
```

### 2. Achievement System

#### Files:
- `src/lib/types/achievements.ts`

```typescript
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

// Define achievement list
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
  // ... more achievements
];
```

- `src/lib/stores/achievementStore.ts`

```typescript
import type { Achievement } from '../types/achievements';
import { writable, derived } from 'svelte/store';
import { isBrowser } from '../utils/browser';
import { gamificationStore } from './gamificationStore';

export const createAchievementStore = () => {
  const { subscribe, update, set } = writable<{
    achievements: Record<string, Achievement>;
    recentlyEarned: string[];
  }>({
    achievements: {},
    recentlyEarned: []
  });

  return {
    subscribe,
    init,
    checkAchievements,
    awardAchievement,
    clearRecentlyEarned,
    getCompletedCount,
    reset
  };
};

export const achievementStore = createAchievementStore();
```

- `src/lib/utils/achievementUtils.ts`

```typescript
export function checkPatternMasteryAchievements(
  completedPatterns: string[],
  maxCatches: Record<string, number>
): string[] { /* ... */ }

export function checkConsistencyAchievements(
  streakData: StreakData,
  sessionCount: number
): string[] { /* ... */ }

export function checkMilestoneAchievements(
  stats: UserStats
): string[] { /* ... */ }

export function checkTechniqueAchievements(
  patternData: PatternData[]
): string[] { /* ... */ }
```

- `src/lib/components/Gamification/Achievement.svelte`
- `src/lib/components/Gamification/AchievementPopup.svelte`
- `src/lib/components/Gamification/TrophyCase.svelte`

### 3. Quest & Challenge System

#### Files:
- `src/lib/types/gamification.ts`

```typescript
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  requiredValue: number;
  currentValue: number;
  completed: boolean;
  expiresAt: number; // Unix timestamp
  rewards: QuestReward;
}

export enum QuestType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CHALLENGE = 'challenge',
  SPECIAL = 'special'
}

export interface QuestReward {
  xp: number;
  streakPoints?: number;
  achievement?: string;
}
```

- `src/lib/stores/questStore.ts`

```typescript
import type { Quest } from '../types/gamification';
import { writable, derived } from 'svelte/store';
import { isBrowser } from '../utils/browser';
import { gamificationStore } from './gamificationStore';

export const createQuestStore = () => {
  const { subscribe, update, set } = writable<{
    quests: Quest[];
    lastRefresh: number;
  }>({
    quests: [],
    lastRefresh: 0
  });

  return {
    subscribe,
    generateDailyQuests,
    generateWeeklyChallenge,
    generatePatternOfTheDay,
    updateQuestProgress,
    completeQuest,
    refreshQuests,
    checkExpiredQuests
  };
};

export const questStore = createQuestStore();
```

- `src/lib/utils/questGenerator.ts`

```typescript
export function generateDailyQuests(
  userLevel: number,
  completedPatterns: string[],
  recentPatterns: string[]
): Quest[] { /* ... */ }

export function generateWeeklyChallenge(
  userLevel: number,
  userStats: UserStats
): Quest { /* ... */ }

export function generatePatternOfTheDay(
  userLevel: number,
  patternPool: string[]
): string { /* ... */ }
```

- `src/lib/components/Gamification/QuestLog.svelte`
- `src/lib/components/Gamification/DailyQuest.svelte`

### 4. Streak System

#### Files:
- `src/lib/stores/streakStore.ts`

```typescript
import { writable, derived } from 'svelte/store';
import { isBrowser } from '../utils/browser';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  streakPoints: number;
  pendingStreak: boolean;
}

export const createStreakStore = () => {
  const { subscribe, update, set } = writable<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    streakPoints: 0,
    pendingStreak: false
  });

  return {
    subscribe,
    recordPractice,
    checkStreakStatus,
    getStreakModifier,
    resetStreak,
    addStreakPoints
  };
};

export const streakStore = createStreakStore();
```

- `src/lib/utils/streakTracker.ts`

```typescript
export function calculateDaysBetween(date1: string, date2: string): number { /* ... */ }
export function isSameDay(date1: string, date2: string): boolean { /* ... */ }
export function isConsecutiveDay(previousDate: string, currentDate: string): boolean { /* ... */ }
export function calculateStreakModifier(streakDays: number): number { /* ... */ }
```

- `src/lib/components/Gamification/Streak.svelte`

### 5. Notification System

#### Files:
- `src/lib/components/ui/NotificationCenter.svelte`

Central component for displaying various notifications and popups.

- `src/lib/stores/notificationStore.ts`

```typescript
import { writable } from 'svelte/store';

export const notificationStore = writable<Notification[]>([]);

export function addNotification(
  message: string,
  type: 'achievement' | 'level' | 'streak' | 'challenge' | 'info',
  duration = 5000,
  data?: any
) { /* ... */ }

export function clearNotification(id: string) { /* ... */ }
export function clearAllNotifications() { /* ... */ }
```

## Integrating into Main App Components

### Modify PatternRow.svelte

Update to award XP when patterns are tracked/completed:

```typescript
// Import gamification utilities
import { gamificationStore } from '$lib/stores/gamificationStore';
import { achievementStore } from '$lib/stores/achievementStore';
import { questStore } from '$lib/stores/questStore';

// In the script section where patterns are updated
$: {
  if (!wasCompleted && patternData.isCompleted) {
    // Existing code for completion
    
    // Add gamification features
    const earnedXP = gamificationStore.addExperience({
      type: 'PATTERN_MASTERY',
      pattern: patternData.pattern,
      catches: patternData.maxCatches
    });
    
    // Check for achievements
    achievementStore.checkAchievements('PATTERN_MASTERY');
    
    // Update quest progress
    questStore.updateQuestProgress({
      type: 'MASTER_PATTERN',
      pattern: patternData.pattern
    });
  }
}
```

### Modify PatternSpinBox.svelte

Add XP for updating catches:

```typescript
function updateCatches(): void {
  catches = Math.max(MIN_CATCHES, Math.min(catches, MAX_CATCHES));
  
  // Record previous catches for comparison
  const previousCatches = progressStore.getMaxCatches(storageKey);
  
  // Update progress store
  progressStore.setMaxCatches(storageKey, catches);
  
  // Award XP for improvement
  if (catches > previousCatches) {
    const improvement = catches - previousCatches;
    
    gamificationStore.addExperience({
      type: 'PRACTICE',
      pattern: storageKey,
      catchImprovement: improvement
    });
    
    // Update quest progress
    questStore.updateQuestProgress({
      type: 'IMPROVE_CATCHES',
      pattern: storageKey,
      amount: improvement
    });
    
    // Record practice for streak
    streakStore.recordPractice();
  }
}
```

### Add to MainWidget.svelte

Add notification center and quest log:

```html
<div class="main-widget" class:wide-layout={isWideLayout} class:narrow-layout={!isWideLayout}>
  <NotificationCenter />
  
  <header class="widget-header">
    <!-- Existing header content -->
    <div class="header-controls">
      <PointsDisplay />
    </div>
  </header>

  <div class="main-content" class:wide-layout={isWideLayout} class:narrow-layout={!isWideLayout}>
    <div class="control-panel-wrapper">
      <ControlPanel />
      <QuestLog />
    </div>
    <!-- Rest of existing content -->
  </div>
</div>
```

## App Initialization

Update `src/main.ts` to initialize gamification features:

```typescript
import MainWidget from './lib/components/MainWidget.svelte';
import { gamificationStore } from './lib/stores/gamificationStore';
import { achievementStore } from './lib/stores/achievementStore';
import { questStore } from './lib/stores/questStore';
import { streakStore } from './lib/stores/streakStore';

// Initialize gamification system
gamificationStore.init();
achievementStore.init();
questStore.refreshQuests();
streakStore.checkStreakStatus();

const app = new MainWidget({
  target: document.getElementById('app') || document.body
});

export default app;
```

## Implementation Order

1. **Phase 1: Core Gamification Framework**
   - Implement gamificationStore with XP and leveling system
   - Create basic achievement framework
   - Add LevelProgressBar and PointsDisplay components

2. **Phase 2: Achievement System**
   - Implement full achievement list
   - Create achievement popups and trophy case
   - Integrate achievement checks into pattern tracking

3. **Phase 3: Quests & Challenges**
   - Build quest generation system
   - Create daily and weekly quest UI
   - Implement Pattern of the Day feature

4. **Phase 4: Streak System**
   - Implement streak tracking
   - Create streak UI and rewards
   - Add streak bonuses to XP calculations

5. **Phase 5: Social Features**
   - Add profile page
   - Implement progress statistics and visualizations
   - Create leaderboard system (if adding backend)

6. **Phase 6: Animation & Feedback**
   - Enhance visual feedback for achievements
   - Add sound effects for milestones
   - Implement celebration animations

## Testing Strategy

For each component, verify:

1. State persistence (localStorage)
2. Correct XP calculations
3. Achievement triggers
4. Quest completion logic
5. UI transitions and animations

## Future Feature Ideas

- Skill tree system for different juggling disciplines
- Custom pattern creator
- Challenge friends feature (requires backend)
- In-app mini-games
- Video upload and progress sharing
- Guided practice mode