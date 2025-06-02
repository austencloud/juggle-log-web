<!-- Unified Glassmorphism Siteswap Generator -->
<script lang="ts">
  import { SiteswapGenerator as SiteswapGeneratorService, type GeneratedPattern } from '../../services/siteswapGenerator';
  import { PatternCacheService } from '../../services/patternCacheService';
  import LeftPanel from './LeftPanel.svelte';
  import AnimationViewer from './AnimationViewer.svelte';
  import LoadingState from './shared/LoadingState.svelte';
  import SiteswapTheoryExplainer from './shared/SiteswapTheoryExplainer.svelte';
  // import PatternCacheDebug from './debug/PatternCacheDebug.svelte';
  // import ValidationTester from './debug/ValidationTester.svelte';

  // State management using Svelte 5 patterns - initialize immediately to prevent effects
  let isInitialized = $state(true);

  const defaultPattern: GeneratedPattern = {
    pattern: '441',
    description: 'Classic 3-ball pattern with one high throw',
    objectCount: 3,
    period: 3,
    difficulty: 2.5,
    averageHeight: 4.33,
    patternType: 'async',
    tags: ['classic', 'beginner']
  };

  let selectedPattern = $state<GeneratedPattern | null>(defaultPattern);
  let recentPatterns = $state<GeneratedPattern[]>([defaultPattern]);

  // Page load detection
  console.log('🌟 [SiteswapGenerator] Component script loaded/reloaded at:', new Date().toISOString());

  // Add error handler to catch unhandled errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('🚨 [SiteswapGenerator] Unhandled error detected:', event.error);
      console.error('🚨 [SiteswapGenerator] Error message:', event.message);
      console.error('🚨 [SiteswapGenerator] Error filename:', event.filename);
      console.error('🚨 [SiteswapGenerator] Error line:', event.lineno);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 [SiteswapGenerator] Unhandled promise rejection:', event.reason);
    });
  }

  // Add a global counter to detect actual page reloads vs component re-renders
  if (typeof window !== 'undefined') {
    const globalWindow = window as any;
    if (!globalWindow.siteswapGeneratorLoadCount) {
      globalWindow.siteswapGeneratorLoadCount = 0;
    }
    globalWindow.siteswapGeneratorLoadCount++;
    console.log('📊 [SiteswapGenerator] Load count:', globalWindow.siteswapGeneratorLoadCount);

    // Detect if this is a page reload vs HMR
    if (globalWindow.siteswapGeneratorLoadCount > 1) {
      console.warn('🔄 [SiteswapGenerator] MULTIPLE LOADS DETECTED - possible infinite reload!');
    }
  }

  // TEMPORARILY DISABLED INITIALIZATION TO DEBUG INFINITE RELOAD
  // All initialization moved to state declarations above

  // initializeGenerator function removed - initialization now happens at state declaration

  // Event handlers for component communication
  function handlePatternSelected(pattern: GeneratedPattern) {
    selectedPattern = pattern;

    // Add to recent patterns (avoid duplicates)
    if (!recentPatterns.some(p => p.pattern === pattern.pattern)) {
      recentPatterns = [pattern, ...recentPatterns.slice(0, 9)]; // Keep last 10
    }
  }

  function handleRecentPatternSelected(pattern: GeneratedPattern) {
    selectedPattern = pattern;
  }
</script>

<div class="glassmorphism-container">
  {#if !isInitialized}
    <div class="initialization-loading">
      <LoadingState
        message="Initializing pattern generator..."
        variant="card"
        size="large"
      />
    </div>
  {:else}
    <div class="layout-grid">
      <!-- Left Panel - Pattern Controls -->
      <div class="left-panel">
        <LeftPanel
          {selectedPattern}
          {recentPatterns}
          onpatternSelected={handlePatternSelected}
          onrecentPatternSelected={handleRecentPatternSelected}
        />
      </div>

      <!-- Right Panel - Animation Viewer -->
      <div class="right-panel">
        <AnimationViewer
          {selectedPattern}
        />
      </div>
    </div>

    <!-- Theory Explainer Section -->
    <div class="theory-section">
      <SiteswapTheoryExplainer />
    </div>
  {/if}
</div>

<style>
  /* Glassmorphism Container */
  .glassmorphism-container {
    min-height: 100vh;
    padding: 1rem;
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  /* Initialization Loading */
  .initialization-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 2rem);
    max-width: 600px;
    margin: 0 auto;
  }

  /* Layout Grid */
  .layout-grid {
    display: grid;
    grid-template-columns: 40% 60%;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    height: calc(100vh - 2rem);
  }

  /* Left Panel */
  .left-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Right Panel */
  .right-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Theory Section */
  .theory-section {
    margin-top: 2rem;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }



  /* Mobile Layout */
  @media (max-width: 768px) {
    .layout-grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
      height: auto;
      min-height: calc(100vh - 2rem);
    }

    .right-panel {
      order: -1; /* Animation viewer first on mobile */
      min-height: 50vh;
    }

    .left-panel {
      min-height: auto;
    }
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    .glassmorphism-container {
      padding: 0.5rem;
    }

    .layout-grid {
      gap: 1rem;
      height: calc(100vh - 1rem);
    }
  }
</style>
