<!-- Siteswap Theory Explainer Component -->
<script lang="ts">
  import { SiteswapService } from '../../../services/siteswapService';

  let selectedExample = $state('cyclic');
  
  const examples = {
    cyclic: {
      title: 'Cyclic Equivalence',
      description: 'These patterns are all the same juggling sequence, just starting at different points:',
      patterns: ['342', '423', '234'],
      canonical: '423',
      explanation: 'All represent the same physical pattern. The canonical form "423" starts with the highest throw (4).'
    },
    constant: {
      title: 'Constant Patterns',
      description: 'Repetitive patterns simplify to their basic unit:',
      patterns: ['333', '33333', '3'],
      canonical: '3',
      explanation: 'Since every throw is the same height, the pattern reduces to a simple cascade.'
    },
    zeros: {
      title: 'Patterns with Gaps',
      description: 'Zero represents a gap (no throw) in the pattern:',
      patterns: ['405', '054', '540'],
      canonical: '504',
      explanation: 'Rotated to start with the highest throw (5), preserving the gap position.'
    }
  };

  function demonstrateNormalization(pattern: string) {
    try {
      const result = SiteswapService.normalizeToCanonical(pattern);
      return result;
    } catch (error) {
      throw new Error('Invalid pattern');
    }
  }
</script>

<div class="theory-explainer">
  <div class="header">
    <h3>🎯 Understanding Canonical Siteswap Forms</h3>
    <p class="subtitle">
      Learn why "342", "423", and "234" are actually the same juggling pattern
    </p>
  </div>

  <div class="concept-tabs">
    <button 
      class="tab-button {selectedExample === 'cyclic' ? 'active' : ''}"
      onclick={() => selectedExample = 'cyclic'}
    >
      Cyclic Patterns
    </button>
    <button 
      class="tab-button {selectedExample === 'constant' ? 'active' : ''}"
      onclick={() => selectedExample = 'constant'}
    >
      Constant Patterns
    </button>
    <button 
      class="tab-button {selectedExample === 'zeros' ? 'active' : ''}"
      onclick={() => selectedExample = 'zeros'}
    >
      Patterns with Gaps
    </button>
  </div>

  <div class="example-content">
    {#each Object.entries(examples) as [key, example]}
      {#if selectedExample === key}
        <div class="example-section">
          <h4>{example.title}</h4>
          <p class="description">{example.description}</p>
          
          <div class="pattern-demonstration">
            <div class="pattern-list">
              {#each example.patterns as pattern}
                <div class="pattern-item {pattern === example.canonical ? 'canonical' : 'equivalent'}">
                  <span class="pattern-text">{pattern}</span>
                  <span class="pattern-label">
                    {pattern === example.canonical ? 'Canonical' : 'Equivalent'}
                  </span>
                </div>
              {/each}
            </div>
            
            <div class="arrow">→</div>
            
            <div class="canonical-result">
              <div class="canonical-pattern">
                <span class="pattern-text">{example.canonical}</span>
                <span class="canonical-label">Canonical Form</span>
              </div>
            </div>
          </div>
          
          <div class="explanation">
            <p>{example.explanation}</p>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <div class="key-concepts">
    <h4>🔑 Key Concepts</h4>
    <div class="concepts-grid">
      <div class="concept-card">
        <div class="concept-icon">🔄</div>
        <h5>Cyclic Equivalence</h5>
        <p>Juggling patterns are circular - you can start at any point in the sequence.</p>
      </div>
      
      <div class="concept-card">
        <div class="concept-icon">📏</div>
        <h5>Canonical Form</h5>
        <p>The "standard" way to write a pattern - starts with the highest throw for consistency.</p>
      </div>
      
      <div class="concept-card">
        <div class="concept-icon">🎯</div>
        <h5>Unique Representation</h5>
        <p>Each juggling pattern has exactly one canonical form, eliminating duplicates.</p>
      </div>
      
      <div class="concept-card">
        <div class="concept-icon">⚡</div>
        <h5>Simplified Learning</h5>
        <p>Focus on unique patterns instead of confusing equivalent variations.</p>
      </div>
    </div>
  </div>

  <div class="benefits">
    <h4>✨ Why This Matters</h4>
    <ul>
      <li><strong>Cleaner Pattern Lists:</strong> No more seeing "342", "423", and "234" as separate patterns</li>
      <li><strong>Easier Learning:</strong> Focus on truly unique juggling sequences</li>
      <li><strong>Better Organization:</strong> Patterns are grouped by their actual juggling content</li>
      <li><strong>Faster Discovery:</strong> Find new patterns without wading through duplicates</li>
    </ul>
  </div>

  <div class="interactive-demo">
    <h4>🧪 Try It Yourself</h4>
    <p>Enter any siteswap pattern to see its canonical form:</p>
    
    <div class="demo-input">
      <input 
        type="text" 
        placeholder="Enter pattern (e.g., 342, 5551, 4040)"
        class="pattern-input"
        onkeyup={(e) => {
          const target = e.target as HTMLInputElement;
          const result = target.nextElementSibling as HTMLElement;
          if (target.value.trim()) {
            try {
              const normalized = demonstrateNormalization(target.value.trim());
              result.innerHTML = `
                <div class="demo-result">
                  <span class="input-pattern">${target.value.trim()}</span>
                  <span class="arrow">→</span>
                  <span class="canonical-pattern">${normalized.canonical}</span>
                  <div class="result-info">
                    ${normalized.isAlreadyCanonical ? 
                      '<span class="already-canonical">✅ Already canonical!</span>' : 
                      `<span class="normalized">🔄 Normalized from ${normalized.normalizationType}</span>`
                    }
                  </div>
                </div>
              `;
            } catch (error) {
              result.innerHTML = `<div class="demo-error">❌ Invalid pattern</div>`;
            }
          } else {
            result.innerHTML = '';
          }
        }}
      />
      <div class="demo-output"></div>
    </div>
  </div>
</div>

<style>
  .theory-explainer {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2rem;
    margin: 2rem 0;
    backdrop-filter: blur(10px);
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .header h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color, #374151);
    font-size: 1.5rem;
  }

  .subtitle {
    color: var(--text-secondary, #6b7280);
    font-size: 1rem;
    margin: 0;
  }

  .concept-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .tab-button {
    padding: 0.75rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary, #6b7280);
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .tab-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .tab-button.active {
    background: var(--primary-color, #3b82f6);
    color: white;
    border-color: var(--primary-color, #3b82f6);
  }

  .example-section {
    margin-bottom: 2rem;
  }

  .example-section h4 {
    margin: 0 0 1rem 0;
    color: var(--text-color, #374151);
    font-size: 1.25rem;
  }

  .description {
    color: var(--text-secondary, #6b7280);
    margin-bottom: 1.5rem;
  }

  .pattern-demonstration {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin: 1.5rem 0;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pattern-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pattern-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .pattern-item.canonical {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
  }

  .pattern-item.equivalent {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .pattern-text {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--text-color, #374151);
  }

  .pattern-label {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .arrow {
    font-size: 2rem;
    color: var(--primary-color, #3b82f6);
    font-weight: bold;
  }

  .canonical-result {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .canonical-pattern {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: rgba(16, 185, 129, 0.15);
    border: 2px solid rgba(16, 185, 129, 0.4);
    border-radius: 0.75rem;
  }

  .canonical-label {
    font-size: 0.875rem;
    color: #10b981;
    font-weight: 600;
  }

  .explanation {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid var(--primary-color, #3b82f6);
    margin-top: 1.5rem;
  }

  .key-concepts h4 {
    margin: 2rem 0 1rem 0;
    color: var(--text-color, #374151);
  }

  .concepts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .concept-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1.5rem;
    text-align: center;
  }

  .concept-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .concept-card h5 {
    margin: 0 0 0.75rem 0;
    color: var(--text-color, #374151);
    font-size: 1.1rem;
  }

  .concept-card p {
    color: var(--text-secondary, #6b7280);
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
  }

  .benefits {
    margin: 2rem 0;
  }

  .benefits h4 {
    margin: 0 0 1rem 0;
    color: var(--text-color, #374151);
  }

  .benefits ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .benefits li {
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-secondary, #6b7280);
    line-height: 1.5;
  }

  .benefits li:last-child {
    border-bottom: none;
  }

  .interactive-demo {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .interactive-demo h4 {
    margin: 0 0 1rem 0;
    color: var(--text-color, #374151);
  }

  .demo-input {
    margin-top: 1rem;
  }

  .pattern-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-color, #374151);
    font-size: 1rem;
    font-family: 'Courier New', monospace;
  }

  .pattern-input:focus {
    outline: none;
    border-color: var(--primary-color, #3b82f6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .demo-output {
    margin-top: 1rem;
    min-height: 2rem;
  }

  .demo-result {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .input-pattern, .canonical-pattern {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .demo-result .arrow {
    font-size: 1.5rem;
    margin: 0 0.5rem;
  }

  .result-info {
    width: 100%;
    text-align: center;
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  .already-canonical {
    color: #10b981;
    font-weight: 500;
  }

  .normalized {
    color: var(--primary-color, #3b82f6);
    font-weight: 500;
  }

  .demo-error {
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 0.5rem;
    color: var(--error-color, #ef4444);
    text-align: center;
  }

  @media (max-width: 768px) {
    .pattern-demonstration {
      flex-direction: column;
      gap: 1rem;
    }

    .arrow {
      transform: rotate(90deg);
    }

    .concepts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
