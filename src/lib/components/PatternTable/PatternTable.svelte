<script lang="ts">
    import { onMount } from 'svelte';
    import PatternRow from './PatternRow.svelte';
    import { SortType, SortOrder } from '$lib/types/types';
    import { patternDataList, sortConfig, updateSort } from '$lib/stores/patternStore';
    
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
    
    {#if $patternDataList === undefined || $patternDataList.length === 0}
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
            {#each $patternDataList as patternData, i (patternData.pattern)}
              <PatternRow patternData={patternData} evenRow={i % 2 === 0} />
            {/each}
          </tbody>
        </table>
      </div>
      
      <div class="table-summary">
        <p>Showing {$patternDataList.length} patterns</p>
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