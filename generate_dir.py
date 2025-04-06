import os
import json

# Define the project structure
project_structure = {
    "src": {
        "app.css": """
:root {
  --primary-color: #3498db;
  --primary-dark: #2980b9;
  --text-color: #333;
  --text-light: #7f8c8d;
  --header-color: #2c3e50;
  --background-color: #f5f5f5;
  --card-background: #fff;
  --completed-color: rgba(144, 238, 144, 0.5);
  --border-color: #ddd;
  --stripe-color: #f9f9f9;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Font sizes */
  --font-size-sm: 0.9rem;
  --font-size-base: 1rem;
  --font-size-md: 1.1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-xxl: 2rem;
  --font-size-xxxl: 3rem;
  
  /* Border radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  line-height: 1.2;
  color: var(--header-color);
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  cursor: pointer;
}

/* Mobile-first responsive design */
@media (min-width: 768px) {
  html, body {
    font-size: 18px;
  }
}

@media (min-width: 1024px) {
  html, body {
    font-size: 18px;
  }
}
""",
        "app.d.ts": """
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
""",
        "app.html": """
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="description" content="JuggleLog - Track your juggling progress" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
""",
        "main.ts": """
import './app.css';
import App from './lib/components/App.svelte';

const app = new App({
  target: document.getElementById('app') || document.body,
});

export default app;
""",
        "routes": {
            "+page.svelte": """
<script lang="ts">
  import App from '$lib/components/App.svelte';
</script>

<App />
"""
        },
        "lib": {
            "components": {
                "App.svelte": """
<script lang="ts">
  import ControlPanel from './ControlPanel/ControlPanel.svelte';
  import PatternTable from './PatternTable/PatternTable.svelte';
  import { onMount } from 'svelte';
  
  // Track window size for responsive design
  let windowWidth: number;
  
  // Listen for window resize
  function handleResize() {
    windowWidth = window.innerWidth;
  }
  
  onMount(() => {
    // Set initial window width
    windowWidth = window.innerWidth;
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<svelte:window on:resize={handleResize} />

<div class="app-container">
  <header>
    <h1>Juggle Log</h1>
    <p class="subtitle">Track your juggling progress</p>
  </header>
  
  <main>
    <section class="table-section">
      <PatternTable />
    </section>
    
    <section class="control-section">
      <ControlPanel />
    </section>
  </main>
  
  <footer>
    <p>JuggleLog &copy; {new Date().getFullYear()}</p>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
  }
  
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    color: #2c3e50;
    margin: 0;
    font-size: 2.5rem;
  }
  
  .subtitle {
    color: #7f8c8d;
    margin: 0.5rem 0 0 0;
    font-size: 1.2rem;
  }
  
  main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .table-section {
    order: 2;
  }
  
  .control-section {
    order: 1;
  }
  
  footer {
    margin-top: 3rem;
    text-align: center;
    color: #7f8c8d;
    font-size: 0.9rem;
  }
  
  /* Responsive layout for larger screens */
  @media (min-width: 1024px) {
    main {
      flex-direction: row;
      align-items: flex-start;
    }
    
    .table-section {
      flex: 3;
      order: 1;
    }
    
    .control-section {
      flex: 2;
      order: 2;
      position: sticky;
      top: 2rem;
    }
    
    h1 {
      font-size: 3rem;
    }
    
    .subtitle {
      font-size: 1.5rem;
    }
  }
</style>
""",
                "ControlPanel": {
                    "ControlPanel.svelte": """
<script lang="ts">
  import ThrowButtons from './ThrowButtons.svelte';
  import PatternLengthInput from './PatternLengthInput.svelte';
</script>

<div class="control-panel">
  <h2>Juggling Controls</h2>
  
  <section class="throw-buttons-section">
    <h3>Select Throw Types</h3>
    <ThrowButtons />
  </section>
  
  <section class="pattern-length-section">
    <h3>Pattern Configuration</h3>
    <PatternLengthInput />
  </section>
</div>

<style>
  .control-panel {
    background-color: #f9f9f9;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-size: 1.5rem;
  }
  
  h3 {
    color: #34495e;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  section {
    margin-bottom: 2rem;
  }
  
  section:last-child {
    margin-bottom: 0;
  }
  
  @media (min-width: 768px) {
    h2 {
      font-size: 1.8rem;
    }
    
    h3 {
      font-size: 1.4rem;
    }
  }
</style>
""",
                    "PatternLengthInput.svelte": """
<script lang="ts">
  import { patternLength } from '$lib/stores/patternStore';
  
  // Minimum and maximum pattern length values
  const MIN_LENGTH = 1;
  const MAX_LENGTH = 10;
  
  // Handle input change
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    
    // Update pattern length if within valid range
    if (!isNaN(value) && value >= MIN_LENGTH && value <= MAX_LENGTH) {
      patternLength.set(value);
    }
  }
  
  // Increment pattern length
  function increment() {
    patternLength.update(length => Math.min(length + 1, MAX_LENGTH));
  }
  
  // Decrement pattern length
  function decrement() {
    patternLength.update(length => Math.max(length - 1, MIN_LENGTH));
  }
</script>

<div class="pattern-length-container">
  <label for="pattern-length">Pattern Length:</label>
  <div class="input-group">
    <button class="decrement" on:click={decrement} aria-label="Decrease pattern length">-</button>
    <input 
      id="pattern-length"
      type="number"
      min={MIN_LENGTH}
      max={MAX_LENGTH}
      bind:value={$patternLength}
      on:input={handleInput}
    />
    <button class="increment" on:click={increment} aria-label="Increase pattern length">+</button>
  </div>
</div>

<style>
  .pattern-length-container {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  label {
    font-weight: bold;
    margin-right: 1rem;
  }
  
  .input-group {
    display: flex;
    align-items: center;
  }
  
  input {
    width: 3rem;
    text-align: center;
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 0.25rem;
    font-size: 1rem;
    -moz-appearance: textfield; /* Firefox */
  }
  
  /* Remove arrow buttons in Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  button {
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 0.25rem;
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
  }
  
  button:hover {
    background-color: #2980b9;
  }
  
  @media (min-width: 768px) {
    label, input, button {
      font-size: 1.2rem;
    }
    
    button {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
</style>
""",
                    "ThrowButtons.svelte": """
<script lang="ts">
  import { THROW_BUTTONS } from '$lib/types/types';
  import { selectedThrows, toggleThrow } from '$lib/stores/patternStore';
  
  // Reactive variable to track which buttons are selected
  $: selectedSet = $selectedThrows;
  
  // Handle button click
  function handleThrowButtonClick(throwCode: string) {
    toggleThrow(throwCode);
  }
</script>

<div class="throw-buttons-container">
  {#each THROW_BUTTONS as throwButton, i}
    <button 
      type="button"
      class="throw-button" 
      class:selected={selectedSet.has(throwButton.code)}
      on:click={() => handleThrowButtonClick(throwButton.code)}
      title={throwButton.name}
    >
      {throwButton.code}
    </button>
  {/each}
</div>

<style>
  .throw-buttons-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .throw-button {
    background-color: white;
    border: 2px solid #ddd;
    border-radius: 0.25rem;
    padding: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: bold;
  }
  
  .throw-button:hover {
    background-color: #f5f5f5;
    border-color: #aaa;
  }
  
  .throw-button.selected {
    background-color: #3498db;
    color: white;
    border-color: #2980b9;
  }
  
  @media (min-width: 768px) {
    .throw-button {
      font-size: 1.2rem;
      padding: 0.75rem;
    }
  }
</style>
"""
                },
                "PatternTable": {
                    "PatternRow.svelte": """
<script lang="ts">
  import PatternSpinBox from './PatternSpinBox.svelte';
  import type { PatternData } from '$lib/types/types';
  
  export let patternData: PatternData;
  export let evenRow: boolean = false;
</script>

<tr class:even-row={evenRow} class:completed-row={patternData.isCompleted}>
  <td class="pattern-name">{patternData.pattern}</td>
  <td class="max-catches">
    <PatternSpinBox pattern={patternData.pattern} />
  </td>
  <td class="completion-date">
    {patternData.dateCompleted || ''}
  </td>
</tr>

<style>
  tr {
    transition: background-color 0.2s ease;
  }
  
  .even-row {
    background-color: #f9f9f9;
  }
  
  .completed-row {
    background-color: rgba(144, 238, 144, 0.5); /* Light green */
  }
  
  .completed-row.even-row {
    background-color: rgba(144, 238, 144, 0.6); /* Slightly darker green for even rows */
  }
  
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #ddd;
  }
  
  .pattern-name {
    font-weight: bold;
    font-family: monospace;
    font-size: 1.1rem;
  }
  
  .completion-date {
    text-align: center;
    color: #666;
  }
  
  @media (max-width: 768px) {
    td {
      padding: 0.5rem;
    }
    
    .pattern-name {
      font-size: 0.9rem;
    }
  }
</style>
""",
                    "PatternSpinBox.svelte": """
<script lang="ts">
  import { progressStore } from '$lib/stores/progressStore';
  
  export let pattern: string;
  
  // Get the initial value from the progress store
  let catches = progressStore.getMaxCatches(pattern);
  
  // Define min and max values for catch counter
  const MIN_CATCHES = 0;
  const MAX_CATCHES = 100;
  
  // Update progress when value changes
  function updateCatches() {
    progressStore.setMaxCatches(pattern, catches);
  }
  
  // Increment catches
  function increment() {
    if (catches < MAX_CATCHES) {
      catches++;
      updateCatches();
    }
  }
  
  // Decrement catches
  function decrement() {
    if (catches > MIN_CATCHES) {
      catches--;
      updateCatches();
    }
  }
  
  // Handle input change
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    
    if (!isNaN(value)) {
      catches = Math.max(MIN_CATCHES, Math.min(value, MAX_CATCHES));
      updateCatches();
    }
  }
</script>

<div class="pattern-spin-box">
  <button class="decrement" on:click={decrement} aria-label="Decrease max catches">-</button>
  <input 
    type="number"
    min={MIN_CATCHES}
    max={MAX_CATCHES}
    bind:value={catches}
    on:change={updateCatches}
    on:input={handleInput}
  />
  <button class="increment" on:click={increment} aria-label="Increase max catches">+</button>
</div>

<style>
  .pattern-spin-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  input {
    width: 3rem;
    text-align: center;
    padding: 0.4rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 0.9rem;
    -moz-appearance: textfield; /* Firefox */
  }
  
  /* Remove arrow buttons in Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  button {
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 0.25rem;
    width: 1.8rem;
    height: 1.8rem;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.3rem;
  }
  
  button:hover {
    background-color: #2980b9;
  }
  
  @media (min-width: 768px) {
    input, button {
      font-size: 1rem;
    }
    
    input {
      width: 3.5rem;
    }
    
    button {
      width: 2rem;
      height: 2rem;
    }
  }
</style>
""",
                    "PatternTable.svelte": """
<script lang="ts">
  import { onMount } from 'svelte';
  import PatternRow from './PatternRow.svelte';
  import { SortType, SortOrder } from '$lib/types/types';
  import { patternDataList, sortConfig, updateSort } from '$lib/stores/patternStore';
  import { derived } from 'svelte/store';
  
  // Get sorted pattern data
  const sortedPatterns = derived(patternDataList, $patternDataList => $patternDataList);
  
  // Column headers
  const columns = [
    { id: SortType.Pattern, name: 'Pattern' },
    { id: SortType.MaxCatches, name: 'Max Catches' },
    { id: SortType.Date, name: 'Date Completed' }
  ];
  
  // Handle header click for sorting
  function handleHeaderClick(sortType: SortType) {
    updateSort(sortType);
  }
  
  // Get sort direction indicator
  function getSortIndicator(columnType: SortType): string {
    if ($sortConfig.sortType !== columnType) {
      return '';
    }
    return $sortConfig.sortOrder === SortOrder.Ascending ? '↑' : '↓';
  }
</script>

<div class="pattern-table-container">
  <h2>Juggling Patterns</h2>
  
  {#if $sortedPatterns.length === 0}
    <div class="empty-state">
      <p>Select throw types to generate patterns</p>
    </div>
  {:else}
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            {#each columns as column}
              <th 
                class="sortable"
                on:click={() => handleHeaderClick(column.id)}
                class:active={$sortConfig.sortType === column.id}
              >
                {column.name} 
                <span class="sort-indicator">{getSortIndicator(column.id)}</span>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each $sortedPatterns as pattern, i (pattern.pattern)}
            <PatternRow patternData={pattern} evenRow={i % 2 === 0} />
          {/each}
        </tbody>
      </table>
    </div>
    
    <div class="table-summary">
      <p>Showing {$sortedPatterns.length} patterns</p>
    </div>
  {/if}
</div>

<style>
  .pattern-table-container {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-size: 1.5rem;
  }
  
  .table-wrapper {
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1rem;
  }
  
  th {
    text-align: left;
    padding: 1rem;
    background-color: #34495e;
    color: white;
    font-weight: normal;
    position: sticky;
    top: 0;
  }
  
  th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
  }
  
  th.sortable:hover {
    background-color: #2c3e50;
  }
  
  th.active {
    background-color: #2980b9;
  }
  
  .sort-indicator {
    display: inline-block;
    margin-left: 0.5rem;
    font-weight: bold;
  }
  
  .empty-state {
    background-color: #f9f9f9;
    border-radius: 0.25rem;
    padding: 2rem;
    text-align: center;
    color: #666;
  }
  
  .table-summary {
    text-align: right;
    color: #666;
    font-size: 0.9rem;
  }
  
  @media (min-width: 768px) {
    h2 {
      font-size: 1.8rem;
    }
    
    table {
      font-size: 1.1rem;
    }
  }
</style>
"""
                }
            },
            "stores": {
                "patternStore.ts": """
import { writable, derived, get } from 'svelte/store';
import { PatternGenerator } from '../utils/patternGenerator';
import { getPatternDataList } from './progressStore';
import type { PatternData } from '../types/types';
import { SortOrder, SortType } from '../types/types';

// Store for selected throws
export const selectedThrows = writable<Set<string>>(new Set());

// Store for pattern length
export const patternLength = writable<number>(3);

// Derived store for generated patterns
export const generatedPatterns = derived(
  [selectedThrows, patternLength],
  ([$selectedThrows, $patternLength]) => {
    const throwArray = Array.from($selectedThrows).sort();
    return PatternGenerator.generatePatterns(throwArray, $patternLength);
  }
);

// Current sort config
export const sortConfig = writable({
  sortType: SortType.Pattern,
  sortOrder: SortOrder.Ascending
});

// Derived store for pattern data with metadata (including sort)
export const patternDataList = derived(
  [generatedPatterns, sortConfig],
  ([$generatedPatterns, $sortConfig]) => {
    // First get the derived store for patterns with metadata
    const dataStore = getPatternDataList($generatedPatterns);
    
    // Return another derived store that sorts the data
    return derived(dataStore, ($dataStore) => {
      const sortedData = [...$dataStore];
      
      // Sort data based on current sort configuration
      sortedData.sort((a, b) => {
        let comparison = 0;
        
        switch ($sortConfig.sortType) {
          case SortType.Pattern:
            comparison = a.pattern.localeCompare(b.pattern);
            break;
            
          case SortType.MaxCatches:
            comparison = a.maxCatches - b.maxCatches;
            break;
            
          case SortType.Date:
            // Handle null dates (put them at the end)
            if (a.dateCompleted === null && b.dateCompleted === null) {
              comparison = 0;
            } else if (a.dateCompleted === null) {
              comparison = 1;
            } else if (b.dateCompleted === null) {
              comparison = -1;
            } else {
              // Parse dates for comparison
              const dateA = new Date(a.dateCompleted.replace(/-/g, '/'));
              const dateB = new Date(b.dateCompleted.replace(/-/g, '/'));
              comparison = dateA.getTime() - dateB.getTime();
            }
            break;
        }
        
        // Apply sort order
        return $sortConfig.sortOrder === SortOrder.Ascending ? 
          comparison : -comparison;
      });
      
      return sortedData;
    });
  }
);

// Helper functions to toggle throws
export function toggleThrow(throwCode: string): void {
  selectedThrows.update(throws => {
    const newThrows = new Set(throws);
    if (newThrows.has(throwCode)) {
      newThrows.delete(throwCode);
    } else {
      newThrows.add(throwCode);
    }
    return newThrows;
  });
}

// Update sort configuration
export function updateSort(sortType: SortType): void {
  sortConfig.update(config => {
    if (config.sortType === sortType) {
      // Toggle the order if the same column is clicked
      return {
        sortType,
        sortOrder: config.sortOrder === SortOrder.Ascending 
          ? SortOrder.Descending 
          : SortOrder.Ascending
      };
    } else {
      // New column, default to ascending
      return {
        sortType,
        sortOrder: SortOrder.Ascending
      };
    }
  });
}
""",
                "progressStore.ts": """
import { writable, derived, get } from 'svelte/store';
import type { ProgressData, PatternData } from '../types/types';
import { ProgressTracker } from '../utils/progressTracker';

// Initialize progress store with data from localStorage
const createProgressStore = () => {
  const initialData = ProgressTracker.loadProgress();
  const { subscribe, update, set } = writable<ProgressData>(initialData);

  return {
    subscribe,
    /**
     * Set max catches for a pattern and update completion status
     */
    setMaxCatches: (pattern: string, catches: number) => {
      update(data => {
        const updatedData = { ...data };
        
        // Check if this is a repeating pattern and update all related patterns
        if (ProgressTracker.isRepeatingPattern(pattern)) {
          const relatedPatterns = ProgressTracker.getRelatedPatterns(pattern);
          
          relatedPatterns.forEach(relatedPattern => {
            // Update max catches
            updatedData.maxCatches[relatedPattern] = catches;
            
            // Update completion status
            if (catches >= 100) {
              if (!updatedData.completedPatterns.includes(relatedPattern)) {
                updatedData.completedPatterns.push(relatedPattern);
              }
              // Set completion date if not already set
              if (!updatedData.completionDates[relatedPattern]) {
                updatedData.completionDates[relatedPattern] = ProgressTracker.getCurrentDate();
              }
            } else {
              // Remove from completed patterns
              updatedData.completedPatterns = updatedData.completedPatterns.filter(
                p => p !== relatedPattern
              );
              
              // Remove completion date if catches is 0
              if (catches === 0 && updatedData.completionDates[relatedPattern]) {
                delete updatedData.completionDates[relatedPattern];
              }
            }
          });
        } else {
          // Update single pattern
          updatedData.maxCatches[pattern] = catches;
          
          if (catches >= 100) {
            if (!updatedData.completedPatterns.includes(pattern)) {
updatedData.completedPatterns.push(pattern);
            }
            // Set completion date if not already set
            if (!updatedData.completionDates[pattern]) {
              updatedData.completionDates[pattern] = ProgressTracker.getCurrentDate();
            }
          } else {
            // Remove from completed patterns
            updatedData.completedPatterns = updatedData.completedPatterns.filter(
              p => p !== pattern
            );
            
            // Remove completion date if catches is 0
            if (catches === 0 && updatedData.completionDates[pattern]) {
              delete updatedData.completionDates[pattern];
            }
          }
        }
        
        // Save to localStorage
        ProgressTracker.saveProgress(updatedData);
        
        return updatedData;
      });
    },
    
    /**
     * Get completion status for a pattern
     */
    isCompleted: (pattern: string) => {
      const data = get({ subscribe });
      return data.maxCatches[pattern] >= 100;
    },
    
    /**
     * Get max catches for a pattern
     */
    getMaxCatches: (pattern: string) => {
      const data = get({ subscribe });
      return data.maxCatches[pattern] || 0;
    },
    
    /**
     * Get completion date for a pattern
     */
    getCompletionDate: (pattern: string) => {
      const data = get({ subscribe });
      return data.completionDates[pattern] || null;
    },
    
    /**
     * Reset store to initial state
     */
    reset: () => {
      const emptyData: ProgressData = {
        completedPatterns: [],
        maxCatches: {},
        completionDates: {}
      };
      
      ProgressTracker.saveProgress(emptyData);
      set(emptyData);
    }
  };
};

// Create and export the progress store
export const progressStore = createProgressStore();

// Derived store to get pattern data with metadata for a list of patterns
export const getPatternDataList = (patterns: string[]) => {
  return derived(progressStore, $progressStore => {
    return patterns.map(pattern => {
      const maxCatches = $progressStore.maxCatches[pattern] || 0;
      const isCompleted = maxCatches >= 100;
      const dateCompleted = $progressStore.completionDates[pattern] || null;
      
      return {
        pattern,
        maxCatches,
        dateCompleted,
        isCompleted
      } as PatternData;
    });
  });
};
"""
            },
            "types": {
                "types.ts": """
// Define the throw types
export type ThrowType = {
  code: string;
  name: string;
};

// Progress data structure
export interface ProgressData {
  completedPatterns: string[];
  maxCatches: Record<string, number>;
  completionDates: Record<string, string>;
}

// Pattern with metadata
export interface PatternData {
  pattern: string;
  maxCatches: number;
  dateCompleted: string | null;
  isCompleted: boolean;
}

// Sort order types
export enum SortOrder {
  Ascending = 'ascending',
  Descending = 'descending'
}

// Sort type for pattern table
export enum SortType {
  Pattern = 'pattern',
  MaxCatches = 'maxCatches',
  Date = 'date'
}

// Throw button definition
export const THROW_BUTTONS: ThrowType[] = [
  { code: "S", name: "Single" },
  { code: "D", name: "Double" },
  { code: "L", name: "Lazy" },
  { code: "F", name: "Flat" },
  { code: "B", name: "Behind the back" },
  { code: "P", name: "Penguin" },
  { code: "O", name: "Over the top" },
  { code: "Od", name: "Over the top double" },
  { code: "Us", name: "Under same leg" },
  { code: "Uo", name: "Under opposite leg" },
];
"""
            },
            "utils": {
                "patternGenerator.ts": """
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
""",
                "progressTracker.ts": """
import type { ProgressData } from '../types/types';

export class ProgressTracker {
  private static readonly MAX_PATTERN_LENGTH = 6;
  
  /**
   * Extract the repeating base of a pattern
   * For example:
   * - 'OdOdOd' returns 'Od'
   * - 'DDD' returns 'D'
   */
  public static extractRepeatingBase(pattern: string): string {
    for (let length = 1; length <= Math.floor(pattern.length / 2); length++) {
      const base = pattern.substring(0, length);
      // Check if the pattern is just repetitions of this base
      if (pattern === base.repeat(Math.floor(pattern.length / length))) {
        return base;
      }
    }
    return pattern; // If no repeating base is found, return the full pattern
  }
  
  /**
   * Check if a pattern consists of repeating substrings
   */
  public static isRepeatingPattern(pattern: string): boolean {
    const base = this.extractRepeatingBase(pattern);
    return pattern.length > base.length && 
           pattern === base.repeat(Math.floor(pattern.length / base.length));
  }
  
  /**
   * Get all related patterns with the same base sequence
   */
  public static getRelatedPatterns(pattern: string): string[] {
    const base = this.extractRepeatingBase(pattern);
    const relatedPatterns: string[] = [];
    
    for (let length = 1; length <= this.MAX_PATTERN_LENGTH; length++) {
      relatedPatterns.push(base.repeat(length));
    }
    
    return relatedPatterns;
  }
  
  /**
   * Format the current date in M-D-YYYY format
   */
  public static getCurrentDate(): string {
    const now = new Date();
    const month = (now.getMonth() + 1).toString();
    const day = now.getDate().toString();
    const year = now.getFullYear().toString();
    
    return `${month}-${day}-${year}`;
  }
  
  /**
   * Save progress data to local storage
   */
  public static saveProgress(data: ProgressData): void {
    localStorage.setItem('juggleLogProgress', JSON.stringify(data));
  }
  
  /**
   * Load progress data from local storage
   */
  public static loadProgress(): ProgressData {
    const storedData = localStorage.getItem('juggleLogProgress');
    
    if (storedData) {
      return JSON.parse(storedData) as ProgressData;
    }
    
    // Return default empty data if nothing is stored
    return {
      completedPatterns: [],
      maxCatches: {},
      completionDates: {}
    };
  }
}
"""
            }
        }
    }
}

# Create the root directory for the project
root_dir = 'svelte-app'
if not os.path.exists(root_dir):
    os.makedirs(root_dir)

# Function to create directories and files recursively
def create_structure(base_path, structure):
    for key, value in structure.items():
        path = os.path.join(base_path, key)
        
        if isinstance(value, dict):
            # If it's a dictionary, it's a directory
            if not os.path.exists(path):
                os.makedirs(path)
            create_structure(path, value)
        else:
            # If it's a string, it's a file
            with open(path, 'w') as f:
                f.write(value.strip())
            print(f"Created: {path}")

# Create the project files
create_structure(root_dir, project_structure)

# Create the package.json file at the root level
package_json = """
{
  "name": "juggle-log",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.2.7",
    "svelte-check": "^3.6.0",
    "tslib": "^2.6.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.3"
  },
  "dependencies": {}
}
"""

svelte_config = """
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: adapter()
    }
};

export default config;
"""

tsconfig = """
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
"""

vite_config = """
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()]
});
"""

readme = """"""