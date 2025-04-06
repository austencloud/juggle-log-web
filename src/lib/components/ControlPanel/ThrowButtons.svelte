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