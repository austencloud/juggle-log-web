/**
 * Manual validation test utility
 * Tests the enhanced siteswap validation system
 */

import { SiteswapService } from '../services/siteswapService';
import { SiteswapGenerator } from '../services/siteswapGenerator';

export interface TestResult {
  pattern: string;
  expected: 'valid' | 'invalid';
  actual: 'valid' | 'invalid';
  passed: boolean;
  errors: string[];
  reason: string;
}

export function runValidationTests(): TestResult[] {
  const results: TestResult[] = [];

  // Test cases that should be invalid
  const invalidCases = [
    { pattern: '342', reason: 'Should fail collision detection - balls land in same position' },
    { pattern: '333', reason: 'Should fail collision detection - all balls land at same time' },
    { pattern: '123', reason: 'Should fail average theorem - sum=6, length=3, avg=2 (not integer objects)' },
    { pattern: '456', reason: 'Should fail collision detection' },
    { pattern: '111', reason: 'Should fail collision detection - all balls land together' },
    { pattern: '222', reason: 'Should fail collision detection' }
  ];

  // Test cases that should be valid
  const validCases = [
    { pattern: '3', reason: 'Basic 3-ball cascade' },
    { pattern: '441', reason: 'Classic 3-ball pattern with high throw' },
    { pattern: '531', reason: 'Valid 3-ball pattern (box)' },
    { pattern: '4', reason: 'Basic 4-ball fountain' },
    { pattern: '534', reason: 'Valid 4-ball pattern' },
    { pattern: '5', reason: 'Basic 5-ball cascade' },
    { pattern: '423', reason: 'Valid 3-ball columns pattern' }
  ];

  console.log('🧪 Running enhanced validation tests...');

  // Test invalid patterns
  for (const testCase of invalidCases) {
    const validation = SiteswapService.validateSiteswap(testCase.pattern);
    const result: TestResult = {
      pattern: testCase.pattern,
      expected: 'invalid',
      actual: validation.isValid ? 'valid' : 'invalid',
      passed: !validation.isValid,
      errors: validation.errors,
      reason: testCase.reason
    };
    results.push(result);
    
    console.log(`${result.passed ? '✅' : '❌'} ${testCase.pattern}: ${result.passed ? 'CORRECTLY INVALID' : 'INCORRECTLY VALID'}`);
    if (!result.passed) {
      console.log(`   Expected: invalid, Got: valid`);
    } else if (validation.errors.length > 0) {
      console.log(`   Validation errors: ${validation.errors.join(', ')}`);
    }
  }

  // Test valid patterns
  for (const testCase of validCases) {
    const validation = SiteswapService.validateSiteswap(testCase.pattern);
    const result: TestResult = {
      pattern: testCase.pattern,
      expected: 'valid',
      actual: validation.isValid ? 'valid' : 'invalid',
      passed: validation.isValid,
      errors: validation.errors,
      reason: testCase.reason
    };
    results.push(result);
    
    console.log(`${result.passed ? '✅' : '❌'} ${testCase.pattern}: ${result.passed ? 'CORRECTLY VALID' : 'INCORRECTLY INVALID'}`);
    if (!result.passed) {
      console.log(`   Expected: valid, Got: invalid - ${validation.errors.join(', ')}`);
    }
  }

  return results;
}

export function testPatternGeneration(): void {
  console.log('🎲 Testing enhanced pattern generation...');

  // Test generation for different object counts
  for (const objectCount of [3, 4, 5]) {
    console.log(`\n--- Testing ${objectCount}-ball pattern generation ---`);
    
    const startTime = performance.now();
    
    try {
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

      console.log(`⏱️ Generated ${patterns.length} patterns in ${generationTime}ms`);

      // Validate all generated patterns
      let allValid = true;
      const invalidPatterns: string[] = [];

      for (const pattern of patterns.slice(0, 10)) { // Test first 10 patterns
        const validation = SiteswapService.validateSiteswap(pattern.pattern);
        if (!validation.isValid) {
          allValid = false;
          invalidPatterns.push(pattern.pattern);
          console.log(`❌ Invalid pattern generated: ${pattern.pattern} - ${validation.errors.join(', ')}`);
        }
      }

      if (allValid) {
        console.log(`✅ All tested patterns are valid!`);
        console.log(`📋 Examples: ${patterns.slice(0, 5).map(p => p.pattern).join(', ')}`);
      } else {
        console.log(`❌ Found ${invalidPatterns.length} invalid patterns: ${invalidPatterns.join(', ')}`);
      }

    } catch (error) {
      console.error(`❌ Generation failed for ${objectCount}-ball patterns:`, error);
    }
  }
}

export function testRandomGeneration(): void {
  console.log('\n🎯 Testing random pattern generation...');

  for (let i = 0; i < 10; i++) {
    const randomPattern = SiteswapGenerator.generateRandomPattern(3, 6);
    
    if (randomPattern) {
      const validation = SiteswapService.validateSiteswap(randomPattern.pattern);
      const status = validation.isValid ? '✅ VALID' : '❌ INVALID';
      console.log(`${status} Random pattern ${i + 1}: ${randomPattern.pattern}`);
      
      if (!validation.isValid) {
        console.log(`   Errors: ${validation.errors.join(', ')}`);
      }
    } else {
      console.log(`❌ Failed to generate random pattern ${i + 1}`);
    }
  }
}

export function runAllTests(): void {
  console.log('🚀 Starting comprehensive siteswap validation tests...\n');
  
  const validationResults = runValidationTests();
  testPatternGeneration();
  testRandomGeneration();
  
  const passed = validationResults.filter(r => r.passed).length;
  const total = validationResults.length;
  
  console.log(`\n🏁 Validation Tests Summary: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All validation tests passed! Enhanced validation is working correctly.');
  } else {
    console.log('⚠️ Some validation tests failed. Check the results above.');
  }
}
