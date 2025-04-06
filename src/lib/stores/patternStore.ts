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

// Modified part of patternStore.ts
// Derived store for pattern data with metadata (including sort)
export const patternDataList = derived(
	[generatedPatterns, sortConfig, progressStore],
	([$generatedPatterns, $sortConfig, $progressStore]) => {
		// Create array of pattern data objects
		const patternData = $generatedPatterns.map((pattern) => {
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

		// Sort data based on current sort configuration
		patternData.sort((a, b) => {
			let comparison = 0;

			switch ($sortConfig.sortType) {
				case SortType.Pattern:
					comparison = a.pattern.localeCompare(b.pattern);
					break;

				case SortType.MaxCatches:
					comparison = a.maxCatches - b.maxCatches;
					break;

				case SortType.Date:
					// Handle null dates (put them at the end)
					if (a.dateCompleted === null && b.dateCompleted === null) {
						comparison = 0;
					} else if (a.dateCompleted === null) {
						comparison = 1;
					} else if (b.dateCompleted === null) {
						comparison = -1;
					} else {
						// Parse dates for comparison
						const dateA = new Date(a.dateCompleted.replace(/-/g, '/'));
						const dateB = new Date(b.dateCompleted.replace(/-/g, '/'));
						comparison = dateA.getTime() - dateB.getTime();
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
