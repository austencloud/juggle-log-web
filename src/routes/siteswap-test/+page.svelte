<!-- Comprehensive Siteswap Animation Layout Testing -->
<script lang="ts">
  import { SiteswapGenerator, type GeneratedPattern } from '../../lib/services/siteswapGenerator';
  import AnimationViewer from '../../lib/components/siteswap/AnimationViewer.svelte';

  // Test patterns covering various categories and complexities
  let testPatterns = $state<GeneratedPattern[]>([]);
  let currentTestIndex = $state(0);
  let testResults = $state<Array<{
    pattern: GeneratedPattern;
    passed: boolean;
    issues: string[];
    measurements: any;
  }>>([]);
  let isRunningTests = $state(false);
  let testProgress = $state(0);

  // Generate comprehensive test pattern set
  function generateTestPatterns(): GeneratedPattern[] {
    const patterns: GeneratedPattern[] = [];

    // Standard 3-ball patterns
    const threeBallPatterns = ['3', '441', '531', '423', '51414', '552', '534'];
    threeBallPatterns.forEach(pattern => {
      patterns.push({
        pattern,
        description: `3-ball pattern: ${pattern}`,
        objectCount: 3,
        period: pattern.length,
        difficulty: 2.5,
        averageHeight: 4,
        patternType: 'async',
        tags: ['3-ball', 'standard']
      });
    });

    // 4-ball patterns
    const fourBallPatterns = ['4', '53', '633', '7531', '97531'];
    fourBallPatterns.forEach(pattern => {
      patterns.push({
        pattern,
        description: `4-ball pattern: ${pattern}`,
        objectCount: 4,
        period: pattern.length,
        difficulty: 4.0,
        averageHeight: 5,
        patternType: 'async',
        tags: ['4-ball', 'advanced']
      });
    });

    // 5-ball patterns
    const fiveBallPatterns = ['5', '744', '645', '97531'];
    fiveBallPatterns.forEach(pattern => {
      patterns.push({
        pattern,
        description: `5-ball pattern: ${pattern}`,
        objectCount: 5,
        period: pattern.length,
        difficulty: 6.0,
        averageHeight: 6,
        patternType: 'async',
        tags: ['5-ball', 'expert']
      });
    });

    // Synchronous patterns
    const syncPatterns = ['(4,4)', '(6,2x)', '(4,2x)(2x,4)'];
    syncPatterns.forEach(pattern => {
      patterns.push({
        pattern,
        description: `Sync pattern: ${pattern}`,
        objectCount: 4,
        period: pattern.length,
        difficulty: 3.5,
        averageHeight: 4,
        patternType: 'sync',
        tags: ['sync', 'special']
      });
    });

    // Generate random patterns
    for (let i = 0; i < 10; i++) {
      const randomPattern = SiteswapGenerator.generateRandomPattern(3 + (i % 3), 4 + (i % 5));
      if (randomPattern) {
        patterns.push(randomPattern);
      }
    }

    return patterns;
  }

  // Validate animation layout for a specific pattern
  async function validateAnimationLayout(pattern: GeneratedPattern): Promise<{
    passed: boolean;
    issues: string[];
    measurements: any;
  }> {
    return new Promise((resolve) => {
      // Wait for animation to load
      setTimeout(() => {
        const issues: string[] = [];
        const measurements: any = {};

        // Get animation frame and iframe elements
        const animationFrame = document.querySelector('.animation-frame') as HTMLElement;
        const iframe = document.querySelector('.animation-frame iframe') as HTMLIFrameElement;

        if (!animationFrame || !iframe) {
          issues.push('Animation elements not found');
          resolve({ passed: false, issues, measurements });
          return;
        }

        // Measure container and iframe
        const containerRect = animationFrame.getBoundingClientRect();
        const iframeRect = iframe.getBoundingClientRect();

        measurements.container = {
          width: containerRect.width,
          height: containerRect.height,
          top: containerRect.top,
          left: containerRect.left
        };

        measurements.iframe = {
          width: iframeRect.width,
          height: iframeRect.height,
          top: iframeRect.top,
          left: iframeRect.left
        };

        // Calculate margins and check for cropping
        const topMargin = iframeRect.top - containerRect.top;
        const leftMargin = iframeRect.left - containerRect.left;
        const rightMargin = (containerRect.left + containerRect.width) - (iframeRect.left + iframeRect.width);
        const bottomMargin = (containerRect.top + containerRect.height) - (iframeRect.top + iframeRect.height);

        measurements.margins = { topMargin, leftMargin, rightMargin, bottomMargin };

        // Validation checks
        if (topMargin < 0) issues.push('Top edge cropped');
        if (leftMargin < 0) issues.push('Left edge cropped');
        if (rightMargin < 0) issues.push('Right edge cropped');
        if (bottomMargin < 0) issues.push('Bottom edge cropped');

        // Check centering (margins should be roughly equal)
        const horizontalCenterTolerance = 20;
        const verticalCenterTolerance = 20;
        
        if (Math.abs(leftMargin - rightMargin) > horizontalCenterTolerance) {
          issues.push('Horizontal centering off');
        }
        
        if (Math.abs(topMargin - bottomMargin) > verticalCenterTolerance) {
          issues.push('Vertical centering off');
        }

        // Check minimum visibility margins
        const minMargin = 10;
        if (topMargin < minMargin) issues.push('Insufficient top margin');
        if (leftMargin < minMargin) issues.push('Insufficient left margin');
        if (rightMargin < minMargin) issues.push('Insufficient right margin');
        if (bottomMargin < minMargin) issues.push('Insufficient bottom margin');

        resolve({
          passed: issues.length === 0,
          issues,
          measurements
        });
      }, 2000); // Wait 2 seconds for animation to load
    });
  }

  // Run comprehensive test suite
  async function runTestSuite() {
    isRunningTests = true;
    testResults = [];
    testProgress = 0;

    for (let i = 0; i < testPatterns.length; i++) {
      currentTestIndex = i;
      testProgress = ((i + 1) / testPatterns.length) * 100;

      const pattern = testPatterns[i];
      const result = await validateAnimationLayout(pattern);
      
      testResults.push({
        pattern,
        ...result
      });

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    isRunningTests = false;
  }

  // Initialize test patterns
  $effect(() => {
    testPatterns = generateTestPatterns();
  });

  // Get current test pattern
  let currentPattern = $derived.by(() => testPatterns[currentTestIndex] || null);

  // Test statistics
  let testStats = $derived.by(() => ({
    total: testResults.length,
    passed: testResults.filter(r => r.passed).length,
    failed: testResults.filter(r => !r.passed).length,
    passRate: testResults.length > 0 ? (testResults.filter(r => r.passed).length / testResults.length * 100).toFixed(1) : '0'
  }));
</script>

<div class="test-container">
  <div class="test-header">
    <h1>🧪 Siteswap Animation Layout Testing</h1>
    <p>Comprehensive testing framework for animation positioning and scaling</p>
  </div>

  <div class="test-controls">
    <div class="pattern-selector">
      <label for="pattern-select">Test Pattern ({currentTestIndex + 1} of {testPatterns.length}):</label>
      <select id="pattern-select" bind:value={currentTestIndex} disabled={isRunningTests}>
        {#each testPatterns as pattern, index}
          <option value={index}>{pattern.pattern} - {pattern.description}</option>
        {/each}
      </select>
    </div>

    <div class="test-actions">
      <button 
        onclick={runTestSuite}
        disabled={isRunningTests || testPatterns.length === 0}
        class="btn btn-primary"
      >
        {isRunningTests ? `Running Tests... ${testProgress.toFixed(0)}%` : 'Run Full Test Suite'}
      </button>
      
      <button 
        onclick={() => currentTestIndex = Math.max(0, currentTestIndex - 1)}
        disabled={isRunningTests || currentTestIndex === 0}
        class="btn btn-secondary"
      >
        ← Previous
      </button>
      
      <button 
        onclick={() => currentTestIndex = Math.min(testPatterns.length - 1, currentTestIndex + 1)}
        disabled={isRunningTests || currentTestIndex === testPatterns.length - 1}
        class="btn btn-secondary"
      >
        Next →
      </button>
    </div>
  </div>

  {#if isRunningTests}
    <div class="progress-bar">
      <div class="progress-fill" style="width: {testProgress}%"></div>
    </div>
  {/if}

  <div class="test-layout">
    <!-- Animation Viewer -->
    <div class="animation-section">
      <h3>Animation Display</h3>
      {#if currentPattern}
        <AnimationViewer selectedPattern={currentPattern} />
      {:else}
        <div class="no-pattern">No pattern selected</div>
      {/if}
    </div>

    <!-- Test Results -->
    <div class="results-section">
      <h3>Test Results</h3>
      
      {#if testResults.length > 0}
        <div class="test-stats">
          <div class="stat">
            <span class="stat-label">Total Tests:</span>
            <span class="stat-value">{testStats.total}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Passed:</span>
            <span class="stat-value passed">{testStats.passed}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Failed:</span>
            <span class="stat-value failed">{testStats.failed}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Pass Rate:</span>
            <span class="stat-value">{testStats.passRate}%</span>
          </div>
        </div>

        <div class="results-list">
          {#each testResults as result, index}
            <div class="result-item" class:passed={result.passed} class:failed={!result.passed}>
              <div class="result-header">
                <span class="pattern-name">{result.pattern.pattern}</span>
                <span class="result-status">{result.passed ? '✅ PASS' : '❌ FAIL'}</span>
              </div>
              
              {#if !result.passed}
                <div class="result-issues">
                  <strong>Issues:</strong>
                  <ul>
                    {#each result.issues as issue}
                      <li>{issue}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
              
              {#if result.measurements}
                <div class="result-measurements">
                  <strong>Measurements:</strong>
                  <div class="measurements-grid">
                    <div>Container: {result.measurements.container?.width}×{result.measurements.container?.height}</div>
                    <div>Iframe: {result.measurements.iframe?.width}×{result.measurements.iframe?.height}</div>
                    {#if result.measurements.margins}
                      <div>Margins: T:{result.measurements.margins.topMargin.toFixed(0)} L:{result.measurements.margins.leftMargin.toFixed(0)} R:{result.measurements.margins.rightMargin.toFixed(0)} B:{result.measurements.margins.bottomMargin.toFixed(0)}</div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="no-results">
          <p>No test results yet. Click "Run Full Test Suite" to begin testing.</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .test-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    min-height: 100vh;
  }

  .test-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .test-header h1 {
    color: var(--text-color, #1f2937);
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    font-weight: 700;
  }

  .test-controls {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    gap: 2rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .pattern-selector {
    flex: 1;
    min-width: 300px;
  }

  .pattern-selector label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color, #374151);
  }

  .pattern-selector select {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-color, #374151);
  }

  .test-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
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

  .btn-secondary:hover:not(:disabled) {
    background: rgba(107, 114, 128, 0.9);
    transform: translateY(-1px);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #10b981);
    transition: width 0.3s ease;
  }

  .test-layout {
    display: grid;
    grid-template-columns: 60% 40%;
    gap: 2rem;
    min-height: 600px;
  }

  .animation-section,
  .results-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .animation-section h3,
  .results-section h3 {
    margin: 0 0 1rem 0;
    color: var(--text-color, #374151);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .no-pattern,
  .no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary, #6b7280);
    font-style: italic;
  }

  .test-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
  }

  .stat {
    text-align: center;
  }

  .stat-label {
    display: block;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    margin-bottom: 0.25rem;
  }

  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color, #374151);
  }

  .stat-value.passed {
    color: var(--success-color, #10b981);
  }

  .stat-value.failed {
    color: var(--error-color, #ef4444);
  }

  .results-list {
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .result-item {
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result-item.passed {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.2);
  }

  .result-item.failed {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .pattern-name {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: var(--text-color, #374151);
  }

  .result-status {
    font-weight: 500;
    font-size: 0.875rem;
  }

  .result-issues ul {
    margin: 0.5rem 0 0 1rem;
    padding: 0;
  }

  .result-issues li {
    color: var(--error-color, #ef4444);
    font-size: 0.875rem;
  }

  .result-measurements {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .measurements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .test-layout {
      grid-template-columns: 1fr;
    }

    .test-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .test-actions {
      justify-content: center;
    }

    .test-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
