<!-- src/lib/components/PatternTable/PatternSpinBox.svelte -->
<script lang="ts">
  import { progressStore } from '$lib/stores/progressStore';
  import { onMount } from 'svelte';
  // Import gamification utilities
  import { gamificationStore } from '$lib/stores/gamificationStore';
  import { addNotification } from '$lib/stores/notificationStore';
  import { ExperienceType } from '$lib/types/gamification';
  
  export let storageKey: string; // Changed from pattern
  export let displayPattern: string; // Added for display
  export let labelId: string = '';
  export let descriptionId: string = '';
  
  // Get the initial value from the progress store using storageKey
  let catches = progressStore.getMaxCatches(storageKey);
  
  // Define min and max values for catch counter
  const MIN_CATCHES = 0;
  const MAX_CATCHES = 999; // Increased max value
  
  // Update progress when value changes, using storageKey
  function updateCatches(): void {
    catches = Math.max(MIN_CATCHES, Math.min(catches, MAX_CATCHES));
    
    // Record previous catches for comparison
    const previousCatches = progressStore.getMaxCatches(storageKey);
    
    // Update progress store
    progressStore.setMaxCatches(storageKey, catches);
    
    // Award XP for improvement if catches increased
    if (catches > previousCatches) {
      const improvement = catches - previousCatches;
      
      const xpResult = gamificationStore.addExperience({
        type: ExperienceType.PRACTICE,
        pattern: displayPattern,
        catchImprovement: improvement
      });
      
      // Display XP gain notification for significant improvements
      if (improvement >= 5) {
        addNotification(
          `+${xpResult.xp} XP for improving ${displayPattern} by ${improvement} catches!`,
          'info',
          3000
        );
      }
      
      // Check for level up
      if (xpResult.levelUp) {
        addNotification(
          `Level Up! You're now level ${$gamificationStore.level}`,
          'level',
          5000
        );
      }
    }
  }
  
  // Increment catches
  function increment(): void {
    if (catches < MAX_CATCHES) {
      catches++;
      updateCatches();
    }
  }
  
  // Decrement catches
  function decrement(): void {
    if (catches > MIN_CATCHES) {
      catches--;
      updateCatches();
    }
  }
  
  // Handle input change
  function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    
    if (!isNaN(value)) {
      catches = Math.max(MIN_CATCHES, Math.min(value, MAX_CATCHES));
      updateCatches();
    }
  }
  
  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        increment();
        break;
      case 'ArrowDown':
        event.preventDefault();
        decrement();
        break;
      case 'Home':
        event.preventDefault();
        catches = MIN_CATCHES;
        updateCatches();
        break;
      case 'End':
        event.preventDefault();
        catches = MAX_CATCHES;
        updateCatches();
        break;
      case 'PageUp':
        event.preventDefault();
        catches = Math.min(catches + 10, MAX_CATCHES);
        updateCatches();
        break;
      case 'PageDown':
        event.preventDefault();
        catches = Math.max(catches - 10, MIN_CATCHES);
        updateCatches();
        break;
    }
  }

  // Generate unique IDs using storageKey
  let inputId = `spinbox-${storageKey.replace(/[^a-zA-Z0-9]/g, '-')}`;
  let decrementId = `${inputId}-decrement`;
  let incrementId = `${inputId}-increment`;

  onMount(() => {
    // Ensure initial value is within bounds
    if (catches < MIN_CATCHES || catches > MAX_CATCHES || isNaN(catches)) {
      catches = Math.max(MIN_CATCHES, Math.min(catches || 0, MAX_CATCHES));
      updateCatches();
    }
  });
</script>

<div 
  class="pattern-spin-box" 
  role="group"
  aria-labelledby={labelId || null}
  aria-describedby={descriptionId || null}
>
  <button 
    id={decrementId}
    class="decrement" 
    on:click={decrement} 
    aria-label={`Decrease catches for pattern ${displayPattern}`} 
    aria-controls={inputId}
    tabindex="0"
    disabled={catches <= MIN_CATCHES}
    type="button"
  >
    <span aria-hidden="true">-</span>
  </button>
  
  <input 
    id={inputId}
    type="number"
    min={MIN_CATCHES}
    max={MAX_CATCHES}
    bind:value={catches}
    on:change={updateCatches}
    on:input={handleInput}
    on:keydown={handleKeydown}
    aria-label={`Maximum catches for pattern ${displayPattern}: ${catches}`}
    aria-valuemin={MIN_CATCHES}
    aria-valuemax={MAX_CATCHES}
    aria-valuenow={catches}
    autocomplete="off"
    tabindex="0"
  />
  
  <button 
    id={incrementId}
    class="increment" 
    on:click={increment} 
    aria-label={`Increase catches for pattern ${displayPattern}`} 
    aria-controls={inputId}
    tabindex="0"
    disabled={catches >= MAX_CATCHES}
    type="button"
  >
    <span aria-hidden="true">+</span>
  </button>
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
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    background-color: var(--background-light);
    color: var(--text-color);
    appearance: textfield; /* Standard */
    -moz-appearance: textfield; /* Firefox */
    transition: 
      border-color var(--transition-quick),
      box-shadow var(--transition-quick);
  }
  
  input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }
  
  /* Remove arrow buttons in Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius-sm);
    width: 1.8rem;
    height: 1.8rem;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.3rem;
    transition: 
      background-color var(--transition-quick),
      transform var(--transition-quick),
      opacity var(--transition-quick);
  }
  
  button:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.4);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (min-width: 768px) {
    input, button {
      font-size: var(--font-size-base);
    }
    
    input {
      width: 3.5rem;
    }
    
    button {
      width: 2rem;
      height: 2rem;
    }
  }

  /* High contrast mode adjustments */
  @media (prefers-contrast: high) {
    button {
      border: 1px solid black;
      background-color: #0070cc;
    }

    input {
      border: 1px solid black;
    }
  }
</style>