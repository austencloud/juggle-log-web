import { writable, derived, get } from 'svelte/store';
import type { ProgressData, PatternData } from '../types/types';
import { ProgressTracker } from '../utils/progressTracker';
import { browser } from '$app/environment';

// Initialize progress store with data from localStorage
const createProgressStore = () => {
	// Initialize with empty data
	const initialData: ProgressData = {
		completedPatterns: [],
		maxCatches: {},
		completionDates: {}
	};

	const { subscribe, update, set } = writable<ProgressData>(initialData);

	// If in browser, load data from localStorage
	if (browser) {
		const storedData = ProgressTracker.loadProgress();
		set(storedData);
	}

	return {
		subscribe,
		/**
		 * Set max catches for a pattern and update completion status
		 */
		setMaxCatches: (pattern: string, catches: number) => {
			update((data) => {
				const updatedData = { ...data };

				// Check if this is a repeating pattern and update all related patterns
				if (ProgressTracker.isRepeatingPattern(pattern)) {
					const relatedPatterns = ProgressTracker.getRelatedPatterns(pattern);

					relatedPatterns.forEach((relatedPattern) => {
						// Update max catches
						updatedData.maxCatches[relatedPattern] = catches;

						// Update completion status
						if (catches >= 100) {
							if (!updatedData.completedPatterns.includes(relatedPattern)) {
								updatedData.completedPatterns.push(relatedPattern);
							}
							// Set completion date if not already set
							if (!updatedData.completionDates[relatedPattern]) {
								updatedData.completionDates[relatedPattern] = ProgressTracker.getCurrentDate();
							}
						} else {
							// Remove from completed patterns
							updatedData.completedPatterns = updatedData.completedPatterns.filter(
								(p) => p !== relatedPattern
							);

							// Remove completion date if catches is 0
							if (catches === 0 && updatedData.completionDates[relatedPattern]) {
								delete updatedData.completionDates[relatedPattern];
							}
						}
					});
				} else {
					// Update single pattern
					updatedData.maxCatches[pattern] = catches;

					if (catches >= 100) {
						if (!updatedData.completedPatterns.includes(pattern)) {
							updatedData.completedPatterns.push(pattern);
						}
						// Set completion date if not already set
						if (!updatedData.completionDates[pattern]) {
							updatedData.completionDates[pattern] = ProgressTracker.getCurrentDate();
						}
					} else {
						// Remove from completed patterns
						updatedData.completedPatterns = updatedData.completedPatterns.filter(
							(p) => p !== pattern
						);

						// Remove completion date if catches is 0
						if (catches === 0 && updatedData.completionDates[pattern]) {
							delete updatedData.completionDates[pattern];
						}
					}
				}

				// Save to localStorage
				ProgressTracker.saveProgress(updatedData);

				return updatedData;
			});
		},

		/**
		 * Get completion status for a pattern
		 */
		isCompleted: (pattern: string) => {
			const data = get({ subscribe });
			return data.maxCatches[pattern] >= 100;
		},

		/**
		 * Get max catches for a pattern
		 */
		getMaxCatches: (pattern: string) => {
			const data = get({ subscribe });
			return data.maxCatches[pattern] || 0;
		},

		/**
		 * Get completion date for a pattern
		 */
		getCompletionDate: (pattern: string) => {
			const data = get({ subscribe });
			return data.completionDates[pattern] || null;
		},

		/**
		 * Reset store to initial state
		 */
		reset: () => {
			const emptyData: ProgressData = {
				completedPatterns: [],
				maxCatches: {},
				completionDates: {}
			};

			ProgressTracker.saveProgress(emptyData);
			set(emptyData);
		}
	};
};

// Create and export the progress store
export const progressStore = createProgressStore();

// Derived store to get pattern data with metadata for a list of patterns
export const getPatternDataList = (patterns: string[]) => {
	return derived(progressStore, ($progressStore) => {
		return patterns.map((pattern) => {
			const maxCatches = $progressStore.maxCatches[pattern] || 0;
			const isCompleted = maxCatches >= 100;
			const dateCompleted = $progressStore.completionDates[pattern] || null;

			return {
				pattern,
				maxCatches,
				dateCompleted,
				isCompleted
			} as PatternData;
		});
	});
};
