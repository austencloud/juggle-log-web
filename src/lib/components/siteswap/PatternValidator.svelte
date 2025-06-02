<!-- Pattern Validator Component -->
<script lang="ts">
  import { SiteswapService } from '../../services/siteswapService';
  import { normalizeSiteswapPattern, getCanonicalSuggestion, type NormalizationResult } from '../../utils/siteswapNormalization';
  import type { GeneratedPattern } from '../../services/siteswapGenerator';

  interface Props {
    expanded?: boolean;
    selectedPattern?: GeneratedPattern | null;
    customPattern?: string;
    ontoggleExpanded?: () => void;
    oncopyToClipboard?: (text: string) => void;
    ongenerateAnimation?: (pattern: string) => void;
  }

  let {
    expanded = false,
    selectedPattern = null,
    customPattern = '',
    ontoggleExpanded,
    oncopyToClipboard,
    ongenerateAnimation
  }: Props = $props();

  let customValidation = $state<{
    isValid: boolean;
    errors: string[];
    analysis?: any;
    normalization?: NormalizationResult;
    suggestion?: string | null;
  }>({
    isValid: false,
    errors: []
  });

  // Validate custom pattern reactively using $effect
  $effect(() => {
    if (customPattern) {
      validateCustomPattern(customPattern);
    } else {
      customValidation = { isValid: false, errors: [] };
    }
  });

  function validateCustomPattern(pattern: string) {
    // Use new normalization system for comprehensive validation
    const normalization = normalizeSiteswapPattern(pattern);
    const suggestion = getCanonicalSuggestion(pattern);

    // Fallback to legacy validation for compatibility
    const validation = SiteswapService.validateSiteswap(pattern);
    const analysis = SiteswapService.analyzeSiteswap(pattern);

    customValidation = {
      isValid: normalization.mathematicallyValid && validation.isValid,
      errors: [
        ...(normalization.validationErrors || []),
        ...validation.errors
      ],
      analysis,
      normalization,
      suggestion
    };
  }

  function toggleExpanded() {
    ontoggleExpanded?.();
  }

  function copyToClipboard(text: string) {
    oncopyToClipboard?.(text);
  }

  function generateAnimation(pattern: string) {
    ongenerateAnimation?.(pattern);
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
    <h2>🔍 Pattern Validator & Analyzer</h2>
    <button class="siteswap-expand-btn" class:expanded>
      {expanded ? '−' : '+'}
    </button>
  </div>
  
  {#if expanded}
    <div class="siteswap-card-content">
      <div class="validator-section">
        <div class="siteswap-form-group">
          <label for="customPattern">Enter Siteswap Pattern</label>
          <input 
            id="customPattern"
            type="text" 
            bind:value={customPattern}
            placeholder="e.g., 441, 97531, (4,4)(4,0)"
            class="siteswap-form-input pattern-input"
          />
        </div>

        {#if customPattern}
          <div class="validation-results">
            {#if customValidation.isValid}
              <div class="siteswap-validation-success">
                <div class="success-header">
                  <span class="success-icon">✅</span>
                  <span>Valid siteswap pattern!</span>
                </div>

                <!-- Normalization Information -->
                {#if customValidation.normalization}
                  <div class="normalization-info">
                    <h4>🔄 Pattern Analysis</h4>
                    <div class="normalization-grid">
                      <div class="norm-item">
                        <span class="label">Input:</span>
                        <span class="value pattern-code">{customPattern}</span>
                      </div>
                      <div class="norm-item">
                        <span class="label">Canonical:</span>
                        <span class="value pattern-code">{customValidation.normalization.canonical}</span>
                      </div>
                      <div class="norm-item">
                        <span class="label">Pattern Type:</span>
                        <span class="value">{customValidation.normalization.patternType}</span>
                      </div>
                      {#if customValidation.normalization.ballCount}
                        <div class="norm-item">
                          <span class="label">Ball Count:</span>
                          <span class="value">{customValidation.normalization.ballCount}</span>
                        </div>
                      {/if}
                      {#if customValidation.normalization.authenticName}
                        <div class="norm-item">
                          <span class="label">Authentic Name:</span>
                          <span class="value authentic-name">{customValidation.normalization.authenticName}</span>
                        </div>
                      {/if}
                    </div>

                    {#if customValidation.normalization.equivalentForms.length > 1}
                      <div class="equivalent-forms">
                        <span class="label">Equivalent Forms:</span>
                        <div class="forms-list">
                          {#each customValidation.normalization.equivalentForms as form}
                            <span class="form-tag" class:canonical={form === customValidation.normalization.canonical}>
                              {form}
                            </span>
                          {/each}
                        </div>
                      </div>
                    {/if}

                    <div class="reasoning">
                      <span class="label">Reasoning:</span>
                      <span class="reasoning-text">{customValidation.normalization.reasoning}</span>
                    </div>
                  </div>
                {/if}

                {#if customValidation.analysis}
                  <div class="legacy-analysis">
                    <h4>📊 Legacy Analysis</h4>
                    <div class="analysis-grid">
                      <div class="analysis-item">
                        <span class="label">Objects:</span>
                        <span class="value">{customValidation.analysis.objectCount}</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">Period:</span>
                        <span class="value">{customValidation.analysis.period}</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">Difficulty:</span>
                        <span class="value">{customValidation.analysis.difficulty.toFixed(2)}</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">Avg Height:</span>
                        <span class="value">{customValidation.analysis.averageHeight.toFixed(1)}</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">Max Height:</span>
                        <span class="value">{customValidation.analysis.maxHeight}</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">Type:</span>
                        <span class="value">{customValidation.analysis.patternType}</span>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="siteswap-validation-error">
                <div class="error-header">
                  <span class="error-icon">❌</span>
                  <span>Invalid pattern</span>
                </div>
                <ul class="error-list">
                  {#each customValidation.errors as error}
                    <li>{error}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            <!-- Canonical Suggestion -->
            {#if customValidation.suggestion}
              <div class="suggestion-box">
                <span class="suggestion-icon">💡</span>
                <span class="suggestion-text">{customValidation.suggestion}</span>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Selected Pattern Details -->
        {#if selectedPattern}
          <div class="selected-pattern">
            <h4>Selected Pattern: {selectedPattern.pattern}</h4>
            <div class="pattern-details">
              <p class="pattern-description">{selectedPattern.description}</p>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">Objects:</span>
                  <span class="value">{selectedPattern.objectCount}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Period:</span>
                  <span class="value">{selectedPattern.period}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Difficulty:</span>
                  <span class="value">{selectedPattern.difficulty.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Avg Height:</span>
                  <span class="value">{selectedPattern.averageHeight.toFixed(1)}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Type:</span>
                  <span class="value">{selectedPattern.patternType}</span>
                </div>
              </div>
              <div class="pattern-tags">
                {#each selectedPattern.tags as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
              <div class="pattern-actions">
                <button 
                  class="siteswap-btn siteswap-btn-secondary"
                  onclick={() => copyToClipboard(selectedPattern?.pattern || '')}
                >
                  📋 Copy Pattern
                </button>
                <button 
                  class="siteswap-btn siteswap-btn-primary"
                  onclick={() => generateAnimation(selectedPattern?.pattern || '')}
                >
                  🎬 Animate
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .pattern-input {
    font-family: 'Courier New', monospace;
  }

  .validation-results {
    margin-top: 1rem;
  }

  .success-header,
  .error-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .success-icon,
  .error-icon {
    font-size: 1.125rem;
  }

  .error-list {
    margin: 0.5rem 0 0 0;
    padding-left: 1.25rem;
  }

  .error-list li {
    margin-bottom: 0.25rem;
  }

  .analysis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .analysis-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }

  .analysis-item .label {
    font-weight: 500;
  }

  .analysis-item .value {
    font-family: 'Courier New', monospace;
    font-weight: 600;
  }

  /* Normalization styles */
  .normalization-info {
    background: #f0f8ff;
    border: 1px solid #bfdbfe;
    border-radius: 0.5rem;
    padding: 1rem;
    margin: 1rem 0;
  }

  .normalization-info h4 {
    margin: 0 0 0.75rem 0;
    color: var(--primary-color, #3b82f6);
    font-size: 1rem;
  }

  .normalization-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .norm-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    background: white;
    padding: 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #e5e7eb;
  }

  .norm-item .label {
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
  }

  .norm-item .value {
    font-weight: 600;
    color: var(--text-color, #374151);
  }

  .pattern-code {
    font-family: 'Courier New', monospace;
    background: #f1f5f9;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }

  .authentic-name {
    color: var(--primary-color, #3b82f6);
    font-weight: 700;
  }

  .equivalent-forms {
    margin: 0.75rem 0;
  }

  .equivalent-forms .label {
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
    margin-bottom: 0.5rem;
    display: block;
  }

  .forms-list {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .form-tag {
    padding: 0.25rem 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .form-tag.canonical {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .reasoning {
    background: #fffbeb;
    border: 1px solid #fbbf24;
    border-radius: 0.25rem;
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  .reasoning .label {
    font-weight: 500;
    color: #92400e;
  }

  .reasoning-text {
    color: #78350f;
    font-style: italic;
  }

  .legacy-analysis {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    margin: 1rem 0;
  }

  .legacy-analysis h4 {
    margin: 0 0 0.75rem 0;
    color: var(--text-secondary, #6b7280);
    font-size: 1rem;
  }

  .suggestion-box {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 0.5rem;
    padding: 0.75rem;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .suggestion-icon {
    font-size: 1.125rem;
  }

  .suggestion-text {
    color: #856404;
    font-weight: 500;
  }

  .selected-pattern {
    background: var(--primary-light, #eff6ff);
    border: 1px solid var(--primary-border, #bfdbfe);
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .selected-pattern h4 {
    color: var(--primary-color, #3b82f6);
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .pattern-details {
    margin-top: 1rem;
  }

  .pattern-description {
    color: var(--text-secondary, #4b5563);
    font-size: 0.875rem;
    margin: 0 0 1rem 0;
    line-height: 1.4;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }

  .detail-item .label {
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
  }

  .detail-item .value {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: var(--text-color, #374151);
  }

  .pattern-tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .tag {
    background: var(--tag-bg, #f1f5f9);
    color: var(--tag-text, #475569);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 500;
  }

  .pattern-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .details-grid,
    .analysis-grid {
      grid-template-columns: 1fr;
    }

    .pattern-actions {
      flex-direction: column;
    }
  }
</style>
