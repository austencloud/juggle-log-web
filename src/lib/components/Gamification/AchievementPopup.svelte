<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import type { Achievement } from '$lib/types/achievements';

  export let achievement: Achievement;
  
  const dispatch = createEventDispatcher();
  
  function dismiss() {
    dispatch('dismiss');
  }
  
  // Play sound when component is mounted
  import { onMount } from 'svelte';
  
  onMount(() => {
    try {
      const audio = new Audio('/sounds/yay.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.log('Could not play sound', e);
    }
  });
</script>

<button 
  type="button"
  class="achievement-popup"
  transition:fly={{ y: -20, duration: 300 }}
  on:click={dismiss}
>
  <div class="achievement-header">
    <div class="achievement-badge">
      <span class="icon">{achievement.icon}</span>
    </div>
    <div class="achievement-title">
      <h3>Achievement Unlocked!</h3>
      <h4>{achievement.name}</h4>
    </div>
  </div>
  
  <div class="achievement-content">
    <p>{achievement.description}</p>
    <div class="xp-reward" in:fade={{ delay: 300, duration: 300 }}>
      +{achievement.xpReward} XP
    </div>
  </div>
  
  <!-- Removed redundant close button as the whole element is clickable -->
</button>

<style>
  .achievement-popup {
    background: linear-gradient(135deg, var(--color-primary-variant), var(--color-tertiary));
    color: var(--text-on-primary);
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    width: 100%;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    animation: glow 2s infinite alternate;
  }
  
  @keyframes glow {
    from {
      box-shadow: 0 0 10px -5px var(--color-tertiary);
    }
    to {
      box-shadow: 0 0 15px 2px var(--color-tertiary);
    }
  }
  
  .achievement-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .achievement-badge {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .icon {
    font-size: 1.5rem;
  }
  
  .achievement-title h3 {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.9;
  }
  
  .achievement-title h4 {
    font-size: 1.1rem;
    margin: 0;
    font-weight: 600;
  }
  
  .achievement-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .achievement-content p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }
  
  .xp-reward {
    align-self: flex-end;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.9rem;
  }

  /* Removed styles for the close button */
</style>