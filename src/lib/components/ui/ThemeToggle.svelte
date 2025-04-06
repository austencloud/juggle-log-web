<!-- src/lib/components/ui/ThemeToggle.svelte -->
<script lang="ts">
	import { themeStore } from '$lib/stores/themeStore';
	import { onDestroy, onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// Track current theme
	let currentTheme: 'light' | 'dark';
	let toggleElement: HTMLButtonElement;
	let isInitialized = false;

	// Subscribe to theme changes
	const unsubscribe = themeStore.subscribe((value) => {
		currentTheme = value;
		
		// Only animate if already initialized
		if (isInitialized) {
			animateThemeIcon();
		}
	});

	// Cleanup subscription on component destroy
	onDestroy(() => {
		unsubscribe();
	});

	// Toggle theme when button is clicked
	function handleThemeToggle(): void {
		themeStore.toggle();
	}

	// Initialize theme on component mount
	onMount(() => {
		themeStore.initialize();
		isInitialized = true;

		// Add event listener for keyboard shortcut
		window.addEventListener('keydown', handleKeyboardShortcut);

		// Clean up event listener on component destroy
		return () => {
			window.removeEventListener('keydown', handleKeyboardShortcut);
		};
	});

	// Keyboard shortcut handler (Alt+T)
	function handleKeyboardShortcut(event: KeyboardEvent): void {
		if (event.altKey && event.key === 't') {
			event.preventDefault();
			handleThemeToggle();
			// Focus the button for visual feedback
			if (toggleElement) {
				toggleElement.focus();
			}
		}
	}

	// Keyboard support for the button itself
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleThemeToggle();
		}
	}

	// Animation variables
	let isAnimating = false;
	
	// Animate theme transition
	function animateThemeIcon(): void {
		if (isAnimating) return;
		isAnimating = true;
		setTimeout(() => {
			isAnimating = false;
		}, 600); // Animation duration plus a small buffer
	}
</script>

<button
	bind:this={toggleElement}
	type="button"
	class="theme-toggle"
	role="switch"
	aria-checked={currentTheme === 'dark'}
	aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
	title={currentTheme === 'light' ? 'Switch to dark mode (Alt+T)' : 'Switch to light mode (Alt+T)'}
	on:click={handleThemeToggle}
	on:keydown={handleKeydown}
>
	<span class="toggle-track">
		<span class="toggle-handle" class:dark={currentTheme === 'dark'}>
			{#if currentTheme === 'light'}
				<span class="icon sun" in:fly={{ y: -10, duration: 200, delay: 150, easing: cubicOut }}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="5" />
						<line x1="12" y1="1" x2="12" y2="3" />
						<line x1="12" y1="21" x2="12" y2="23" />
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
						<line x1="1" y1="12" x2="3" y2="12" />
						<line x1="21" y1="12" x2="23" y2="12" />
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
					</svg>
				</span>
			{:else}
				<span class="icon moon" in:fly={{ y: -10, duration: 200, delay: 150, easing: cubicOut }}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				</span>
			{/if}
		</span>
	</span>
	<span class="sr-only">{currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</span>
</button>

<style>
	.theme-toggle {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 28px;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		outline: none;
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
		border-radius: var(--border-radius-md);
	}

	.toggle-track {
		position: relative;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.1);
		border-radius: 14px;
		transition: background-color var(--transition-normal);
		display: flex;
		align-items: center;
		padding: 2px;
		box-sizing: border-box;
		border: 1px solid var(--border-color);
	}

	/* Track appearance changes with theme */
	:global(.dark-mode) .toggle-track {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.toggle-handle {
		position: relative;
		left: 0;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: 
			transform var(--transition-normal),
			background-color var(--transition-normal),
			box-shadow var(--transition-normal);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transform: translateX(0);
		overflow: hidden;
	}

	.toggle-handle.dark {
		transform: translateX(28px);
		background-color: #2c3e50;
	}

	.icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: currentColor;
	}

	.icon.sun {
		color: #f39c12;
	}

	.icon.moon {
		color: #f4f4f4;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* Hover effects */
	.theme-toggle:hover .toggle-handle {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	
	/* Active (pressed) effects */
	.theme-toggle:active .toggle-handle {
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}
</style>