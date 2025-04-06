<!-- src/lib/components/ui/Toast.svelte -->
<script lang="ts">
	import { uiState } from '$lib/stores/uiStore';
	import { fly, fade } from 'svelte/transition';
</script>

{#if $uiState.toast}
	<div
		class="toast-container"
		class:success={$uiState.toast.type === 'success'}
		class:error={$uiState.toast.type === 'error'}
		class:info={$uiState.toast.type === 'info'}
		in:fly={{ y: 50, duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<div class="toast-icon">
			{#if $uiState.toast.type === 'success'}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
			{:else if $uiState.toast.type === 'error'}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="15" y1="9" x2="9" y2="15"></line>
					<line x1="9" y1="9" x2="15" y2="15"></line>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="16" x2="12" y2="12"></line>
					<line x1="12" y1="8" x2="12.01" y2="8"></line>
				</svg>
			{/if}
		</div>
		<div class="toast-content">{$uiState.toast.message}</div>
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background-color: white;
		padding: 1rem;
		border-radius: var(--border-radius-md);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		min-width: 280px;
		max-width: 400px;
		z-index: 1000;
		border-left: 4px solid var(--primary-color);
	}

	.toast-container.success {
		border-left-color: #4caf50;
	}

	.toast-container.error {
		border-left-color: #f44336;
	}

	.toast-container.info {
		border-left-color: var(--primary-color);
	}

	.toast-icon {
		margin-right: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toast-content {
		font-size: 0.95rem;
	}

	.success .toast-icon {
		color: #4caf50;
	}

	.error .toast-icon {
		color: #f44336;
	}

	.info .toast-icon {
		color: var(--primary-color);
	}

	@media (max-width: 768px) {
		.toast-container {
			left: 1rem;
			right: 1rem;
			bottom: 1rem;
			max-width: none;
		}
	}
</style>
