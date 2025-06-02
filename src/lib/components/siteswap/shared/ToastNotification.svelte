<!-- Toast Notification Component -->
<script lang="ts">
  export let show = false;
  export let message = '';
  export let type: 'success' | 'error' | 'info' = 'success';
  export let duration = 3000;

  let timeoutId: number | null = null;

  $: if (show && duration > 0) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      show = false;
    }, duration);
  }

  function getToastClass() {
    return `toast toast-${type}`;
  }
</script>

{#if show}
  <div class={getToastClass()} class:show>
    {message}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    font-weight: 500;
    max-width: 300px;
  }

  .toast.show {
    transform: translateX(0);
  }

  .toast-success {
    background: var(--success-color, #10b981);
  }

  .toast-error {
    background: var(--error-color, #ef4444);
  }

  .toast-info {
    background: var(--info-color, #3b82f6);
  }

  @media (max-width: 768px) {
    .toast {
      top: 1rem;
      right: 1rem;
      left: 1rem;
      transform: translateY(-100%);
    }

    .toast.show {
      transform: translateY(0);
    }
  }
</style>
