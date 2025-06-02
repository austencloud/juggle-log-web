# Siteswap Canonical Normalization Theory

## Mathematical Foundation

### Pattern Equivalence Classes

In siteswap notation, patterns that are cyclic permutations of each other represent identical juggling sequences. This is because juggling patterns are inherently cyclic - the starting position is arbitrary.

**Theorem**: For any siteswap pattern P = (a₁, a₂, ..., aₙ), all cyclic rotations (a₂, a₃, ..., aₙ, a₁), (a₃, a₄, ..., aₙ, a₁, a₂), etc., represent the same physical juggling pattern.

**Proof**: The collision detection formula `(position + throw_height) % pattern_length` ensures that the landing positions remain consistent regardless of the starting beat, as long as the relative sequence is preserved.

### Canonical Form Definition

The **canonical form** of a siteswap pattern is the lexicographically smallest rotation that begins with the highest throw value in the pattern.

**Algorithm**:
1. Find the maximum throw value in the pattern
2. Among all positions containing the maximum value, choose the leftmost
3. Rotate the pattern to start at that position
4. If multiple rotations start with the same maximum value, choose the lexicographically smallest

### Constant Pattern Reduction

**Definition**: A constant pattern is one where all throws have the same value (e.g., "333", "4444").

**Canonical Rule**: Constant patterns reduce to their single throw value:
- "333" → "3"
- "4444" → "4" 
- "55555" → "5"

**Mathematical Justification**: Since `(n + n) % n = 0` for any constant n, all balls land in the same hand they were thrown from, creating a trivial pattern equivalent to the single throw.

## Implementation Rules

### 1. Periodic Patterns (Standard Async)

For patterns like "342", "234", "243":
- Maximum value: 4
- Rotations starting with 4: "423" (from "342" rotated)
- Canonical form: "423"

### 2. Patterns with Zeros

Zeros represent gaps (no throw) and must be preserved in their relative positions:
- "405" → "504" (rotate to start with maximum 5)
- "3040" → "4030" (rotate to start with maximum 4)

### 3. Synchronous Patterns

Format: `(x,y)(a,b)...` where each pair represents simultaneous throws.

**Canonical Rules**:
- Find the pair with the highest sum (x+y)
- If tied, use lexicographic ordering within pairs
- Rotate to start with the canonical pair

Example: `(2,4)(6,0)(4,2)` → `(6,0)(4,2)(2,4)`

### 4. Multiplex Patterns

Format: `[xy]z[ab]...` where brackets contain simultaneous throws from one hand.

**Canonical Rules**:
- Sort throws within each multiplex bracket
- Apply standard rotation rules to the sequence
- Preserve multiplex structure

Example: `[42]3[51]` → `[51][42]3` (if 5+1 > 4+2)

## Edge Cases and Exceptions

### 1. All-Zero Patterns
- "000" → "0" (constant reduction)
- Invalid in practice (no objects)

### 2. Single-Throw Patterns
- Already canonical by definition
- "3", "4", "5" remain unchanged

### 3. Palindromic Patterns
- May have multiple equivalent canonical forms
- Choose the one that starts with the highest value
- If tied, use leftmost position

### 4. Complex Multiplex
- `[43][21]` vs `[34][12]` - sort within brackets first
- Then apply rotation rules to bracket sequence

## Performance Considerations

### Time Complexity
- Pattern rotation: O(n²) where n is pattern length
- Maximum finding: O(n)
- Lexicographic comparison: O(n)
- Overall: O(n²) for worst case

### Space Complexity
- O(n) for storing rotations during comparison
- Can be optimized to O(1) with in-place rotation

### Optimization Strategies
1. **Early termination**: Stop when canonical form is found
2. **Caching**: Store canonical forms to avoid recomputation
3. **Generation-time normalization**: Generate canonical patterns directly

## Integration with Validation

### Mathematical vs Canonical Validity

**Mathematical Validity**: Pattern satisfies:
- Average theorem: `sum(throws) / length = integer`
- No collisions: `(position + throw) % length` unique for all throws
- State consistency: Returns to starting configuration

**Canonical Validity**: Pattern is in canonical form according to normalization rules

**Relationship**: All canonical patterns must be mathematically valid, but not all mathematically valid patterns are canonical.

### Validation Pipeline
1. Check mathematical validity
2. If valid, compute canonical form
3. Compare with original to determine if already canonical
4. Return both validity status and canonical form

## References

Based on research from:
- "Combinatorial aspects of juggling" (Mays, University of Melbourne)
- "Braids and Juggling Patterns" (Macauley & Orrison)
- "Juggling Drops and Descents" (UCSD Mathematics)
- Established conventions from JugglingLab and siteswap community

## Implementation Notes

### Backward Compatibility
- Existing pattern databases remain valid
- Canonical forms can be computed on-demand
- Migration strategy preserves all pattern data

### Performance Targets
- Normalization: <1ms for patterns up to length 20
- Generation: Only produce canonical forms
- Caching: Use canonical forms as unique keys

### Testing Requirements
- Verify all cyclic permutations normalize to same canonical form
- Confirm constant patterns reduce correctly
- Validate synchronous and multiplex handling
- Performance benchmarks for large pattern sets
