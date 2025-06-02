<script lang="ts">
  import { notificationStore, type Notification, clearNotification } from '$lib/stores/notificationStore';
  import { fly, fade } from 'svelte/transition';
  // Fix import path
  import AchievementPopup from '$lib/components/Gamification/AchievementPopup.svelte';

  export let maxNotifications = 3;
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

  $: visibleNotifications = $notificationStore.slice(0, maxNotifications);

  function getPositionClass() {
    return position.replace('-', ' ');
  }

  function handleDismiss(id: string) {
    clearNotification(id);
  }
  
  function handleKeydown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDismiss(id);
    }
  }
</script>

<div class="notification-container {getPositionClass()}">
  {#each visibleNotifications as notification (notification.id)}
    <div 
      class="notification-wrapper" 
      transition:fly={{ y: position.includes('top') ? -20 : 20, duration: 300 }}
    >
      {#if notification.type === 'achievement' && notification.data}
        <AchievementPopup 
          achievement={notification.data} 
          on:dismiss={() => handleDismiss(notification.id)}
        />
      {:else}
        <div 
          class="notification {notification.type}"
          role="button"
          tabindex="0"
          on:click={() => handleDismiss(notification.id)}
          on:keydown={(e) => handleKeydown(e, notification.id)}
        >
          <div class="notification-content">
            <div class="notification-message">{notification.message}</div>
          </div>
          <button 
            class="close-button" 
            aria-label="Dismiss notification"
            on:click|stopPropagation={() => handleDismiss(notification.id)}
          >×</button>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .notification-container {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    width: 100%;
    max-width: 400px;
  }

  .notification-container.top.right {
    top: 0;
    right: 0;
    align-items: flex-end;
  }

  .notification-container.top.left {
    top: 0;
    left: 0;
    align-items: flex-start;
  }

  .notification-container.bottom.right {
    bottom: 0;
    right: 0;
    align-items: flex-end;
  }

  .notification-container.bottom.left {
    bottom: 0;
    left: 0;
    align-items: flex-start;
  }

  .notification-wrapper {
    pointer-events: auto;
    width: 100%;
  }

  .notification {
    /* Reset button styles */
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    text-align: left;
    width: 100%; /* Ensure button takes full width */
    
    /* Original styles */
    background-color: var(--color-surface);
    color: var(--text-on-surface);
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .notification.achievement {
    color: var(--text-on-tertiary);
  }

  .notification.level {
    background-color: var(--color-primary);
    color: var(--text-on-primary);
  }

  .notification.streak {
    background-color: var(--color-secondary);
    color: var(--text-on-secondary);
  }

  .notification-content {
    flex: 1;
  }

  .notification-message {
    font-weight: 500;
  }

  .close-button {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    padding: 0 0.5rem;
  }

  .close-button:hover {
    opacity: 1;
  }
</style>