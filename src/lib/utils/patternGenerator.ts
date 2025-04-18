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

	// Helper to parse a pattern string into an array of throws, handling multi-character throws
	private static parsePattern(pattern: string, validThrows: string[]): string[] {
		if (!pattern) return [];

		// Sort throws by length descending to match longest first (e.g., "Us" before "U")
		const sortedThrows = [...validThrows].sort((a, b) => b.length - a.length);
		const result: string[] = [];
		let currentPos = 0;

		while (currentPos < pattern.length) {
			let foundMatch = false;
			for (const throwType of sortedThrows) {
				if (pattern.startsWith(throwType, currentPos)) {
					result.push(throwType);
					currentPos += throwType.length;
					foundMatch = true;
					break;
				}
			}
			// If no valid throw matches at the current position, advance by one character.
			// This handles potential malformed inputs but might lead to incorrect parsing if
			// the input string doesn't perfectly align with validThrows.
			if (!foundMatch) {
				// Optionally log a warning here if unexpected characters are encountered
				// console.warn(`Unexpected character or sequence found at position ${currentPos} in pattern "${pattern}"`);
				currentPos++;
			}
		}
		return result;
	}

	/**
	 * Generate patterns from selected throws and desired length
	 * @param throws - Array of selected throw types
	 * @param length - Length of each pattern
	 * @returns Array of unique patterns
	 */
	public static generatePatterns(throws: string[], length: number): string[] {
		if (!throws.length || length <= 0) return [];

		const cacheKey = `${throws.sort().join(',')}-${length}`; // Use comma for clarity with multi-char throws
		if (this.patternCache.has(cacheKey)) {
			return [...this.patternCache.get(cacheKey)!];
		}

		const allPatterns = new Set<string>();
		const queue: string[] = ['']; // Start with an empty pattern string
		let patternsChecked = 0;
		const validThrowsSet = new Set(throws); // Use the provided throws as the valid ones

		while (queue.length > 0 && patternsChecked < this.MAX_PATTERNS) {
			const currentPatternStr = queue.shift()!;
			patternsChecked++;

			// Parse the current string into its constituent throws
			const currentPatternThrows = this.parsePattern(currentPatternStr, throws);
			const currentLength = currentPatternThrows.length;

			if (currentLength === length) {
				// Only add if the parsed pattern string correctly reconstructs (handles edge cases from parsePattern)
				if (currentPatternThrows.join('') === currentPatternStr) {
					allPatterns.add(currentPatternStr);
				}
			} else if (currentLength < length) { // Only add more throws if below the target length
				for (const throwType of validThrowsSet) {
					// Check if adding the next throw would exceed the max pattern count check limit early
					// This is an approximation to prevent queue explosion near the limit
					if (patternsChecked + queue.length < this.MAX_PATTERNS) {
						queue.push(currentPatternStr + throwType);
					} else {
						// Avoid adding too many items to the queue if we are close to the limit
						break; // Stop adding new candidates for this branch
					}
				}
			}
			// If currentLength > length, it's implicitly discarded as it won't be processed further
		}

		if (patternsChecked >= this.MAX_PATTERNS) {
			console.warn(`Pattern generation stopped: exceeded maximum of ${this.MAX_PATTERNS} patterns checked/generated.`);
		}

		// Pass valid throws to filtering functions
		const uniquePatterns = this.filterUniquePatterns(allPatterns, throws);
		const sortedPatterns = Array.from(uniquePatterns).sort();

		this.patternCache.set(cacheKey, sortedPatterns);
		return sortedPatterns;
	}

	/**
	 * Filter out patterns that are rotations or repetitions of other patterns
	 * @param patterns - Set of all generated patterns
	 * @param validThrows - Array of valid throw types
	 * @returns Set of unique patterns
	 */
	private static filterUniquePatterns(patterns: Set<string>, validThrows: string[]): Set<string> {
		const uniquePatterns = new Set<string>();
		// Store canonical representations we've already added to avoid duplicates from different string representations
		const canonicalsAdded = new Set<string>();

		for (const pattern of patterns) {
			// Get the canonical rotation based on the parsed throws
			const canonicalRotation = this.getCanonicalRotation(pattern, validThrows);

			// Skip if this canonical form has already been added
			if (canonicalsAdded.has(canonicalRotation)) {
				continue;
			}

			// Check for repetition based on parsed throws
			const repeatingBase = this.findRepeatingBase(pattern, validThrows);
			if (repeatingBase) {
				const baseThrows = this.parsePattern(repeatingBase, validThrows);
				const patternThrows = this.parsePattern(pattern, validThrows);
				// Skip if it's a repetition of a shorter sequence of throws
				if (baseThrows.length < patternThrows.length) {
					continue;
				}
			}

			// Add the canonical rotation to our unique set and track it
			uniquePatterns.add(canonicalRotation);
			canonicalsAdded.add(canonicalRotation);
		}

		return uniquePatterns;
	}

	/**
	 * Get all possible rotations of a pattern
	 * @param pattern - The pattern to rotate
	 * @param validThrows - Array of valid throw types
	 * @returns Array of all possible rotations
	 */
	private static getAllRotations(pattern: string, validThrows: string[]): string[] {
		const throwsArray = this.parsePattern(pattern, validThrows);
		const rotations: string[] = [];
		const n = throwsArray.length;
		if (n === 0) return [];

		for (let i = 0; i < n; i++) {
			// Rotate the array of throws
			const rotatedArray = throwsArray.slice(i).concat(throwsArray.slice(0, i));
			// Join the rotated throws back into a string
			rotations.push(rotatedArray.join(''));
		}
		return rotations;
	}

	/**
	 * Get the canonical rotation of a pattern (lexicographically smallest)
	 * @param pattern - The pattern to get canonical form for
	 * @param validThrows - Array of valid throw types
	 * @returns The canonical rotation
	 */
	private static getCanonicalRotation(pattern: string, validThrows: string[]): string {
		const rotations = this.getAllRotations(pattern, validThrows);
		if (rotations.length === 0) return '';
		// Sort the string representations lexicographically
		return rotations.sort()[0];
	}

	/**
	 * Find the repeating base of a pattern, if any
	 * @param pattern - The pattern to check
	 * @param validThrows - Array of valid throw types
	 * @returns The repeating base pattern, or null if it doesn't repeat
	 */
	public static findRepeatingBase(pattern: string, validThrows: string[]): string | null {
		const throwsArray = this.parsePattern(pattern, validThrows);
		const n = throwsArray.length;

		// Iterate through possible lengths of the repeating base sequence
		for (let subLength = 1; subLength <= Math.floor(n / 2); subLength++) {
			// The total length must be divisible by the sub-sequence length
			if (n % subLength !== 0) continue;

			const subPatternThrows = throwsArray.slice(0, subLength);
			const repeats = n / subLength;
			let isRepeating = true;

			// Check if the rest of the pattern consists of repetitions of the sub-pattern
			for (let i = 1; i < repeats; i++) {
				const currentSegment = throwsArray.slice(i * subLength, (i + 1) * subLength);
				// Compare arrays element by element
				if (currentSegment.length !== subPatternThrows.length || !currentSegment.every((val, index) => val === subPatternThrows[index])) {
					isRepeating = false;
					break;
				}
			}

			if (isRepeating) {
				// Return the string representation of the repeating base
				return subPatternThrows.join('');
			}
		}

		return null; // No repeating base found
	}

	/**
	 * Clear the pattern cache
	 */
	public static clearCache(): void {
		this.patternCache.clear();
	}
}
