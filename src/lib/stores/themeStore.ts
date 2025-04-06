// src/lib/stores/themeStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
    // Always return dark as the initial theme
    const getInitialTheme = (): Theme => 'dark';

    const { subscribe, set } = writable<Theme>(getInitialTheme());

    return {
        subscribe,

        // No longer need toggle function but keeping for compatibility
        toggle: () => {
            // Do nothing - we're always in dark mode
            console.log('Toggle attempted, but app is in permanent dark mode');
        },

        // Set theme explicitly - but only allow dark
        set: (theme: Theme) => {
            console.log('Setting theme to dark (ignoring requested theme)');
            if (browser) {
                applyTheme('dark');
            }
            set('dark');
        },

        // Initialize theme on page load - always to dark
        initialize: () => {
            if (browser) {
                console.log('Initializing theme to dark');
                applyTheme('dark');
                set('dark');
            }
        }
    };
}

// Helper function to apply theme
function applyTheme(theme: Theme) {
    console.log('Applying dark theme');

    // Store the setting in localStorage for consistency
    localStorage.setItem('juggleLogTheme', 'dark');

    // Always add dark-mode class on root element
    document.documentElement.classList.add('dark-mode');

    // Optional: Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#121212');
    }
}

export const themeStore = createThemeStore();