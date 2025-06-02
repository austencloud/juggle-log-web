// src/lib/stores/gamificationStoreCompat.ts - Compatibility layer for gamificationStore
// Provides the same API as the old Svelte 4 store but uses the new runes-based GamificationState

import { gamificationStore } from './gamificationStore';

// Export the store directly since it already has the correct interface
export { gamificationStore } from './gamificationStore';
