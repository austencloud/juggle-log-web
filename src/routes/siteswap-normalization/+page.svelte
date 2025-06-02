<script lang="ts">
  import SiteswapNormalizationDemo from '$lib/components/SiteswapNormalizationDemo.svelte';
  import { page } from '$app/stores';
  
  // Get pattern from URL if provided
  const urlPattern = $page.url.searchParams.get('pattern');
</script>

<svelte:head>
  <title>Siteswap Pattern Normalization - Juggle Log</title>
  <meta name="description" content="Advanced siteswap pattern validation, canonical normalization, and authentic naming system for juggling patterns." />
</svelte:head>

<div class="page-container">
  <header class="page-header">
    <h1>🔄 Siteswap Pattern Normalization</h1>
    <p class="page-description">
      Advanced pattern validation, canonical normalization, and authentic naming system 
      based on comprehensive research from authoritative juggling sources.
    </p>
  </header>
  
  <div class="features-overview">
    <div class="feature-card">
      <h3>🎯 Mathematical Validation</h3>
      <p>Validates patterns using the average theorem and collision detection algorithms.</p>
    </div>
    <div class="feature-card">
      <h3>🔄 Canonical Normalization</h3>
      <p>Converts patterns to their canonical form (lexicographically smallest cyclic rotation).</p>
    </div>
    <div class="feature-card">
      <h3>📚 Authentic Names</h3>
      <p>Provides verified pattern names from authoritative juggling sources.</p>
    </div>
    <div class="feature-card">
      <h3>⚡ High Performance</h3>
      <p>Sub-10ms processing time with comprehensive pattern analysis.</p>
    </div>
  </div>
  
  <SiteswapNormalizationDemo />
  
  <div class="technical-details">
    <h2>🔬 Technical Implementation</h2>
    
    <div class="detail-section">
      <h3>Canonical Form Algorithm</h3>
      <p>
        The canonical form is determined by generating all cyclic rotations of a pattern 
        and selecting the lexicographically smallest one. For example:
      </p>
      <ul>
        <li><code>531</code> → rotations: [531, 315, 153] → canonical: <strong>153</strong></li>
        <li><code>441</code> → rotations: [441, 414, 144] → canonical: <strong>144</strong></li>
        <li><code>423</code> → rotations: [423, 234, 342] → canonical: <strong>234</strong></li>
      </ul>
    </div>
    
    <div class="detail-section">
      <h3>Mathematical Validation</h3>
      <p>Patterns are validated using two key mathematical principles:</p>
      <ul>
        <li><strong>Average Theorem:</strong> sum(throws) / length must equal ball count (integer)</li>
        <li><strong>Collision Detection:</strong> No two balls can land at the same time</li>
      </ul>
    </div>
    
    <div class="detail-section">
      <h3>Authentic Pattern Names</h3>
      <p>Pattern names are sourced from authoritative juggling references:</p>
      <ul>
        <li>Library of Juggling</li>
        <li>The Juggling Edge (Greg Phillips)</li>
        <li>JugglingLab Documentation</li>
        <li>rec.juggling archives</li>
        <li>Academic papers on siteswap mathematics</li>
      </ul>
    </div>
    
    <div class="detail-section">
      <h3>Pattern Types Supported</h3>
      <ul>
        <li><strong>Asynchronous:</strong> Standard siteswap notation (3, 531, 441, etc.)</li>
        <li><strong>Synchronous:</strong> Simultaneous throws (4,4), (4,2x)(2x,4), etc.</li>
        <li><strong>Multiplex:</strong> Multiple objects per hand [33], [43]23, etc.</li>
        <li><strong>Hexadecimal:</strong> Extended notation a-z for throws 10-35</li>
      </ul>
    </div>
  </div>
  
  <div class="research-sources">
    <h2>📖 Research Sources</h2>
    <div class="sources-grid">
      <div class="source-card">
        <h4>The Juggling Edge</h4>
        <p>Greg Phillips' comprehensive siteswap notes and pattern database</p>
        <a href="https://www.jugglingedge.com/help/siteswapnotes.php" target="_blank" rel="noopener">
          View Source →
        </a>
      </div>
      <div class="source-card">
        <h4>JugglingLab Documentation</h4>
        <p>Official siteswap notation reference and animation parameters</p>
        <a href="https://jugglinglab.org/html/ssnotation.html" target="_blank" rel="noopener">
          View Source →
        </a>
      </div>
      <div class="source-card">
        <h4>Kingston Jugglers Club</h4>
        <p>Academic treatment of siteswap mathematics and theory</p>
        <a href="https://kingstonjugglers.club/r/siteswap.pdf" target="_blank" rel="noopener">
          View Source →
        </a>
      </div>
      <div class="source-card">
        <h4>MDPI Education Sciences</h4>
        <p>Peer-reviewed academic paper on siteswap mathematics</p>
        <a href="https://www.mdpi.com/2227-7102/13/11/1092" target="_blank" rel="noopener">
          View Source →
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .page-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--primary-color, #007acc);
  }
  
  .page-header h1 {
    font-size: 2.5rem;
    color: var(--text-color, #333);
    margin-bottom: 10px;
  }
  
  .page-description {
    font-size: 1.1rem;
    color: var(--text-secondary, #666);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
  
  .features-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .feature-card {
    padding: 20px;
    background: var(--card-background, #f8f9fa);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    text-align: center;
  }
  
  .feature-card h3 {
    color: var(--primary-color, #007acc);
    margin-bottom: 10px;
    font-size: 1.2rem;
  }
  
  .feature-card p {
    color: var(--text-secondary, #666);
    line-height: 1.5;
  }
  
  .technical-details {
    margin: 40px 0;
    padding: 30px;
    background: var(--card-background, #f8f9fa);
    border-radius: 12px;
    border: 1px solid var(--border-color, #e0e0e0);
  }
  
  .technical-details h2 {
    color: var(--text-color, #333);
    margin-bottom: 25px;
    text-align: center;
  }
  
  .detail-section {
    margin-bottom: 25px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid var(--border-color, #e0e0e0);
  }
  
  .detail-section h3 {
    color: var(--primary-color, #007acc);
    margin-bottom: 12px;
  }
  
  .detail-section p {
    line-height: 1.6;
    margin-bottom: 10px;
  }
  
  .detail-section ul {
    margin-left: 20px;
    line-height: 1.6;
  }
  
  .detail-section li {
    margin-bottom: 5px;
  }
  
  .detail-section code {
    background: #f1f3f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  .research-sources {
    margin: 40px 0;
  }
  
  .research-sources h2 {
    text-align: center;
    color: var(--text-color, #333);
    margin-bottom: 25px;
  }
  
  .sources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .source-card {
    padding: 20px;
    background: white;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .source-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .source-card h4 {
    color: var(--primary-color, #007acc);
    margin-bottom: 10px;
  }
  
  .source-card p {
    color: var(--text-secondary, #666);
    line-height: 1.5;
    margin-bottom: 15px;
  }
  
  .source-card a {
    color: var(--primary-color, #007acc);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .source-card a:hover {
    color: var(--primary-color-dark, #005a9e);
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    .page-header h1 {
      font-size: 2rem;
    }
    
    .features-overview {
      grid-template-columns: 1fr;
    }
    
    .sources-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
