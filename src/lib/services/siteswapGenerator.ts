/**
 * Siteswap Pattern Generator
 * Generates valid siteswap patterns based on various criteria and constraints
 */

import { SiteswapService } from './siteswapService';

export interface GeneratorOptions {
  objectCount: number;
  maxHeight?: number;
  minHeight?: number;
  patternLength?: number;
  patternType?: 'async' | 'sync' | 'multiplex' | 'any';
  includeZeros?: boolean;
  symmetrical?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard' | 'any';
}

export interface GeneratedPattern {
  pattern: string;
  objectCount: number;
  period: number;
  difficulty: number;
  averageHeight: number;
  patternType: 'async' | 'sync' | 'multiplex';
  description: string;
  tags: string[];
}

export interface PatternCategory {
  name: string;
  description: string;
  patterns: GeneratedPattern[];
}

export class SiteswapGenerator {
  // Well-known pattern database
  private static readonly CLASSIC_PATTERNS: Record<number, string[]> = {
    3: ['3', '423', '441', '531', '522', '51', '42', '60'],
    4: ['4', '534', '552', '71', '62', '53', '633', '642'],
    5: ['5', '645', '663', '744', '753', '97531', '91', '82'],
    6: ['6', '756', '774', '855', '864', '97', '88', '79'],
    7: ['7', '867', '885', '966', '975', 'b97531', '99', '9a']
  };

  private static readonly PATTERN_FAMILIES = {
    flash: { description: 'All objects thrown and caught once', examples: ['3', '4', '5'] },
    cascade: { description: 'Alternating hand throws', examples: ['3', '5', '7'] },
    fountain: { description: 'Same-hand throws', examples: ['4', '6', '8'] },
    shower: { description: 'Circular throwing pattern', examples: ['51', '71', '91'] },
    columns: { description: 'Vertical throwing patterns', examples: ['423', '534', '645'] },
    mills: { description: 'Mills mess family', examples: ['441', '552', '663'] },
    box: { description: 'Box pattern family', examples: ['(4,2x)(2x,4)', '(6,2x)(2x,6)'] }
  };

  /**
   * Generate patterns based on specified criteria
   */
  static generatePatterns(options: GeneratorOptions): GeneratedPattern[] {
    const patterns: GeneratedPattern[] = [];

    // Generate from classic patterns first
    const classicPatterns = this.getClassicPatterns(options);
    patterns.push(...classicPatterns);

    // Generate algorithmic patterns
    const algorithmicPatterns = this.generateAlgorithmicPatterns(options);
    patterns.push(...algorithmicPatterns);

    // Filter and sort by difficulty/preference
    return this.filterAndSortPatterns(patterns, options);
  }

  /**
   * Get patterns by category
   */
  static getPatternsByCategory(): PatternCategory[] {
    const categories: PatternCategory[] = [];

    // Beginner patterns (3-4 objects)
    categories.push({
      name: 'Beginner Patterns',
      description: 'Easy patterns for learning basic siteswap',
      patterns: this.generatePatterns({ objectCount: 3, difficulty: 'easy', patternLength: 3 })
    });

    // Intermediate patterns (3-5 objects)
    categories.push({
      name: 'Intermediate Patterns',
      description: 'Medium difficulty patterns for skill development',
      patterns: this.generatePatterns({ objectCount: 4, difficulty: 'medium', patternLength: 4 })
    });

    // Advanced patterns (5+ objects)
    categories.push({
      name: 'Advanced Patterns',
      description: 'Complex patterns for experienced jugglers',
      patterns: this.generatePatterns({ objectCount: 5, difficulty: 'hard', patternLength: 5 })
    });

    // Pattern families
    Object.entries(this.PATTERN_FAMILIES).forEach(([family, info]) => {
      categories.push({
        name: `${family.charAt(0).toUpperCase() + family.slice(1)} Family`,
        description: info.description,
        patterns: info.examples.map(pattern => this.analyzePattern(pattern)).filter(Boolean) as GeneratedPattern[]
      });
    });

    return categories;
  }

  /**
   * Generate random valid pattern using constraint-based generation
   */
  static generateRandomPattern(objectCount: number, maxLength: number = 6): GeneratedPattern | null {
    // Use the new constraint-based generation for guaranteed valid patterns
    const patternLength = Math.floor(Math.random() * maxLength) + 1;

    const pattern = SiteswapService.generateValidPattern(objectCount, patternLength, {
      minHeight: 0,
      maxHeight: objectCount * 2,
      includeZeros: true,
      maxAttempts: 100
    });

    if (pattern) {
      return this.analyzePattern(pattern);
    }

    // Fallback to classic patterns if generation fails
    const classicPatterns = this.getClassicPatterns({ objectCount, patternLength: maxLength });
    if (classicPatterns.length > 0) {
      const randomIndex = Math.floor(Math.random() * classicPatterns.length);
      return classicPatterns[randomIndex];
    }

    return null;
  }

  /**
   * Get pattern suggestions based on current skill level
   */
  static getProgressionSuggestions(currentPatterns: string[]): GeneratedPattern[] {
    const suggestions: GeneratedPattern[] = [];
    
    // Analyze current patterns to determine skill level
    const skillLevel = this.analyzeSkillLevel(currentPatterns);
    
    // Suggest next patterns based on progression
    const nextPatterns = this.getNextInProgression(skillLevel);
    
    return nextPatterns.map(pattern => this.analyzePattern(pattern)).filter(Boolean) as GeneratedPattern[];
  }

  /**
   * Generate patterns from classic database
   */
  private static getClassicPatterns(options: GeneratorOptions): GeneratedPattern[] {
    const patterns: GeneratedPattern[] = [];
    const classicForObjects = this.CLASSIC_PATTERNS[options.objectCount] || [];

    for (const pattern of classicForObjects) {
      const analyzed = this.analyzePattern(pattern);
      if (analyzed && this.matchesOptions(analyzed, options)) {
        patterns.push(analyzed);
      }
    }

    return patterns;
  }

  /**
   * Generate patterns algorithmically using constraint-based validation
   */
  private static generateAlgorithmicPatterns(options: GeneratorOptions): GeneratedPattern[] {
    const patterns: GeneratedPattern[] = [];
    const maxLength = options.patternLength || 6;
    const maxHeight = options.maxHeight || (options.objectCount * 2);
    const minHeight = options.minHeight || 0;

    // Generate valid patterns for each length using constraint-based approach
    for (let length = 1; length <= maxLength; length++) {
      const validPatterns = this.generateValidPatternsForLength(
        options.objectCount,
        length,
        minHeight,
        maxHeight,
        options
      );

      patterns.push(...validPatterns);
    }

    return patterns;
  }

  /**
   * Generate all valid canonical patterns for a specific length using smart enumeration
   */
  private static generateValidPatternsForLength(
    objectCount: number,
    length: number,
    minHeight: number,
    maxHeight: number,
    options: GeneratorOptions
  ): GeneratedPattern[] {
    const patterns: GeneratedPattern[] = [];
    const maxPatternsPerLength = 20; // Limit to prevent excessive generation

    // Use canonical forms as unique keys to prevent duplicates
    const foundCanonicalPatterns = new Set<string>();

    // Use constraint-based generation with multiple attempts for variety
    const attempts = Math.min(100, maxPatternsPerLength * 5); // Increased attempts since we filter duplicates

    for (let attempt = 0; attempt < attempts && patterns.length < maxPatternsPerLength; attempt++) {
      const pattern = SiteswapService.generateValidPattern(objectCount, length, {
        minHeight,
        maxHeight,
        includeZeros: options.includeZeros,
        maxAttempts: 10
      });

      if (pattern) {
        // Get canonical form to check for duplicates
        try {
          const canonicalInfo = SiteswapService.normalizeToCanonical(pattern);
          const canonicalPattern = canonicalInfo.canonical;

          if (!foundCanonicalPatterns.has(canonicalPattern)) {
            foundCanonicalPatterns.add(canonicalPattern);

            const analyzed = this.analyzePattern(canonicalPattern);
            if (analyzed && this.matchesOptions(analyzed, options)) {
              patterns.push(analyzed);
            }
          }
        } catch (error) {
          // If normalization fails, use original pattern
          if (!foundCanonicalPatterns.has(pattern)) {
            foundCanonicalPatterns.add(pattern);

            const analyzed = this.analyzePattern(pattern);
            if (analyzed && this.matchesOptions(analyzed, options)) {
              patterns.push(analyzed);
            }
          }
        }
      }
    }

    // If we didn't find enough patterns, try systematic enumeration for short patterns
    if (patterns.length < 5 && length <= 3) {
      const systematicPatterns = this.generateSystematicCanonicalPatterns(
        objectCount,
        length,
        minHeight,
        maxHeight,
        options,
        foundCanonicalPatterns
      );

      patterns.push(...systematicPatterns);
    }

    return patterns;
  }

  /**
   * Generate canonical patterns using systematic enumeration (for short patterns)
   */
  private static generateSystematicCanonicalPatterns(
    objectCount: number,
    length: number,
    minHeight: number,
    maxHeight: number,
    options: GeneratorOptions,
    foundCanonicalPatterns: Set<string>
  ): GeneratedPattern[] {
    const patterns: GeneratedPattern[] = [];
    const targetSum = objectCount * length;
    const maxPatternsToAdd = 10; // Limit systematic generation

    // Generate combinations that satisfy the average theorem
    const validCombinations = this.generateValidCombinations(
      length,
      minHeight,
      maxHeight,
      targetSum
    );

    for (const combination of validCombinations) {
      if (patterns.length >= maxPatternsToAdd) break;

      // Validate the combination using our enhanced validation
      if (SiteswapService.isValidSiteswapSequence(combination)) {
        const pattern = combination.join('');

        // Get canonical form to avoid duplicates
        try {
          const canonicalInfo = SiteswapService.normalizeToCanonical(pattern);
          const canonicalPattern = canonicalInfo.canonical;

          if (!foundCanonicalPatterns.has(canonicalPattern)) {
            foundCanonicalPatterns.add(canonicalPattern);

            const analyzed = this.analyzePattern(canonicalPattern);
            if (analyzed && this.matchesOptions(analyzed, options)) {
              patterns.push(analyzed);
            }
          }
        } catch (error) {
          // If normalization fails, use original pattern
          if (!foundCanonicalPatterns.has(pattern)) {
            foundCanonicalPatterns.add(pattern);

            const analyzed = this.analyzePattern(pattern);
            if (analyzed && this.matchesOptions(analyzed, options)) {
              patterns.push(analyzed);
            }
          }
        }
      }
    }

    return patterns;
  }

  /**
   * Generate valid combinations that satisfy the average theorem and basic constraints
   */
  private static generateValidCombinations(length: number, minHeight: number, maxHeight: number, targetSum: number): number[][] {
    const combinations: number[][] = [];
    const maxCombinations = 1000; // Limit to prevent excessive computation

    const generate = (current: number[], remaining: number, currentSum: number) => {
      if (combinations.length >= maxCombinations) return;

      if (remaining === 0) {
        if (currentSum === targetSum) {
          combinations.push([...current]);
        }
        return;
      }

      // Calculate bounds for next throw to stay within target sum
      const minNeeded = Math.max(minHeight, targetSum - currentSum - (remaining - 1) * maxHeight);
      const maxAllowed = Math.min(maxHeight, targetSum - currentSum - (remaining - 1) * minHeight);

      if (minNeeded > maxAllowed) return; // Impossible to reach target

      for (let height = minNeeded; height <= maxAllowed; height++) {
        current.push(height);
        generate(current, remaining - 1, currentSum + height);
        current.pop();
      }
    };

    generate([], length, 0);
    return combinations;
  }

  /**
   * Analyze a pattern and create GeneratedPattern object
   */
  private static analyzePattern(pattern: string): GeneratedPattern | null {
    const analysis = SiteswapService.analyzeSiteswap(pattern);
    if (!analysis) return null;

    const description = this.generateDescription(pattern, analysis);
    const tags = this.generateTags(pattern, analysis);

    return {
      pattern,
      objectCount: analysis.objectCount,
      period: analysis.period,
      difficulty: analysis.difficulty,
      averageHeight: analysis.averageHeight,
      patternType: analysis.patternType,
      description,
      tags
    };
  }

  /**
   * Generate human-readable description for pattern
   */
  private static generateDescription(pattern: string, analysis: any): string {
    const { objectCount, patternType, averageHeight, maxHeight } = analysis;
    
    let description = `${objectCount}-object `;
    
    if (patternType === 'async') {
      if (pattern === objectCount.toString()) {
        description += 'cascade';
      } else if (averageHeight === objectCount) {
        description += 'cascade variation';
      } else if (maxHeight > objectCount + 2) {
        description += 'high throw pattern';
      } else {
        description += 'asynchronous pattern';
      }
    } else if (patternType === 'sync') {
      description += 'synchronous pattern';
    } else {
      description += 'multiplex pattern';
    }

    // Add difficulty indicator
    if (analysis.difficulty < 3) {
      description += ' (easy)';
    } else if (analysis.difficulty < 6) {
      description += ' (medium)';
    } else {
      description += ' (hard)';
    }

    return description;
  }

  /**
   * Generate tags for pattern categorization
   */
  private static generateTags(pattern: string, analysis: any): string[] {
    const tags: string[] = [];
    
    // Object count tag
    tags.push(`${analysis.objectCount}-ball`);
    
    // Pattern type
    tags.push(analysis.patternType);
    
    // Difficulty
    if (analysis.difficulty < 3) tags.push('beginner');
    else if (analysis.difficulty < 6) tags.push('intermediate');
    else tags.push('advanced');
    
    // Special characteristics
    if (analysis.hasMultiplex) tags.push('multiplex');
    if (analysis.hasSynchronous) tags.push('synchronous');
    if (analysis.maxHeight > analysis.objectCount + 3) tags.push('high-throws');
    if (analysis.throwSequence.includes(0)) tags.push('gaps');
    
    // Pattern families
    if (pattern === analysis.objectCount.toString()) tags.push('cascade');
    if (pattern.endsWith('1')) tags.push('shower');
    if (pattern.includes('42')) tags.push('columns');
    
    return tags;
  }

  /**
   * Check if pattern matches generation options
   */
  private static matchesOptions(pattern: GeneratedPattern, options: GeneratorOptions): boolean {
    if (options.patternType && options.patternType !== 'any' && pattern.patternType !== options.patternType) {
      return false;
    }
    
    if (options.difficulty && options.difficulty !== 'any') {
      const difficultyRanges = {
        easy: [0, 3],
        medium: [3, 6],
        hard: [6, 10]
      };
      const [min, max] = difficultyRanges[options.difficulty];
      if (pattern.difficulty < min || pattern.difficulty >= max) {
        return false;
      }
    }
    
    if (!options.includeZeros && pattern.pattern.includes('0')) {
      return false;
    }
    
    return true;
  }

  /**
   * Filter and sort patterns by preference
   */
  private static filterAndSortPatterns(patterns: GeneratedPattern[], options: GeneratorOptions): GeneratedPattern[] {
    // Remove duplicates
    const unique = patterns.filter((pattern, index, self) => 
      index === self.findIndex(p => p.pattern === pattern.pattern)
    );
    
    // Sort by difficulty and then by pattern length
    return unique.sort((a, b) => {
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return a.period - b.period;
    });
  }



  /**
   * Analyze skill level from current patterns
   */
  private static analyzeSkillLevel(patterns: string[]): 'beginner' | 'intermediate' | 'advanced' {
    if (patterns.length === 0) return 'beginner';
    
    const maxObjects = Math.max(...patterns.map(p => {
      const analysis = SiteswapService.analyzeSiteswap(p);
      return analysis?.objectCount || 0;
    }));
    
    if (maxObjects >= 5) return 'advanced';
    if (maxObjects >= 4) return 'intermediate';
    return 'beginner';
  }

  /**
   * Get next patterns in learning progression
   */
  private static getNextInProgression(skillLevel: string): string[] {
    const progressions = {
      beginner: ['3', '423', '441', '531'],
      intermediate: ['4', '534', '552', '633', '642'],
      advanced: ['5', '645', '663', '744', '753', '97531']
    };
    
    return progressions[skillLevel as keyof typeof progressions] || [];
  }
}
