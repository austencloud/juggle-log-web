<script lang="ts">
	import ThrowButtons from './ThrowButtons.svelte';
	import PatternLengthInput from './PatternLengthInput.svelte';
	import { selectedThrows } from '$lib/stores/patternStore';
	function selectTemplate(throws: Iterable<string> | null | undefined) {
		// Clear current selection
		selectedThrows.set(new Set(throws));
	}
</script>

<div class="control-panel">


	<section class="throw-buttons-section">
		<h3>Throw Types:</h3>
		<ThrowButtons />
	</section>

	<section class="pattern-length-section">
		<!-- <h3>Pattern Configuration</h3> -->
		<PatternLengthInput />
	</section>
</div>

<style>
	.control-panel {
		background-color: var(--card-background);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: var(--shadow-md);
		color: var(--text-color);
	}



	h3 {
		color: var(--header-color);
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	section {
		margin-bottom: 2rem;
	}

	section:last-child {
		margin-bottom: 0;
	}

	@media (min-width: 768px) {


		h3 {
			font-size: 1.4rem;
		}
	}
</style>