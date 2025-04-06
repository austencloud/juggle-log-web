/**
 * Generates all unique juggling patterns from a set of throws with a given length
 */
export class PatternGenerator {
    /**
     * Maximum number of patterns to generate to prevent performance issues
     */
    private static readonly MAX_PATTERNS = 10000;

    /**
     * Generate patterns from selected throws and desired length
     * @param throws - Array of selected throw types
     * @param length - Length of each pattern
     * @returns Array of unique patterns
     */
    public static generatePatterns(throws: string[], length: number): string[] {
      if (throws.length === 0 || length <= 0) {
        return [];
      }

      // Use an iterative approach instead of recursion
      const allPatterns = new Set<string>();
      
      // Start with an empty pattern
      let queue = [''];
      
      // Process the queue until we reach the desired length
      while (queue.length > 0) {
        const currentPattern = queue.shift()!;
        
        // If we've reached the desired length, add to results
        if (currentPattern.length === length) {
          allPatterns.add(currentPattern);
        } else {
          // Otherwise, extend the pattern with each throw type
          for (const throwType of throws) {
            // Check if we're about to exceed the maximum number of patterns
            if (queue.length + allPatterns.size < this.MAX_PATTERNS) {
              queue.push(currentPattern + throwType);
            } else {
              console.warn(`Pattern generation stopped: exceeded maximum of ${this.MAX_PATTERNS} patterns`);
              queue = []; // Clear the queue to exit the loop
              break;
            }
          }
        }
      }
      
      // Filter unique patterns (remove rotations and repetitions)
      const uniquePatterns = new Set<string>();
      
      allPatterns.forEach(pattern => {
        // First check if this pattern is a repetition of a smaller pattern
        const repeatingBase = this.findRepeatingBase(pattern);
        
        // If it's a repetition (and not just itself), skip it
        if (repeatingBase && repeatingBase !== pattern) {
          return; // Skip this pattern
        }
        
        // Now check if any rotation is already in uniquePatterns
        const isUnique = !Array.from({ length: pattern.length }, (_, i) => 
          pattern.slice(i) + pattern.slice(0, i)
        ).some(rotation => uniquePatterns.has(rotation));
        
        if (isUnique) {
          uniquePatterns.add(pattern);
        }
      });
      
      return Array.from(uniquePatterns).sort();
    }
    
    /**
     * Find the repeating base of a pattern, if any
     * @param pattern - The pattern to check
     * @returns The repeating base pattern, or null if it doesn't repeat
     */
    private static findRepeatingBase(pattern: string): string | null {
      for (let subLength = 1; subLength < pattern.length; subLength++) {
        // Skip if the pattern length isn't a multiple of the subpattern length
        if (pattern.length % subLength !== 0) continue;
        
        const subpattern = pattern.substring(0, subLength);
        const repeats = pattern.length / subLength;
        
        if (pattern === subpattern.repeat(repeats)) {
          return subpattern;
        }
      }
      
      return null;
    }
}