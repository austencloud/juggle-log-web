<!-- src/lib/components/MainWidget.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import ControlPanel from './ControlPanel/ControlPanel.svelte';
	import PatternTable from './PatternTable/PatternTable.svelte';
	import Confetti from './ui/Confetti.svelte'; // Import Confetti
	import { isBrowser } from '$lib/utils/browser';

	let innerWidth: number = 0;
	let innerHeight: number = 0;
	let isWideLayout: boolean = false;
	// let showConfetti = false; // Replaced with an array
	let confettiInstances: number[] = []; // Array to track confetti instances
	let confettiCounter = 0; // Counter for unique keys

	// Threshold for determining wide layout (width > height)
	const WIDE_LAYOUT_THRESHOLD = 0.8;

	function updateLayout() {
		if (isBrowser) {
			isWideLayout = innerWidth / innerHeight > WIDE_LAYOUT_THRESHOLD;
		}
	}

	function triggerConfetti() {
		// showConfetti = false; // Removed reset logic
		// setTimeout(() => {
		// 	showConfetti = true;
		// }, 0);
		confettiInstances = [...confettiInstances, confettiCounter++];
		// Optional: Clean up the array after a delay slightly longer than confetti duration
		// This prevents the array from growing indefinitely if the user clicks many times.
		const instanceToRemove = confettiCounter - 1;
		setTimeout(() => {
			confettiInstances = confettiInstances.filter(id => id !== instanceToRemove);
		}, 5000); // 5 seconds, slightly longer than confetti duration (4s)
	}

	onMount(() => {
		if (isBrowser) {
			innerWidth = window.innerWidth;
			innerHeight = window.innerHeight;
			updateLayout();
		}
	});

	// Update layout on resize
	$: if (isBrowser && innerWidth && innerHeight) {
		updateLayout();
	}
</script>

<!-- Bind window dimensions -->
<svelte:window bind:innerWidth bind:innerHeight />

{#each confettiInstances as instanceId (instanceId)}
	<Confetti />
{/each}

<div class="main-widget" class:wide-layout={isWideLayout} class:narrow-layout={!isWideLayout}> <!-- Removed themeStore class binding -->
	<header class="widget-header">
		<div class="header-content">
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<h1 class="title" on:click={triggerConfetti}>Juggle Log</h1>
		</div>
		<div class="header-controls">
			<!-- Removed ThemeToggle component -->
		</div>
	</header>

	<div class="main-content" class:wide-layout={isWideLayout} class:narrow-layout={!isWideLayout}>
		<div class="control-panel-wrapper">
			<ControlPanel />
			<!-- Removed ImportExport component -->
		</div>
		<div class="pattern-table-wrapper">
			<PatternTable />
		</div>
	</div>
</div>

<style>
	/* 
		==============================
		Global Dark Mode Variables
		==============================
	*/
	:global(:root) {
		/* Dark mode colors */
		--primary-color: #4ecdc4;
		--primary-dark: #45b7aa;
		--text-color: #e0e0e0;
		--text-light: #a0a0a0;
		--header-color: #f0f0f0;
		--background-color: #121212;
		--card-background: #1e1e1e;
		--border-color: #333;
		--stripe-color: #1a1a1a;
		--completed-color: rgba(144, 238, 144, 0.3);

		/* Spacing */
		--spacing-xs: 0.25rem;
		--spacing-sm: 0.5rem;
		--spacing-md: 1rem;
		--spacing-lg: 1.5rem;
		--spacing-xl: 2rem;

		/* Font sizes */
		--font-size-sm: 0.9rem;
		--font-size-base: 1rem;
		--font-size-md: 1.1rem;
		--font-size-lg: 1.25rem;
		--font-size-xl: 1.5rem;
		--font-size-xxl: 2rem;
		--font-size-xxxl: 3rem;

		/* Border radius */
		--border-radius-sm: 0.25rem;
		--border-radius-md: 0.5rem;

		/* Shadows */
		--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
		--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(html, body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		font-size: 16px;
		line-height: 1.6;
		color: var(--text-color);
		background-color: var(--background-color);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		margin-top: 0;
		line-height: 1.2;
		color: var(--header-color);
	}

	:global(a) {
		color: var(--primary-color);
		text-decoration: none;
		transition: color 0.3s;
	}

	:global(a:hover) {
		text-decoration: underline;
	}

	:global(button) {
		cursor: pointer;
		transition: background-color 0.3s, color 0.3s;
	}

	@media (min-width: 768px) {
		:global(html),
		:global(body) {
			font-size: 18px;
		}
	}

	/*
		==============================
		Main app container
		==============================
	*/
	.main-widget {
		display: flex;
		flex-direction: column; /* Stack header and main content */
		gap: 1.5rem;
		padding: 1.5rem;
		min-height: 100vh; /* Use min-height for flexibility */
		box-sizing: border-box;
		max-width: 1400px; /* Limit maximum width */
		margin-left: auto;  /* Center the widget horizontally */
		margin-right: auto; /* Center the widget horizontally */
	}

	.widget-header {
		display: flex;
		justify-content: center; /* Center header content */
		align-items: center;
		padding-bottom: 2rem; /* Increased padding */
		border-bottom: 1px solid var(--border-color);
		text-align: center; /* Ensure text within is centered */
		min-height: 8rem; /* Keep increased min-height */
	}

	@keyframes gradient-animation {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}

	.header-content .title {
		font-size: 2.8rem; /* Slightly reduced font size */
		font-weight: 700; /* Bolder */
		margin: 0;
		line-height: 1.2; /* Ensure sufficient line height */
		padding-bottom: 0.2rem; /* Add small padding for descenders */
		/* Apply colorful gradient */
		background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b); /* Added repeat color for smooth loop */
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent; /* Make original text transparent */
		/* Updated transition to include transform on active */
		transition: transform 0.3s ease-out, filter 0.3s ease-out, transform 0.1s ease-in-out;
		cursor: pointer; /* Change cursor to pointer */
		background-size: 200% 200%; /* Make gradient larger than text */
		animation: gradient-animation 5s ease infinite; /* Apply animation */
		user-select: none; /* Prevent text selection */
		-webkit-user-select: none; /* For Safari */
		-moz-user-select: none; /* For Firefox */
		-ms-user-select: none; /* For IE/Edge */
	}

	.header-content .title:hover {
		transform: scale(1.05); /* Slightly scale up on hover */
		filter: brightness(1.2); /* Make colors brighter on hover */
		animation-play-state: paused; /* Pause animation on hover */
	}

	/* Add active state for click feedback */
	.header-content .title:active {
		transform: scale(0.98); /* Slightly shrink when clicked */
		filter: brightness(1.1);
	}

	.main-content {
		display: flex;
		flex-grow: 1; /* Allow main content to fill remaining space */
		gap: 1.5rem;
		/* Adjust height calculation if header height is fixed */
		height: calc(100vh - 3rem - 4rem); /* Approximate: 100vh - padding - header height */
		overflow: hidden; /* Prevent main content from causing double scrollbars */
	}

	/* Default: Narrow Layout (Vertical Stack for main content) */
	.main-content.narrow-layout {
		flex-direction: column;
		height: auto; /* Allow content to determine height */
		overflow: visible; /* Reset overflow */
	}

	.narrow-layout .control-panel-wrapper {
		width: 100%;
		margin-bottom: 0; /* Gap is handled by main-content */
		order: 1;
		height: auto; /* Reset height */
	}

	.narrow-layout .pattern-table-wrapper {
		width: 100%;
		flex-grow: 1;
		overflow-y: auto;
		order: 2;
		height: auto; /* Reset height */
	}

	/* Wide Layout (Side-by-Side for main content) */
	.main-content.wide-layout {
		flex-direction: row;
	}

	.wide-layout .control-panel-wrapper {
		width: 350px;
		flex-shrink: 0;
		overflow-y: auto;
		height: 100%; /* Fill the height of main-content */
		order: 2;
		margin-bottom: 0; /* Gap handled by main-content */
	}

	.wide-layout .pattern-table-wrapper {
		flex-grow: 1;
		overflow-y: auto;
		height: 100%; /* Fill the height of main-content */
		order: 1;
	}

	/* Responsive adjustments if needed */
	@media (max-width: 768px) {
		.main-widget {
			padding: 1rem;
			gap: 1rem;
			min-height: calc(100vh - 2rem);
		}

		.wide-layout .control-panel-wrapper,
		.wide-layout .pattern-table-wrapper {
			height: calc(100vh - 2rem);
		}
	}

	.control-panel-wrapper {
		display: flex; /* Add flex display */
		flex-direction: column; /* Stack items vertically */
	}
</style>
