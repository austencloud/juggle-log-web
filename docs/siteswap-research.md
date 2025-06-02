# Siteswap Notation System Research & Implementation Guide

## Core Siteswap Principles

### Mathematical Foundation

**Siteswap** is a mathematical notation for juggling patterns where each digit represents the height of a throw:
- **0**: No throw (empty hand)
- **1**: Hand-to-hand pass (no air time)
- **2**: Low throw to same hand (lazy/column)
- **3**: Standard cascade throw to opposite hand
- **4**: Standard fountain throw to same hand (double)
- **5**: High throw to opposite hand
- **6**: High throw to same hand
- **7+**: Increasingly high throws

### The Average Theorem

**Core Rule**: `sum(throws) / pattern_length = object_count`

Examples:
- `3` (cascade): 3/1 = 3 balls
- `441`: (4+4+1)/3 = 9/3 = 3 balls
- `531`: (5+3+1)/3 = 9/3 = 3 balls
- `97531`: (9+7+5+3+1)/5 = 25/5 = 5 balls

### Pattern Types

1. **Asynchronous (Async)**: Alternating hands, odd-length patterns
   - Examples: `3`, `441`, `531`, `97531`
   - Most common type, natural hand alternation

2. **Synchronous (Sync)**: Both hands throw simultaneously, even-length
   - Notation: `(4,4)(4,0)`, `(6x,4)(4,6x)`
   - Parentheses indicate simultaneous throws
   - `x` indicates crossing throw

3. **Multiplex**: Multiple objects from one hand
   - Notation: `[34]`, `[44]1`, `[333]`
   - Brackets indicate multiple objects thrown together

### Validation Rules

1. **State-based validation**: Each throw must land in an available slot
2. **Collision detection**: No two objects can land in the same hand at the same time
3. **Ground state**: Pattern must return to starting configuration
4. **Parity**: Odd throws go to opposite hand, even throws stay in same hand

## Custom Notation to Siteswap Mapping

### Direct Mappings
```typescript
const BASIC_MAPPINGS = {
  'S': '3',  // Single (cascade throw)
  'D': '4',  // Double (fountain throw)
  'L': '2',  // Lazy (low same-hand throw)
  'F': '3',  // Flat (cascade height but different style)
  'B': '3',  // Behind back (cascade height)
  'P': '1',  // Penguin (hand-to-hand pass)
  'O': '5'   // Over top (high throw)
};
```

### Complex Mappings with Modifiers
- **F (Flat)**: `3` with style modifier (horizontal vs vertical)
- **B (Behind)**: `3` with position modifier (behind back)
- **P (Penguin)**: `1` or special case for under-leg passes
- **O (Over)**: `5` or higher depending on height

### Conversion Limitations

**Cannot Convert**:
1. Style variations at same height (Flat vs normal cascade)
2. Body position modifiers (Behind back, Under leg)
3. Catch variations (Claw, Penguin catch)
4. Timing variations within same siteswap value

**Fallback Strategies**:
1. Use base siteswap value with metadata tags
2. Store style information in separate fields
3. Maintain both notations for complete representation

## Integration Points

### Database Schema (Already Exists)
```sql
-- world_records table
pattern_siteswap VARCHAR(200)     -- Standard siteswap notation
pattern_custom VARCHAR(200)       -- Existing custom notation
pattern_description TEXT          -- Human-readable description

-- pattern_mappings table
custom_notation VARCHAR(200)      -- Custom pattern
siteswap_notation VARCHAR(200)    -- Equivalent siteswap
verified BOOLEAN                  -- Community verified conversion
```

### Service Integration Points

1. **WorldRecordsService**: Dual notation validation and storage
2. **RecordFilters**: Search across both notation types
3. **RecordCard**: Display both notations when available
4. **PatternGenerator**: Maintain existing custom pattern generation

### Search Enhancement Strategy

```typescript
// Enhanced search query
query = query.or(`
  pattern_siteswap.ilike.%${search}%,
  pattern_custom.ilike.%${search}%,
  pattern_description.ilike.%${search}%
`);
```

## Difficulty Calculation

### Siteswap Difficulty Factors
1. **Average height**: Higher throws = more difficulty
2. **Variance**: More variation in throw heights = more difficulty
3. **Pattern length**: Longer patterns = more difficulty
4. **Special elements**: Multiplexes, synchronous = bonus difficulty

### Formula
```typescript
difficulty = (averageHeight * 0.4) + 
            (variance * 0.3) + 
            (patternLength * 0.2) + 
            (specialElements * 0.1)
```

## Implementation Priority

### Phase 2: Core Services
1. SiteswapService - validation and analysis
2. PatternConverter - bidirectional conversion
3. Database integration enhancements

### Phase 3: UI Integration
1. Dual notation input fields
2. Real-time validation feedback
3. Automatic conversion preview
4. Enhanced search and filtering

### Phase 4: Testing & Validation
1. Standard pattern validation
2. Conversion accuracy testing
3. Edge case handling
4. Backward compatibility verification

## Standard Test Patterns

### Basic Patterns
- `3`: 3-ball cascade
- `4`: 4-ball fountain
- `5`: 5-ball cascade

### Intermediate Patterns
- `441`: 3-ball flash pattern
- `531`: 3-ball high-low pattern
- `423`: 3-ball columns

### Advanced Patterns
- `97531`: 5-ball high-low cascade
- `(4,4)(4,0)`: 4-ball synchronous fountain
- `[34]`: 3-ball multiplex

### Edge Cases
- `0`: Empty pattern (no throws)
- `1`: Hand-to-hand passes only
- `a` (10): Very high throws
- Invalid: `24` (doesn't average to integer)

This research foundation will guide the implementation of a professional-grade siteswap system that enhances the platform's credibility while maintaining full backward compatibility with existing custom notation workflows.
