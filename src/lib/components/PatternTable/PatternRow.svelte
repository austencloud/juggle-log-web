<!-- src/lib/components/PatternTable/PatternRow.svelte -->
<script lang="ts">
	import { fly, crossfade } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import PatternSpinBox from './PatternSpinBox.svelte';
	import type { PatternData } from '$lib/types/types';
	import { uiState, showToast } from '$lib/stores/uiStore';

	export let patternData: PatternData;
	export let evenRow: boolean = false;

	// Track if pattern was just completed (for animation)
	let wasCompleted = patternData.isCompleted;
	let justCompleted = false;

	// Check if pattern was just completed this render
	$: {
		if (!wasCompleted && patternData.isCompleted) {
			justCompleted = true;

			// Display congratulation message
			showToast(`Congratulations! You've mastered ${patternData.pattern}`, 'success');

			// Reset flag after animation
			setTimeout(() => {
				justCompleted = false;
			}, 1500);

			// Update UI state with recently completed pattern
			uiState.update((state) => ({
				...state,
				recentlyCompletedPattern: patternData.pattern
			}));
		}
		wasCompleted = patternData.isCompleted;
	}
</script>

<tr
	class:even-row={evenRow}
	class:completed-row={patternData.isCompleted}
	class:just-completed={justCompleted}
>
	<td class="pattern-name">
		<div class="pattern-display">
			{patternData.pattern}
			{#if justCompleted}
				<div class="completion-badge">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M20 6L9 17l-5-5"></path>
					</svg>
				</div>
			{/if}
		</div>
	</td>
	<td class="max-catches">
		<PatternSpinBox pattern={patternData.pattern} />
	</td>
	<td class="completion-date">
		{patternData.dateCompleted || ''}
	</td>
</tr>

<style>
	tr {
		transition:
			background-color 0.3s ease,
			transform 0.3s ease;
	}

	tr:hover {
		background-color: var(--background-color);
	}

	.even-row {
		background-color: var(--stripe-color);
	}

	.even-row:hover {
		background-color: var(--background-color);
	}

	.completed-row {
		background-color: var(--completed-color);
	}

	.completed-row.even-row {
		background-color: rgba(144, 238, 144, 0.6);
	}

	.just-completed {
		animation: pulse 1.5s cubic-bezier(0.22, 1, 0.36, 1);
	}

	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	.pattern-name {
		font-weight: bold;
		font-family: monospace;
		font-size: 1.1rem;
	}

	.pattern-display {
		display: flex;
		align-items: center;
		position: relative;
	}

	.completion-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: 0.75rem;
		color: white;
		background-color: #4caf50;
		height: 1.5rem;
		width: 1.5rem;
		border-radius: 50%;
		animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.completion-date {
		text-align: center;
		color: var(--text-light);
	}

	@keyframes pulse {
		0% {
			background-color: var(--completed-color);
		}
		25% {
			background-color: rgba(76, 175, 80, 0.6);
		}
		50% {
			background-color: var(--completed-color);
		}
		75% {
			background-color: rgba(76, 175, 80, 0.6);
		}
		100% {
			background-color: var(--completed-color);
		}
	}

	@keyframes scaleIn {
		0% {
			transform: scale(0);
		}
		70% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	@media (max-width: 768px) {
		td {
			padding: 0.5rem;
		}

		.pattern-name {
			font-size: 0.9rem;
		}
	}
</style>
