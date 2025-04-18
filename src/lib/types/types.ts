// src/lib/types/types.ts

/**
 * Types of throw techniques
 */
export interface ThrowType {
	/** Short code for the throw (e.g., "S" for Single) */
	code: string;
	/** Full descriptive name of the throw technique */
	name: string;
	/** Optional description of the throw technique */
	description?: string;
	/** Optional difficulty level from 1-5 */
	difficulty?: number;
}

/**
 * Progress data structure stored in localStorage
 */
export interface ProgressData {
	/** List of pattern strings that have been completed */
	completedPatterns: string[];
	/** Map of pattern string to number of catches achieved */
	maxCatches: Record<string, number>;
	/** Map of pattern string to date completed */
	lastUpdatedDates: Record<string, string>;
}

/**
 * Pattern with metadata for display
 */
export interface PatternData {
	/** The pattern string (sequence of throw codes) */
	pattern: string;
    /** The key used for storing/retrieving progress (e.g., "DS" or "DS_R") */
    storageKey: string;
	/** The maximum number of catches achieved */
	maxCatches: number;
	/** The date the pattern was completed, or null if not completed */
	lastUpdated: string | null;
	/** Whether the pattern is considered completed (max catches >= 100) */
	isCompleted: boolean;
}

/**
 * Sort order for tables
 */
export enum SortOrder {
	/** Ascending order (A-Z, 0-9) */
	Ascending = 'ascending',
	/** Descending order (Z-A, 9-0) */
	Descending = 'descending'
}

/**
 * Sort type for pattern table
 */
export enum SortType {
	/** Sort by pattern sequence */
	Pattern = 'pattern',
	/** Sort by maximum catches achieved */
	MaxCatches = 'maxCatches',
	/** Sort by completion date */
	Date = 'date'
}

/**
 * Toast notification levels
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification data
 */
export interface Toast {
	/** The message to display */
	message: string;
	/** The type of notification */
	type: ToastType;
	/** Optional duration in milliseconds */
	duration?: number;
	/** Optional ID for tracking and dismissing */
	id?: string;
}

/**
 * UI state for animations and visual effects
 */
export interface UiState {
	/** Whether the pattern table is visible */
	isPatternTableVisible: boolean;
	/** The most recently completed pattern, if any */
	recentlyCompletedPattern: string | null;
	/** The currently active throw types */
	activeThrowTypes: string[];
	/** The current toast notification, if any */
	toast: Toast | null;
	/** Whether confetti animation is active */
	showConfetti: boolean;
}

/**
 * Configuration for pattern generation
 */
export interface PatternConfig {
	/** The selected throw types */
	throwTypes: string[];
	/** The length of patterns to generate */
	patternLength: number;
	/** Whether to include rotations */
	includeRotations: boolean;
	/** Whether to include repetitions */
	includeRepetitions: boolean;
}

/**
 * Defined throw buttons for the application
 */
export const THROW_BUTTONS: ThrowType[] = [
	{ code: 'S', name: 'Single', description: 'Standard single throw', difficulty: 1 },
	{ code: 'D', name: 'Double', description: 'Throw travels twice as high', difficulty: 2 },
	{ code: 'L', name: 'Lazy', description: 'Low throw for timing adjustments', difficulty: 2 },
	{ code: 'F', name: 'Flat', description: 'Horizontal spin throw', difficulty: 2 },
	{ code: 'B', name: 'Behind the back', description: 'Throw from behind the back', difficulty: 3 },
	{ code: 'P', name: 'Penguin', description: 'Throw with arm across body', difficulty: 3 },
	{
		code: 'O',
		name: 'Over the top',
		description: 'Throw a single on with an outside throw',
		difficulty: 3
	},
	{
		code: 'Od',
		name: 'Over the top double',
		description: 'Double height over the top',
		difficulty: 4
	},
	{
		code: 'Us',
		name: 'Under same leg',
		description: 'Throw under the same side leg',
		difficulty: 3
	},
	{
		code: 'Uo',
		name: 'Under opposite leg',
		description: 'Throw under the opposite side leg',
		difficulty: 4
	},
	{
		code: 'Cd',
		name: 'Circus Double',
		description: 'Double thrown at single height',
		difficulty: 4
	}
];
