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
    appearance: textfield; /* Standard */
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