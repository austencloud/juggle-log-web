<script lang="ts">
	import { themeStore } from '$lib/stores/themeStore';
	import { onDestroy, onMount } from 'svelte';

	// Track current theme
	let currentTheme: 'light' | 'dark';
	let toggleElement: HTMLButtonElement;

	// Subscribe to theme changes
	const unsubscribe = themeStore.subscribe((value) => {
		// console.log('Theme store updated:', value); // Keep for debugging if needed
		currentTheme = value;
	});

	// Cleanup subscription on component destroy
	onDestroy(() => {
		unsubscribe();
	});

	// Toggle theme when button is clicked
	function handleThemeToggle() {
		// console.log('Attempting to toggle theme'); // Keep for debugging if needed
		themeStore.toggle();
	}

	// Initialize theme on component mount
	onMount(() => {
		// console.log('ThemeToggle mounted'); // Keep for debugging if needed
		// REMOVED: Redundant themeStore.initialize(); - Already done in main.ts
		// REMOVED: Debug logging and forced repaint logic
	});

	// Keyboard support
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleThemeToggle();
		}
	}
</script>

<button
	bind:this={toggleElement}
	type="button"
	class="theme-toggle"
	role="switch"
	aria-checked={currentTheme === 'dark'}
	aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
	on:click={handleThemeToggle}
	on:keydown={handleKeydown}
>
	<span class="toggle-track">
		<span class="toggle-thumb">
			<span class="icon sun">
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
			<span class="icon moon">
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
		</span>
	</span>
</button>

<style>
	/* REMOVED: .debug-info styles */

	.theme-toggle {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 34px;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		outline-offset: 5px;
	}

	.theme-toggle:focus-visible {
		/* Use a theme-aware focus outline */
		outline: 2px solid var(--primary-color);
		/* Or use a default outline */
		/* outline: 2px auto -webkit-focus-ring-color; */
	}

	.toggle-track {
		position: relative;
		width: 100%;
		height: 100%;
		background-color: var(--border-color); /* Use theme variable */
		border-radius: 34px;
		transition: background-color 0.3s ease;
		display: flex;
		align-items: center;
		/* Removed justify-content and padding, handled by thumb position */
		box-sizing: border-box;
	}

	.toggle-thumb {
		position: absolute;
		left: 4px; /* Initial position for light mode */
		top: 4px; /* Center vertically */
		width: 26px; /* Thumb size */
		height: 26px; /* Thumb size */
		border-radius: 50%;
		background-color: white; /* Thumb color */
		transition:
			transform 0.3s ease,
			background-color 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); /* Optional thumb shadow */
		transform: translateX(0); /* Initial transform */
	}

	.theme-toggle[aria-checked='true'] .toggle-track {
		/* Active track color - could use a variable */
		background-color: var(--primary-dark); /* Or another dark mode active color */
	}

	.theme-toggle[aria-checked='true'] .toggle-thumb {
		transform: translateX(26px); /* Move thumb to the right for dark mode */
	}

	.icon {
		position: absolute; /* Position icons within the thumb */
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px; /* Icon container size */
		height: 20px; /* Icon container size */
		/* Icon color should contrast with thumb background */
		color: #888; /* Example color, adjust as needed */
		transition: opacity 0.3s ease; /* Transition only opacity */
	}

	.icon svg {
		width: 16px; /* Actual SVG size */
		height: 16px; /* Actual SVG size */
	}

	/* Light mode: show sun, hide moon */
	.theme-toggle .sun {
		opacity: 1;
	}
	.theme-toggle .moon {
		opacity: 0;
	}

	/* Dark mode (aria-checked=true): hide sun, show moon */
	.theme-toggle[aria-checked='true'] .sun {
		opacity: 0;
	}
	.theme-toggle[aria-checked='true'] .moon {
		opacity: 1;
	}

	/* Adjust moon icon color for dark mode thumb if needed */
	/* .theme-toggle[aria-checked='true'] .moon { color: #eee; } */
</style>
