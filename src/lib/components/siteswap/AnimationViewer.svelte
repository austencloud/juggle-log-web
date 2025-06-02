<!-- Animation Viewer Component -->
<script lang="ts">
  import { AnimationService, type AnimationOptions, type AnimationResult } from '../../services/animationService';
  import { PatternCacheService } from '../../services/patternCacheService';
  import type { GeneratedPattern } from '../../services/siteswapGenerator';
  import { dimensionTester, type SpaceUtilizationReport } from '../../utils/animationDimensionTester';
  import LoadingState from './shared/LoadingState.svelte';

  interface Props {
    selectedPattern?: GeneratedPattern | null;
    oncopyToClipboard?: (text: string) => void;
  }

  let {
    selectedPattern = null,
    oncopyToClipboard
  }: Props = $props();

  let animationResult = $state<AnimationResult | null>(null);
  let isLoadingAnimation = $state(false);
  let animationError = $state<string | null>(null);
  let lastProcessedPattern = $state<string | null>(null);
  let animationFrameRef = $state<HTMLDivElement | null>(null);
  let iframeRef = $state<HTMLIFrameElement | null>(null);
  let imageRef = $state<HTMLImageElement | null>(null);
  let showDebugOverlay = $state(false);
  let dimensionReport = $state<SpaceUtilizationReport | null>(null);
  let showDimensionOverlay = $state(false);
  let useDirectGif = $state(true); // Always use direct GIF (no iframe fallback)
  let extractedGifUrl = $state<string | null>(null); // Extracted direct GIF URL

  let animationOptions = $state<Partial<AnimationOptions>>({
    width: 500,
    height: 450,
    slowdown: 2.0,
    colors: 'mixed'
  });

  async function generateAnimation(pattern: string) {
    console.log(`🔄 [AnimationViewer] generateAnimation called with pattern: ${pattern}`);

    // Prevent duplicate calls for the same pattern
    if (isLoadingAnimation || lastProcessedPattern === pattern) {
      console.log(`⏭️ [AnimationViewer] Skipping generation - already loading or pattern unchanged`);
      return;
    }

    console.log(`🔄 [AnimationViewer] Pattern changed from "${lastProcessedPattern}" to "${pattern}" - starting generation`);

    isLoadingAnimation = true;
    animationResult = null;
    animationError = null;
    extractedGifUrl = null;
    lastProcessedPattern = pattern;

    try {
      // Validate pattern for animation
      const validation = AnimationService.validatePatternForAnimation(pattern, 'jugglinglab');
      if (!validation.isValid) {
        throw new Error(`Pattern validation failed: ${validation.errors.join(', ')}`);
      }

      // Use pattern cache service for intelligent loading
      console.log(`🚀 [AnimationViewer] Loading pattern from cache: ${pattern}`);
      animationResult = await PatternCacheService.getPatternAnimation(pattern, animationOptions);

      console.log(`🎯 [AnimationViewer] Animation loaded for pattern ${pattern}:`, animationResult);

      // Use direct GIF URL from animation result
      if (animationResult.gifUrl) {
        extractedGifUrl = animationResult.gifUrl;
        console.log(`✅ [AnimationViewer] GIF URL set for pattern ${pattern}: ${extractedGifUrl}`);
      }

      // Preload similar patterns in background
      PatternCacheService.preloadSimilarPatterns(pattern);

    } catch (error) {
      console.error('Animation generation failed:', error);
      animationError = error instanceof Error ? error.message : 'Animation generation failed';
      animationResult = null;
    } finally {
      isLoadingAnimation = false;
    }
  }

  function copyToClipboard(text: string) {
    oncopyToClipboard?.(text);
  }

  // Simplified scaling function - only for extreme resize cases
  function adjustIframeScaling() {
    if (!animationFrameRef || !iframeRef) return;

    // Only apply minimal adjustments for extreme container size changes
    // Most sizing is now handled by CSS object-fit
    const containerRect = animationFrameRef.getBoundingClientRect();

    console.log('Container size:', { width: containerRect.width, height: containerRect.height });

    // Ensure iframe maintains proper properties without transforms
    iframeRef.style.objectFit = 'contain';
    iframeRef.style.objectPosition = 'center center';
    iframeRef.style.overflow = 'hidden';
    iframeRef.style.transform = 'none';
    iframeRef.style.transition = 'none';
  }

  // Run comprehensive dimension testing
  async function runDimensionTest() {
    if (!animationFrameRef) return;

    // Check if we have either iframe or image element
    const animationElement = imageRef || iframeRef;
    if (!animationElement) return;

    try {
      dimensionReport = await dimensionTester.runComprehensiveTest();
      showDimensionOverlay = true;

      // Log results for development
      if (dimensionReport) {
        console.log('Dimension Test Results:', dimensionReport);
        console.log('Using Direct GIF:', useDirectGif && !!animationResult?.gifUrl);
        console.log('Animation Element Type:', imageRef ? 'img' : 'iframe');
      }
    } catch (error) {
      console.error('Dimension test failed:', error);
    }
  }

  // Toggle visual dimension overlay
  function toggleDimensionOverlay() {
    if (showDimensionOverlay) {
      showDimensionOverlay = false;
      // Remove any existing overlay
      const existingOverlay = document.getElementById('dimension-debug-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
    } else {
      runDimensionTest();
      // Add visual overlay
      const overlay = dimensionTester.createVisualDebugOverlay();
      document.body.appendChild(overlay);
    }
  }

  // Auto-generate animation when pattern changes (with proper guards)
  $effect(() => {
    console.log('🔄 [AnimationViewer] Effect triggered');
    console.log('   selectedPattern:', selectedPattern?.pattern);
    console.log('   lastProcessedPattern:', lastProcessedPattern);
    console.log('   isLoadingAnimation:', isLoadingAnimation);

    // Only trigger if we have a valid pattern and it's different from the last processed one
    const currentPattern = selectedPattern?.pattern;

    if (currentPattern &&
        currentPattern !== lastProcessedPattern &&
        !isLoadingAnimation) {

      console.log('🚀 [AnimationViewer] Scheduling animation generation for:', currentPattern);

      // Use a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        console.log('⏰ [AnimationViewer] Timeout triggered, calling generateAnimation');
        generateAnimation(currentPattern);
      }, 50);

      // Cleanup function to cancel timeout if effect runs again
      return () => {
        console.log('🧹 [AnimationViewer] Cleaning up timeout');
        clearTimeout(timeoutId);
      };
    } else {
      console.log('⏭️ [AnimationViewer] Skipping animation generation');
      if (!currentPattern) console.log('   Reason: No current pattern');
      if (currentPattern === lastProcessedPattern) console.log('   Reason: Pattern unchanged');
      if (isLoadingAnimation) console.log('   Reason: Already loading');
    }
  });

  // Adjust scaling when animation loads or container resizes
  $effect(() => {
    if (animationResult && animationFrameRef && iframeRef) {
      // Remove automatic scaling to prevent startup animation issues
      // The CSS will handle the scaling statically

      // Run dimension test after animation loads
      setTimeout(() => {
        runDimensionTest();
      }, 1500);

      // Only add resize listener for window resize events
      const handleResize = () => {
        // Use longer delay to prevent rapid resize calls
        setTimeout(() => {
          if (animationFrameRef && iframeRef) {
            // Only adjust if container size actually changed significantly
            const containerRect = animationFrameRef.getBoundingClientRect();
            const currentWidth = containerRect.width;
            const currentHeight = containerRect.height;

            // Store previous dimensions to compare
            if (!iframeRef.dataset.lastWidth ||
                Math.abs(currentWidth - parseFloat(iframeRef.dataset.lastWidth || '0')) > 50 ||
                Math.abs(currentHeight - parseFloat(iframeRef.dataset.lastHeight || '0')) > 50) {

              iframeRef.dataset.lastWidth = currentWidth.toString();
              iframeRef.dataset.lastHeight = currentHeight.toString();

              // Only apply minimal scaling adjustment
              adjustIframeScaling();

              // Re-run dimension test after resize
              runDimensionTest();
            }
          }
        }, 300);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  });
</script>

<div class="animation-viewer">
  <div class="animation-content">
    {#if selectedPattern}
      <div class="current-pattern">
        <span class="pattern-display">{selectedPattern.pattern}</span>
        <span class="pattern-description">{selectedPattern.description}</span>
      </div>
    {:else}
      <div class="no-pattern">
        <p>Select a pattern to view animation</p>
      </div>
    {/if}

    {#if isLoadingAnimation}
      <LoadingState
        message="Loading animation..."
        variant="card"
        size="medium"
      />
    {/if}

    {#if animationError}
      <div class="animation-error">
        <h4>❌ Animation Error</h4>
        <p>{animationError}</p>
        <button
          class="btn btn-secondary"
          onclick={() => selectedPattern && generateAnimation(selectedPattern.pattern)}
        >
          🔄 Try Again
        </button>
      </div>
    {/if}

    {#if animationResult}
      <div class="animation-result">
        <div class="animation-frame" bind:this={animationFrameRef}>
          {#if extractedGifUrl || animationResult.gifUrl}
            <img
              bind:this={imageRef}
              src={extractedGifUrl || animationResult.gifUrl}
              alt="Siteswap Animation for {animationResult.pattern}"
              class="animation-gif"
              loading="lazy"
              onload={() => {
                console.log(`✅ [Image] Successfully loaded: ${extractedGifUrl || animationResult?.gifUrl}`);
              }}
              onerror={() => {
                console.error(`❌ [Image] Failed to load: ${extractedGifUrl || animationResult?.gifUrl}`);
              }}
            />
          {:else}
            <div class="loading-placeholder">
              Loading animation...
            </div>
          {/if}
        </div>

        <div class="animation-actions">
          <a
            href={animationResult.url}
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary"
          >
            🔗 Open in new tab
          </a>
          <a
            href={animationResult.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary"
          >
            📥 Direct GIF
          </a>
          <button
            class="btn btn-secondary"
            onclick={() => copyToClipboard(animationResult?.directUrl || '')}
          >
            📋 Copy URL
          </button>
          <button
            class="btn btn-secondary"
            onclick={() => showDebugOverlay = !showDebugOverlay}
          >
            🔍 Debug
          </button>
          <button
            class="btn btn-secondary"
            onclick={toggleDimensionOverlay}
          >
            📏 Dimensions
          </button>
        </div>

        {#if showDebugOverlay}
          <div class="debug-overlay">
            <div class="debug-info">
              <h4>Debug Information</h4>
              <div class="debug-grid">
                <div>Pattern: {animationResult.pattern}</div>
                <div>Provider: {animationResult.provider}</div>
                <div>Dimensions: {animationResult.options.width}×{animationResult.options.height}</div>
                <div>Container Chain: iframe → .animation-frame → .animation-result → .right-panel</div>
              </div>

              {#if dimensionReport}
                <div class="dimension-report">
                  <h5>Space Utilization Analysis</h5>
                  <div class="utilization-grid">
                    <div class="utilization-item" class:pass={dimensionReport.widthUtilization >= 80} class:fail={dimensionReport.widthUtilization < 80}>
                      Width: {dimensionReport.widthUtilization.toFixed(1)}%
                    </div>
                    <div class="utilization-item" class:pass={dimensionReport.heightUtilization >= 80} class:fail={dimensionReport.heightUtilization < 80}>
                      Height: {dimensionReport.heightUtilization.toFixed(1)}%
                    </div>
                    <div class="utilization-item">
                      Aspect Ratio: {dimensionReport.aspectRatio.toFixed(2)}
                    </div>
                    <div class="utilization-item">
                      Limiting Factor: {dimensionReport.limitingFactor}
                    </div>
                  </div>

                  {#if dimensionReport.recommendations.length > 0}
                    <div class="recommendations">
                      <h6>Optimization Recommendations:</h6>
                      <ul>
                        {#each dimensionReport.recommendations.slice(0, 3) as recommendation}
                          <li>{recommendation}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .animation-viewer {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0; /* Allow flex shrinking */
  }

  .animation-content {
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0; /* Allow flex shrinking */
    flex: 1;
  }

  .current-pattern {
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .pattern-display {
    font-family: 'Courier New', monospace;
    font-weight: 700;
    color: var(--primary-color, #3b82f6);
    font-size: 2rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .pattern-description {
    color: var(--text-secondary, #6b7280);
    font-size: 0.875rem;
  }

  .no-pattern {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary, #6b7280);
    font-style: italic;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }



  .animation-error {
    text-align: center;
    padding: 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 0.75rem;
    color: var(--error-color, #ef4444);
  }

  .animation-error h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
  }

  .animation-result {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    min-height: 0; /* Allow flex shrinking */
    height: 100%;
  }

  .animation-frame {
    flex: 1;
    min-height: 700px; /* Increased from 600px for even more space */
    background: white;
    border-radius: 0.5rem 0.5rem 0 0;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible; /* Allow scaled content to be visible */
    /* Minimal padding to maximize animation space */
    padding: 0.5rem;
    box-sizing: border-box;
    /* Prevent any size changes that could cause startup animations */
    flex-shrink: 0;
    flex-grow: 1;
  }

  /* Removed iframe styles - using direct GIF display only */

  .loading-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    color: var(--text-secondary);
    font-size: 1.1rem;
    background: var(--card-background);
    border-radius: 0.5rem;
    border: 2px dashed var(--border-color);
  }

  .animation-gif {
    border-radius: 0.5rem 0.5rem 0 0;
    border: none;
    /* Maximize space utilization for direct GIF display */
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    /* Use object-fit to scale up to fill available space while maintaining aspect ratio */
    object-fit: contain;
    object-position: center center;
    /* Remove any transforms that could cause issues */
    transform: none;
    transform-origin: center center;
    /* No transitions for stable display */
    transition: none;
    /* Center the image */
    margin: 0 auto;
    /* Add subtle shadow for better visual separation */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    /* Ensure stable positioning */
    position: relative;
    display: block;
    /* Optimize image rendering for animations */
    image-rendering: auto;
    /* Ensure the image is responsive */
    flex-shrink: 0;
  }

  .animation-actions {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
    justify-content: center;
    flex-shrink: 0; /* Prevent shrinking */
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    font-size: 0.875rem;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .btn-secondary {
    background: rgba(107, 114, 128, 0.8);
    color: white;
  }

  .btn-secondary:hover {
    background: rgba(107, 114, 128, 0.9);
    transform: translateY(-1px);
  }

  .debug-overlay {
    background: rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem 1.5rem;
  }

  .debug-info h4 {
    margin: 0 0 0.75rem 0;
    color: var(--text-color, #374151);
    font-size: 1rem;
  }

  .debug-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .dimension-report {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dimension-report h5 {
    margin: 0 0 0.75rem 0;
    color: var(--text-color, #374151);
    font-size: 0.95rem;
  }

  .utilization-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .utilization-item {
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.25rem;
    font-size: 0.8rem;
    text-align: center;
  }

  .utilization-item.pass {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .utilization-item.fail {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .recommendations {
    font-size: 0.8rem;
  }

  .recommendations h6 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color, #374151);
    font-size: 0.85rem;
  }

  .recommendations ul {
    margin: 0;
    padding-left: 1rem;
    color: var(--text-secondary, #6b7280);
  }

  .recommendations li {
    margin-bottom: 0.25rem;
  }

  /* Medium screens - maintain stable sizing with optimized space usage */
  @media (max-width: 1200px) and (min-width: 769px) {
    .animation-frame {
      min-height: 650px; /* Slightly reduced for medium screens */
      padding: 0.5rem;
    }

    /* Removed iframe styles - using direct GIF display only */
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .animation-content {
      padding: 1rem;
    }

    .pattern-display {
      font-size: 1.5rem;
    }

    .animation-actions {
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
    }

    .btn {
      justify-content: center;
      width: 100%;
    }

    .animation-frame {
      min-height: 500px; /* Increased for mobile */
      padding: 0.25rem; /* Minimal padding on mobile */
    }

    /* Removed iframe styles - using direct GIF display only */

    .current-pattern {
      padding: 0.75rem;
    }

    .no-pattern {
      padding: 2rem 1rem;
    }
  }
</style>
