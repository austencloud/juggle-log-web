<!-- Siteswap Generator Page -->
<script lang="ts">
  import SiteswapGenerator from '$lib/components/siteswap/SiteswapGenerator.svelte';
</script>

<svelte:head>
  <title>Siteswap Generator - Juggle Log</title>
  <meta name="description" content="Generate, validate, and animate siteswap juggling patterns. Comprehensive pattern generator with difficulty levels, categories, and animation integration." />
  <meta name="keywords" content="siteswap, juggling patterns, pattern generator, juggling animation, siteswap validator" />
</svelte:head>

<div class="siteswap-page">
  <div class="page-header">
    <div class="header-content">
      <h1>🎯 Siteswap Pattern Generator</h1>
      <p class="page-description">
        Discover, generate, and validate siteswap juggling patterns. From beginner-friendly cascades 
        to advanced multiplex patterns, explore the mathematical beauty of juggling notation.
      </p>
      
      <div class="feature-highlights">
        <div class="feature">
          <span class="feature-icon">🎲</span>
          <span>Pattern Generation</span>
        </div>
        <div class="feature">
          <span class="feature-icon">📚</span>
          <span>Pattern Categories</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🔍</span>
          <span>Validation & Analysis</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🎬</span>
          <span>Animation Integration</span>
        </div>
      </div>
    </div>
  </div>

  <div class="generator-container">
    <SiteswapGenerator />
  </div>

  <div class="educational-section">
    <div class="education-content">
      <h2>Understanding Siteswap Notation</h2>
      
      <div class="education-grid">
        <div class="education-card">
          <h3>🎯 What is Siteswap?</h3>
          <p>
            Siteswap is a mathematical notation system for describing juggling patterns. 
            Each number represents the height and timing of a throw, creating a precise 
            language for juggling patterns.
          </p>
          <ul>
            <li><strong>3:</strong> Standard cascade throw</li>
            <li><strong>4:</strong> Fountain throw (same hand)</li>
            <li><strong>5:</strong> High throw to opposite hand</li>
            <li><strong>0:</strong> Empty hand (gap)</li>
          </ul>
        </div>

        <div class="education-card">
          <h3>📊 Pattern Analysis</h3>
          <p>
            Every valid siteswap follows mathematical rules. The average of all 
            throws equals the number of objects being juggled.
          </p>
          <div class="example">
            <strong>Example: 441</strong><br>
            (4 + 4 + 1) ÷ 3 = 3 objects
          </div>
        </div>

        <div class="education-card">
          <h3>🎪 Pattern Types</h3>
          <p>Siteswap can describe various juggling styles:</p>
          <ul>
            <li><strong>Asynchronous:</strong> 3, 441, 531</li>
            <li><strong>Synchronous:</strong> (4,4), (6,2x)</li>
            <li><strong>Multiplex:</strong> [33], [54]2</li>
          </ul>
        </div>

        <div class="education-card">
          <h3>🚀 Getting Started</h3>
          <p>
            Start with basic patterns and gradually increase complexity. 
            Use the generator to explore new patterns and understand 
            their mathematical relationships.
          </p>
          <div class="progression">
            <span class="level beginner">Beginner: 3, 423</span>
            <span class="level intermediate">Intermediate: 441, 531</span>
            <span class="level advanced">Advanced: 97531, 753</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="animation-section">
    <div class="animation-content">
      <h2>🎬 Animation Integration</h2>
      <p>
        Visualize patterns with integrated animation tools. Connect with popular 
        juggling animation platforms to see your patterns in motion.
      </p>
      
      <div class="animation-tools">
        <div class="tool-card">
          <h4>JugglingLab</h4>
          <p>Comprehensive animation with customizable props and environments</p>
          <a href="https://jugglinglab.org" target="_blank" rel="noopener noreferrer">
            Visit JugglingLab →
          </a>
        </div>
        
        <div class="tool-card">
          <h4>Gunswap</h4>
          <p>Real-time pattern visualization and editing</p>
          <a href="https://gunswap.co" target="_blank" rel="noopener noreferrer">
            Visit Gunswap →
          </a>
        </div>
        
        <div class="tool-card">
          <h4>Siteswap Central</h4>
          <p>Pattern database with community animations</p>
          <a href="https://siteswapcentral.com" target="_blank" rel="noopener noreferrer">
            Visit Siteswap Central →
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .siteswap-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 0;
  }

  .page-header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
    padding: 0 2rem;
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .page-header h1 {
    font-size: 3rem;
    margin: 0 0 1rem 0;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .page-description {
    font-size: 1.25rem;
    margin: 0 0 2rem 0;
    opacity: 0.9;
    line-height: 1.6;
  }

  .feature-highlights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 0.75rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .feature-icon {
    font-size: 1.5rem;
  }

  .generator-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .educational-section {
    background: white;
    margin-top: 4rem;
    padding: 4rem 2rem;
  }

  .education-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .education-content h2 {
    text-align: center;
    color: #374151;
    margin: 0 0 3rem 0;
    font-size: 2.5rem;
  }

  .education-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .education-card {
    background: #f8fafc;
    padding: 2rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  .education-card h3 {
    color: #374151;
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
  }

  .education-card p {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .education-card ul {
    margin: 1rem 0;
    padding-left: 1.25rem;
    color: #4b5563;
  }

  .education-card li {
    margin-bottom: 0.5rem;
  }

  .example {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 0.5rem;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    color: #1e40af;
    margin-top: 1rem;
  }

  .progression {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .level {
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .level.beginner {
    background: #dcfce7;
    color: #166534;
  }

  .level.intermediate {
    background: #fef3c7;
    color: #92400e;
  }

  .level.advanced {
    background: #fee2e2;
    color: #991b1b;
  }

  .animation-section {
    background: #1f2937;
    color: white;
    padding: 4rem 2rem;
  }

  .animation-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .animation-content h2 {
    margin: 0 0 1rem 0;
    font-size: 2.5rem;
  }

  .animation-content > p {
    font-size: 1.125rem;
    opacity: 0.9;
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .animation-tools {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .tool-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 2rem;
    border-radius: 1rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: left;
  }

  .tool-card h4 {
    color: white;
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
  }

  .tool-card p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .tool-card a {
    color: #60a5fa;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .tool-card a:hover {
    color: #93c5fd;
  }

  @media (max-width: 768px) {
    .siteswap-page {
      padding: 1rem 0;
    }

    .page-header h1 {
      font-size: 2rem;
    }

    .page-description {
      font-size: 1rem;
    }

    .feature-highlights {
      grid-template-columns: 1fr;
    }

    .education-grid {
      grid-template-columns: 1fr;
    }

    .animation-tools {
      grid-template-columns: 1fr;
    }

    .progression {
      align-items: stretch;
    }

    .educational-section,
    .animation-section {
      padding: 2rem 1rem;
    }
  }
</style>
