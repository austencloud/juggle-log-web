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