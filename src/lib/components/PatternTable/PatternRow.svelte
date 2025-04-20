<!-- src/lib/components/PatternTable/PatternRow.svelte -->
<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import PatternSpinBox from './PatternSpinBox.svelte';
	import type { PatternData } from '$lib/types/types';
	import { uiState, showToast } from '$lib/stores/uiStore';
	import Confetti from '../ui/Confetti.svelte';
	// Import gamification utilities
	import { gamificationStore } from '$lib/stores/gamificationStore';
	import { achievementStore } from '$lib/stores/achievementStore';
	import { AchievementCategory } from '$lib/types/achievements';
	import { addNotification } from '$lib/stores/notificationStore';
	import { ExperienceType } from '$lib/types/gamification';

	export let patternData: PatternData;
	export let evenRow: boolean = false;
	export let index: number = 0;

	// Track if pattern was just completed (for animation)
	let wasCompleted = patternData.isCompleted;
	let justCompleted = false;
	let showCompletionConfetti = false;

	// Check if pattern was just completed this render
	$: {
		if (!wasCompleted && patternData.isCompleted) {
			justCompleted = true;
			showCompletionConfetti = true;

			// Display congratulation message
			showToast(`Congratulations! You've mastered ${patternData.pattern}`, 'success');

			// Add gamification features
			const xpResult = gamificationStore.addExperience({
				type: ExperienceType.PATTERN_MASTERY,
				pattern: patternData.pattern,
				catches: patternData.maxCatches
			});
			
			// Show XP notification
			addNotification(
				`+${xpResult.xp} XP for mastering ${patternData.pattern}!`,
				'achievement',
				3000
			);
			
			// Check for level up
			if (xpResult.levelUp) {
				addNotification(
					`Level Up! You're now level ${$gamificationStore.level}`,
					'level',
					5000
				);
				
				// Play confetti for level up
				uiState.update((state) => ({
					...state,
					showConfetti: true
				}));
			}
			
			// Get count of completed patterns for achievements
			const getCompletedPatternsCount = () => {
				return index + 1; // For demo purposes
			};
			
			// Check for achievements
			const earnedAchievements = achievementStore.checkAchievements(
				AchievementCategory.PATTERN_MASTERY, 
				{ completedPatternsCount: getCompletedPatternsCount() }
			);
			
			// Check for milestone achievements based on catches
			achievementStore.checkAchievements(
				AchievementCategory.MILESTONE,
				{ maxCatches: patternData.maxCatches }
			);
			
			// Reset flag after animation
			setTimeout(() => {
				justCompleted = false;
			}, 1500);

			// Hide confetti after it runs
			setTimeout(() => {
				showCompletionConfetti = false;
			}, 3000);

			// Update UI state with recently completed pattern
			uiState.update((state) => ({
				...state,
				recentlyCompletedPattern: patternData.pattern,
				showConfetti: true
			}));

			// Reset UI confetti flag after animation
			setTimeout(() => {
				uiState.update((state) => ({
					...state,
					showConfetti: false
				}));
			}, 3000);
		}
		wasCompleted = patternData.isCompleted;
	}

	// Generate a unique ID for this row's elements using storageKey
	const rowId = `pattern-row-${patternData.storageKey.replace(/[^a-zA-Z0-9]/g, '-')}`;
</script>

{#if showCompletionConfetti}
	<Confetti duration={3000} />
{/if}

<tr
	id={rowId}
	class:even-row={evenRow}
	class:completed-row={patternData.isCompleted}
	class:just-completed={justCompleted}
	aria-rowindex={index + 1}
	data-pattern={patternData.pattern} 
	data-storage-key={patternData.storageKey} 
	data-completed={patternData.isCompleted ? 'true' : 'false'}
	tabindex="0"
	aria-label={`Pattern ${patternData.pattern}, ${patternData.isCompleted ? 'Completed' : 'Not completed'}, Maximum catches: ${patternData.maxCatches}`}
>
	<td class="pattern-name" role="cell">
		<div class="pattern-display" aria-hidden="false">
			<span class="pattern-text">{patternData.pattern}</span> <!-- Display pattern -->
			{#if justCompleted}
				<div
					class="completion-badge"
					aria-hidden="true"
					in:fly={{ y: -10, duration: 400, easing: elasticOut }}
				>
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
						aria-hidden="true"
					>
						<path d="M20 6L9 17l-5-5"></path>
					</svg>
				</div>
			{/if}
		</div>
	</td>
	<td class="max-catches" role="cell">
		<PatternSpinBox
			storageKey={patternData.storageKey} 
			displayPattern={patternData.pattern} 
			labelId={`${rowId}-catches-label`}
			descriptionId={`${rowId}-catches-description`}
		/>
	</td>
	<td class="last-updated-date" role="cell">
		{#if patternData.lastUpdated}
			<span aria-label={`Last updated on ${patternData.lastUpdated}`}>
				{patternData.lastUpdated}
			</span>
		{:else}
			<span aria-label="Not updated yet" class="not-updated">—</span>
		{/if}
	</td>
</tr>

<!-- Invisible descriptions for screen readers -->
<div class="sr-only" aria-hidden="true">
	<span id={`${rowId}-catches-label`}>Maximum catches for pattern {patternData.pattern}</span> <!-- Use display pattern -->
	<span id={`${rowId}-catches-description`}>
		Enter the maximum number of consecutive catches you've achieved with this pattern. When you
		reach 100 catches, the pattern will be marked as mastered.
	</span>
</div>

<style>
	tr {
		transition:
			background-color 0.3s ease,
			transform 0.3s ease;
	}

	tr:hover {
		background-color: var(--background-lighter);
	}

	tr:focus {
		outline: 2px solid var(--primary-color);
		position: relative;
		z-index: 1;
	}

	.even-row {
		background-color: var(--stripe-color);
	}

	.even-row:hover {
		background-color: var(--background-lighter);
	}

	.completed-row {
		background-color: var(--completed-color);
	}

	.completed-row:hover {
		background-color: var(--completed-hover);
	}

	.completed-row.even-row {
		background-color: var(--completed-color);
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

	.pattern-text {
		letter-spacing: 1px;
	}

	.completion-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: 0.75rem;
		color: white;
		background-color: var(--success-color);
		height: 1.5rem;
		width: 1.5rem;
		border-radius: 50%;
		animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.last-updated-date {
		text-align: center;
		color: var(--text-light);
	}

	.not-updated {
		opacity: 0.5;
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
