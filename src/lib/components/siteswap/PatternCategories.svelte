<!-- Pattern Categories Component -->
<script lang="ts">
  import { SiteswapGenerator, type PatternCategory, type GeneratedPattern } from '../../services/siteswapGenerator';

  interface Props {
    expanded?: boolean;
    onpatternSelected?: (pattern: GeneratedPattern) => void;
    ontoggleExpanded?: () => void;
  }

  let {
    expanded = false,
    onpatternSelected,
    ontoggleExpanded
  }: Props = $props();

  let patternCategories = $state<PatternCategory[]>([]);

  // Initialize with pattern categories using $effect
  $effect(() => {
    patternCategories = SiteswapGenerator.getPatternsByCategory();
  });

  function selectPattern(pattern: GeneratedPattern) {
    onpatternSelected?.(pattern);
  }

  function toggleExpanded() {
    ontoggleExpanded?.();
  }
</script>

<div class="siteswap-card">
  <div
    class="siteswap-card-header"
    onclick={toggleExpanded}
    onkeydown={(e) => e.key === 'Enter' && toggleExpanded()}
    role="button"
    tabindex="0"
  >
    <h2>📚 Pattern Categories</h2>
    <button class="siteswap-expand-btn" class:expanded>
      {expanded ? '−' : '+'}
    </button>
  </div>
  
  {#if expanded}
    <div class="siteswap-card-content">
      <div class="categories-grid">
        {#each patternCategories as category}
          <div class="category-section">
            <h4>{category.name}</h4>
            <p class="category-description">{category.description}</p>
            <div class="category-patterns">
              {#each category.patterns as pattern}
                <button 
                  class="siteswap-pattern-chip"
                  onclick={() => selectPattern(pattern)}
                  title={pattern.description}
                >
                  {pattern.pattern}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .categories-grid {
    display: grid;
    gap: 1.5rem;
  }

  .category-section {
    background: var(--card-background, #f8fafc);
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color, #e2e8f0);
  }

  .category-section h4 {
    color: var(--text-color, #374151);
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .category-description {
    color: var(--text-secondary, #6b7280);
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .category-patterns {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  @media (max-width: 480px) {
    .category-patterns {
      gap: 0.375rem;
    }
  }
</style>
