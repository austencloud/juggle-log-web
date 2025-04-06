import { writable } from 'svelte/store';

// Define a type for the toast notification
type Toast = {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
} | null;

// Define a type for the entire UI state
type UiState = {
  isPatternTableVisible: boolean;
  recentlyCompletedPattern: string | null;
  activeThrowTypes: string[];
  toast: Toast;
};

// UI state for animations
export const uiState = writable<UiState>({
  isPatternTableVisible: false,
  recentlyCompletedPattern: null,
  activeThrowTypes: [],
  toast: null
});

// Toast notification function
export function showToast(
  message: string, 
  type: 'success' | 'error' | 'info' | 'warning' = 'info', 
  duration = 3000
) {
  uiState.update((state) => ({ 
    ...state, 
    toast: { message, type } 
  }));
  
  setTimeout(() => {
    uiState.update((state) => ({ 
      ...state, 
      toast: null 
    }));
  }, duration);
}