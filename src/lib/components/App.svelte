// src/lib/components/App.svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import ControlPanel from './ControlPanel/ControlPanel.svelte';
	import PatternTable from './PatternTable/PatternTable.svelte';
	// We'll still import the ThemeToggle component for compatibility
	// but we won't display it
	import ThemeToggle from './ui/ThemeToggle.svelte';

	// Track window size
	let windowWidth: number;

	// Listen for window resize
	function handleResize() {
		windowWidth = window.innerWidth;
	}

	onMount(() => {
		// Set initial window width
		windowWidth = window.innerWidth;

		// Add resize listener
		window.addEventListener('resize', handleResize);

		// Cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<svelte:window on:resize={handleResize} />

<div class="app-container">
	<header>
		<div class="header-content">
			<div class="title-section">
				<h1>Juggle Log</h1>
				<p class="subtitle">Track your juggling progress</p>
			</div>
			<!-- Theme toggle container removed -->
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

<style lang="postcss">
	/* Global styles using CSS variables */
	.app-container {
		background-color: var(--background-color);
		color: var(--text-color);
		min-height: 100vh; /* Ensure container takes full height */
		display: flex;
		flex-direction: column;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md) var(--spacing-lg); /* Add some padding */
		border-bottom: 1px solid var(--border-color); /* Optional: add a separator */
	}

	header {
		margin-bottom: 2rem;
	}

	.title-section {
		/* Styles for the title and subtitle if needed */
	}

	h1 {
		color: var(--header-color);
		margin: 0;
		font-size: 2rem; /* Adjusted size */
	}

	.subtitle {
		color: var(--text-light);
		margin: 0.25rem 0 0 0; /* Adjusted margin */
		font-size: 1rem; /* Adjusted size */
	}

	main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: var(--spacing-lg); /* Add padding to main */
		flex-grow: 1; /* Allow main to grow */
	}

	.table-section {
		order: 2;
	}

	.control-section {
		order: 1;
	}

	footer {
		margin-top: auto; /* Push footer to the bottom */
		padding: var(--spacing-md) var(--spacing-lg); /* Add padding */
		text-align: center;
		color: var(--text-light);
		font-size: 0.9rem;
		border-top: 1px solid var(--border-color); /* Optional: add separator */
		background-color: var(--card-background); /* Optional: Footer background */
	}

	/* Responsive layout for larger screens */
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
			top: 2rem; /* Adjust based on header height if sticky */
		}

		h1 {
			font-size: 2.5rem; /* Adjusted size */
		}

		.subtitle {
			font-size: 1.2rem; /* Adjusted size */
		}
	}
</style>