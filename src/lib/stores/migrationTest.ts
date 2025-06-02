// Migration Test - Simple demonstration of Svelte 5 runes working
// This file demonstrates that the basic runes functionality is working

import { isBrowser } from '../utils/browser';

/**
 * Simple test of Svelte 5 runes functionality
 */
export class SimpleRunesTest {
  // Basic reactive state
  private _count = $state(0);
  private _name = $state('Test');

  // Derived state
  readonly doubleCount = $derived(() => this._count * 2);
  readonly greeting = $derived(() => `Hello, ${this._name}!`);

  // Getters
  get count() { return this._count; }
  get name() { return this._name; }

  constructor() {
    // Effect to log changes
    $effect(() => {
      if (isBrowser) {
        console.log(`Count changed to: ${this._count}, Double: ${this.doubleCount}`);
      }
    });
  }

  increment() {
    this._count++;
  }

  setName(newName: string) {
    this._name = newName;
  }

  reset() {
    this._count = 0;
    this._name = 'Test';
  }
}

// Test the runes functionality
export function testRunes() {
  console.log('Testing Svelte 5 Runes...');
  
  const test = new SimpleRunesTest();
  
  console.log('Initial state:', {
    count: test.count,
    name: test.name,
    doubleCount: test.doubleCount,
    greeting: test.greeting
  });
  
  test.increment();
  test.setName('Svelte 5');
  
  console.log('After changes:', {
    count: test.count,
    name: test.name,
    doubleCount: test.doubleCount,
    greeting: test.greeting
  });
  
  return test;
}

// Export for testing
export const simpleRunesTest = new SimpleRunesTest();
