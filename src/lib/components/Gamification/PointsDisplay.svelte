<script lang="ts">
  import { gamificationStore } from '$lib/stores/gamificationStore';
  import { fade } from 'svelte/transition';

  export let showIcon = true;

  let recentXP: { amount: number; timestamp: number } | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function showXPGain(amount: number) {
    recentXP = { amount, timestamp: Date.now() };
    
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      recentXP = null;
    }, 2000);
  }
</script>

<div class="points-display">
  {#if showIcon}
    <div class="xp-icon">XP</div>
  {/if}
  <div class="points-container">
    <div class="level-text">Level {$gamificationStore.level}</div>
    <div class="xp-text">{$gamificationStore.totalXP} XP</div>
  </div>
  
  {#if recentXP}
    <div class="xp-gain" transition:fade={{ duration: 200 }}>
      +{recentXP.amount}
    </div>
  {/if}
</div>

<style>
  .points-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
  }
  
  .xp-icon {
    background-color: var(--color-tertiary);
    color: var(--text-on-tertiary);
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
  }
  
  .points-container {
    display: flex;
    flex-direction: column;
  }
  
  .level-text {
    font-weight: bold;
    font-size: 0.9rem;
    line-height: 1;
  }
  
  .xp-text {
    font-size: 0.8rem;
    opacity: 0.8;
  }
  
  .xp-gain {
    position: absolute;
    top: -1rem;
    right: 0;
    color: var(--color-tertiary);
    font-weight: bold;
    font-size: 0.9rem;
    animation: float-up 2s ease-out forwards;
  }
  
  @keyframes float-up {
    0% {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-1.5rem);
    }
  }
</style>