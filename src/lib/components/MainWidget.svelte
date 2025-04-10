<!-- src/lib/components/MainWidget.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import ControlPanel from './ControlPanel/ControlPanel.svelte';
	import PatternTable from './PatternTable/PatternTable.svelte';

	let windowWidth: number;

	function handleResize() {
		windowWidth = window.innerWidth;
	}

	onMount(() => {
		windowWidth = window.innerWidth;
		window.addEventListener('resize', handleResize);

		// Set theme color meta tag programmatically
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', '#121212');
		}

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<svelte:window on:resize={handleResize} />

<!-- 1) Wrap .app-container in a .outer-container -->
<div class="outer-container">
	<div class="app-container">
		<header>
			<div class="header-content">
				<div class="title-section">
					<h1>Juggle Log</h1>
					<p class="subtitle">Track your juggling progress</p>
				</div>
			</div>
		</header>

		<main>
			<section class="table-section">
				<PatternTable />
			</section>
			<section class="control-section">
				<ControlPanel />
			</section>
		</main>

		<footer>
			<p>JuggleLog &copy; {new Date().getFullYear()}</p>
		</footer>
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

	header {
		margin-bottom: 2rem;
	}

	h1 {
		color: var(--header-color);
		margin: 0;
		font-size: 2rem;
	}

	.subtitle {
		color: var(--text-light);
		margin: 0.25rem 0 0 0;
		font-size: 1rem;
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: var(--spacing-lg);
		flex-grow: 1;
	}

	.table-section {
		order: 2;
	}

	.control-section {
		order: 1;
	}

	footer {
		margin-top: auto;
		padding: var(--spacing-md) var(--spacing-lg);
		text-align: center;
		color: var(--text-light);
		font-size: 0.9rem;
		border-top: 1px solid var(--border-color);
		background-color: var(--card-background);
	}

	@media (min-width: 1024px) {
		main {
			flex-direction: row;
			align-items: flex-start;
		}

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

		h1 {
			font-size: 2.5rem;
		}

		.subtitle {
			font-size: 1.2rem;
		}
	}
</style>
