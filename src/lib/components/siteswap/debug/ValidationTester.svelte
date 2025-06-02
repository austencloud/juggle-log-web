<!-- Validation Tester Component -->
<script lang="ts">
  import { SiteswapService } from '../../../services/siteswapService';
  import { SiteswapGenerator } from '../../../services/siteswapGenerator';

  let testResults = $state<any[]>([]);
  let isRunningTests = $state(false);

  // Test cases that should be invalid
  const invalidTestCases = [
    { pattern: '342', reason: 'Should fail collision detection' },
    { pattern: '333', reason: 'Should fail state validation' },
    { pattern: '123', reason: 'Should fail average theorem (sum=6, avg=2, not integer objects)' },
    { pattern: '456', reason: 'Should fail collision detection' },
    { pattern: '111', reason: 'Should fail collision detection' },
    { pattern: '222', reason: 'Should fail collision detection' }
  ];

  // Test cases that should be valid
  const validTestCases = [
    { pattern: '3', reason: 'Basic 3-ball cascade' },
    { pattern: '441', reason: 'Classic 3-ball pattern' },
    { pattern: '531', reason: 'Valid 3-ball pattern' },
    { pattern: '4', reason: 'Basic 4-ball fountain' },
    { pattern: '534', reason: 'Valid 4-ball pattern' },
    { pattern: '5', reason: 'Basic 5-ball cascade' }
  ];

  async function runValidationTests() {
    isRunningTests = true;
    testResults = [];

    console.log('🧪 [ValidationTester] Starting validation tests...');

    // Test invalid patterns
    for (const testCase of invalidTestCases) {
      const validation = SiteswapService.validateSiteswap(testCase.pattern);
      const result = {
        pattern: testCase.pattern,
        expected: 'invalid',
        actual: validation.isValid ? 'valid' : 'invalid',
        passed: !validation.isValid,
        reason: testCase.reason,
        errors: validation.errors,
        type: 'validation'
      };
      testResults.push(result);
      console.log(`${result.passed ? '✅' : '❌'} [ValidationTester] ${testCase.pattern}: ${result.passed ? 'PASS' : 'FAIL'}`);
    }

    // Test valid patterns
    for (const testCase of validTestCases) {
      const validation = SiteswapService.validateSiteswap(testCase.pattern);
      const result = {
        pattern: testCase.pattern,
        expected: 'valid',
        actual: validation.isValid ? 'valid' : 'invalid',
        passed: validation.isValid,
        reason: testCase.reason,
        errors: validation.errors,
        type: 'validation'
      };
      testResults.push(result);
      console.log(`${result.passed ? '✅' : '❌'} [ValidationTester] ${testCase.pattern}: ${result.passed ? 'PASS' : 'FAIL'}`);
    }

    // Test pattern generation
    await testPatternGeneration();

    isRunningTests = false;
    
    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    console.log(`🏁 [ValidationTester] Tests completed: ${passedTests}/${totalTests} passed`);
  }

  async function testPatternGeneration() {
    console.log('🎲 [ValidationTester] Testing pattern generation...');

    // Test generation for different object counts
    for (const objectCount of [3, 4, 5]) {
      const startTime = performance.now();
      
      try {
        const patterns = SiteswapGenerator.generatePatterns({
          objectCount,
          patternLength: 4,
          maxHeight: objectCount * 2,
          minHeight: 0,
          includeZeros: false,
          difficulty: 'any',
          patternType: 'any'
        });

        const endTime = performance.now();
        const generationTime = Math.round(endTime - startTime);

        // Validate all generated patterns
        let allValid = true;
        const invalidPatterns: string[] = [];

        for (const pattern of patterns) {
          const validation = SiteswapService.validateSiteswap(pattern.pattern);
          if (!validation.isValid) {
            allValid = false;
            invalidPatterns.push(pattern.pattern);
          }
        }

        const result = {
          pattern: `${objectCount}-ball generation`,
          expected: 'all valid',
          actual: allValid ? 'all valid' : `${invalidPatterns.length} invalid`,
          passed: allValid,
          reason: `Generated ${patterns.length} patterns in ${generationTime}ms`,
          errors: invalidPatterns,
          type: 'generation',
          count: patterns.length,
          time: generationTime
        };

        testResults.push(result);
        console.log(`${result.passed ? '✅' : '❌'} [ValidationTester] ${objectCount}-ball generation: ${result.passed ? 'PASS' : 'FAIL'} (${patterns.length} patterns, ${generationTime}ms)`);

        if (!allValid) {
          console.warn(`⚠️ [ValidationTester] Invalid patterns found: ${invalidPatterns.join(', ')}`);
        }

      } catch (error) {
        const result = {
          pattern: `${objectCount}-ball generation`,
          expected: 'success',
          actual: 'error',
          passed: false,
          reason: `Generation failed: ${error}`,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          type: 'generation'
        };
        testResults.push(result);
        console.error(`❌ [ValidationTester] ${objectCount}-ball generation failed:`, error);
      }
    }
  }

  function getTestSummary() {
    const total = testResults.length;
    const passed = testResults.filter(r => r.passed).length;
    const failed = total - passed;
    
    return { total, passed, failed };
  }
</script>

<div class="validation-tester">
  <h3>🧪 Siteswap Validation Tester</h3>
  
  <div class="test-controls">
    <button 
      class="btn btn-primary" 
      onclick={runValidationTests}
      disabled={isRunningTests}
    >
      {isRunningTests ? '⏳ Running Tests...' : '🚀 Run Validation Tests'}
    </button>
  </div>

  {#if testResults.length > 0}
    <div class="test-summary">
      <h4>Test Summary</h4>
      <div class="summary-stats">
        <div class="stat-item passed">✅ Passed: {getTestSummary().passed}</div>
        <div class="stat-item failed">❌ Failed: {getTestSummary().failed}</div>
        <div class="stat-item total">📊 Total: {getTestSummary().total}</div>
      </div>
    </div>

    <div class="test-results">
      <h4>Test Results</h4>
      {#each testResults as result}
        <div class="test-result {result.passed ? 'pass' : 'fail'}">
          <div class="result-header">
            <span class="result-icon">{result.passed ? '✅' : '❌'}</span>
            <span class="result-pattern">{result.pattern}</span>
            <span class="result-status">{result.passed ? 'PASS' : 'FAIL'}</span>
            <span class="result-type">[{result.type}]</span>
          </div>
          
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Expected:</span>
              <span class="detail-value">{result.expected}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Actual:</span>
              <span class="detail-value">{result.actual}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Reason:</span>
              <span class="detail-value">{result.reason}</span>
            </div>
            
            {#if result.count !== undefined}
              <div class="detail-row">
                <span class="detail-label">Patterns Generated:</span>
                <span class="detail-value">{result.count}</span>
              </div>
            {/if}
            
            {#if result.time !== undefined}
              <div class="detail-row">
                <span class="detail-label">Generation Time:</span>
                <span class="detail-value">{result.time}ms</span>
              </div>
            {/if}
            
            {#if result.errors.length > 0}
              <div class="detail-row">
                <span class="detail-label">Errors:</span>
                <span class="detail-value error-list">
                  {#each result.errors as error}
                    <div class="error-item">{error}</div>
                  {/each}
                </span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .validation-tester {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin: 1rem 0;
  }

  .validation-tester h3 {
    margin: 0 0 1.5rem 0;
    color: var(--text-color, #374151);
  }

  .test-controls {
    margin-bottom: 1.5rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
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
  }

  .test-summary {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
  }

  .test-summary h4 {
    margin: 0 0 1rem 0;
    color: var(--text-color, #374151);
  }

  .summary-stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .stat-item {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .stat-item.passed {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .stat-item.failed {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .stat-item.total {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
  }

  .test-results h4 {
    margin: 0 0 1rem 0;
    color: var(--text-color, #374151);
  }

  .test-result {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .test-result.pass {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.2);
  }

  .test-result.fail {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
  }

  .result-pattern {
    font-family: 'Courier New', monospace;
    color: var(--primary-color, #3b82f6);
  }

  .result-status {
    font-weight: 700;
  }

  .result-type {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .result-details {
    font-size: 0.875rem;
  }

  .detail-row {
    display: flex;
    margin-bottom: 0.25rem;
  }

  .detail-label {
    font-weight: 500;
    min-width: 120px;
    color: var(--text-secondary, #6b7280);
  }

  .detail-value {
    color: var(--text-color, #374151);
  }

  .error-list {
    flex-direction: column;
    display: flex;
  }

  .error-item {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: var(--error-color, #ef4444);
    margin-bottom: 0.25rem;
  }
</style>
