/**
 * Generates all unique juggling patterns from a set of throws with a given length
 */
export class PatternGenerator {
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
  
      // Generate all possible permutations
      const allPatterns = new Set<string>();
      
      // Helper function to generate patterns recursively
      const generatePattern = (currentPattern: string) => {
        if (currentPattern.length === length) {
          allPatterns.add(currentPattern);
          return;
        }
        
        for (const throwType of throws) {
          generatePattern(currentPattern + throwType);
        }
      };
      
      generatePattern('');
      
      // Filter unique patterns (remove rotations)
      const uniquePatterns = new Set<string>();
      
      allPatterns.forEach(pattern => {
        // Check if any rotation is already in uniquePatterns
        const isUnique = !Array.from({ length: pattern.length }, (_, i) => 
          pattern.slice(i) + pattern.slice(0, i)
        ).some(rotation => uniquePatterns.has(rotation));
        
        if (isUnique) {
          uniquePatterns.add(pattern);
        }
      });
      
      return Array.from(uniquePatterns).sort();
    }
  }