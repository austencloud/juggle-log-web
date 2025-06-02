<!-- Pattern Card Component -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GeneratedPattern } from '../../../services/siteswapGenerator';

  export let pattern: GeneratedPattern;
  export let compact = false;

  const dispatch = createEventDispatcher<{
    select: GeneratedPattern;
  }>();

  function handleSelect() {
    dispatch('select', pattern);
  }

  function getDifficultyClass(difficulty: number): string {
    return `difficulty-${Math.floor(difficulty / 3)}`;
  }
</script>

<button 
  class="pattern-card" 
  class:compact
  onclick={handleSelect}
  role="button"
  tabindex="0"
>
  <div class="pattern-header">
    <span class="pattern-text">{pattern.pattern}</span>
    <span class="difficulty-badge {getDifficultyClass(pattern.difficulty)}">
      {pattern.difficulty.toFixed(1)}
    </span>
  </div>
  
  <div class="pattern-info">
    <p class="pattern-description">{pattern.description}</p>
    <div class="pattern-stats">
      <span>Objects: {pattern.objectCount}</span>
      <span>Period: {pattern.period}</span>
      <span>Avg Height: {pattern.averageHeight.toFixed(1)}</span>
    </div>
    <div class="pattern-tags">
      {#each pattern.tags.slice(0, 3) as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  </div>
</button>

<style>
  .pattern-card {
    background: white;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.5rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .pattern-card:hover {
    border-color: var(--primary-color, #3b82f6);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  .pattern-card.compact {
    padding: 0.75rem;
  }

  .pattern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .pattern-text {
    font-family: 'Courier New', monospace;
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--primary-color, #3b82f6);
  }

  .difficulty-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .difficulty-0 {
    background: var(--success-light, #dcfce7);
    color: var(--success-dark, #166534);
  }

  .difficulty-1 {
    background: var(--warning-light, #fef3c7);
    color: var(--warning-dark, #92400e);
  }

  .difficulty-2 {
    background: var(--error-light, #fee2e2);
    color: var(--error-dark, #991b1b);
  }

  .difficulty-3 {
    background: #fde2e7;
    color: #be185d;
  }

  .pattern-info {
    flex: 1;
  }

  .pattern-description {
    color: var(--text-secondary, #4b5563);
    font-size: 0.875rem;
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }

  .pattern-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--text-muted, #6b7280);
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .pattern-tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .tag {
    background: var(--tag-bg, #f1f5f9);
    color: var(--tag-text, #475569);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 500;
  }

  .pattern-card:focus-visible {
    outline: 2px solid var(--primary-color, #3b82f6);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    .pattern-stats {
      flex-direction: column;
      gap: 0.25rem;
    }

    .pattern-text {
      font-size: 1.125rem;
    }
  }
</style>
