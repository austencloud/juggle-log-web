import { writable, derived, get } from 'svelte/store';
import { PatternGenerator } from '../utils/patternGenerator';
import { getPatternDataList, progressStore } from './progressStore';
import type { PatternData } from '../types/types';
import { SortOrder, SortType } from '../types/types';

// Store for selected throws
export const selectedThrows = writable<Set<string>>(new Set());

// Store for pattern length
export const patternLength = writable<number>(3);

// Derived store for generated patterns
export const generatedPatterns = derived(
	[selectedThrows, patternLength],
	([$selectedThrows, $patternLength]) => {
		const throwArray = Array.from($selectedThrows).sort();
		return PatternGenerator.generatePatterns(throwArray, $patternLength);
	}
);

// Current sort config
export const sortConfig = writable({
	sortType: SortType.Pattern,
	sortOrder: SortOrder.Ascending
});

// Derived store for pattern data with metadata (including sort)
export const patternDataList = derived(
	[generatedPatterns, sortConfig, progressStore, patternLength], // Add patternLength dependency
	([$generatedPatterns, $sortConfig, $progressStore, $patternLength]) => {
		const isEvenLength = $patternLength % 2 === 0;

		// Create array of pattern data objects
		const patternData: PatternData[] = $generatedPatterns.flatMap((pattern) => {
			if (isEvenLength) {
				// Even length: Create two entries, one for Right, one for Left
				const storageKeyR = pattern + '_R';
				const storageKeyL = pattern + '_L';

				const maxCatchesR = $progressStore.maxCatches[storageKeyR] || 0;
				const isCompletedR = maxCatchesR >= 100;
				const lastUpdatedR = $progressStore.lastUpdatedDates[storageKeyR] || null;

				const maxCatchesL = $progressStore.maxCatches[storageKeyL] || 0;
				const isCompletedL = maxCatchesL >= 100;
				const lastUpdatedL = $progressStore.lastUpdatedDates[storageKeyL] || null;

				return [
					{
						pattern,
						storageKey: storageKeyR,
						maxCatches: maxCatchesR,
						lastUpdated: lastUpdatedR,
						isCompleted: isCompletedR
					} as PatternData,
					{
						pattern,
						storageKey: storageKeyL,
						maxCatches: maxCatchesL,
						lastUpdated: lastUpdatedL,
						isCompleted: isCompletedL
					} as PatternData
				];
			} else {
				// Odd length: Create single entry
				const storageKey = pattern;
				const maxCatches = $progressStore.maxCatches[storageKey] || 0;
				const isCompleted = maxCatches >= 100;
				const lastUpdated = $progressStore.lastUpdatedDates[storageKey] || null;

				return [
					{
						pattern,
						storageKey,
						maxCatches,
						lastUpdated,
						isCompleted
					} as PatternData
				];
			}
		});

		// Sort data based on current sort configuration
		patternData.sort((a, b) => {
			let comparison = 0;

			switch ($sortConfig.sortType) {
				case SortType.Pattern:
					// Sort primarily by pattern string, then by storageKey to keep R/L together
					comparison = a.pattern.localeCompare(b.pattern);
					if (comparison === 0) {
						comparison = a.storageKey.localeCompare(b.storageKey); // _R before _L
					}
					break;

				case SortType.MaxCatches:
					comparison = a.maxCatches - b.maxCatches;
					// Secondary sort by pattern if catches are equal
					if (comparison === 0) {
						comparison = a.pattern.localeCompare(b.pattern);
						if (comparison === 0) {
							comparison = a.storageKey.localeCompare(b.storageKey);
						}
					}
					break;

				case SortType.Date:
					// Handle null dates (put them at the end)
					if (a.lastUpdated === null && b.lastUpdated === null) {
						comparison = 0;
					} else if (a.lastUpdated === null) {
						comparison = 1;
					} else if (b.lastUpdated === null) {
						comparison = -1;
					} else {
						const dateA = new Date(a.lastUpdated.replace(/-/g, '/'));
						const dateB = new Date(b.lastUpdated.replace(/-/g, '/'));
						comparison = dateA.getTime() - dateB.getTime();
					}
					// Secondary sort by pattern if dates are equal
					if (comparison === 0) {
						comparison = a.pattern.localeCompare(b.pattern);
						if (comparison === 0) {
							comparison = a.storageKey.localeCompare(b.storageKey);
						}
					}
					break;
			}

			// Apply sort order
			return $sortConfig.sortOrder === SortOrder.Ascending ? comparison : -comparison;
		});

		return patternData;
	}
);

// Helper functions to toggle throws
export function toggleThrow(throwCode: string): void {
	selectedThrows.update((throws) => {
		const newThrows = new Set(throws);
		if (newThrows.has(throwCode)) {
			newThrows.delete(throwCode);
		} else {
			newThrows.add(throwCode);
		}
		return newThrows;
	});
}

// Update sort configuration
export function updateSort(sortType: SortType): void {
	sortConfig.update((config) => {
		if (config.sortType === sortType) {
			// Toggle the order if the same column is clicked
			return {
				sortType,
				sortOrder:
					config.sortOrder === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending
			};
		} else {
			// New column, default to ascending
			return {
				sortType,
				sortOrder: SortOrder.Ascending
			};
		}
	});
}
