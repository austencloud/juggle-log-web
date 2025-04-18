<!-- src/lib/components/MainWidget.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import ControlPanel from './ControlPanel/ControlPanel.svelte';
	import PatternTable from './PatternTable/PatternTable.svelte';
	// Removed ImportExport import
	import { isBrowser } from '$lib/utils/browser';

	let innerWidth: number = 0;
	let innerHeight: number = 0;
	let isWideLayout: boolean = false;

	// Threshold for determining wide layout (width > height)
	const WIDE_LAYOUT_THRESHOLD = 0.8;

	function updateLayout() {
		if (isBrowser) {
			isWideLayout = innerWidth / innerHeight > WIDE_LAYOUT_THRESHOLD;
		}
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

<div class="main-widget" class:wide-layout={isWideLayout} class:narrow-layout={!isWideLayout}> <!-- Removed themeStore class binding -->
	<header class="widget-header">
		<div class="header-content">
			<h1 class="title">Juggle Log</h1>
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
		Layout Centering
		==============================
	*/

	/* 2) The wrapper that centers and limits width */
	.outer-container {
		max-width: 1200px;    /* Or 1000px, etc. for your preferred width */
		margin: 0 auto;       /* This centers horizontally */
		padding: 0 var(--spacing-lg); /* Optional horizontal padding */
	}

	/*
		==============================
		Main app container
		==============================
	*/
	.app-container {
		background-color: var(--background-color);
		color: var(--text-color);
		min-height: 100vh; 
		display: flex;
		flex-direction: column;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md) var(--spacing-lg);
		border-bottom: 1px solid var(--border-color);
	}

	.subtitle {
		color: var(--text-light);
		margin: 0.25rem 0 0 0;
		font-size: 1rem;
	}

	.table-section {
		order: 2;
	}

	.control-section {
		order: 1;
	}

	@media (min-width: 1024px) {
		.table-section {
			flex: 3;
			order: 1;
		}

		.control-section {
			flex: 2;
			order: 2;
			position: sticky;
			top: 2rem;
		}

		.subtitle {
			font-size: 1.2rem;
		}
	}

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
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
		/* Optional: Add a subtle gradient background */
		/* background: linear-gradient(to right, var(--primary-color), var(--primary-dark)); */
		/* color: white; */
	}

	.header-content .title {
		font-size: var(--font-size-xl);
		font-weight: 600; /* Semi-bold */
		margin: 0;
		color: var(--header-color);
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
