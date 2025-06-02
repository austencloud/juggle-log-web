// src/lib/stores/stateManager.ts - Central State Manager for Svelte 5 Runes
// Manages dependencies and initialization of all state classes

import { userStore } from './userStore';
import { worldRecordsState } from './worldRecordsState';
import { gamificationStore } from './gamificationStore';
import { progressStore } from './progressStore';
import { achievementStore } from './achievementStore';

/**
 * Central State Manager
 * Handles initialization and dependency injection for all runes-based state classes
 */
export class StateManager {
  private _initialized = false;

  constructor() {
    this.initializeStates();
  }

  /**
   * Initialize all states and wire up dependencies
   */
  private initializeStates(): void {
    if (this._initialized) return;

    try {
      // Wire up dependencies
      this.setupDependencies();
      
      this._initialized = true;
      console.log('Svelte 5 Runes State Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize State Manager:', error);
    }
  }

  /**
   * Set up dependencies between state classes
   */
  private setupDependencies(): void {
    // Inject dependencies into userState
    (userStore as any).gamificationState = gamificationStore;
    (userStore as any).progressState = progressStore;
    (userStore as any).achievementState = achievementStore;

    // Inject dependencies into worldRecordsState
    (worldRecordsState as any).userState = userStore;

    // Inject dependencies into achievementState
    (achievementStore as any).gamificationState = gamificationStore;
    (achievementStore as any).progressState = progressStore;
  }

  /**
   * Get all state instances
   */
  getStates() {
    return {
      userStore,
      worldRecordsState,
      gamificationStore,
      progressStore,
      achievementStore
    };
  }

  /**
   * Reset all states to defaults
   */
  resetAllStates(): void {
    userStore.reset();
    worldRecordsState.reset();
    gamificationStore.reset();
    progressStore.reset();
    achievementStore.reset();
  }

  /**
   * Check if state manager is initialized
   */
  get isInitialized(): boolean {
    return this._initialized;
  }
}

// Create and export the singleton instance
export const stateManager = new StateManager();

// Export individual states for convenience
export {
  userStore,
  worldRecordsState,
  gamificationStore,
  progressStore,
  achievementStore
};

// Backward compatibility exports for existing code
export const userState = userStore;
export const worldRecordsState = worldRecordsState;
export const gamificationState = gamificationStore;
export const progressState = progressStore;
export const achievementState = achievementStore;
