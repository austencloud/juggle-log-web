/**
 * Siteswap Notation Service
 * Provides comprehensive validation, analysis, and manipulation of siteswap patterns
 */

export interface SiteswapValidationResult {
  isValid: boolean;
  errors: string[];
  objectCount?: number;
  period?: number;
  difficulty?: number;
  patternType: 'async' | 'sync' | 'multiplex' | 'invalid';
  averageHeight?: number;
  variance?: number;
  canonicalForm?: string;
  isCanonical?: boolean;
  equivalentForms?: string[];
}

export interface SiteswapAnalysis {
  objectCount: number;
  period: number;
  difficulty: number;
  averageHeight: number;
  variance: number;
  maxHeight: number;
  minHeight: number;
  patternType: 'async' | 'sync' | 'multiplex';
  hasMultiplex: boolean;
  hasSynchronous: boolean;
  throwSequence: number[];
}

export class SiteswapService {
  /**
   * Validate a siteswap pattern for mathematical correctness
   */
  static validateSiteswap(pattern: string): SiteswapValidationResult {
    const result: SiteswapValidationResult = {
      isValid: false,
      errors: [],
      patternType: 'invalid'
    };

    if (!pattern || pattern.trim().length === 0) {
      result.errors.push('Pattern cannot be empty');
      return result;
    }

    const normalized = this.normalizePattern(pattern);
    
    try {
      // Detect pattern type
      const patternType = this.detectPatternType(normalized);
      result.patternType = patternType;

      if (patternType === 'invalid') {
        result.errors.push('Invalid pattern format');
        return result;
      }

      // Parse throws based on pattern type
      let throws: number[];
      
      if (patternType === 'sync') {
        throws = this.parseSynchronousPattern(normalized);
      } else if (patternType === 'multiplex') {
        throws = this.parseMultiplexPattern(normalized);
      } else {
        throws = this.parseAsynchronousPattern(normalized);
      }

      if (throws.length === 0) {
        result.errors.push('No valid throws found in pattern');
        return result;
      }

      // Validate average theorem
      const sum = throws.reduce((a, b) => a + b, 0);
      const average = sum / throws.length;
      
      if (!Number.isInteger(average)) {
        result.errors.push(`Pattern average ${average.toFixed(2)} is not an integer (violates average theorem)`);
        return result;
      }

      // Check for collision detection
      const collisionCheck = this.detectCollisions(throws);
      if (!collisionCheck.isValid) {
        result.errors.push(`Collision detected: ${collisionCheck.error}`);
        return result;
      }

      // Validate pattern state consistency
      const stateCheck = this.validatePatternState(throws);
      if (!stateCheck.isValid) {
        result.errors.push(`State validation failed: ${stateCheck.error}`);
        return result;
      }

      // Calculate pattern properties
      result.objectCount = Math.round(average);
      result.period = throws.length;
      result.averageHeight = average;
      result.variance = this.calculateVariance(throws);
      result.difficulty = this.calculateDifficulty(throws, patternType);
      result.isValid = true;

      // Add canonical form information
      try {
        const canonicalInfo = this.normalizeToCanonical(pattern);
        result.canonicalForm = canonicalInfo.canonical;
        result.isCanonical = canonicalInfo.isAlreadyCanonical;
        result.equivalentForms = canonicalInfo.equivalentForms;
      } catch (error) {
        // If canonical normalization fails, pattern is still mathematically valid
        result.canonicalForm = pattern;
        result.isCanonical = true;
        result.equivalentForms = [pattern];
      }

    } catch (error) {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Analyze a siteswap pattern for detailed properties
   */
  static analyzeSiteswap(pattern: string): SiteswapAnalysis | null {
    const validation = this.validateSiteswap(pattern);
    
    if (!validation.isValid) {
      return null;
    }

    const normalized = this.normalizePattern(pattern);
    const throws = this.parsePattern(normalized, validation.patternType);

    return {
      objectCount: validation.objectCount!,
      period: validation.period!,
      difficulty: validation.difficulty!,
      averageHeight: validation.averageHeight!,
      variance: validation.variance!,
      maxHeight: Math.max(...throws),
      minHeight: Math.min(...throws),
      patternType: validation.patternType as 'async' | 'sync' | 'multiplex',
      hasMultiplex: validation.patternType === 'multiplex' || normalized.includes('['),
      hasSynchronous: validation.patternType === 'sync' || normalized.includes('('),
      throwSequence: throws
    };
  }

  /**
   * Calculate difficulty score for a siteswap pattern
   */
  static calculateDifficulty(throws: number[], patternType: string): number {
    if (throws.length === 0) return 0;

    const averageHeight = throws.reduce((a, b) => a + b, 0) / throws.length;
    const variance = this.calculateVariance(throws);
    const maxHeight = Math.max(...throws);
    const patternLength = throws.length;

    // Base difficulty from average height (0.4 weight)
    const heightDifficulty = averageHeight * 0.4;

    // Variance adds complexity (0.3 weight)
    const varianceDifficulty = variance * 0.3;

    // Pattern length adds memory complexity (0.2 weight)
    const lengthDifficulty = Math.log(patternLength + 1) * 0.2;

    // Special pattern bonuses (0.1 weight)
    let specialBonus = 0;
    if (patternType === 'sync') specialBonus += 0.5;
    if (patternType === 'multiplex') specialBonus += 0.7;
    if (maxHeight >= 7) specialBonus += 0.3;
    if (throws.includes(0)) specialBonus += 0.2; // Gaps add difficulty

    const totalDifficulty = heightDifficulty + varianceDifficulty + lengthDifficulty + (specialBonus * 0.1);

    // Scale to 1-10 range
    return Math.min(Math.max(totalDifficulty, 1), 10);
  }

  /**
   * Get object count for a valid siteswap pattern
   */
  static getObjectCount(pattern: string): number {
    const validation = this.validateSiteswap(pattern);
    return validation.objectCount || 0;
  }

  /**
   * Detect collisions in a siteswap pattern using enhanced algorithm
   */
  static detectCollisions(throws: number[]): { isValid: boolean; error?: string } {
    if (throws.length === 0) {
      return { isValid: false, error: 'Empty pattern' };
    }

    const handCount = 2; // Standard juggling with 2 hands
    const period = throws.length;

    // Track landing positions for each beat and hand
    const landingMap = new Map<string, { beat: number; hand: number; throwHeight: number }>();

    // Check each throw for collisions
    for (let beat = 0; beat < period; beat++) {
      const throwHeight = throws[beat];
      const currentHand = beat % handCount;

      if (throwHeight === 0) continue; // No throw, no collision possible

      // Calculate landing beat and hand
      const landingBeat = (beat + throwHeight) % period;
      const landingHand = (currentHand + throwHeight) % handCount;

      // Create unique key for landing position
      const landingKey = `${landingBeat}-${landingHand}`;

      // Check if landing slot is already occupied
      if (landingMap.has(landingKey)) {
        const existing = landingMap.get(landingKey)!;
        return {
          isValid: false,
          error: `Collision at beat ${landingBeat}, hand ${landingHand}: throw ${throwHeight} from beat ${beat} conflicts with throw ${existing.throwHeight} from beat ${existing.beat}`
        };
      }

      // Mark landing slot as occupied
      landingMap.set(landingKey, { beat, hand: currentHand, throwHeight });
    }

    return { isValid: true };
  }

  /**
   * Validate that pattern returns to starting state (state validation)
   */
  static validatePatternState(throws: number[]): { isValid: boolean; error?: string } {
    if (throws.length === 0) {
      return { isValid: false, error: 'Empty pattern' };
    }

    const period = throws.length;
    const handCount = 2;

    // Track the state of each hand at each beat
    const states: number[][] = [];
    for (let i = 0; i < period; i++) {
      states[i] = [0, 0]; // [left_hand, right_hand] - number of balls
    }

    // Simulate the pattern for one complete cycle
    for (let beat = 0; beat < period; beat++) {
      const throwHeight = throws[beat];
      const currentHand = beat % handCount;

      if (throwHeight === 0) continue;

      // Calculate landing beat and hand
      const landingBeat = (beat + throwHeight) % period;
      const landingHand = (currentHand + throwHeight) % handCount;

      // Remove ball from current hand
      states[beat][currentHand]--;

      // Add ball to landing hand
      states[landingBeat][landingHand]++;
    }

    // Check if we return to a valid starting state
    // All hands should have the same number of balls at the end as at the start
    const initialState = states[0];
    const finalState = states[period - 1];

    if (initialState[0] !== finalState[0] || initialState[1] !== finalState[1]) {
      return {
        isValid: false,
        error: `Pattern does not return to starting state: initial [${initialState}], final [${finalState}]`
      };
    }

    return { isValid: true };
  }

  /**
   * Fast validation for pattern generation (optimized for performance)
   * Returns true if pattern is mathematically valid, false otherwise
   */
  static isValidSiteswapSequence(throws: number[]): boolean {
    if (throws.length === 0) return false;

    // Quick average theorem check
    const sum = throws.reduce((a, b) => a + b, 0);
    const average = sum / throws.length;
    if (!Number.isInteger(average)) return false;

    // Quick collision detection
    const period = throws.length;
    const handCount = 2;
    const landingSet = new Set<string>();

    for (let beat = 0; beat < period; beat++) {
      const throwHeight = throws[beat];
      if (throwHeight === 0) continue;

      const landingBeat = (beat + throwHeight) % period;
      const landingHand = ((beat % handCount) + throwHeight) % handCount;
      const landingKey = `${landingBeat}-${landingHand}`;

      if (landingSet.has(landingKey)) return false;
      landingSet.add(landingKey);
    }

    return true;
  }

  /**
   * Generate valid siteswap pattern using constraint-based approach
   */
  static generateValidPattern(objectCount: number, patternLength: number, options: {
    minHeight?: number;
    maxHeight?: number;
    includeZeros?: boolean;
    maxAttempts?: number;
  } = {}): string | null {
    const {
      minHeight = 0,
      maxHeight = objectCount * 2,
      includeZeros = false,
      maxAttempts = 1000
    } = options;

    const targetSum = objectCount * patternLength;

    // Use backtracking to generate valid patterns
    const generateSequence = (current: number[], remaining: number, currentSum: number): number[] | null => {
      if (remaining === 0) {
        if (currentSum === targetSum && this.isValidSiteswapSequence(current)) {
          return current;
        }
        return null;
      }

      const minNeeded = Math.max(minHeight, targetSum - currentSum - (remaining - 1) * maxHeight);
      const maxAllowed = Math.min(maxHeight, targetSum - currentSum - (remaining - 1) * minHeight);

      for (let height = minNeeded; height <= maxAllowed; height++) {
        if (!includeZeros && height === 0) continue;

        current.push(height);

        // Early validation check only for complete patterns
        if (current.length === patternLength) {
          if (!this.isValidSiteswapSequence([...current])) {
            current.pop();
            continue;
          }
        }

        const result = generateSequence(current, remaining - 1, currentSum + height);
        if (result) return result;

        current.pop();
      }

      return null;
    };

    // Try multiple starting points for better variety
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = generateSequence([], patternLength, 0);
      if (result) {
        const pattern = result.join('');

        // Ensure the generated pattern is in canonical form
        try {
          const canonicalInfo = this.normalizeToCanonical(pattern);
          return canonicalInfo.canonical;
        } catch {
          // If normalization fails, return the original pattern
          return pattern;
        }
      }
    }

    return null;
  }

  /**
   * Normalize siteswap pattern to canonical form
   */
  static normalizeToCanonical(pattern: string): {
    canonical: string;
    isAlreadyCanonical: boolean;
    equivalentForms: string[];
    normalizationType: 'constant' | 'cyclic' | 'already-canonical';
  } {
    if (!pattern || pattern.length === 0) {
      throw new Error('Empty pattern cannot be normalized');
    }

    const cleanPattern = this.normalizePatternString(pattern);

    // Handle single character patterns (already canonical)
    if (cleanPattern.length === 1) {
      return {
        canonical: cleanPattern,
        isAlreadyCanonical: true,
        equivalentForms: [cleanPattern],
        normalizationType: 'already-canonical'
      };
    }

    // Check if it's a constant pattern (all throws the same)
    const throws = this.parseThrows(cleanPattern);
    const isConstant = throws.every(t => t === throws[0]);

    if (isConstant) {
      const canonical = throws[0].toString();
      return {
        canonical,
        isAlreadyCanonical: cleanPattern === canonical,
        equivalentForms: [canonical],
        normalizationType: 'constant'
      };
    }

    // Find canonical rotation for non-constant patterns
    const canonicalResult = this.findCanonicalRotation(throws);
    const canonical = canonicalResult.canonical.join('');

    return {
      canonical,
      isAlreadyCanonical: cleanPattern === canonical,
      equivalentForms: canonicalResult.allRotations.map(r => r.join('')),
      normalizationType: 'cyclic'
    };
  }

  /**
   * Find the canonical rotation of a pattern
   */
  private static findCanonicalRotation(throws: number[]): {
    canonical: number[];
    allRotations: number[][];
  } {
    const length = throws.length;
    const rotations: number[][] = [];

    // Generate all rotations
    for (let i = 0; i < length; i++) {
      const rotation = [...throws.slice(i), ...throws.slice(0, i)];
      rotations.push(rotation);
    }

    // Find maximum value in the pattern
    const maxValue = Math.max(...throws);

    // Filter rotations that start with the maximum value
    const maxStartingRotations = rotations.filter(r => r[0] === maxValue);

    // If only one rotation starts with max value, that's canonical
    if (maxStartingRotations.length === 1) {
      return {
        canonical: maxStartingRotations[0],
        allRotations: rotations
      };
    }

    // Multiple rotations start with max value - choose lexicographically smallest
    let canonical = maxStartingRotations[0];

    for (let i = 1; i < maxStartingRotations.length; i++) {
      const current = maxStartingRotations[i];

      if (this.isLexicographicallySmaller(current, canonical)) {
        canonical = current;
      }
    }

    return {
      canonical,
      allRotations: rotations
    };
  }

  /**
   * Compare two arrays lexicographically
   */
  private static isLexicographicallySmaller(a: number[], b: number[]): boolean {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] < b[i]) return true;
      if (a[i] > b[i]) return false;
    }
    return a.length < b.length;
  }

  /**
   * Check if a pattern is already in canonical form
   */
  static isCanonicalForm(pattern: string): boolean {
    try {
      const result = this.normalizeToCanonical(pattern);
      return result.isAlreadyCanonical;
    } catch {
      return false;
    }
  }

  /**
   * Get all equivalent forms of a pattern
   */
  static getEquivalentForms(pattern: string): string[] {
    try {
      const result = this.normalizeToCanonical(pattern);
      return result.equivalentForms;
    } catch {
      return [];
    }
  }

  /**
   * Parse throws from a clean pattern string
   */
  private static parseThrows(pattern: string): number[] {
    const throws: number[] = [];

    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];

      if (char >= '0' && char <= '9') {
        throws.push(parseInt(char));
      } else if (char >= 'a' && char <= 'z') {
        // Handle hex notation for throws > 9
        throws.push(char.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
      }
    }

    return throws;
  }

  /**
   * Normalize pattern string for canonical processing
   */
  private static normalizePatternString(pattern: string): string {
    return pattern
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ''); // Remove all whitespace
  }

  /**
   * Normalize pattern string for consistent processing
   */
  static normalizePattern(pattern: string): string {
    return pattern
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all whitespace
      .replace(/[^0-9a-fx()\[\],]/g, ''); // Keep only valid siteswap characters
  }

  /**
   * Detect the type of siteswap pattern
   */
  private static detectPatternType(pattern: string): 'async' | 'sync' | 'multiplex' | 'invalid' {
    if (pattern.includes('[') && pattern.includes(']')) {
      return 'multiplex';
    }
    
    if (pattern.includes('(') && pattern.includes(')')) {
      return 'sync';
    }
    
    // Check if it's a valid async pattern (only digits and letters a-f)
    if (/^[0-9a-f]+$/.test(pattern)) {
      return 'async';
    }
    
    return 'invalid';
  }

  /**
   * Parse asynchronous siteswap pattern
   */
  private static parseAsynchronousPattern(pattern: string): number[] {
    const throws: number[] = [];
    
    for (const char of pattern) {
      if (/[0-9]/.test(char)) {
        throws.push(parseInt(char, 10));
      } else if (/[a-f]/.test(char)) {
        // Handle hex digits (a=10, b=11, etc.)
        throws.push(char.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
      }
    }
    
    return throws;
  }

  /**
   * Parse synchronous siteswap pattern
   */
  private static parseSynchronousPattern(pattern: string): number[] {
    const throws: number[] = [];
    const pairs = pattern.match(/\([^)]+\)/g);
    
    if (!pairs) return [];
    
    for (const pair of pairs) {
      const content = pair.slice(1, -1); // Remove parentheses
      const parts = content.split(',');
      
      for (const part of parts) {
        const cleanPart = part.replace('x', ''); // Remove crossing indicator
        const value = this.parseThrowValue(cleanPart);
        if (value !== null) throws.push(value);
      }
    }
    
    return throws;
  }

  /**
   * Parse multiplex siteswap pattern
   */
  private static parseMultiplexPattern(pattern: string): number[] {
    const throws: number[] = [];
    let i = 0;
    
    while (i < pattern.length) {
      if (pattern[i] === '[') {
        // Find matching closing bracket
        const closeIndex = pattern.indexOf(']', i);
        if (closeIndex === -1) break;
        
        const multiplexContent = pattern.slice(i + 1, closeIndex);
        for (const char of multiplexContent) {
          const value = this.parseThrowValue(char);
          if (value !== null) throws.push(value);
        }
        
        i = closeIndex + 1;
      } else {
        const value = this.parseThrowValue(pattern[i]);
        if (value !== null) throws.push(value);
        i++;
      }
    }
    
    return throws;
  }

  /**
   * Parse a single throw value
   */
  private static parseThrowValue(char: string): number | null {
    if (/[0-9]/.test(char)) {
      return parseInt(char, 10);
    } else if (/[a-f]/.test(char)) {
      return char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    }
    return null;
  }

  /**
   * Parse pattern based on detected type
   */
  private static parsePattern(pattern: string, type: string): number[] {
    switch (type) {
      case 'sync':
        return this.parseSynchronousPattern(pattern);
      case 'multiplex':
        return this.parseMultiplexPattern(pattern);
      default:
        return this.parseAsynchronousPattern(pattern);
    }
  }

  /**
   * Calculate variance of throw heights
   */
  private static calculateVariance(throws: number[]): number {
    if (throws.length === 0) return 0;
    
    const mean = throws.reduce((a, b) => a + b, 0) / throws.length;
    const squaredDiffs = throws.map(x => Math.pow(x - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / throws.length;
  }
}
