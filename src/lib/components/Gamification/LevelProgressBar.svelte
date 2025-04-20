<script lang="ts">
  import { gamificationStore } from '$lib/stores/gamificationStore';

  export let showLevel = true;
  export let compact = false;

  $: progress = $gamificationStore.currentLevelXP / ($gamificationStore.currentLevelXP + $gamificationStore.xpToNextLevel) * 100;
</script>

<div class="level-progress-container" class:compact>
  {#if showLevel}
    <div class="level-indicator">Level {$gamificationStore.level}</div>
  {/if}
  <div class="progress-bar">
    <div class="progress-fill" style="width: {progress}%"></div>
    {#if !compact}
      <div class="progress-text">
        {$gamificationStore.currentLevelXP} / {$gamificationStore.currentLevelXP + $gamificationStore.xpToNextLevel} XP
      </div>
    {/if}
  </div>
</div>

<style>
  .level-progress-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    margin: 0.5rem 0;
  }
  
  .level-progress-container.compact {
    max-width: 200px;
  }
  
  .level-indicator {
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    background-color: var(--color-primary);
    color: var(--text-on-primary);
    font-size: 0.9rem;
    white-space: nowrap;
  }
  
  .progress-bar {
    position: relative;
    width: 100%;
    height: 0.75rem;
    background-color: var(--color-surface-variant);
    border-radius: 1rem;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: var(--color-tertiary);
    border-radius: 1rem;
    transition: width 0.3s ease-in-out;
  }
  
  .progress-text {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--text-on-surface);
    font-weight: 500;
  }
</style>