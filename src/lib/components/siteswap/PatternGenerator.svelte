<!-- Pattern Generator Component -->
<script lang="ts">
  import { SiteswapGenerator, type GeneratorOptions, type GeneratedPattern } from '../../services/siteswapGenerator';
  import PatternCard from './shared/PatternCard.svelte';

  interface Props {
    expanded?: boolean;
    onpatternSelected?: (pattern: GeneratedPattern) => void;
    ontoggleExpanded?: () => void;
  }

  let {
    expanded = true,
    onpatternSelected,
    ontoggleExpanded
  }: Props = $props();

  let generatorOptions = $state<GeneratorOptions>({
    objectCount: 3,
    maxHeight: 7,
    minHeight: 0,
    patternLength: 4,
    patternType: 'any',
    includeZeros: false,
    symmetrical: false,
    difficulty: 'any'
  });

  let generatedPatterns = $state<GeneratedPattern[]>([]);
  let isGenerating = $state(false);

  function generatePatterns() {
    isGenerating = true;
    try {
      generatedPatterns = SiteswapGenerator.generatePatterns(generatorOptions);
    } catch (error) {
      console.error('Pattern generation failed:', error);
      generatedPatterns = [];
    } finally {
      isGenerating = false;
    }
  }

  function generateRandomPattern() {
    const randomPattern = SiteswapGenerator.generateRandomPattern(
      generatorOptions.objectCount,
      generatorOptions.patternLength || 6
    );
    if (randomPattern) {
      onpatternSelected?.(randomPattern);
    }
  }

  function handlePatternSelect(event: CustomEvent<GeneratedPattern>) {
    onpatternSelected?.(event.detail);
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
    <h2>🎲 Pattern Generator</h2>
    <button class="siteswap-expand-btn" class:expanded>
      {expanded ? '−' : '+'}
    </button>
  </div>
  
  {#if expanded}
    <div class="siteswap-card-content">
      <div class="generator-controls">
        <div class="siteswap-control-grid">
          <div class="siteswap-form-group">
            <label for="objectCount">Objects</label>
            <input 
              id="objectCount"
              type="number" 
              bind:value={generatorOptions.objectCount}
              min="1" 
              max="10"
              class="siteswap-form-input"
            />
          </div>

          <div class="siteswap-form-group">
            <label for="patternLength">Length</label>
            <input 
              id="patternLength"
              type="number" 
              bind:value={generatorOptions.patternLength}
              min="1" 
              max="12"
              class="siteswap-form-input"
            />
          </div>

          <div class="siteswap-form-group">
            <label for="maxHeight">Max Height</label>
            <input 
              id="maxHeight"
              type="number" 
              bind:value={generatorOptions.maxHeight}
              min="0" 
              max="15"
              class="siteswap-form-input"
            />
          </div>

          <div class="siteswap-form-group">
            <label for="difficulty">Difficulty</label>
            <select id="difficulty" bind:value={generatorOptions.difficulty} class="siteswap-form-select">
              <option value="any">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div class="siteswap-form-group">
            <label for="patternType">Type</label>
            <select id="patternType" bind:value={generatorOptions.patternType} class="siteswap-form-select">
              <option value="any">Any</option>
              <option value="async">Async</option>
              <option value="sync">Sync</option>
              <option value="multiplex">Multiplex</option>
            </select>
          </div>

          <div class="siteswap-form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                bind:checked={generatorOptions.includeZeros}
                class="form-checkbox"
              />
              Include gaps (0s)
            </label>
          </div>
        </div>

        <div class="generator-actions">
          <button 
            class="siteswap-btn siteswap-btn-primary"
            onclick={generatePatterns}
            disabled={isGenerating}
          >
            {isGenerating ? '🔄 Generating...' : '🎲 Generate Patterns'}
          </button>
          
          <button 
            class="siteswap-btn siteswap-btn-secondary"
            onclick={generateRandomPattern}
          >
            🎯 Random Pattern
          </button>
        </div>
      </div>

      <!-- Generated Patterns Display -->
      {#if generatedPatterns.length > 0}
        <div class="patterns-section">
          <h3>Generated Patterns ({generatedPatterns.length})</h3>
          <div class="siteswap-pattern-grid">
            {#each generatedPatterns as pattern}
              <PatternCard {pattern} on:select={handlePatternSelect} />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .generator-controls {
    margin-bottom: 1rem;
  }

  .checkbox-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .form-checkbox {
    width: auto;
    margin: 0;
  }

  .generator-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .patterns-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color, #e5e7eb);
  }

  .patterns-section h3 {
    color: var(--text-color, #374151);
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .generator-actions {
      flex-direction: column;
    }
  }
</style>
