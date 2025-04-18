<script lang="ts">
	import { onMount } from 'svelte';
	import PatternRow from './PatternRow.svelte';
	import { SortType, SortOrder, type PatternData } from '$lib/types/types';
	import { patternDataList, sortConfig, updateSort, patternLength } from '$lib/stores/patternStore'; // Import patternLength

	// Column headers
	const columns = [
		{ id: SortType.Pattern, name: 'Pattern' },
		{ id: SortType.MaxCatches, name: 'Max Catches' },
		{ id: SortType.Date, name: 'Last Updated' } // Updated header name
	];

	// Handle header click for sorting
	function handleHeaderClick(sortType: SortType) {
		updateSort(sortType);
	}

	// Get sort direction indicator
	function getSortIndicator(columnType: SortType): string {
		if ($sortConfig.sortType !== columnType) {
			return '';
		}
		return $sortConfig.sortOrder === SortOrder.Ascending ? '↑' : '↓';
	}

	// Reactive variables for filtered lists for even length patterns
	let rightHandPatterns: PatternData[] = [];
	let leftHandPatterns: PatternData[] = [];

	$: {
		if ($patternLength % 2 === 0 && $patternDataList) {
			rightHandPatterns = $patternDataList.filter(p => p.storageKey.endsWith('_R'));
			leftHandPatterns = $patternDataList.filter(p => p.storageKey.endsWith('_L'));
		} else {
			// Clear lists if length is odd or data is not ready
			rightHandPatterns = [];
			leftHandPatterns = [];
		}
	}
</script>

<div class="pattern-table-container">
	{#if $patternDataList === undefined || $patternDataList.length === 0}
		<h2>Patterns</h2>
		<div class="empty-state">
			<p>Select throw types and pattern length to generate patterns</p>
		</div>
	{:else if $patternLength % 2 !== 0}
		<!-- ODD LENGTH: Render single table -->
		<h2>Patterns</h2>
		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						{#each columns as column}
							<th
								class="sortable"
								on:click={() => handleHeaderClick(column.id)}
								class:active={$sortConfig.sortType === column.id}
							>
								{column.name}
								<span class="sort-indicator">{getSortIndicator(column.id)}</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each $patternDataList as patternData, i (patternData.storageKey)} <!-- Use storageKey for key -->
						<PatternRow {patternData} evenRow={i % 2 === 0} index={i} />
					{/each}
				</tbody>
			</table>
		</div>
		<div class="table-summary">
			<p>Showing {$patternDataList.length} patterns</p>
		</div>
	{:else}
		<!-- EVEN LENGTH: Render two tables -->
		<div class="dual-table-section">
			<h3>Right Hand Start</h3>
			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							{#each columns as column}
								<th
									class="sortable"
									on:click={() => handleHeaderClick(column.id)}
									class:active={$sortConfig.sortType === column.id}
								>
									{column.name}
									<span class="sort-indicator">{getSortIndicator(column.id)}</span>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each rightHandPatterns as patternData, i (patternData.storageKey)} <!-- Iterate over rightHandPatterns, use storageKey -->
							<PatternRow {patternData} evenRow={i % 2 === 0} index={i} />
						{/each}
					</tbody>
				</table>
			</div>
			<div class="table-summary">
				<p>Showing {rightHandPatterns.length} patterns</p> <!-- Use filtered list length -->
			</div>
		</div>

		<div class="dual-table-section">
			<h3>Left Hand Start</h3>
			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							{#each columns as column}
								<th
									class="sortable"
									on:click={() => handleHeaderClick(column.id)}
									class:active={$sortConfig.sortType === column.id}
								>
									{column.name}
									<span class="sort-indicator">{getSortIndicator(column.id)}</span>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each leftHandPatterns as patternData, i (patternData.storageKey)} <!-- Iterate over leftHandPatterns, use storageKey -->
							<PatternRow {patternData} evenRow={i % 2 === 0} index={i} />
						{/each}
					</tbody>
				</table>
			</div>
			<div class="table-summary">
				<p>Showing {leftHandPatterns.length} patterns</p> <!-- Use filtered list length -->
			</div>
		</div>
	{/if}
</div>

<style>
	.pattern-table-container {
		background-color: var(--card-background);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: var(--shadow-md);
		color: var(--text-color);
	}

	h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		color: var(--header-color);
		font-size: 1.5rem;
	}

	.table-wrapper {
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 1rem;
	}

	th {
		text-align: left;
		padding: 1rem;
		background-color: var(--header-color);
		color: var(--card-background);
		font-weight: normal;
		position: sticky;
		top: 0;
	}

	th.sortable {
		cursor: pointer;
		user-select: none;
		transition: background-color 0.3s;
	}

	th.sortable:hover {
		background-color: var(--primary-color);
	}

	th.active {
		background-color: var(--primary-dark);
	}

	.sort-indicator {
		display: inline-block;
		margin-left: 0.5rem;
		font-weight: bold;
	}

	.empty-state {
		background-color: var(--stripe-color);
		border-radius: 0.25rem;
		padding: 2rem;
		text-align: center;
		color: var(--text-light);
	}

	.table-summary {
		text-align: right;
		color: var(--text-light);
		font-size: 0.9rem;
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 1.8rem;
		}

		table {
			font-size: 1.1rem;
		}
	}

	h3 {
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: var(--header-color);
		font-size: 1.3rem;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.5rem;
	}

	.dual-table-section:first-of-type h3 {
		margin-top: 0; /* Remove top margin for the first h3 */
	}
</style>
