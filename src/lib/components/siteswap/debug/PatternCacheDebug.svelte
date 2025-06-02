<!-- Pattern Cache Debug Component -->
<script lang="ts">
  import { PatternCacheService } from '../../../services/patternCacheService';

  let cacheStats = $state({
    size: 0,
    essentialCount: 0,
    hitRate: 0,
    loadingCount: 0
  });

  let testPattern = $state('441');
  let testResult = $state<any>(null);
  let isTestLoading = $state(false);
  let testError = $state<string | null>(null);

  // Update cache stats periodically
  $effect(() => {
    const interval = setInterval(() => {
      cacheStats = PatternCacheService.getCacheStats();
    }, 1000);

    return () => clearInterval(interval);
  });

  async function testPatternLoad() {
    if (!testPattern.trim()) return;

    isTestLoading = true;
    testError = null;
    testResult = null;

    try {
      const startTime = performance.now();
      const result = await PatternCacheService.getPatternAnimation(testPattern);
      const endTime = performance.now();
      
      testResult = {
        ...result,
        loadTime: Math.round(endTime - startTime)
      };
    } catch (error) {
      testError = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      isTestLoading = false;
    }
  }

  function clearCache() {
    PatternCacheService.clearCache();
    cacheStats = PatternCacheService.getCacheStats();
  }

  async function initializeCache() {
    try {
      await PatternCacheService.initializeCache();
      cacheStats = PatternCacheService.getCacheStats();
    } catch (error) {
      console.error('Cache initialization failed:', error);
    }
  }
</script>

<div class="debug-panel">
  <h3>🔍 Pattern Cache Debug</h3>
  
  <!-- Cache Statistics -->
  <div class="stats-section">
    <h4>Cache Statistics</h4>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Total Patterns:</span>
        <span class="stat-value">{cacheStats.size}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Essential Patterns:</span>
        <span class="stat-value">{cacheStats.essentialCount}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Currently Loading:</span>
        <span class="stat-value">{cacheStats.loadingCount}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Hit Rate:</span>
        <span class="stat-value">{cacheStats.hitRate.toFixed(1)}%</span>
      </div>
    </div>
  </div>

  <!-- Cache Controls -->
  <div class="controls-section">
    <h4>Cache Controls</h4>
    <div class="control-buttons">
      <button class="btn btn-primary" onclick={initializeCache}>
        🚀 Initialize Cache
      </button>
      <button class="btn btn-secondary" onclick={clearCache}>
        🗑️ Clear Cache
      </button>
    </div>
  </div>

  <!-- Pattern Test -->
  <div class="test-section">
    <h4>Pattern Load Test</h4>
    <div class="test-controls">
      <input 
        type="text" 
        bind:value={testPattern}
        placeholder="Enter pattern (e.g., 441, 531, 3)"
        class="pattern-input"
      />
      <button 
        class="btn btn-primary" 
        onclick={testPatternLoad}
        disabled={isTestLoading || !testPattern.trim()}
      >
        {isTestLoading ? '⏳ Loading...' : '🧪 Test Load'}
      </button>
    </div>

    {#if testError}
      <div class="test-error">
        ❌ Error: {testError}
      </div>
    {/if}

    {#if testResult}
      <div class="test-result">
        <h5>✅ Load Successful</h5>
        <div class="result-details">
          <div>Pattern: {testResult.pattern}</div>
          <div>Provider: {testResult.provider}</div>
          <div>Load Time: {testResult.loadTime}ms</div>
          <div>GIF URL: <a href={testResult.gifUrl} target="_blank">View</a></div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .debug-panel {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin: 1rem 0;
    backdrop-filter: blur(10px);
  }

  .debug-panel h3 {
    margin: 0 0 1.5rem 0;
    color: var(--text-color, #374151);
    font-size: 1.25rem;
  }

  .debug-panel h4 {
    margin: 0 0 1rem 0;
    color: var(--text-color, #374151);
    font-size: 1rem;
  }

  .debug-panel h5 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color, #374151);
    font-size: 0.9rem;
  }

  .stats-section, .controls-section, .test-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .test-section {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .stat-value {
    font-weight: 600;
    color: var(--primary-color, #3b82f6);
  }

  .control-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .test-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .pattern-input {
    flex: 1;
    min-width: 200px;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-color, #374151);
    font-size: 0.875rem;
  }

  .pattern-input:focus {
    outline: none;
    border-color: var(--primary-color, #3b82f6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-color-dark, #2563eb);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: rgba(107, 114, 128, 0.8);
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(107, 114, 128, 0.9);
    transform: translateY(-1px);
  }

  .test-error {
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 0.5rem;
    color: var(--error-color, #ef4444);
    font-size: 0.875rem;
  }

  .test-result {
    padding: 1rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 0.5rem;
    color: var(--success-color, #10b981);
  }

  .result-details {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .result-details div {
    margin-bottom: 0.25rem;
  }

  .result-details a {
    color: var(--primary-color, #3b82f6);
    text-decoration: none;
  }

  .result-details a:hover {
    text-decoration: underline;
  }
</style>
