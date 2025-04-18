<script lang="ts">
    // Import necessary functions and types
    import { progressStore } from '$lib/stores/progressStore';
    import { showToast } from '$lib/stores/uiStore';
    import { fade, fly } from 'svelte/transition';
    import type { ProgressData } from '$lib/types/types';
  
    // Component state variables
    let isModalOpen = false; // Controls modal visibility
    let importData = ''; // Holds data pasted by the user for import
    let exportData = ''; // Holds data generated for export
    let activeTab: 'import' | 'export' = 'export'; // Tracks the active tab in the modal
  
    /**
     * Exports the current progress data from the store to a JSON string.
     * Displays a success or error toast message.
     */
    function handleExport() {
      try {
        // Retrieve data from the progress store via its export method
        exportData = progressStore.exportData();
        showToast('Data exported successfully!', 'success');
      } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Error exporting data', 'error');
      }
    }
  
    /**
     * Imports progress data from the JSON string provided by the user.
     * Validates the input and updates the progress store.
     * Displays success or error toast messages.
     */
    function handleImport() {
      try {
        // Basic validation: Check if the import data field is empty
        if (!importData.trim()) {
          showToast('Please paste your JSON data first', 'error');
          return;
        }
  
        // Attempt to import data using the progress store's import method
        const success = progressStore.importData(importData);
  
        // If import is successful, clear the input field and close the modal
        if (success) {
          importData = ''; // Clear the textarea
          closeModal(); // Close the modal window
          // Success toast is likely handled within progressStore.importData or should be added here if not
        }
        // Error handling (like invalid JSON) is expected within progressStore.importData
      } catch (error) {
        // Catch potential errors during the import process (e.g., JSON parsing)
        console.error('Error importing data:', error);
        showToast('Error importing data: Invalid format', 'error');
      }
    }
  
    /**
     * Opens the import/export modal.
     * Automatically triggers an export if the export tab is initially active.
     */
    function openModal() {
      isModalOpen = true;
      // Pre-populate export data if opening directly to the export tab
      if (activeTab === 'export') {
        handleExport();
      }
    }
  
    /**
     * Closes the import/export modal.
     * Resets the import and export data fields.
     */
    function closeModal() {
      isModalOpen = false;
      importData = ''; // Clear import textarea
      exportData = ''; // Clear export data
    }
  
    /**
     * Switches between the 'import' and 'export' tabs within the modal.
     * Triggers an export action when switching to the 'export' tab.
     * @param tab The tab to switch to ('import' or 'export').
     */
    function switchTab(tab: 'import' | 'export') {
      activeTab = tab;
      // Refresh export data when switching back to the export tab
      if (tab === 'export') {
        handleExport();
      }
    }
  
    /**
     * Selects all text within the target textarea element when clicked.
     * Useful for easily copying the exported data.
     * @param e The mouse event object.
     */
    function handleTextareaClick(e: Event) {
      const target = e.target;
      // Ensure the target is an HTMLTextAreaElement before calling select()
      if (target && target instanceof HTMLTextAreaElement) {
        target.select();
      }
    }
  
    /**
     * Handles keydown events globally.
     * Closes the modal ONLY if it's open and the 'Escape' key is pressed.
     * This function is attached to <svelte:window> at the top level of the template.
     * @param e The keyboard event object.
     */
    function handleModalKeydown(e: KeyboardEvent) {
      // FIX: Check if modal is open before closing on Escape key press
      if (isModalOpen && e.key === 'Escape') {
        closeModal();
      }
    }
  </script>
  
  <svelte:window on:keydown={handleModalKeydown}/>
  
  <button
    class="import-export-button"
    on:click={openModal}
    aria-label="Import or Export Progress Data"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true" >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    <span>Import/Export</span>
  </button>
  
  {#if isModalOpen}
    <button
      type="button"
      class="modal-overlay"
      transition:fade={{ duration: 200 }}
      on:click={closeModal} aria-label="Close modal" >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <div
        class="modal-content"
        role="dialog"           aria-modal="true"       aria-labelledby="dialog-title" on:click|stopPropagation={() => {}} in:fly={{ y: 20, duration: 300 }} >
        <div class="modal-header">
          <h2 id="dialog-title">Juggling Progress Data</h2>
          <button
            class="close-button"
            on:click={closeModal}
            aria-label="Close dialog" >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true" >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
  
        <div class="modal-tabs" role="tablist" aria-labelledby="dialog-title">
          <button
            id="tab-export"
            class="tab-button"
            class:active={activeTab === 'export'} role="tab"                             aria-selected={activeTab === 'export'} aria-controls="panel-export"           on:click={() => switchTab('export')}   >
            Export
          </button>
          <button
            id="tab-import"
            class="tab-button"
            class:active={activeTab === 'import'}
            role="tab"
            aria-selected={activeTab === 'import'}
            aria-controls="panel-import"
            on:click={() => switchTab('import')}
          >
            Import
          </button>
        </div>
  
        <div class="modal-body">
          {#if activeTab === 'export'}
            <div
              id="panel-export"
              class="export-section"
              role="tabpanel"             aria-labelledby="tab-export" tabindex="0"                 >
              <p class="description">Copy this data and save it somewhere safe:</p>
              <textarea
                class="data-textarea"
                readonly                     value={exportData}           on:click={handleTextareaClick} on:keydown={(e) => {         if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof HTMLTextAreaElement) {
                      e.preventDefault(); // Prevent adding newline/space
                      e.target.select();
                    }
                  }}
                aria-label="Exported data"   rows="10"                    ></textarea>
              <button
                class="action-button"
                type="button"
                on:click={() => {
                    navigator.clipboard.writeText(exportData);
                    showToast('Copied to clipboard!', 'success');
                  }}
              >
                Copy to Clipboard
              </button>
            </div>
          {:else}
            <div
              id="panel-import"
              class="import-section"
              role="tabpanel"
              aria-labelledby="tab-import"
              tabindex="0"
            >
              <p class="description">Paste your saved JSON data below:</p>
              <textarea
                class="data-textarea"
                bind:value={importData} rows="10"
                aria-label="Import data"
                placeholder="Paste your JSON data here... (should have 'completedPatterns', 'maxCatches', and 'completionDates')"
              ></textarea>
              <div class="button-group">
                <button class="action-button" on:click={handleImport}>
                  Import Data
                </button>
                <button class="cancel-button" on:click={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          {/if}
        </div> </div> </button> {/if}
  
  <style>
    /* Main button to open the modal */
    .import-export-button {
      display: flex;
      align-items: center;
      gap: 0.5rem; /* Space between icon and text */
      padding: 0.5rem 0.75rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: background-color var(--transition-quick);
    }
  
    .import-export-button:hover {
      background-color: var(--primary-dark);
    }
  
    /* Overlay styles - Applied to the <button> element */
    .modal-overlay {
      /* Layout and Positioning */
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex; /* Center modal content */
      justify-content: center;
      align-items: center;
      z-index: var(--z-modal); /* Ensure it's above other content */
  
      /* Appearance */
      background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
      padding: 1rem; /* Padding around the modal content */
  
      /* --- Button Reset Styles --- */
      border: none; /* Remove default button border */
      margin: 0; /* Reset margin */
      box-sizing: border-box; /* Consistent sizing */
      width: 100%; /* Cover full width */
      height: 100%; /* Cover full height */
      font: inherit; /* Use surrounding font */
      color: inherit; /* Use surrounding color */
      text-align: inherit; /* Use surrounding alignment */
      cursor: default; /* Use default cursor, not pointer */
      /* Consider focus styles for accessibility */
      /* outline: none; */ /* Removes default focus outline - use with caution */
    }
  
     /* Optional: Add a custom focus style if default outline is removed */
    /* .modal-overlay:focus { */
       /* outline: 2px solid var(--primary-color); */
       /* outline-offset: -2px; */
    /* } */
  
    /* Modal content container */
    .modal-content {
      width: 100%;
      max-width: 600px; /* Max width for larger screens */
      background-color: var(--card-background);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-lg);
      overflow: hidden; /* Prevents content spillover */
      display: flex; /* Use flexbox for internal layout */
      flex-direction: column; /* Stack header, tabs, body vertically */
      cursor: auto; /* Reset cursor for content area */
    }
  
    /* Modal header section */
    .modal-header {
      display: flex;
      justify-content: space-between; /* Title left, close button right */
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0; /* Prevent header from shrinking */
    }
  
    .modal-header h2 {
      margin: 0;
      font-size: var(--font-size-lg);
      color: var(--text-color); /* Ensure title color contrasts */
    }
  
    /* Close button inside the header */
    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-light);
      padding: 0.25rem;
      display: flex; /* Center icon */
      align-items: center;
      justify-content: center;
      border-radius: 50%; /* Circular background on hover */
      transition: background-color var(--transition-quick);
    }
  
    .close-button:hover {
      background-color: var(--background-lighter);
      color: var(--text-color); /* Darken icon on hover */
    }
  
    /* Tab container */
    .modal-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0; /* Prevent tabs from shrinking */
    }
  
    /* Individual tab buttons */
    .tab-button {
      flex: 1; /* Distribute space equally */
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-color);
      font-weight: var(--font-weight-medium);
      transition: all var(--transition-quick);
      border-bottom: 2px solid transparent; /* Placeholder for active indicator */
      text-align: center;
    }
  
    .tab-button:hover {
      background-color: var(--background-lighter);
    }
  
    /* Style for the active tab */
    .tab-button.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color); /* Highlight active tab */
    }
  
    /* Main content area of the modal */
    .modal-body {
      padding: 1.5rem;
      flex-grow: 1; /* Allow body to take remaining space */
      overflow-y: auto; /* Enable scrolling if content exceeds height */
    }
  
    /* Description text style */
    .description {
      margin-top: 0; /* Remove default top margin */
      margin-bottom: 0.75rem;
      font-size: var(--font-size-sm);
      color: var(--text-light);
    }
  
    /* Textarea for import/export data */
    .data-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      background-color: var(--background-lighter);
      color: var(--text-color);
      font-family: monospace; /* Use monospace for code/data */
      font-size: var(--font-size-sm);
      resize: vertical; /* Allow vertical resizing */
      margin-bottom: 1rem;
      min-height: 100px; /* Ensure a minimum height */
    }
  
    /* Container for action buttons (Import/Cancel) */
    .button-group {
      display: flex;
      gap: 0.75rem; /* Space between buttons */
      justify-content: flex-end; /* Align buttons to the right */
    }
  
    /* General action button style (Copy, Import) */
    .action-button {
      padding: 0.5rem 1rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-size: var(--font-size-sm);
      transition: background-color var(--transition-quick);
    }
  
    .action-button:hover {
      background-color: var(--primary-dark);
    }
  
    /* Cancel button style */
    .cancel-button {
      padding: 0.5rem 1rem;
      background-color: var(--background-lighter);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-size: var(--font-size-sm);
      transition: background-color var(--transition-quick);
    }
  
    .cancel-button:hover {
      background-color: var(--background-color);
    }
  
    /* Responsive adjustments for smaller screens */
    @media (max-width: 500px) {
      /* Make modal taller on small screens */
      .modal-content {
        height: 80vh; /* Use viewport height */
        /* Flex direction column is already set */
      }
  
      /* Ensure modal body scrolls */
      .modal-body {
        flex-grow: 1; /* Take available space */
        overflow-y: auto; /* Enable scrolling */
      }
  
      /* Adjust textarea height within the flexible body */
      .data-textarea {
         /* Example: Make textarea take most of the body height */
         /* Adjust calculation based on other elements in modal-body */
         min-height: 200px; /* Ensure reasonable minimum */
         flex-grow: 1; /* Allow textarea to grow if needed */
      }
  
      /* Stack buttons vertically if needed */
      .button-group {
        flex-direction: column;
        align-items: stretch; /* Make buttons full width */
      }
  
      .action-button, .cancel-button {
        width: 100%; /* Full width buttons */
      }
    }
  </style>
  