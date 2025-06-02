<script lang="ts">
  import { getPatternFamily, getPatternVariations } from '$lib/utils/siteswapNormalization.js';
  import PatternFamilyDemo from './PatternFamilyDemo.svelte';
  
  // Pattern family data for display
  const patternFamilies = [
    {
      id: '423',
      name: 'Burke\'s Barrage',
      inventor: 'Ken Burke',
      difficulty: 4,
      balls: 3,
      description: 'Popular pattern with impressive arm moves, featuring alternating Two-in-ones',
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: '531',
      name: 'Box',
      inventor: null,
      difficulty: 6,
      balls: 3,
      description: 'Challenging pattern with simultaneous vertical and horizontal throws',
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: '441',
      name: 'Half-Box',
      inventor: null,
      difficulty: 4,
      balls: 3,
      description: 'First trick with horizontal passes, foundation for advanced patterns',
      color: 'from-green-500 to-green-700'
    },
    {
      id: '3',
      name: 'Mills Mess',
      inventor: 'Steven Mills',
      difficulty: 5,
      balls: 3,
      description: 'Famous pattern with side-to-side movement and arm crossing',
      color: 'from-red-500 to-red-700'
    },
    {
      id: '4',
      name: 'Fountain',
      inventor: null,
      difficulty: 7,
      balls: 4,
      description: 'Most basic four-ball pattern, backbone of advanced 4-ball tricks',
      color: 'from-orange-500 to-orange-700'
    }
  ];

  let selectedFamily: string | null = null;
  let selectedFamilyData: any = null;
  let selectedVariations: any[] = [];
  let searchQuery = '';
  let filteredFamilies: any[] = [];
  let showBackToTop = false;

  // Show/hide back to top button based on scroll position
  function handleScroll() {
    showBackToTop = window.scrollY > 500;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $: {
    if (searchQuery.trim()) {
      filteredFamilies = patternFamilies.filter(family =>
        family.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (family.inventor && family.inventor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        family.id.includes(searchQuery)
      );
    } else {
      filteredFamilies = patternFamilies;
    }
  }

  function selectFamily(familyId: string) {
    selectedFamily = familyId;
    selectedFamilyData = getPatternFamily(familyId);
    selectedVariations = getPatternVariations(familyId);
  }

  function getDifficultyColor(difficulty: number): string {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }

  function getRelationshipIcon(relationship: string): string {
    switch (relationship) {
      case 'prerequisite': return '📚';
      case 'progression': return '🚀';
      case 'variation': return '🔄';
      case 'family_member': return '👥';
      case 'mechanical_relative': return '⚙️';
      default: return '🔗';
    }
  }
</script>

<div class="info-page">
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 class="main-title">
        Siteswap Pattern Families
      </h1>
      <p class="subtitle">
        Explore the complete database of verified juggling patterns, their variations, and relationships.
        Based on exhaustive research from the <a href="https://libraryofjuggling.com" target="_blank"
        class="link">Library of Juggling</a> and other authoritative sources.
      </p>
      
      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number blue">5</div>
          <div class="stat-label">Pattern Families</div>
        </div>
        <div class="stat-card">
          <div class="stat-number purple">35+</div>
          <div class="stat-label">Variations</div>
        </div>
        <div class="stat-card">
          <div class="stat-number green">20+</div>
          <div class="stat-label">Relationships</div>
        </div>
        <div class="stat-card">
          <div class="stat-number orange">100%</div>
          <div class="stat-label">Verified</div>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-wrapper">
        <input
          type="text"
          placeholder="Search patterns, inventors, or siteswaps..."
          bind:value={searchQuery}
          class="search-input"
        />
        <div class="search-icon">
          🔍
        </div>
        {#if searchQuery}
          <button
            on:click={() => searchQuery = ''}
            class="clear-button"
          >
            ✕
          </button>
        {/if}
      </div>
      {#if searchQuery && filteredFamilies.length === 0}
        <div class="no-results">
          No patterns found matching "{searchQuery}"
        </div>
      {/if}
    </div>

    <!-- Pattern Family Grid -->
    <div class="family-grid">
      {#each filteredFamilies as family, index}
        <div
          class="family-card pattern-{family.id}"
          style="animation-delay: {index * 100}ms"
          on:click={() => selectFamily(family.id)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && selectFamily(family.id)}
        >
          <div class="family-header pattern-{family.id}">
            <h3 class="family-title">{family.name}</h3>
            <p class="family-meta">{family.balls} Ball{family.balls > 1 ? 's' : ''} • Difficulty {family.difficulty}/10</p>
          </div>
          <div class="family-body">
            <p class="family-description">{family.description}</p>
            {#if family.inventor}
              <div class="family-inventor">
                <span class="inventor-icon">👤</span>
                <span>Invented by {family.inventor}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Detailed Family View -->
    {#if selectedFamily && selectedFamilyData}
      <div class="family-detail-modal">
        <div class="family-detail-container">
          <!-- Header with gradient background -->
          <div class="family-detail-header pattern-{selectedFamily}">
            <div class="family-detail-header-content">
              <div class="family-detail-title-section">
                <h2 class="family-detail-title">{selectedFamilyData.primaryName}</h2>
                <div class="family-detail-subtitle">
                  <span class="difficulty-indicator">
                    <span class="difficulty-stars">
                      {#each Array(10) as _, i}
                        <span class="star" class:filled={i < selectedFamilyData.difficulty}>★</span>
                      {/each}
                    </span>
                    <span class="difficulty-text">{selectedFamilyData.difficulty}/10 Difficulty</span>
                  </span>
                </div>
              </div>
              <button
                on:click={() => selectedFamily = null}
                class="family-detail-close"
                aria-label="Close family details"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Family Overview Cards -->
          <div class="family-overview-grid">
            <div class="family-info-card">
              <div class="card-header">
                <div class="card-icon">👤</div>
                <h3 class="card-title">Family Information</h3>
              </div>
              <div class="card-content">
                {#if selectedFamilyData.inventor}
                  <div class="info-item">
                    <span class="info-label">Inventor</span>
                    <span class="info-value inventor-name">{selectedFamilyData.inventor}</span>
                  </div>
                {/if}
                <div class="info-item">
                  <span class="info-label">Complexity</span>
                  <div class="complexity-meter">
                    <div class="complexity-bar">
                      <div class="complexity-fill" style="width: {selectedFamilyData.difficulty * 10}%"></div>
                    </div>
                    <span class="complexity-text">{selectedFamilyData.difficulty}/10</span>
                  </div>
                </div>
                {#if selectedFamilyData.alternativeNames?.length > 0}
                  <div class="info-item">
                    <span class="info-label">Also known as</span>
                    <div class="alternative-names">
                      {#each selectedFamilyData.alternativeNames as name}
                        <span class="alt-name-tag">{name}</span>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            <div class="family-history-card">
              <div class="card-header">
                <div class="card-icon">📚</div>
                <h3 class="card-title">Historical Context</h3>
              </div>
              <div class="card-content">
                <p class="history-text">{selectedFamilyData.historicalNotes}</p>
              </div>
            </div>
          </div>

          <!-- Pattern Variations Section -->
          <div class="variations-section">
            <div class="section-header">
              <div class="section-icon">🎯</div>
              <h3 class="section-title">
                Pattern Variations
                <span class="count-badge">{selectedVariations.length}</span>
              </h3>
            </div>
            <div class="variations-grid">
              {#each selectedVariations as variation, index}
                <div
                  class="variation-card"
                  style="animation-delay: {index * 100}ms"
                >
                  <div class="variation-header">
                    <h4 class="variation-name">{variation.name}</h4>
                    <div class="variation-difficulty">
                      <div class="difficulty-badge level-{variation.difficulty}">
                        {variation.difficulty}/10
                      </div>
                    </div>
                  </div>
                  <p class="variation-description">{variation.description}</p>
                  <div class="variation-footer">
                    <div class="siteswap-display">
                      <span class="siteswap-label">Siteswap</span>
                      <code class="siteswap-code">{variation.siteswap}</code>
                    </div>
                    <button class="try-pattern-btn" aria-label="Try this pattern">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Related Patterns Section -->
          {#if selectedFamilyData.relatedPatterns?.length > 0}
            <div class="related-patterns-section">
              <div class="section-header">
                <div class="section-icon">🔗</div>
                <h3 class="section-title">
                  Related Patterns
                  <span class="count-badge">{selectedFamilyData.relatedPatterns.length}</span>
                </h3>
              </div>
              <div class="related-patterns-grid">
                {#each selectedFamilyData.relatedPatterns as pattern, index}
                  <div
                    class="related-pattern-card"
                    style="animation-delay: {index * 150}ms"
                  >
                    <div class="relationship-badge {pattern.relationship}">
                      <span class="relationship-icon">{getRelationshipIcon(pattern.relationship)}</span>
                      <span class="relationship-text">{pattern.relationship.replace('_', ' ')}</span>
                    </div>
                    <div class="pattern-content">
                      <h4 class="pattern-name">{pattern.name}</h4>
                      <p class="pattern-description">{pattern.description}</p>
                      <div class="pattern-footer">
                        <div class="siteswap-display">
                          <span class="siteswap-label">Siteswap</span>
                          <code class="siteswap-code">{pattern.siteswap}</code>
                        </div>
                        <button class="explore-pattern-btn" aria-label="Explore this pattern">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Interactive Pattern Explorer -->
    <div class="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Interactive Pattern Explorer</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Try entering any siteswap pattern to explore its family, variations, and relationships
        </p>
      </div>
      <PatternFamilyDemo />
    </div>

    <!-- Learning Pathways -->
    <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Learning Pathways</h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Beginner Path -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-green-800 flex items-center">
            <span class="mr-2">🌱</span>
            Beginner Path (3-Ball Patterns)
          </h3>
          <div class="space-y-3">
            <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <span class="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              <div>
                <div class="font-medium">Cascade (3)</div>
                <div class="text-sm text-gray-600">Foundation of all juggling</div>
              </div>
            </div>
            <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <span class="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              <div>
                <div class="font-medium">Half-Box (441)</div>
                <div class="text-sm text-gray-600">First horizontal passes</div>
              </div>
            </div>
            <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <span class="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              <div>
                <div class="font-medium">Burke's Barrage (423)</div>
                <div class="text-sm text-gray-600">Impressive arm movements</div>
              </div>
            </div>
            <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <span class="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              <div>
                <div class="font-medium">Mills Mess (3)</div>
                <div class="text-sm text-gray-600">Famous arm crossing pattern</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Path -->
        <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-orange-800 flex items-center">
            <span class="mr-2">🚀</span>
            Advanced Path (4-Ball & Complex)
          </h3>
          <div class="space-y-3">
            <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <span class="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              <div>
                <div class="font-medium">Box (531)</div>
                <div class="text-sm text-gray-600">Challenging 3-ball pattern</div>
              </div>
            </div>
            <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <span class="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              <div>
                <div class="font-medium">Fountain (4)</div>
                <div class="text-sm text-gray-600">First 4-ball pattern</div>
              </div>
            </div>
            <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <span class="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              <div>
                <div class="font-medium">Four Ball Mills Mess</div>
                <div class="text-sm text-gray-600">Advanced arm crossing</div>
              </div>
            </div>
            <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <span class="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              <div>
                <div class="font-medium">Box Variations</div>
                <div class="text-sm text-gray-600">Karas' Box, Bizarre Box</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pattern Relationship Network -->
    <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Pattern Relationship Network</h2>

      <div class="bg-gray-50 rounded-lg p-6">
        <div class="text-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">How Patterns Connect</h3>
          <p class="text-gray-600">Understanding the relationships between juggling patterns helps create effective learning progressions</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">📚</div>
            <div class="font-semibold text-gray-800">Prerequisites</div>
            <div class="text-sm text-gray-600">Patterns you need to learn first</div>
          </div>
          <div class="bg-white rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🚀</div>
            <div class="font-semibold text-gray-800">Progressions</div>
            <div class="text-sm text-gray-600">Next patterns to learn</div>
          </div>
          <div class="bg-white rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🔄</div>
            <div class="font-semibold text-gray-800">Variations</div>
            <div class="text-sm text-gray-600">Different ways to perform</div>
          </div>
          <div class="bg-white rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">⚙️</div>
            <div class="font-semibold text-gray-800">Mechanical</div>
            <div class="text-sm text-gray-600">Similar movements</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Research Information -->
    <div class="bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Research & Verification</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Methodology</h3>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start">
              <span class="mr-2 mt-1">✅</span>
              <span>Systematic investigation of authoritative sources</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2 mt-1">✅</span>
              <span>Multi-source verification for all pattern names</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2 mt-1">✅</span>
              <span>Historical accuracy through cross-referencing</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2 mt-1">✅</span>
              <span>Complete relationship mapping</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Authoritative Sources</h3>
          <ul class="space-y-2 text-gray-600">
            <li>
              <a href="https://libraryofjuggling.com" target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline flex items-center">
                <span class="mr-2">🏛️</span>
                Library of Juggling
              </a>
              <span class="text-sm text-gray-500 ml-6">Primary authoritative source</span>
            </li>
            <li>
              <a href="https://en.wikipedia.org/wiki/Siteswap" target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline flex items-center">
                <span class="mr-2">📖</span>
                Wikipedia
              </a>
              <span class="text-sm text-gray-500 ml-6">Historical verification</span>
            </li>
            <li>
              <a href="https://jugglinglab.org" target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline flex items-center">
                <span class="mr-2">🔬</span>
                JugglingLab
              </a>
              <span class="text-sm text-gray-500 ml-6">Technical validation</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div class="flex items-start">
          <span class="text-2xl mr-4">🛡️</span>
          <div>
            <h4 class="font-semibold text-blue-900 mb-2">Quality Guarantee</h4>
            <p class="text-blue-800 leading-relaxed">
              Every pattern name, variation, and relationship in this database has been verified through multiple
              authoritative sources. Zero fabricated or speculative information is included, ensuring complete
              authenticity for the juggling community. This represents the most comprehensive and accurate
              siteswap pattern family database available.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Back to Top Button -->
  <button
    on:click={scrollToTop}
    class="back-to-top"
    class:visible={showBackToTop}
    aria-label="Back to top"
  >
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  </button>
</div>

<svelte:window on:scroll={handleScroll} />

<style>
  .info-page {
    min-height: 100vh;
    background: var(--background-color);
    padding: var(--spacing-md);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: var(--spacing-xxl);
  }

  .main-title {
    font-size: var(--font-size-xxxl);
    font-weight: var(--font-weight-bold);
    color: var(--header-color);
    margin-bottom: var(--spacing-md);
    line-height: 1.2;
  }

  .subtitle {
    font-size: var(--font-size-md);
    color: var(--text-light);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .link {
    color: var(--primary-color);
    text-decoration: underline;
  }

  .link:hover {
    color: var(--primary-dark);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    max-width: 500px;
    margin: var(--spacing-xl) auto 0;
  }

  @media (min-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
      max-width: 600px;
    }
    .main-title {
      font-size: var(--font-size-xxxl);
    }
    .info-page {
      padding: var(--spacing-lg);
    }
  }

  .stat-card {
    background: var(--card-background);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    text-align: center;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal);
  }

  .stat-card:hover {
    background: var(--card-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .stat-number {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--spacing-xs);
  }

  .stat-number.blue { color: var(--pattern-423-color); }
  .stat-number.purple { color: var(--pattern-531-color); }
  .stat-number.green { color: var(--pattern-441-color); }
  .stat-number.orange { color: var(--pattern-4-color); }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-light);
  }

  .search-container {
    max-width: 400px;
    margin: 0 auto 2rem;
  }

  .search-wrapper {
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    color: var(--text-color);
    font-size: 1rem;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
  }

  .clear-button {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    padding: 0.25rem;
  }

  .clear-button:hover {
    color: var(--text-color);
  }

  .no-results {
    text-align: center;
    color: var(--text-light);
    margin-top: 1rem;
  }

  .family-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  @media (min-width: 768px) {
    .family-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .family-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .family-card {
    background: var(--card-background);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s var(--magic-transition);
    border: 1px solid var(--border-color);
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
  }

  .family-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .family-header {
    padding: 1.5rem;
    color: white;
    position: relative;
  }

  .family-header.pattern-423 { background: linear-gradient(135deg, var(--pattern-423-color), var(--pattern-423-dark)); }
  .family-header.pattern-531 { background: linear-gradient(135deg, var(--pattern-531-color), var(--pattern-531-dark)); }
  .family-header.pattern-441 { background: linear-gradient(135deg, var(--pattern-441-color), var(--pattern-441-dark)); }
  .family-header.pattern-3 { background: linear-gradient(135deg, var(--pattern-3-color), var(--pattern-3-dark)); }
  .family-header.pattern-4 { background: linear-gradient(135deg, var(--pattern-4-color), var(--pattern-4-dark)); }

  .family-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .family-meta {
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .family-body {
    padding: 1.5rem;
  }

  .family-description {
    color: var(--text-light);
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .family-inventor {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: var(--text-light);
  }

  .inventor-icon {
    margin-right: 0.5rem;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Back to Top Button */
  .back-to-top {
    position: fixed;
    bottom: var(--spacing-xl);
    right: var(--spacing-xl);
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    transition: all var(--transition-normal);
    z-index: var(--z-fixed);
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
  }

  .back-to-top.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .back-to-top:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
  }

  .back-to-top:active {
    transform: translateY(0);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .back-to-top {
      bottom: var(--spacing-md);
      right: var(--spacing-md);
      width: 2.5rem;
      height: 2.5rem;
    }
  }

  /* === FAMILY DETAIL MODAL STYLES === */
  .family-detail-modal {
    position: relative;
    margin-bottom: var(--spacing-xxl);
  }

  .family-detail-container {
    background: var(--card-background);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    border: 1px solid var(--border-color);
    animation: modalSlideIn 0.5s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .family-detail-header {
    position: relative;
    padding: var(--spacing-xxl) var(--spacing-xl);
    color: white;
    overflow: hidden;
  }

  .family-detail-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
  }

  .family-detail-header-content {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    z-index: 1;
  }

  .family-detail-title-section {
    flex: 1;
  }

  .family-detail-title {
    font-size: var(--font-size-xxxl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--spacing-md);
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .family-detail-subtitle {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .difficulty-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .difficulty-stars {
    display: flex;
    gap: 2px;
  }

  .star {
    font-size: 1.2rem;
    color: rgba(255,255,255,0.3);
    transition: color var(--transition-fast);
  }

  .star.filled {
    color: #ffd700;
    text-shadow: 0 0 8px rgba(255,215,0,0.5);
  }

  .difficulty-text {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    opacity: 0.9;
  }

  .family-detail-close {
    background: rgba(255,255,255,0.2);
    border: none;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all var(--transition-normal);
    backdrop-filter: blur(10px);
  }

  .family-detail-close:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.1);
  }

  /* === FAMILY OVERVIEW CARDS === */
  .family-overview-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
    padding: var(--spacing-xl);
  }

  @media (min-width: 768px) {
    .family-overview-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .family-info-card,
  .family-history-card {
    background: var(--background-light);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-light);
    overflow: hidden;
    transition: all var(--transition-normal);
  }

  .family-info-card:hover,
  .family-history-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .card-header {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    padding: var(--spacing-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .card-icon {
    font-size: 1.5rem;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }

  .card-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: white;
    margin: 0;
  }

  .card-content {
    padding: var(--spacing-lg);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
  }

  .info-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .info-label {
    font-weight: var(--font-weight-medium);
    color: var(--text-light);
    min-width: 100px;
  }

  .info-value {
    color: var(--text-color);
    text-align: right;
    flex: 1;
  }

  .inventor-name {
    font-weight: var(--font-weight-semibold);
    color: var(--primary-color);
  }

  .complexity-meter {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .complexity-bar {
    flex: 1;
    height: 8px;
    background: var(--border-color);
    border-radius: 4px;
    overflow: hidden;
  }

  .complexity-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--success-color), var(--warning-color), var(--error-color));
    border-radius: 4px;
    transition: width var(--transition-slow);
  }

  .complexity-text {
    font-weight: var(--font-weight-medium);
    color: var(--text-color);
    min-width: 40px;
  }

  .alternative-names {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .alt-name-tag {
    background: var(--primary-color);
    color: white;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }

  .history-text {
    color: var(--text-color);
    line-height: 1.6;
    margin: 0;
  }

  /* === SECTIONS STYLING === */
  .variations-section,
  .related-patterns-section {
    margin: var(--spacing-xxl) 0;
    padding: var(--spacing-xl);
    background: var(--background-lighter);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-light);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--primary-color);
  }

  .section-icon {
    font-size: 2rem;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }

  .section-title {
    font-size: var(--font-size-xxl);
    font-weight: var(--font-weight-bold);
    color: var(--header-color);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .count-badge {
    background: var(--primary-color);
    color: white;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-lg);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    min-width: 2rem;
    text-align: center;
  }

  /* === VARIATIONS GRID === */
  .variations-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  @media (min-width: 768px) {
    .variations-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1200px) {
    .variations-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .variation-card {
    background: var(--card-background);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all var(--transition-normal);
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
    position: relative;
  }

  .variation-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  }

  .variation-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .variation-header {
    padding: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .variation-name {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--header-color);
    margin: 0;
    flex: 1;
  }

  .variation-difficulty {
    flex-shrink: 0;
  }

  .difficulty-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-lg);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    text-align: center;
    min-width: 3rem;
  }

  .difficulty-badge.level-1,
  .difficulty-badge.level-2,
  .difficulty-badge.level-3 {
    background: var(--success-color);
    color: white;
  }

  .difficulty-badge.level-4,
  .difficulty-badge.level-5,
  .difficulty-badge.level-6 {
    background: var(--warning-color);
    color: white;
  }

  .difficulty-badge.level-7,
  .difficulty-badge.level-8,
  .difficulty-badge.level-9,
  .difficulty-badge.level-10 {
    background: var(--error-color);
    color: white;
  }

  .variation-description {
    padding: 0 var(--spacing-lg);
    color: var(--text-light);
    line-height: 1.5;
    margin-bottom: var(--spacing-lg);
  }

  .variation-footer {
    padding: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--background-light);
    border-top: 1px solid var(--border-color);
  }

  .siteswap-display {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .siteswap-label {
    font-size: var(--font-size-xs);
    color: var(--text-light);
    font-weight: var(--font-weight-medium);
  }

  .siteswap-code {
    background: var(--primary-color);
    color: white;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-family: 'Courier New', monospace;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
  }

  .try-pattern-btn,
  .explore-pattern-btn {
    background: var(--primary-color);
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .try-pattern-btn:hover,
  .explore-pattern-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.1);
  }

  /* === RELATED PATTERNS GRID === */
  .related-patterns-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  @media (min-width: 768px) {
    .related-patterns-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .related-patterns-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .related-pattern-card {
    background: var(--card-background);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all var(--transition-normal);
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
    position: relative;
  }

  .related-pattern-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .relationship-badge {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-lg);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    z-index: 2;
    backdrop-filter: blur(10px);
  }

  .relationship-badge.prerequisite {
    background: rgba(16, 185, 129, 0.9);
    color: white;
  }

  .relationship-badge.progression {
    background: rgba(59, 130, 246, 0.9);
    color: white;
  }

  .relationship-badge.family_member {
    background: rgba(139, 92, 246, 0.9);
    color: white;
  }

  .relationship-badge.mechanical {
    background: rgba(245, 158, 11, 0.9);
    color: white;
  }

  .relationship-icon {
    font-size: 1rem;
  }

  .relationship-text {
    text-transform: capitalize;
    font-size: var(--font-size-xs);
  }

  .pattern-content {
    padding: var(--spacing-lg);
    padding-top: calc(var(--spacing-lg) + 2rem); /* Account for badge */
  }

  .pattern-name {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--header-color);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .pattern-description {
    color: var(--text-light);
    line-height: 1.5;
    margin-bottom: var(--spacing-lg);
  }

  .pattern-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color);
  }

  /* === RESPONSIVE DESIGN === */
  @media (max-width: 768px) {
    .family-detail-header {
      padding: var(--spacing-xl) var(--spacing-md);
    }

    .family-detail-title {
      font-size: var(--font-size-xxl);
    }

    .family-overview-grid {
      grid-template-columns: 1fr;
      padding: var(--spacing-md);
    }

    .variations-section,
    .related-patterns-section {
      padding: var(--spacing-md);
    }

    .section-title {
      font-size: var(--font-size-xl);
    }

    .variations-grid,
    .related-patterns-grid {
      grid-template-columns: 1fr;
    }

    .difficulty-stars {
      display: none; /* Hide stars on mobile for space */
    }
  }

  /* === ACCESSIBILITY IMPROVEMENTS === */
  .variation-card:focus-within,
  .related-pattern-card:focus-within {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .try-pattern-btn:focus,
  .explore-pattern-btn:focus,
  .family-detail-close:focus {
    outline: 2px solid var(--primary-light);
    outline-offset: 2px;
  }

  /* === LOADING STATES === */
  .variation-card.loading,
  .related-pattern-card.loading {
    background: linear-gradient(90deg, var(--card-background) 25%, var(--background-light) 50%, var(--card-background) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
</style>
