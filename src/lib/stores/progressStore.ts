// src/lib/stores/progressStore.ts
import { writable, derived, get } from 'svelte/store';
import type { ProgressData, PatternData } from '../types/types';
import { ProgressTracker } from '../utils/progressTracker';
import { isBrowser } from '../utils/browser';
import { showToast } from './uiStore';

// Initialize progress store with data from localStorage if in browser
const createProgressStore = () => {
    // Initialize with empty data
    const initialData: ProgressData = {
        completedPatterns: [],
        maxCatches: {},
        completionDates: {}
    };

    const { subscribe, update, set } = writable<ProgressData>(initialData);

    // Only load from storage in the browser
    if (isBrowser) {
        try {
            const storedData = ProgressTracker.loadProgress();
            set(storedData);
        } catch (error) {
            console.error('Failed to load initial progress data', error);
        }
    }

    // Save data to localStorage
    const saveToStorage = (data: ProgressData): void => {
        if (!isBrowser) return;

        try {
            ProgressTracker.saveProgress(data);
        } catch (error) {
            console.error('Error saving progress data:', error);
            if (typeof showToast === 'function') {
                showToast('Error saving your progress data', 'error');
            }
        }
    };

    // Auto-save progress on window unload in browser environments
    if (isBrowser) {
        window.addEventListener('beforeunload', () => {
            saveToStorage(get({ subscribe }));
        });
    }

    return {
        subscribe,
        
        /**
         * Set max catches for a pattern and update completion status
         * @param pattern - The pattern to update
         * @param catches - The number of catches achieved
         * @returns void
         */
        setMaxCatches: (pattern: string, catches: number): void => {
            if (!isBrowser) return; // Skip in SSR context
            
            update((data) => {
                // Validate input
                if (!pattern || pattern.trim() === '') {
                    console.error('Invalid pattern: empty string');
                    return data;
                }
                
                if (isNaN(catches) || catches < 0) {
                    console.error(`Invalid catches value: ${catches}`);
                    return data;
                }

                const updatedData = { ...data };

                // Check if this is a repeating pattern and update all related patterns
                if (ProgressTracker.isRepeatingPattern(pattern)) {
                    try {
                        const relatedPatterns = ProgressTracker.getRelatedPatterns(pattern);
                        
                        relatedPatterns.forEach((relatedPattern) => {
                            updatePatternData(updatedData, relatedPattern, catches);
                        });
                    } catch (error) {
                        console.error('Error processing related patterns:', error);
                        // Continue with just updating the current pattern
                        updatePatternData(updatedData, pattern, catches);
                    }
                } else {
                    // Update single pattern
                    updatePatternData(updatedData, pattern, catches);
                }

                // Save to localStorage
                saveToStorage(updatedData);

                return updatedData;
            });
        },

        /**
         * Check if a pattern is completed
         * @param pattern - The pattern to check
         * @returns boolean indicating if pattern is completed
         */
        isCompleted: (pattern: string): boolean => {
            if (!pattern || pattern.trim() === '') return false;
            
            const data = get({ subscribe });
            return (data.maxCatches[pattern] || 0) >= 100;
        },

        /**
         * Get max catches for a pattern
         * @param pattern - The pattern to check
         * @returns number of catches
         */
        getMaxCatches: (pattern: string): number => {
            if (!pattern || pattern.trim() === '') return 0;
            
            const data = get({ subscribe });
            return data.maxCatches[pattern] || 0;
        },

        /**
         * Get completion date for a pattern
         * @param pattern - The pattern to check
         * @returns string date or null
         */
        getCompletionDate: (pattern: string): string | null => {
            if (!pattern || pattern.trim() === '') return null;
            
            const data = get({ subscribe });
            return data.completionDates[pattern] || null;
        },

        /**
         * Reset store to initial state
         * @returns void
         */
        reset: (): void => {
            if (!isBrowser) return; // Skip in SSR context
            
            const confirmed = window.confirm(
                'Are you sure you want to reset all your progress data? This cannot be undone.'
            );
            
            if (!confirmed) return;
            
            const emptyData: ProgressData = {
                completedPatterns: [],
                maxCatches: {},
                completionDates: {}
            };

            saveToStorage(emptyData);
            set(emptyData);
            
            if (typeof showToast === 'function') {
                showToast('All progress has been reset', 'info');
            }
        },
        
        /**
         * Export progress data as JSON
         * @returns string JSON representation of data
         */
        exportData: (): string => {
            try {
                const data = get({ subscribe });
                return JSON.stringify(data, null, 2);
            } catch (error) {
                console.error('Error exporting progress data:', error);
                if (typeof showToast === 'function') {
                    showToast('Error exporting your progress data', 'error');
                }
                return '{}';
            }
        },
        
        /**
         * Import progress data from JSON
         * @param jsonData - JSON string of progress data
         * @returns boolean indicating success
         */
        importData: (jsonData: string): boolean => {
            if (!isBrowser) return false; // Skip in SSR context
            
            try {
                const parsedData = JSON.parse(jsonData) as ProgressData;
                
                // Validate data structure
                if (!parsedData.completedPatterns || !Array.isArray(parsedData.completedPatterns) ||
                    !parsedData.maxCatches || typeof parsedData.maxCatches !== 'object' ||
                    !parsedData.completionDates || typeof parsedData.completionDates !== 'object') {
                    throw new Error('Invalid data structure');
                }
                
                set(parsedData);
                saveToStorage(parsedData);
                
                if (typeof showToast === 'function') {
                    showToast('Progress data imported successfully', 'success');
                }
                return true;
            } catch (error) {
                console.error('Error importing progress data:', error);
                
                if (typeof showToast === 'function') {
                    showToast('Error importing progress data: invalid format', 'error');
                }
                return false;
            }
        }
    };
};

/**
 * Helper function to update pattern data
 * @param data - The progress data object to update
 * @param pattern - The pattern to update
 * @param catches - The number of catches
 */
function updatePatternData(data: ProgressData, pattern: string, catches: number): void {
    // Update max catches
    data.maxCatches[pattern] = catches;

    // Update completion status
    if (catches >= 100) {
        if (!data.completedPatterns.includes(pattern)) {
            data.completedPatterns.push(pattern);
        }
        // Set completion date if not already set
        if (!data.completionDates[pattern]) {
            data.completionDates[pattern] = ProgressTracker.getCurrentDate();
        }
    } else {
        // Remove from completed patterns
        data.completedPatterns = data.completedPatterns.filter(
            (p) => p !== pattern
        );

        // Remove completion date if catches is 0
        if (catches === 0 && data.completionDates[pattern]) {
            delete data.completionDates[pattern];
        }
    }
}

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