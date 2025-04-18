<!-- src/lib/components/ControlPanel/ThrowButtons.svelte -->
<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import { THROW_BUTTONS } from '$lib/types/types';
	import { selectedThrows, toggleThrow } from '$lib/stores/patternStore';
	import { uiState } from '$lib/stores/uiStore';

	// Reactive variable to track which buttons are selected
	$: selectedSet = $selectedThrows;

	// Handle button click
	function handleThrowButtonClick(throwCode: string) {
		toggleThrow(throwCode);

		// Update UI state with active throw types
		uiState.update((state) => ({
			...state,
			activeThrowTypes: Array.from($selectedThrows)
		}));
	}
</script>

<div class="throw-buttons-container">
	{#each THROW_BUTTONS as throwButton, i}
		<button
			type="button"
			class="throw-button"
			class:selected={selectedSet.has(throwButton.code)}
			on:click={() => handleThrowButtonClick(throwButton.code)}
			title={throwButton.name}
		>
			<span class="button-content">
				{throwButton.code}
				{#if selectedSet.has(throwButton.code)}
					<span class="selection-indicator" in:scale={{ duration: 300, easing: elasticOut }}></span>
				{/if}
			</span>
		</button>
	{/each}
</div>

<style>
	.throw-buttons-container {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.throw-button {
		position: relative;
		background-color: white;
		border: 2px solid var(--border-color);
		border-radius: var(--border-radius-sm);
		padding: 0.5rem;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: bold;
		overflow: hidden;
	}

	.button-content {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.selection-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: white;
		margin-left: 1.5rem;
	}

	.throw-button:hover {
		background-color: var(--background-color);
		border-color: var(--text-light);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
		/* white text */ 
		color: var(--text-light);
	}

	.throw-button.selected {
		background-color: var(--primary-color);
		color: white;
		border-color: var(--primary-dark);
	}

	.throw-button.selected:hover {
		background-color: var(--primary-dark);
	}

	.throw-button::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: transparent;
		transform: scale(0);
		border-radius: 50%;
		transition: transform 0.3s ease;
	}

	.throw-button:active::before {
		background-color: rgba(0, 0, 0, 0.1);
		transform: scale(2);
	}

	@media (min-width: 768px) {
		.throw-button {
			font-size: 1.2rem;
			padding: 0.75rem;
		}
	}
</style>
