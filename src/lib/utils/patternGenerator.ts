// src/lib/utils/patternGenerator.ts
/**
 * Generates all unique juggling patterns from a set of throws with a given length
 */
export class PatternGenerator {
	/**
	 * Maximum number of patterns to generate to prevent performance issues
	 */
	private static readonly MAX_PATTERNS = 10000;

	/**
	 * Cache for previously generated patterns
	 */
	private static patternCache: Map<string, string[]> = new Map();

	/**
	 * Generate patterns from selected throws and desired length
	 * @param throws - Array of selected throw types
	 * @param length - Length of each pattern
	 * @returns Array of unique patterns
	 */
	public static generatePatterns(throws: string[], length: number): string[] {
		if (!throws.length || length <= 0) return [];

		// Create a cache key from the throw types and length
		const cacheKey = `${throws.sort().join('')}-${length}`;

		// Check if we have cached results for this configuration
		if (this.patternCache.has(cacheKey)) {
			return [...this.patternCache.get(cacheKey)!]; // Return a copy to prevent mutation
		}

		// Use a breadth-first approach for pattern generation
		const allPatterns = new Set<string>();
		const queue: string[] = [''];
		let patternsChecked = 0;

		while (queue.length > 0 && patternsChecked < this.MAX_PATTERNS) {
			const currentPattern = queue.shift()!;
			patternsChecked++;

			if (currentPattern.length === length) {
				allPatterns.add(currentPattern);
			} else {
				// Using a Set for throws ensures we don't try duplicates
				const throwSet = new Set(throws);
				for (const throwType of throwSet) {
					queue.push(currentPattern + throwType);
				}
			}
		}

		if (patternsChecked >= this.MAX_PATTERNS) {
			console.warn(`Pattern generation stopped: exceeded maximum of ${this.MAX_PATTERNS} patterns`);
		}

		// Filter out patterns that are rotations or repetitions of others
		const uniquePatterns = this.filterUniquePatterns(allPatterns);

		// Sort the patterns for consistent ordering
		const sortedPatterns = Array.from(uniquePatterns).sort();

		// Cache the results
		this.patternCache.set(cacheKey, sortedPatterns);

		return sortedPatterns;
	}

	/**
	 * Filter out patterns that are rotations or repetitions of other patterns
	 * @param patterns - Set of all generated patterns
	 * @returns Set of unique patterns
	 */
	private static filterUniquePatterns(patterns: Set<string>): Set<string> {
		const uniquePatterns = new Set<string>();

		// Create a map to track which patterns are rotations of others
		const rotationMap = new Map<string, string>();

		// Process each pattern
		for (const pattern of patterns) {
			// Skip if already processed as a rotation of another pattern
			if (rotationMap.has(pattern)) continue;

			// Check if pattern is a repetition of a smaller pattern
			const repeatingBase = this.findRepeatingBase(pattern);
			if (repeatingBase && repeatingBase !== pattern) {
				continue; // Skip repetitive patterns
			}

			// Add all rotations to the rotation map
			const rotations = this.getAllRotations(pattern);
			const canonicalRotation = this.getCanonicalRotation(pattern);

			// Mark all rotations as being represented by the canonical form
			for (const rotation of rotations) {
				rotationMap.set(rotation, canonicalRotation);
			}

			// Add the canonical rotation to our unique set
			uniquePatterns.add(canonicalRotation);
		}

		return uniquePatterns;
	}

	/**
	 * Get all possible rotations of a pattern
	 * @param pattern - The pattern to rotate
	 * @returns Array of all possible rotations
	 */
	private static getAllRotations(pattern: string): string[] {
		const rotations: string[] = [];
		for (let i = 0; i < pattern.length; i++) {
			rotations.push(pattern.slice(i) + pattern.slice(0, i));
		}
		return rotations;
	}

	/**
	 * Get the canonical rotation of a pattern (lexicographically smallest)
	 * @param pattern - The pattern to get canonical form for
	 * @returns The canonical rotation
	 */
	private static getCanonicalRotation(pattern: string): string {
		return this.getAllRotations(pattern).sort()[0];
	}

	/**
	 * Find the repeating base of a pattern, if any
	 * @param pattern - The pattern to check
	 * @returns The repeating base pattern, or null if it doesn't repeat
	 */
	public static findRepeatingBase(pattern: string): string | null {
		for (let subLength = 1; subLength <= Math.floor(pattern.length / 2); subLength++) {
			// Skip if the pattern length isn't a multiple of the subpattern length
			if (pattern.length % subLength !== 0) continue;

			const subpattern = pattern.substring(0, subLength);
			const repeats = pattern.length / subLength;

			// Check if repeating the subpattern gives us the original pattern
			if (pattern === subpattern.repeat(repeats)) {
				return subpattern;
			}
		}

		return null;
	}

	/**
	 * Clear the pattern cache
	 */
	public static clearCache(): void {
		this.patternCache.clear();
	}
}
