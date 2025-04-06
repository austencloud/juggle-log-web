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