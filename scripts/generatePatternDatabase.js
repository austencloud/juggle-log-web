#!/usr/bin/env node

/**
 * Comprehensive Pattern-to-GIF URL Database Generator
 * 
 * This script generates a static database of siteswap pattern-to-GIF URL mappings
 * by querying JugglingLab's animation service and extracting direct GIF URLs.
 * 
 * Usage: node scripts/generatePatternDatabase.js
 * Output: src/lib/data/patternGifMappings.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  outputFile: path.join(__dirname, '../src/lib/data/patternGifMappings.ts'),
  jugglingLabBaseUrl: 'https://jugglinglab.org/anim',
  requestDelay: 500, // ms between requests to avoid overwhelming server
  maxConcurrentRequests: 5,
  maxRetries: 3,
  requestTimeout: 10000, // 10 seconds
  width: 500,
  height: 450
};

// Pattern categories to generate
const PATTERN_CATEGORIES = {
  // 3-ball patterns (most common)
  threeBall: [
    '3', '333', '441', '531', '423', '552', '534', '51414', '612', '633',
    '642', '651', '714', '723', '732', '741', '75751', '801', '813', '822',
    '831', '84184', '93393', '945', '954', '96396', 'b13', 'b31', 'c33'
  ],
  
  // 4-ball patterns
  fourBall: [
    '4', '444', '53', '633', '642', '7531', '8040', '8131', '8222', '8313',
    '8404', '9040', '9131', '9222', '9313', '9404', '9505', 'a23', 'a32',
    'b13', 'b22', 'b31', 'b40', 'c04', 'c13', 'c22', 'c31', 'c40'
  ],
  
  // 5-ball patterns
  fiveBall: [
    '5', '555', '64', '744', '645', '97531', '86', '95', 'a4', 'b3',
    'c2', 'd1', '77722', '88811', '99900', 'aaaaa', 'bbbbb'
  ],
  
  // 6+ ball patterns (advanced)
  sixPlusBall: [
    '6', '666', '75', '84', '93', 'a2', 'b1', 'c0',
    '7', '777', '86', '95', 'a4', 'b3', 'c2',
    '8', '888', '97', 'a6', 'b5', 'c4',
    '9', '999', 'a8', 'b7', 'c6'
  ],
  
  // Synchronous patterns
  synchronous: [
    '(4,4)', '(6,2x)', '(4,2x)(2x,4)', '(6,4)', '(8,2x)', '(4,4)(4,0)',
    '(6,2x)(2x,6)', '(8,4)', '(a,2x)', '(4,2x)(4,2x)', '(6,6)', '(8,8)',
    '(4,4)(0,4)', '(6,4)(4,6)', '(8,6)', '(a,8)', '(c,2x)'
  ],
  
  // Multiplex patterns
  multiplex: [
    '[33]', '[44]', '[55]', '[43]', '[53]', '[54]', '[64]', '[65]',
    '[33]23', '[44]34', '[55]45', '[43]23', '[53]34', '[54]45',
    '3[33]', '4[44]', '5[55]', '4[43]', '5[53]', '5[54]'
  ],
  
  // Flash patterns
  flash: [
    '51', '61', '71', '81', '91', 'a1', 'b1', 'c1',
    '52', '62', '72', '82', '92', 'a2', 'b2', 'c2',
    '53', '63', '73', '83', '93', 'a3', 'b3', 'c3'
  ],
  
  // Mills Mess and variations
  millsMess: [
    '3', '441', '531', '423', '552', '534', '612', '633', '642', '651',
    '714', '723', '732', '741', '75751', '801', '813', '822', '831'
  ],
  
  // Shower patterns
  shower: [
    '51', '52', '61', '62', '71', '72', '81', '82', '91', '92',
    'a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'd1', 'd2'
  ]
};

// Utility functions
class PatternDatabaseGenerator {
  constructor() {
    this.results = new Map();
    this.errors = [];
    this.processed = 0;
    this.total = 0;
    this.startTime = Date.now();
  }

  /**
   * Extract GIF URL from JugglingLab HTML response
   */
  extractGifUrl(html) {
    // Primary: Google Storage URL
    const googleStorageMatch = html.match(/https:\/\/storage\.googleapis\.com\/download\/storage\/v1\/b\/jugglinglab\/o\/gif[^"'\s<>]+/);
    if (googleStorageMatch) {
      return googleStorageMatch[0];
    }
    
    // Fallback: Any GIF URL
    const gifMatches = html.match(/https?:\/\/[^\s"'<>]+\.gif[^\s"'<>]*/gi);
    if (gifMatches && gifMatches.length > 0) {
      return gifMatches[0];
    }
    
    return null;
  }

  /**
   * Analyze pattern to determine metadata
   */
  analyzePattern(pattern) {
    const ballCount = this.calculateBallCount(pattern);
    const patternType = this.determinePatternType(pattern);
    const difficulty = this.estimateDifficulty(pattern, ballCount);
    const description = this.generateDescription(pattern, ballCount, patternType);
    
    return {
      ballCount,
      patternType,
      difficulty,
      description
    };
  }

  /**
   * Calculate ball count for a siteswap pattern
   */
  calculateBallCount(pattern) {
    // Handle synchronous patterns
    if (pattern.includes('(') && pattern.includes(')')) {
      // Extract throws from sync pattern
      const throws = pattern.match(/\([^)]+\)/g);
      if (throws) {
        let maxThrow = 0;
        throws.forEach(throwPair => {
          const values = throwPair.match(/[0-9a-f]/gi);
          if (values) {
            values.forEach(val => {
              const num = parseInt(val, 16);
              if (!isNaN(num)) maxThrow = Math.max(maxThrow, num);
            });
          }
        });
        return Math.ceil(maxThrow / 2);
      }
    }
    
    // Handle multiplex patterns
    if (pattern.includes('[') && pattern.includes(']')) {
      // Count objects in multiplex throws
      let totalObjects = 0;
      const multiplexMatches = pattern.match(/\[[^\]]+\]/g);
      if (multiplexMatches) {
        multiplexMatches.forEach(multiplex => {
          const objects = multiplex.match(/[0-9a-f]/gi);
          if (objects) totalObjects += objects.length;
        });
      }
      return Math.max(totalObjects, 3); // Minimum 3 balls
    }
    
    // Standard async patterns
    const throws = pattern.match(/[0-9a-f]/gi) || [];
    if (throws.length === 0) return 3;
    
    const sum = throws.reduce((acc, throw_) => {
      const num = parseInt(throw_, 16);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    
    return Math.round(sum / throws.length);
  }

  /**
   * Determine pattern type
   */
  determinePatternType(pattern) {
    if (pattern.includes('(') && pattern.includes(')')) return 'sync';
    if (pattern.includes('[') && pattern.includes(']')) return 'multiplex';
    return 'async';
  }

  /**
   * Estimate pattern difficulty (1-10 scale)
   */
  estimateDifficulty(pattern, ballCount) {
    let difficulty = ballCount; // Base difficulty on ball count
    
    // Adjust for pattern complexity
    if (pattern.includes('[') || pattern.includes('(')) difficulty += 1;
    if (pattern.length > 5) difficulty += 0.5;
    if (pattern.includes('x')) difficulty += 0.5; // Crossing throws
    
    // Specific pattern adjustments
    if (pattern === '3' || pattern === '333') difficulty = 1;
    if (pattern.includes('97531')) difficulty = 8;
    
    return Math.min(Math.max(Math.round(difficulty * 10) / 10, 1), 10);
  }

  /**
   * Generate human-readable description
   */
  generateDescription(pattern, ballCount, patternType) {
    const ballText = `${ballCount}-ball`;
    
    if (pattern === '3' || pattern === '333') return `${ballText} cascade`;
    if (pattern === '441') return `${ballText} flash`;
    if (pattern === '531') return `${ballText} box`;
    if (pattern === '423') return `${ballText} tennis`;
    if (pattern === '552') return `${ballText} columns`;
    if (pattern.includes('97531')) return `${ballText} cascade (advanced)`;
    
    if (patternType === 'sync') return `${ballText} synchronous pattern`;
    if (patternType === 'multiplex') return `${ballText} multiplex pattern`;
    
    return `${ballText} ${patternType} pattern`;
  }

  /**
   * Fetch GIF URL for a single pattern with retries
   */
  async fetchPatternGif(pattern, retries = CONFIG.maxRetries) {
    const url = `${CONFIG.jugglingLabBaseUrl}?pattern=${encodeURIComponent(pattern)}&width=${CONFIG.width}&height=${CONFIG.height}&format=gif`;
    
    try {
      console.log(`🔍 Fetching pattern: ${pattern} (${this.processed + 1}/${this.total})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'juggle-log-web-pattern-generator/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const gifUrl = this.extractGifUrl(html);
      
      if (!gifUrl) {
        throw new Error('No GIF URL found in response');
      }
      
      // Verify GIF URL is accessible
      const gifResponse = await fetch(gifUrl, { method: 'HEAD' });
      if (!gifResponse.ok) {
        throw new Error(`GIF URL not accessible: ${gifResponse.status}`);
      }
      
      const metadata = this.analyzePattern(pattern);
      
      const result = {
        gifUrl,
        ...metadata,
        lastVerified: new Date().toISOString()
      };
      
      console.log(`✅ Success: ${pattern} -> ${ballCount}-ball ${patternType}`);
      return result;
      
    } catch (error) {
      if (retries > 0) {
        console.log(`⚠️ Retry ${CONFIG.maxRetries - retries + 1}/${CONFIG.maxRetries} for pattern: ${pattern}`);
        await this.delay(CONFIG.requestDelay * 2); // Longer delay for retries
        return this.fetchPatternGif(pattern, retries - 1);
      }
      
      console.error(`❌ Failed: ${pattern} - ${error.message}`);
      this.errors.push({ pattern, error: error.message });
      return null;
    }
  }

  /**
   * Delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Process patterns in batches with concurrency control
   */
  async processPatternsInBatches(patterns) {
    const results = new Map();
    
    for (let i = 0; i < patterns.length; i += CONFIG.maxConcurrentRequests) {
      const batch = patterns.slice(i, i + CONFIG.maxConcurrentRequests);
      
      const batchPromises = batch.map(async (pattern) => {
        const result = await this.fetchPatternGif(pattern);
        this.processed++;
        
        if (result) {
          results.set(pattern, result);
        }
        
        // Progress reporting
        const progress = ((this.processed / this.total) * 100).toFixed(1);
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        console.log(`📊 Progress: ${progress}% (${this.processed}/${this.total}) - ${elapsed}s elapsed`);
        
        return { pattern, result };
      });
      
      await Promise.all(batchPromises);
      
      // Delay between batches
      if (i + CONFIG.maxConcurrentRequests < patterns.length) {
        await this.delay(CONFIG.requestDelay);
      }
    }
    
    return results;
  }

  /**
   * Generate TypeScript output file
   */
  generateTypeScriptFile(patternDatabase) {
    const timestamp = new Date().toISOString();
    const totalPatterns = patternDatabase.size;
    const categories = Object.keys(PATTERN_CATEGORIES);

    let output = `/**
 * Comprehensive Siteswap Pattern-to-GIF URL Database
 *
 * Auto-generated on: ${timestamp}
 * Total patterns: ${totalPatterns}
 * Categories: ${categories.join(', ')}
 *
 * This file contains static mappings from siteswap patterns to their
 * corresponding JugglingLab GIF URLs, eliminating runtime CORS dependencies.
 *
 * DO NOT EDIT MANUALLY - Regenerate using: npm run generate-patterns
 */

export interface PatternGifData {
  gifUrl: string;
  ballCount: number;
  patternType: 'async' | 'sync' | 'multiplex';
  difficulty: number;
  description: string;
  lastVerified: string;
}

export const PATTERN_GIF_DATABASE: Record<string, PatternGifData> = {\n`;

    // Sort patterns by ball count, then alphabetically
    const sortedPatterns = Array.from(patternDatabase.entries()).sort(([a, dataA], [b, dataB]) => {
      if (dataA.ballCount !== dataB.ballCount) {
        return dataA.ballCount - dataB.ballCount;
      }
      return a.localeCompare(b);
    });

    sortedPatterns.forEach(([pattern, data], index) => {
      const isLast = index === sortedPatterns.length - 1;
      output += `  '${pattern}': {\n`;
      output += `    gifUrl: '${data.gifUrl}',\n`;
      output += `    ballCount: ${data.ballCount},\n`;
      output += `    patternType: '${data.patternType}',\n`;
      output += `    difficulty: ${data.difficulty},\n`;
      output += `    description: '${data.description}',\n`;
      output += `    lastVerified: '${data.lastVerified}'\n`;
      output += `  }${isLast ? '' : ','}\n`;
    });

    output += `};\n\n`;

    // Add utility functions
    output += `/**
 * Get GIF data for a pattern with fallback logic
 */
export function getPatternGifData(pattern: string): PatternGifData | null {
  return PATTERN_GIF_DATABASE[pattern] || null;
}

/**
 * Get patterns by ball count
 */
export function getPatternsByBallCount(ballCount: number): string[] {
  return Object.entries(PATTERN_GIF_DATABASE)
    .filter(([_, data]) => data.ballCount === ballCount)
    .map(([pattern, _]) => pattern);
}

/**
 * Get patterns by type
 */
export function getPatternsByType(type: 'async' | 'sync' | 'multiplex'): string[] {
  return Object.entries(PATTERN_GIF_DATABASE)
    .filter(([_, data]) => data.patternType === type)
    .map(([pattern, _]) => pattern);
}

/**
 * Get fallback pattern for given ball count
 */
export function getFallbackPattern(ballCount: number): string {
  const fallbacks: Record<number, string> = {
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9'
  };

  return fallbacks[ballCount] || '3';
}

/**
 * Database statistics
 */
export const DATABASE_STATS = {
  totalPatterns: ${totalPatterns},
  generatedOn: '${timestamp}',
  categories: ${JSON.stringify(categories)},
  ballCountDistribution: {
${this.generateBallCountDistribution(patternDatabase)}
  }
};
`;

    return output;
  }

  /**
   * Generate ball count distribution for stats
   */
  generateBallCountDistribution(patternDatabase) {
    const distribution = new Map();

    for (const [_, data] of patternDatabase) {
      const count = distribution.get(data.ballCount) || 0;
      distribution.set(data.ballCount, count + 1);
    }

    return Array.from(distribution.entries())
      .sort(([a], [b]) => a - b)
      .map(([ballCount, count]) => `    ${ballCount}: ${count}`)
      .join(',\n');
  }

  /**
   * Main generation process
   */
  async generate() {
    console.log('🚀 Starting comprehensive pattern database generation...');
    console.log(`📊 Configuration: ${CONFIG.maxConcurrentRequests} concurrent, ${CONFIG.requestDelay}ms delay`);

    // Collect all unique patterns
    const allPatterns = new Set();

    Object.entries(PATTERN_CATEGORIES).forEach(([category, patterns]) => {
      console.log(`📂 Category: ${category} (${patterns.length} patterns)`);
      patterns.forEach(pattern => allPatterns.add(pattern));
    });

    const uniquePatterns = Array.from(allPatterns);
    this.total = uniquePatterns.length;

    console.log(`🎯 Total unique patterns to process: ${this.total}`);
    console.log(`⏱️ Estimated time: ${Math.ceil((this.total * CONFIG.requestDelay) / 1000 / 60)} minutes`);

    // Process patterns
    const patternDatabase = await this.processPatternsInBatches(uniquePatterns);

    // Generate output file
    console.log('📝 Generating TypeScript output file...');
    const outputContent = this.generateTypeScriptFile(patternDatabase);

    // Ensure output directory exists
    const outputDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(CONFIG.outputFile, outputContent, 'utf8');

    // Generate summary
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const successCount = patternDatabase.size;
    const errorCount = this.errors.length;
    const successRate = ((successCount / this.total) * 100).toFixed(1);

    console.log('\n🎉 Pattern database generation complete!');
    console.log(`📊 Results:`);
    console.log(`   ✅ Successful: ${successCount}/${this.total} (${successRate}%)`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   ⏱️ Total time: ${elapsed}s`);
    console.log(`   📁 Output: ${CONFIG.outputFile}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Failed patterns:');
      this.errors.forEach(({ pattern, error }) => {
        console.log(`   ${pattern}: ${error}`);
      });
    }

    return {
      success: successCount,
      errors: errorCount,
      total: this.total,
      outputFile: CONFIG.outputFile
    };
  }
}

// Main execution
async function main() {
  try {
    const generator = new PatternDatabaseGenerator();
    const results = await generator.generate();

    if (results.errors > 0) {
      console.log(`\n⚠️ Generation completed with ${results.errors} errors`);
      process.exit(1);
    } else {
      console.log('\n✅ Generation completed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Fatal error during generation:', error);
    process.exit(1);
  }
}

// Run if called directly
console.log('🚀 Pattern database generator starting...');

// Check if this script is being run directly
const scriptPath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === scriptPath || process.argv[1].endsWith('generatePatternDatabase.js');

if (isMainModule) {
  console.log('✅ Running main function...');
  main();
} else {
  console.log('❌ Script not running as main module');
}
