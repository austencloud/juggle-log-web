// src/lib/stores/themeStore.ts
import { readable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'dark'; // Only dark mode is supported now

// Helper function to apply the dark theme class to the DOM
function applyDarkMode(): void {
    if (!browser) return;
    const rootEl = document.documentElement;
    rootEl.classList.add('dark-mode');
    rootEl.classList.remove('light-mode'); // Ensure light-mode is removed

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#121212'); // Dark mode color
    }
}

// Apply dark mode immediately on script load in the browser
if (browser) {
    applyDarkMode();
}

// Create a simple readable store that always holds 'dark'
export const themeStore = readable<Theme>('dark', (set) => {
    // The store value never changes, but we still need to apply the class
    // in case this runs client-side after initial SSR render.
    if (browser) {
        applyDarkMode();
    }
    // No need for a cleanup function as the theme is static
});

// Optional: Export applyDarkMode if needed elsewhere, though it's called automatically now.
// export { applyDarkMode };