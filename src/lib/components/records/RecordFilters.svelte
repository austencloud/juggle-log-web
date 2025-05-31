<!-- src/lib/components/records/RecordFilters.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { RecordFilters } from '../../stores/worldRecordsStore';
  
  export let filters: RecordFilters = {};
  
  const dispatch = createEventDispatcher<{
    filtersChanged: RecordFilters;
    clearFilters: void;
  }>();
  
  // Filter options
  const categories = [
    { value: 'balls', label: 'Balls' },
    { value: 'clubs', label: 'Clubs' },
    { value: 'rings', label: 'Rings' },
    { value: 'bounce', label: 'Ball Bouncing' },
    { value: 'diabolo', label: 'Diabolo' },
    { value: 'other', label: 'Other' }
  ];
  
  const subcategories = [
    { value: 'force', label: 'Force Bounce' },
    { value: 'lift', label: 'Lift Bounce' },
    { value: 'high', label: 'High Diabolo' },
    { value: 'low', label: 'Low Diabolo' },
    { value: 'sync', label: 'Synchronous' },
    { value: 'async', label: 'Asynchronous' }
  ];
  
  const recordTypes = [
    { value: 'endurance', label: 'Endurance' },
    { value: 'flash', label: 'Flash' },
    { value: 'technical', label: 'Technical' },
    { value: 'speed', label: 'Speed' }
  ];
  
  const verificationStatuses = [
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'disputed', label: 'Disputed' }
  ];
  
  // Object count options (1-15)
  const objectCounts = Array.from({ length: 15 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'object' : 'objects'}`
  }));
  
  let searchInput = filters.search || '';
  let selectedCategory = filters.category || '';
  let selectedSubcategory = filters.subcategory || '';
  let selectedObjectCount = filters.objectCount || '';
  let selectedRecordType = filters.recordType || '';
  let selectedVerificationStatus = filters.verificationStatus || '';
  
  // Reactive updates
  $: {
    const newFilters: RecordFilters = {};
    
    if (searchInput.trim()) newFilters.search = searchInput.trim();
    if (selectedCategory) newFilters.category = selectedCategory;
    if (selectedSubcategory) newFilters.subcategory = selectedSubcategory;
    if (selectedObjectCount) newFilters.objectCount = Number(selectedObjectCount);
    if (selectedRecordType) newFilters.recordType = selectedRecordType;
    if (selectedVerificationStatus) newFilters.verificationStatus = selectedVerificationStatus;
    
    dispatch('filtersChanged', newFilters);
  }
  
  function clearAllFilters() {
    searchInput = '';
    selectedCategory = '';
    selectedSubcategory = '';
    selectedObjectCount = '';
    selectedRecordType = '';
    selectedVerificationStatus = '';
    
    dispatch('clearFilters');
  }
  
  function hasActiveFilters(): boolean {
    return !!(
      searchInput ||
      selectedCategory ||
      selectedSubcategory ||
      selectedObjectCount ||
      selectedRecordType ||
      selectedVerificationStatus
    );
  }
  
  // Filter subcategories based on selected category
  $: availableSubcategories = selectedCategory === 'bounce' 
    ? subcategories.filter(sub => ['force', 'lift'].includes(sub.value))
    : selectedCategory === 'diabolo'
    ? subcategories.filter(sub => ['high', 'low'].includes(sub.value))
    : subcategories.filter(sub => ['sync', 'async'].includes(sub.value));
</script>

<div class="record-filters">
  <div class="filters-header">
    <h3>Filter Records</h3>
    {#if hasActiveFilters()}
      <button class="clear-button" on:click={clearAllFilters}>
        Clear All
      </button>
    {/if}
  </div>
  
  <div class="filters-grid">
    <!-- Search -->
    <div class="filter-group">
      <label for="search">Search</label>
      <input
        id="search"
        type="text"
        bind:value={searchInput}
        placeholder="Search patterns, descriptions..."
        class="filter-input"
      />
    </div>
    
    <!-- Category -->
    <div class="filter-group">
      <label for="category">Category</label>
      <select id="category" bind:value={selectedCategory} class="filter-select">
        <option value="">All Categories</option>
        {#each categories as category}
          <option value={category.value}>{category.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- Subcategory -->
    {#if selectedCategory && availableSubcategories.length > 0}
      <div class="filter-group">
        <label for="subcategory">Subcategory</label>
        <select id="subcategory" bind:value={selectedSubcategory} class="filter-select">
          <option value="">All Subcategories</option>
          {#each availableSubcategories as subcategory}
            <option value={subcategory.value}>{subcategory.label}</option>
          {/each}
        </select>
      </div>
    {/if}
    
    <!-- Object Count -->
    <div class="filter-group">
      <label for="objectCount">Object Count</label>
      <select id="objectCount" bind:value={selectedObjectCount} class="filter-select">
        <option value="">Any Count</option>
        {#each objectCounts as count}
          <option value={count.value}>{count.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- Record Type -->
    <div class="filter-group">
      <label for="recordType">Record Type</label>
      <select id="recordType" bind:value={selectedRecordType} class="filter-select">
        <option value="">All Types</option>
        {#each recordTypes as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
    </div>
    
    <!-- Verification Status -->
    <div class="filter-group">
      <label for="verificationStatus">Status</label>
      <select id="verificationStatus" bind:value={selectedVerificationStatus} class="filter-select">
        <option value="">All Statuses</option>
        {#each verificationStatuses as status}
          <option value={status.value}>{status.label}</option>
        {/each}
      </select>
    </div>
  </div>
</div>

<style>
  .record-filters {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .filters-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.1rem;
  }
  
  .clear-button {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .clear-button:hover {
    background: #dc2626;
  }
  
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
  }
  
  .filter-group label {
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .filter-input,
  .filter-select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    background: white;
  }
  
  .filter-input:focus,
  .filter-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }
  
  .filter-select {
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .filters-grid {
      grid-template-columns: 1fr;
    }
    
    .filters-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>
