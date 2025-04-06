// src/lib/stores/themeStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
    // Get initial theme from localStorage or system preference
    const getInitialTheme = (): Theme => {
        if (!browser) return 'dark'; // SSR default

        // Check localStorage first
        const storedTheme = localStorage.getItem('juggleLogTheme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }

        // Then check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        // Default to dark
        return 'dark';
    };

    const { subscribe, set } = writable<Theme>(getInitialTheme());

    // Listen for system theme changes
    if (browser && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        
        const handleChange = (event: MediaQueryListEvent) => {
            // Only update if user hasn't explicitly set a theme
            if (!localStorage.getItem('juggleLogTheme')) {
                set(event.matches ? 'light' : 'dark');
                applyTheme(event.matches ? 'light' : 'dark');
            }
        };

        // Add listener for change
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange);
        }
    }

    return {
        subscribe,

        // Toggle between light and dark
        toggle: () => {
            if (browser) {
                subscribe(currentTheme => {
                    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                    localStorage.setItem('juggleLogTheme', newTheme);
                    applyTheme(newTheme);
                    set(newTheme);
                })();
            }
        },

        // Set theme explicitly
        set: (theme: Theme) => {
            if (browser) {
                localStorage.setItem('juggleLogTheme', theme);
                applyTheme(theme);
            }
            set(theme);
        },

        // Initialize theme on page load
        initialize: () => {
            if (browser) {
                const theme = getInitialTheme();
                applyTheme(theme);
                set(theme);
            }
        }
    };
}

// Helper function to apply theme to DOM
function applyTheme(theme: Theme): void {
    if (!browser) return;

    // Add or remove theme class from html element
    const rootEl = document.documentElement;
    
    if (theme === 'light') {
        rootEl.classList.add('light-mode');
        rootEl.classList.remove('dark-mode');
    } else {
        rootEl.classList.add('dark-mode');
        rootEl.classList.remove('light-mode');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute(
            'content', 
            theme === 'light' ? '#f5f5f5' : '#121212'
        );
    }
}

export const themeStore = createThemeStore();