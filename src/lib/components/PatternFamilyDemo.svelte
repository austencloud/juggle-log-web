<script lang="ts">
  import {
    normalizeSiteswapPattern,
    getPatternFamily,
    getPatternVariations,
    getRelatedPatterns
  } from '$lib/utils/siteswapNormalization.js';

  let inputPattern = '423';
  let result: any = null;
  let family: any = null;
  let variations: any[] = [];
  let relatedPatterns: any[] = [];

  function analyzePattern() {
    if (!inputPattern.trim()) return;
    
    result = normalizeSiteswapPattern(inputPattern);
    family = getPatternFamily(inputPattern);
    variations = getPatternVariations(inputPattern);
    relatedPatterns = getRelatedPatterns(inputPattern);
  }

  // Analyze default pattern on mount
  analyzePattern();
</script>

<div class="demo-container">
  <div class="demo-header">
    <h2 class="demo-title">Pattern Family API Demo</h2>
    <p class="demo-subtitle">Enter any siteswap pattern to explore its complete family ecosystem</p>
  </div>

  <div class="demo-input-section">
    <label for="pattern-input" class="demo-label">
      Enter a siteswap pattern:
    </label>
    <div class="demo-input-group">
      <input
        id="pattern-input"
        type="text"
        bind:value={inputPattern}
        placeholder="e.g., 423, 531, 441, 3, 4"
        on:input={analyzePattern}
        class="demo-input"
      />
      <button
        on:click={analyzePattern}
        class="demo-button"
      >
        Analyze
      </button>
    </div>
  </div>

  {#if result}
    <div class="demo-results">
      <!-- Basic Pattern Info -->
      <div class="result-section analysis">
        <h3 class="result-title">
          Pattern Analysis
        </h3>
        <div class="result-grid">
          <div class="result-item">
            <span class="result-label">Input:</span>
            <span class="result-value">{inputPattern}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Canonical:</span>
            <span class="result-value">{result.canonical}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Valid:</span>
            <span class="result-value {result.isValid ? 'valid' : 'invalid'}">
              {result.isValid ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          {#if result.authenticName}
            <div class="result-item">
              <span class="result-label">Authentic Name:</span>
              <span class="result-value">{result.authenticName}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Pattern Family -->
      {#if family}
        <div class="result-section family">
          <h3 class="result-title">
            Pattern Family: {family.primaryName}
          </h3>
          <div class="family-details">
            {#if family.inventor}
              <div class="family-detail">
                <span class="detail-label">Inventor:</span>
                <span class="detail-value">{family.inventor}</span>
              </div>
            {/if}
            <div class="family-detail">
              <span class="detail-label">Difficulty:</span>
              <span class="difficulty-badge">{family.difficulty}/10</span>
            </div>
            {#if family.alternativeNames?.length > 0}
              <div class="family-detail">
                <span class="detail-label">Also known as:</span>
                <div class="alt-names">
                  {#each family.alternativeNames as name}
                    <span class="alt-name">{name}</span>
                  {/each}
                </div>
              </div>
            {/if}
            <div class="family-detail">
              <span class="detail-label">Historical Notes:</span>
              <span class="detail-value">{family.historicalNotes}</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- Summary -->
      {#if variations.length > 0 || relatedPatterns.length > 0}
        <div class="result-section summary">
          <h3 class="result-title">Pattern Family Summary</h3>
          <div class="summary-stats">
            {#if variations.length > 0}
              <div class="summary-stat">
                <span class="stat-number">{variations.length}</span>
                <span class="stat-label">Variations</span>
              </div>
            {/if}
            {#if relatedPatterns.length > 0}
              <div class="summary-stat">
                <span class="stat-number">{relatedPatterns.length}</span>
                <span class="stat-label">Related Patterns</span>
              </div>
            {/if}
          </div>
          <p class="summary-note">
            Click on the pattern family cards above to explore detailed variations and relationships.
          </p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .demo-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .demo-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text-color);
    margin-bottom: 0.5rem;
  }

  .demo-subtitle {
    color: var(--text-light);
  }

  .demo-input-section {
    margin-bottom: 2rem;
  }

  .demo-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 0.5rem;
  }

  .demo-input-group {
    display: flex;
    gap: 0.75rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .demo-input {
    flex: 1;
    padding: 0.75rem;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    color: var(--text-color);
    font-size: 1rem;
  }

  .demo-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }

  .demo-button {
    padding: 0.75rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-weight: 500;
    transition: background 0.3s var(--magic-transition);
  }

  .demo-button:hover {
    background: var(--primary-dark);
  }

  .demo-results {
    display: grid;
    gap: 1.5rem;
  }

  .result-section {
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 1.5rem;
  }

  .result-section.analysis {
    background: var(--background-light);
    border-color: var(--border-light);
  }

  .result-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .result-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (min-width: 768px) {
    .result-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .result-label {
    font-weight: 500;
    color: var(--text-light);
  }

  .result-value {
    font-weight: 600;
    color: var(--text-color);
  }

  .result-value.valid {
    color: var(--success-color);
  }

  .result-value.invalid {
    color: var(--error-color);
  }

  .result-section.family {
    background: rgba(59, 130, 246, 0.1);
    border-color: var(--info-color);
  }

  .family-details {
    display: grid;
    gap: var(--spacing-md);
  }

  .family-detail {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .detail-label {
    font-weight: var(--font-weight-medium);
    color: var(--info-color);
    min-width: 120px;
    flex-shrink: 0;
  }

  .detail-value {
    color: var(--text-color);
    line-height: 1.5;
  }

  .difficulty-badge {
    background: rgba(59, 130, 246, 0.2);
    color: var(--info-color);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .alt-names {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .alt-name {
    background: rgba(59, 130, 246, 0.15);
    color: var(--info-light);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
  }

  .result-section.summary {
    background: rgba(16, 185, 129, 0.1);
    border-color: var(--success-color);
  }

  .summary-stats {
    display: flex;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-md);
  }

  .summary-stat {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--success-color);
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--success-dark);
  }

  .summary-note {
    color: var(--success-dark);
    font-style: italic;
    margin: 0;
  }
</style>


