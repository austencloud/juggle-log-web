<!-- Loading State Component -->
<script lang="ts">
  interface Props {
    message?: string;
    showSpinner?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'minimal' | 'card';
  }

  let {
    message = 'Loading...',
    showSpinner = true,
    size = 'medium',
    variant = 'default'
  }: Props = $props();
</script>

<div class="loading-state {variant} {size}">
  {#if showSpinner}
    <div class="spinner">
      <div class="spinner-ring"></div>
    </div>
  {/if}
  
  <div class="loading-message">
    {message}
  </div>
</div>

<style>
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    text-align: center;
  }

  .loading-state.minimal {
    padding: 1rem;
    gap: 0.5rem;
  }

  .loading-state.card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    backdrop-filter: blur(10px);
  }

  .loading-state.small {
    padding: 1rem;
  }

  .loading-state.large {
    padding: 3rem;
    min-height: 200px;
  }

  .spinner {
    position: relative;
  }

  .spinner-ring {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .small .spinner-ring {
    width: 24px;
    height: 24px;
    border-width: 2px;
  }

  .large .spinner-ring {
    width: 60px;
    height: 60px;
    border-width: 4px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-message {
    color: var(--text-secondary, #6b7280);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .small .loading-message {
    font-size: 0.75rem;
  }

  .large .loading-message {
    font-size: 1rem;
  }

  /* Animation for smooth appearance */
  .loading-state {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
