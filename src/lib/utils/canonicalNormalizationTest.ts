/**
 * Comprehensive test suite for canonical normalization
 */

import { SiteswapService } from '../services/siteswapService';
import { SiteswapGenerator } from '../services/siteswapGenerator';

export interface CanonicalTestCase {
  input: string;
  expectedCanonical: string;
  expectedType: 'constant' | 'cyclic' | 'already-canonical';
  description: string;
}

export interface GenerationTestResult {
  objectCount: number;
  totalGenerated: number;
  uniqueCanonical: number;
  duplicatesEliminated: number;
  examples: string[];
  generationTime: number;
}

export const CANONICAL_TEST_CASES: CanonicalTestCase[] = [
  // Cyclic rotation tests
  { input: '342', expectedCanonical: '423', expectedType: 'cyclic', description: 'Basic cyclic rotation - start with highest throw' },
  { input: '234', expectedCanonical: '423', expectedType: 'cyclic', description: 'Same pattern, different starting point' },
  { input: '423', expectedCanonical: '423', expectedType: 'already-canonical', description: 'Already in canonical form' },
  
  // Constant pattern tests
  { input: '333', expectedCanonical: '3', expectedType: 'constant', description: 'Constant pattern reduction' },
  { input: '4444', expectedCanonical: '4', expectedType: 'constant', description: 'Longer constant pattern' },
  { input: '55555', expectedCanonical: '5', expectedType: 'constant', description: 'Very long constant pattern' },
  
  // Patterns with zeros
  { input: '405', expectedCanonical: '504', expectedType: 'cyclic', description: 'Pattern with gap - rotate to start with highest' },
  { input: '054', expectedCanonical: '504', expectedType: 'cyclic', description: 'Same pattern with gap, different rotation' },
  { input: '540', expectedCanonical: '504', expectedType: 'cyclic', description: 'Another rotation of gap pattern' },
  
  // More complex patterns
  { input: '531', expectedCanonical: '531', expectedType: 'already-canonical', description: 'Box pattern already canonical' },
  { input: '315', expectedCanonical: '531', expectedType: 'cyclic', description: 'Box pattern rotated' },
  { input: '153', expectedCanonical: '531', expectedType: 'cyclic', description: 'Box pattern another rotation' },
  
  // Edge cases
  { input: '3', expectedCanonical: '3', expectedType: 'already-canonical', description: 'Single throw already canonical' },
  { input: '7', expectedCanonical: '7', expectedType: 'already-canonical', description: 'Single high throw' },
  { input: '0', expectedCanonical: '0', expectedType: 'already-canonical', description: 'Single zero throw' },
  
  // Patterns with multiple max values
  { input: '5151', expectedCanonical: '5151', expectedType: 'already-canonical', description: 'Multiple max values - lexicographically first' },
  { input: '1515', expectedCanonical: '5151', expectedType: 'cyclic', description: 'Same pattern, needs rotation' },
  
  // Higher throws (hex notation)
  { input: 'a23', expectedCanonical: 'a23', expectedType: 'already-canonical', description: 'Hex notation already canonical' },
  { input: '23a', expectedCanonical: 'a23', expectedType: 'cyclic', description: 'Hex notation needs rotation' },
];

export function runCanonicalNormalizationTests(): {
  passed: number;
  failed: number;
  results: Array<{
    testCase: CanonicalTestCase;
    passed: boolean;
    actualCanonical?: string;
    actualType?: string;
    error?: string;
  }>;
} {
  console.log('🧪 Running canonical normalization tests...');
  
  const results: Array<{
    testCase: CanonicalTestCase;
    passed: boolean;
    actualCanonical?: string;
    actualType?: string;
    error?: string;
  }> = [];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of CANONICAL_TEST_CASES) {
    try {
      const result = SiteswapService.normalizeToCanonical(testCase.input);
      
      const canonicalMatch = result.canonical === testCase.expectedCanonical;
      const typeMatch = result.normalizationType === testCase.expectedType;
      const testPassed = canonicalMatch && typeMatch;
      
      if (testPassed) {
        passed++;
        console.log(`✅ ${testCase.input} → ${result.canonical} (${result.normalizationType})`);
      } else {
        failed++;
        console.log(`❌ ${testCase.input} → Expected: ${testCase.expectedCanonical} (${testCase.expectedType}), Got: ${result.canonical} (${result.normalizationType})`);
      }
      
      results.push({
        testCase,
        passed: testPassed,
        actualCanonical: result.canonical,
        actualType: result.normalizationType
      });
      
    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ ${testCase.input} → Error: ${errorMessage}`);
      
      results.push({
        testCase,
        passed: false,
        error: errorMessage
      });
    }
  }
  
  console.log(`\n📊 Canonical normalization tests: ${passed}/${passed + failed} passed`);
  
  return { passed, failed, results };
}

export function testGenerationUniqueness(): GenerationTestResult[] {
  console.log('\n🎲 Testing pattern generation uniqueness...');
  
  const results: GenerationTestResult[] = [];
  
  for (const objectCount of [3, 4, 5]) {
    console.log(`\n--- Testing ${objectCount}-ball pattern generation ---`);
    
    const startTime = performance.now();
    
    const patterns = SiteswapGenerator.generatePatterns({
      objectCount,
      patternLength: 4,
      maxHeight: objectCount * 2,
      minHeight: 0,
      includeZeros: false,
      difficulty: 'any',
      patternType: 'any'
    });
    
    const endTime = performance.now();
    const generationTime = Math.round(endTime - startTime);
    
    // Check for duplicates by canonical form
    const canonicalForms = new Set<string>();
    const allPatterns: string[] = [];
    
    for (const pattern of patterns) {
      allPatterns.push(pattern.pattern);
      
      try {
        const canonical = SiteswapService.normalizeToCanonical(pattern.pattern).canonical;
        canonicalForms.add(canonical);
      } catch (error) {
        canonicalForms.add(pattern.pattern); // Fallback if normalization fails
      }
    }
    
    const totalGenerated = allPatterns.length;
    const uniqueCanonical = canonicalForms.size;
    const duplicatesEliminated = totalGenerated - uniqueCanonical;
    
    const result: GenerationTestResult = {
      objectCount,
      totalGenerated,
      uniqueCanonical,
      duplicatesEliminated,
      examples: Array.from(canonicalForms).slice(0, 10),
      generationTime
    };
    
    results.push(result);
    
    console.log(`📈 Generated: ${totalGenerated} patterns`);
    console.log(`🎯 Unique canonical: ${uniqueCanonical} patterns`);
    console.log(`🗑️ Duplicates eliminated: ${duplicatesEliminated}`);
    console.log(`⏱️ Generation time: ${generationTime}ms`);
    console.log(`📋 Examples: ${result.examples.slice(0, 5).join(', ')}`);
    
    if (duplicatesEliminated === 0) {
      console.log(`✅ Perfect uniqueness - no duplicates found!`);
    } else {
      console.log(`⚠️ Found ${duplicatesEliminated} duplicate patterns`);
    }
  }
  
  return results;
}

export function testEquivalenceDetection(): void {
  console.log('\n🔄 Testing pattern equivalence detection...');
  
  const equivalenceGroups = [
    ['342', '423', '234'], // Should all normalize to '423'
    ['531', '315', '153'], // Should all normalize to '531'
    ['405', '054', '540'], // Should all normalize to '504'
    ['333', '33333'], // Should all normalize to '3'
    ['4444', '44'], // Should all normalize to '4'
  ];
  
  for (const group of equivalenceGroups) {
    console.log(`\nTesting equivalence group: [${group.join(', ')}]`);
    
    const canonicalForms = new Set<string>();
    
    for (const pattern of group) {
      try {
        const result = SiteswapService.normalizeToCanonical(pattern);
        canonicalForms.add(result.canonical);
        console.log(`  ${pattern} → ${result.canonical}`);
      } catch (error) {
        console.log(`  ${pattern} → Error: ${error}`);
      }
    }
    
    if (canonicalForms.size === 1) {
      console.log(`✅ All patterns normalize to the same canonical form: ${Array.from(canonicalForms)[0]}`);
    } else {
      console.log(`❌ Patterns normalize to different forms: ${Array.from(canonicalForms).join(', ')}`);
    }
  }
}

export function runAllCanonicalTests(): void {
  console.log('🚀 Running comprehensive canonical normalization test suite...\n');
  
  const normalizationResults = runCanonicalNormalizationTests();
  const generationResults = testGenerationUniqueness();
  testEquivalenceDetection();
  
  console.log('\n🏁 Test Suite Summary:');
  console.log(`📝 Normalization tests: ${normalizationResults.passed}/${normalizationResults.passed + normalizationResults.failed} passed`);
  
  const totalGenerated = generationResults.reduce((sum, r) => sum + r.totalGenerated, 0);
  const totalUnique = generationResults.reduce((sum, r) => sum + r.uniqueCanonical, 0);
  const totalDuplicates = totalGenerated - totalUnique;
  
  console.log(`🎲 Generation tests: ${totalGenerated} patterns generated, ${totalUnique} unique, ${totalDuplicates} duplicates eliminated`);
  
  if (normalizationResults.failed === 0 && totalDuplicates === 0) {
    console.log('🎉 All tests passed! Canonical normalization is working perfectly.');
  } else {
    console.log('⚠️ Some tests failed. Check the results above for details.');
  }
}
