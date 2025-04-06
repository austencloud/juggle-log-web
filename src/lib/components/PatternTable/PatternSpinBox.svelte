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