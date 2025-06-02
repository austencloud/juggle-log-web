<script lang="ts">
  import { normalizeSiteswapPattern, getCanonicalSuggestion, arePatternsEquivalent } from '../utils/siteswapNormalization';
  
  let inputPattern = '531';
  let comparisonPattern = '315';
  
  $: normalizationResult = normalizeSiteswapPattern(inputPattern);
  $: suggestion = getCanonicalSuggestion(inputPattern);
  $: areEquivalent = arePatternsEquivalent(inputPattern, comparisonPattern);
  
  // Demo patterns to test
  const demoPatterns = [
    { pattern: '531', description: 'Box pattern (non-canonical)' },
    { pattern: '315', description: 'Box pattern (non-canonical)' },
    { pattern: '153', description: 'Box pattern (canonical)' },
    { pattern: '441', description: 'Flash pattern (non-canonical)' },
    { pattern: '144', description: 'Flash pattern (canonical)' },
    { pattern: '423', description: 'Tennis pattern (non-canonical)' },
    { pattern: '234', description: 'Tennis pattern (canonical)' },
    { pattern: '3', description: 'Cascade (already canonical)' },
    { pattern: '532', description: 'Invalid pattern (average theorem)' },
    { pattern: '(4,4)', description: 'Synchronous fountain' },
    { pattern: '[33]', description: 'Multiplex cascade' }
  ];
  
  function setPattern(pattern: string) {
    inputPattern = pattern;
  }
</script>

<div class="normalization-demo">
  <h2>🔄 Siteswap Pattern Normalization Demo</h2>
  
  <div class="demo-section">
    <h3>Pattern Input & Analysis</h3>
    <div class="input-group">
      <label for="pattern-input">Enter Siteswap Pattern:</label>
      <input 
        id="pattern-input"
        bind:value={inputPattern} 
        placeholder="e.g., 531, 441, (4,4), [33]"
        class="pattern-input"
      />
    </div>
    
    {#if normalizationResult}
      <div class="result-card" class:valid={normalizationResult.mathematicallyValid} class:invalid={!normalizationResult.mathematicallyValid}>
        <h4>
          {#if normalizationResult.mathematicallyValid}
            ✅ Valid Pattern
          {:else}
            ❌ Invalid Pattern
          {/if}
        </h4>
        
        <div class="result-grid">
          <div class="result-item">
            <strong>Input:</strong> {inputPattern}
          </div>
          <div class="result-item">
            <strong>Canonical Form:</strong> {normalizationResult.canonical}
          </div>
          <div class="result-item">
            <strong>Pattern Type:</strong> {normalizationResult.patternType}
          </div>
          {#if normalizationResult.ballCount}
            <div class="result-item">
              <strong>Ball Count:</strong> {normalizationResult.ballCount}
            </div>
          {/if}
          {#if normalizationResult.authenticName}
            <div class="result-item">
              <strong>Authentic Name:</strong> {normalizationResult.authenticName}
            </div>
          {/if}
        </div>
        
        <div class="reasoning">
          <strong>Reasoning:</strong> {normalizationResult.reasoning}
        </div>
        
        {#if normalizationResult.equivalentForms.length > 1}
          <div class="equivalent-forms">
            <strong>Equivalent Forms:</strong>
            <div class="forms-list">
              {#each normalizationResult.equivalentForms as form}
                <span class="form-tag" class:canonical={form === normalizationResult.canonical}>
                  {form}
                </span>
              {/each}
            </div>
          </div>
        {/if}
        
        {#if normalizationResult.sources}
          <div class="sources">
            <strong>Sources:</strong> {normalizationResult.sources.join(', ')}
          </div>
        {/if}
        
        {#if normalizationResult.validationErrors}
          <div class="errors">
            <strong>Validation Errors:</strong>
            <ul>
              {#each normalizationResult.validationErrors as error}
                <li>{error}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}
    
    {#if suggestion}
      <div class="suggestion">
        💡 {suggestion}
      </div>
    {/if}
  </div>
  
  <div class="demo-section">
    <h3>Pattern Equivalence Test</h3>
    <div class="equivalence-test">
      <div class="input-group">
        <label>Pattern 1:</label>
        <input bind:value={inputPattern} class="pattern-input" />
      </div>
      <div class="input-group">
        <label>Pattern 2:</label>
        <input bind:value={comparisonPattern} class="pattern-input" />
      </div>
      <div class="equivalence-result" class:equivalent={areEquivalent} class:not-equivalent={!areEquivalent}>
        {#if areEquivalent}
          ✅ These patterns are mathematically equivalent
        {:else}
          ❌ These patterns are NOT equivalent
        {/if}
      </div>
    </div>
  </div>
  
  <div class="demo-section">
    <h3>Demo Patterns</h3>
    <div class="demo-patterns">
      {#each demoPatterns as { pattern, description }}
        <button 
          class="demo-pattern-btn"
          on:click={() => setPattern(pattern)}
          class:active={inputPattern === pattern}
        >
          <div class="pattern-code">{pattern}</div>
          <div class="pattern-desc">{description}</div>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .normalization-demo {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .demo-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
  }
  
  .input-group {
    margin-bottom: 15px;
  }
  
  .input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
  }
  
  .pattern-input {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    font-family: 'Courier New', monospace;
  }
  
  .pattern-input:focus {
    outline: none;
    border-color: #007acc;
  }
  
  .result-card {
    margin-top: 20px;
    padding: 20px;
    border-radius: 8px;
    border: 2px solid;
  }
  
  .result-card.valid {
    border-color: #28a745;
    background: #f8fff9;
  }
  
  .result-card.invalid {
    border-color: #dc3545;
    background: #fff8f8;
  }
  
  .result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 15px 0;
  }
  
  .result-item {
    padding: 8px;
    background: white;
    border-radius: 4px;
    border: 1px solid #eee;
  }
  
  .reasoning {
    margin: 15px 0;
    padding: 10px;
    background: #f0f8ff;
    border-radius: 4px;
    border-left: 4px solid #007acc;
  }
  
  .equivalent-forms {
    margin: 15px 0;
  }
  
  .forms-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  
  .form-tag {
    padding: 4px 8px;
    background: #e9ecef;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
  }
  
  .form-tag.canonical {
    background: #28a745;
    color: white;
    font-weight: bold;
  }
  
  .sources {
    margin: 15px 0;
    font-size: 14px;
    color: #666;
  }
  
  .errors {
    margin: 15px 0;
    color: #dc3545;
  }
  
  .errors ul {
    margin: 8px 0 0 20px;
  }
  
  .suggestion {
    margin-top: 15px;
    padding: 12px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    color: #856404;
  }
  
  .equivalence-test {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    align-items: end;
  }
  
  .equivalence-result {
    grid-column: 1 / -1;
    padding: 15px;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
  }
  
  .equivalence-result.equivalent {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .equivalence-result.not-equivalent {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .demo-patterns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
  }
  
  .demo-pattern-btn {
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  
  .demo-pattern-btn:hover {
    border-color: #007acc;
    background: #f8f9fa;
  }
  
  .demo-pattern-btn.active {
    border-color: #007acc;
    background: #e3f2fd;
  }
  
  .pattern-code {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 4px;
  }
  
  .pattern-desc {
    font-size: 12px;
    color: #666;
  }
  
  h2, h3 {
    color: #333;
    margin-bottom: 15px;
  }
  
  h2 {
    text-align: center;
    border-bottom: 2px solid #007acc;
    padding-bottom: 10px;
  }
</style>
