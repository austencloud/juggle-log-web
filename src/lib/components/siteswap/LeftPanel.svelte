<!-- Left Panel - Unified Pattern Controls -->
<script lang="ts">
  import { SiteswapGenerator, type GeneratedPattern, type GeneratorOptions } from '../../services/siteswapGenerator';
  import { SiteswapService } from '../../services/siteswapService';
  import { runAllCanonicalTests } from '../../utils/canonicalNormalizationTest';
  import { runAllTests } from '../../utils/validationTest';

  interface Props {
    selectedPattern?: GeneratedPattern | null;
    recentPatterns?: GeneratedPattern[];
    onpatternSelected?: (pattern: GeneratedPattern) => void;
    onrecentPatternSelected?: (pattern: GeneratedPattern) => void;
  }

  let { 
    selectedPattern = null,
    recentPatterns = [],
    onpatternSelected,
    onrecentPatternSelected
  }: Props = $props();

  // State management
  let customPattern = $state('');
  let customValidation = $state<{ isValid: boolean; errors: string[]; analysis?: any }>({ isValid: false, errors: [] });
  let generatedPatterns = $state<GeneratedPattern[]>([]);
  let isGenerating = $state(false);
  let patternCategories = $state<any[]>([]);

  // Generator options
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

  // Initialize pattern categories
  $effect(() => {
    patternCategories = SiteswapGenerator.getPatternsByCategory();
  });

  // Validate custom pattern reactively
  $effect(() => {
    if (customPattern) {
      validateCustomPattern(customPattern);
    } else {
      customValidation = { isValid: false, errors: [] };
    }
  });

  function validateCustomPattern(pattern: string) {
    const validation = SiteswapService.validateSiteswap(pattern);
    const analysis = SiteswapService.analyzeSiteswap(pattern);
    
    customValidation = {
      isValid: validation.isValid,
      errors: validation.errors,
      analysis
    };

    // Auto-select valid patterns
    if (validation.isValid && analysis) {
      const generatedPattern: GeneratedPattern = {
        pattern: pattern,
        description: `Custom pattern: ${pattern}`,
        objectCount: analysis.objectCount,
        period: analysis.period,
        difficulty: analysis.difficulty,
        averageHeight: analysis.averageHeight,
        patternType: analysis.patternType,
        tags: ['custom']
      };
      onpatternSelected?.(generatedPattern);
    }
  }

  function generatePatterns() {
    isGenerating = true;
    try {
      console.log('🎲 [LeftPanel] Generating patterns with options:', generatorOptions);
      const startTime = performance.now();

      generatedPatterns = SiteswapGenerator.generatePatterns(generatorOptions);

      const endTime = performance.now();
      const generationTime = Math.round(endTime - startTime);

      console.log(`✅ [LeftPanel] Generated ${generatedPatterns.length} valid patterns in ${generationTime}ms`);

      // Log some examples of generated patterns for verification
      if (generatedPatterns.length > 0) {
        const examples = generatedPatterns.slice(0, 5).map(p => p.pattern).join(', ');
        console.log(`📋 [LeftPanel] Example patterns: ${examples}`);
      }
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

  function selectPattern(pattern: GeneratedPattern) {
    onpatternSelected?.(pattern);
  }

  function selectRecentPattern(pattern: GeneratedPattern) {
    onrecentPatternSelected?.(pattern);
  }
</script>

<div class="left-panel-content">
  <!-- Recent Patterns -->
  {#if recentPatterns.length > 0}
    <section class="recent-patterns">
      <h3>Recent Patterns</h3>
      <div class="pattern-chips-scroll">
        {#each recentPatterns as pattern}
          <button 
            class="pattern-chip"
            class:active={selectedPattern?.pattern === pattern.pattern}
            onclick={() => selectRecentPattern(pattern)}
            title={pattern.description}
          >
            {pattern.pattern}
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Quick Pattern Input -->
  <section class="pattern-input">
    <h3>Quick Pattern Input</h3>
    <div class="input-group">
      <input 
        type="text" 
        bind:value={customPattern}
        placeholder="Enter siteswap pattern (e.g., 441, 97531)"
        class="pattern-input-field"
      />
      {#if customPattern}
        <div class="validation-feedback">
          {#if customValidation.isValid}
            <div class="validation-success">
              <span class="success-icon">✅</span>
              <span>Valid pattern!</span>
            </div>
          {:else}
            <div class="validation-error">
              <span class="error-icon">❌</span>
              <span>{customValidation.errors[0] || 'Invalid pattern'}</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </section>

  <!-- Pattern Generation -->
  <section class="pattern-generation">
    <h3>Generate Patterns</h3>
    <div class="generation-controls">
      <div class="control-row">
        <div class="control-group">
          <label for="objects-input">Objects</label>
          <input 
            id="objects-input"
            type="number" 
            bind:value={generatorOptions.objectCount}
            min="1" 
            max="10"
            class="control-input"
          />
        </div>
        <div class="control-group">
          <label for="length-input">Length</label>
          <input 
            id="length-input"
            type="number" 
            bind:value={generatorOptions.patternLength}
            min="1" 
            max="12"
            class="control-input"
          />
        </div>
        <div class="control-group">
          <label for="difficulty-select">Difficulty</label>
          <select id="difficulty-select" bind:value={generatorOptions.difficulty} class="control-select">
            <option value="any">Any</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
      
      <div class="generation-actions">
        <button 
          class="btn btn-primary"
          onclick={generatePatterns}
          disabled={isGenerating}
        >
          {isGenerating ? '🔄 Generating...' : '🎲 Generate'}
        </button>
        <button
          class="btn btn-secondary"
          onclick={generateRandomPattern}
        >
          🎯 Random
        </button>
        <button
          class="btn btn-accent"
          onclick={() => runAllCanonicalTests()}
        >
          🧪 Test Canonical
        </button>
      </div>
    </div>

    <!-- Generated Results -->
    {#if generatedPatterns.length > 0}
      <div class="generated-results">
        <h4>Generated ({generatedPatterns.length})</h4>
        <div class="pattern-grid">
          {#each generatedPatterns as pattern}
            <button 
              class="pattern-card"
              onclick={() => selectPattern(pattern)}
            >
              <div class="pattern-header">
                <span class="pattern-text">{pattern.pattern}</span>
                <span class="difficulty-badge">{pattern.difficulty.toFixed(1)}</span>
              </div>
              <div class="pattern-info">
                <span class="pattern-description">{pattern.description}</span>
                <div class="pattern-stats">
                  <span>Objects: {pattern.objectCount}</span>
                  <span>Period: {pattern.period}</span>
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </section>

  <!-- Recommended Patterns -->
  <section class="recommended-patterns">
    <h3>Recommended Patterns</h3>
    <div class="categories-grid">
      {#each patternCategories.slice(0, 2) as category}
        <div class="category-section">
          <h4>{category.name}</h4>
          <div class="category-patterns">
            {#each category.patterns.slice(0, 6) as pattern}
              <button 
                class="pattern-chip"
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
  </section>
</div>

<style>
  .left-panel-content {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color, #1f2937);
  }

  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-color, #374151);
  }

  /* Recent Patterns */
  .pattern-chips-scroll {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .pattern-chip {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-family: 'Courier New', monospace;
    font-weight: 500;
    color: var(--text-color, #374151);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .pattern-chip:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
  }

  .pattern-chip.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }

  /* Pattern Input */
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pattern-input-field {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    color: var(--text-color, #374151);
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .pattern-input-field:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .validation-feedback {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .validation-success {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--success-color, #10b981);
  }

  .validation-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--error-color, #ef4444);
  }

  /* Generation Controls */
  .generation-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .control-group label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
  }

  .control-input,
  .control-select {
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.375rem;
    color: var(--text-color, #374151);
    font-size: 0.875rem;
  }

  .generation-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    font-size: 0.875rem;
    flex: 1;
  }

  .btn-primary {
    background: rgba(59, 130, 246, 0.8);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.9);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: rgba(107, 114, 128, 0.8);
    color: white;
  }

  .btn-secondary:hover {
    background: rgba(107, 114, 128, 0.9);
    transform: translateY(-1px);
  }

  .btn-accent {
    background: rgba(168, 85, 247, 0.8);
    color: white;
  }

  .btn-accent:hover {
    background: rgba(168, 85, 247, 0.9);
    transform: translateY(-1px);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* Generated Results */
  .pattern-grid {
    display: grid;
    gap: 0.75rem;
  }

  .pattern-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .pattern-card:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }

  .pattern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .pattern-text {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    color: var(--primary-color, #3b82f6);
    font-size: 1.125rem;
  }

  .difficulty-badge {
    background: rgba(59, 130, 246, 0.2);
    color: var(--primary-color, #3b82f6);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .pattern-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .pattern-description {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    line-height: 1.3;
  }

  .pattern-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--text-muted, #9ca3af);
  }

  /* Categories */
  .categories-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-section {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.5rem;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .category-patterns {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .left-panel-content {
      padding: 1rem;
      gap: 1.5rem;
    }

    .control-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .generation-actions {
      flex-direction: column;
    }

    .pattern-chips-scroll {
      gap: 0.375rem;
    }

    .pattern-chip {
      padding: 0.375rem 0.5rem;
      font-size: 0.875rem;
    }
  }
</style>
