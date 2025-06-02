<!-- src/routes/world-records/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { worldRecordsStore, type RecordFilters } from '$lib/stores/worldRecordsStore';
  import { enhancedUserStore } from '$lib/stores/enhancedUserStore';
  import RecordCard from '$lib/components/records/RecordCard.svelte';
  import RecordFiltersComponent from '$lib/components/records/RecordFilters.svelte';
  import RecordSubmissionForm from '$lib/components/records/RecordSubmissionForm.svelte';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';

  let showAuthModal = false;
  let authMode: 'signin' | 'signup' = 'signin';
  let showSubmissionForm = false;

  // Reactive state from stores
  $: records = $worldRecordsStore.records;
  $: isLoading = $worldRecordsStore.isLoading;
  $: error = $worldRecordsStore.error;
  $: totalRecords = $worldRecordsStore.totalCount;
  $: currentPage = $worldRecordsStore.currentPage;
  $: totalPages = Math.ceil($worldRecordsStore.totalCount / $worldRecordsStore.pageSize);

  onMount(() => {
    // Load initial records
    worldRecordsStore.loadRecords();
  });

  function handleFiltersChanged(event: CustomEvent<RecordFilters>) {
    worldRecordsStore.setFilters(event.detail);
  }

  function handleClearFilters() {
    worldRecordsStore.clearFilters();
  }

  function handlePageChange(page: number) {
    worldRecordsStore.setPage(page);
  }

  function handleRecordDetails(event: CustomEvent<string>) {
    // TODO: Navigate to record detail page
    console.log('View record details:', event.detail);
  }

  function handlePlayVideo(event: CustomEvent<string>) {
    // TODO: Open video player modal
    console.log('Play video for record:', event.detail);
  }

  function openSubmissionForm() {
    if (!$enhancedUserStore.isAuthenticated) {
      showAuthModal = true;
      authMode = 'signin';
    } else {
      showSubmissionForm = true;
    }
  }

  function closeAuthModal() {
    showAuthModal = false;
  }

  function closeSubmissionForm() {
    showSubmissionForm = false;
  }

  function handleRecordSubmitted() {
    showSubmissionForm = false;
    // Reload records to show the new submission
    worldRecordsStore.loadRecords();
  }
</script>

<svelte:head>
  <title>World Records - Juggle Log</title>
  <meta name="description" content="Browse and submit juggling world records with video verification" />
</svelte:head>

<div class="world-records-page">
  <div class="page-header">
    <div class="header-content">
      <h1>🏆 Juggling World Records</h1>
      <p class="page-description">
        The definitive database of verified juggling world records. All records require video evidence and community verification.
      </p>
    </div>
    
    <div class="header-actions">
      <button class="submit-record-btn" on:click={openSubmissionForm}>
        <span class="btn-icon">📝</span>
        Submit Record
      </button>
    </div>
  </div>

  <div class="page-content">
    <aside class="filters-sidebar">
      <RecordFiltersComponent
        on:filtersChanged={handleFiltersChanged}
        on:clearFilters={handleClearFilters}
      />
    </aside>

    <main class="records-main">
      {#if error}
        <div class="error-message">
          <h3>⚠️ Error Loading Records</h3>
          <p>{error}</p>
          <button class="retry-btn" on:click={() => worldRecordsStore.loadRecords()}>
            Try Again
          </button>
        </div>
      {:else if isLoading}
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading world records...</p>
        </div>
      {:else if records.length === 0}
        <div class="empty-state">
          <h3>🎯 No Records Found</h3>
          <p>No records match your current filters. Try adjusting your search criteria or be the first to submit a record!</p>
          <button class="submit-first-btn" on:click={openSubmissionForm}>
            Submit First Record
          </button>
        </div>
      {:else}
        <div class="records-grid">
          {#each records as record (record.id)}
            <RecordCard 
              {record} 
              showVideo={true}
              on:viewDetails={handleRecordDetails}
              on:playVideo={handlePlayVideo}
            />
          {/each}
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
          <div class="pagination">
            <button 
              class="page-btn" 
              disabled={currentPage <= 1}
              on:click={() => handlePageChange(currentPage - 1)}
            >
              ← Previous
            </button>
            
            <span class="page-info">
              Page {currentPage} of {totalPages} ({totalRecords} records)
            </span>
            
            <button 
              class="page-btn" 
              disabled={currentPage >= totalPages}
              on:click={() => handlePageChange(currentPage + 1)}
            >
              Next →
            </button>
          </div>
        {/if}
      {/if}
    </main>
  </div>
</div>

<!-- Auth Modal -->
{#if showAuthModal}
  <AuthModal 
    isOpen={showAuthModal}
    mode={authMode}
    on:close={closeAuthModal}
  />
{/if}

<!-- Record Submission Modal -->
{#if showSubmissionForm}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" on:click={closeSubmissionForm}>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="modal-content" role="document" on:click|stopPropagation>
      <RecordSubmissionForm
        on:submitted={handleRecordSubmitted}
        on:cancelled={closeSubmissionForm}
      />
    </div>
  </div>
{/if}

<style>
  .world-records-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 4rem);
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    gap: 2rem;
  }

  .header-content h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    color: var(--header-color);
  }

  .page-description {
    color: var(--text-light);
    font-size: 1.1rem;
    margin: 0;
    max-width: 600px;
  }

  .header-actions {
    flex-shrink: 0;
  }

  .submit-record-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
  }

  .submit-record-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }

  .btn-icon {
    font-size: 1.2rem;
  }

  .page-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    align-items: start;
  }

  .filters-sidebar {
    position: sticky;
    top: 6rem;
  }

  .records-main {
    min-height: 400px;
  }

  .error-message,
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--card-background);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
  }

  .error-message h3,
  .empty-state h3 {
    margin: 0 0 1rem 0;
    color: var(--header-color);
  }

  .retry-btn,
  .submit-first-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    margin-top: 1rem;
    transition: background 0.3s;
  }

  .retry-btn:hover,
  .submit-first-btn:hover {
    background: var(--primary-dark);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .records-grid {
    display: grid;
    gap: 1.5rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    padding: 1rem;
  }

  .page-btn {
    background: var(--card-background);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: all 0.3s;
  }

  .page-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-info {
    color: var(--text-light);
    font-size: 0.9rem;
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--card-background);
    border-radius: var(--border-radius-md);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h2 {
    margin: 0;
    color: var(--header-color);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-light);
    padding: 0.25rem;
  }

  .close-btn:hover {
    color: var(--text-color);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-body ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .modal-body li {
    margin: 0.5rem 0;
    color: var(--text-light);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .world-records-page {
      padding: 1rem;
    }

    .page-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .page-content {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .filters-sidebar {
      position: static;
    }

    .header-content h1 {
      font-size: 2rem;
    }

    .pagination {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
