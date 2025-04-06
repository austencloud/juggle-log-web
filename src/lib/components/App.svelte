<script lang="ts">
  import ControlPanel from './ControlPanel/ControlPanel.svelte';
  import PatternTable from './PatternTable/PatternTable.svelte';
  import { onMount } from 'svelte';
  
  // Track window size for responsive design
  let windowWidth: number;
  
  // Listen for window resize
  function handleResize() {
    windowWidth = window.innerWidth;
  }
  
  onMount(() => {
    // Set initial window width
    windowWidth = window.innerWidth;
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<svelte:window on:resize={handleResize} />

<div class="app-container">
  <header>
    <h1>Juggle Log</h1>
    <p class="subtitle">Track your juggling progress</p>
  </header>
  
  <main>
    <section class="table-section">
      <PatternTable />
    </section>
    
    <section class="control-section">
      <ControlPanel />
    </section>
  </main>
  
  <footer>
    <p>JuggleLog &copy; {new Date().getFullYear()}</p>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
  }
  
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    color: #2c3e50;
    margin: 0;
    font-size: 2.5rem;
  }
  
  .subtitle {
    color: #7f8c8d;
    margin: 0.5rem 0 0 0;
    font-size: 1.2rem;
  }
  
  main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .table-section {
    order: 2;
  }
  
  .control-section {
    order: 1;
  }
  
  footer {
    margin-top: 3rem;
    text-align: center;
    color: #7f8c8d;
    font-size: 0.9rem;
  }
  
  /* Responsive layout for larger screens */
  @media (min-width: 1024px) {
    main {
      flex-direction: row;
      align-items: flex-start;
    }
    
    .table-section {
      flex: 3;
      order: 1;
    }
    
    .control-section {
      flex: 2;
      order: 2;
      position: sticky;
      top: 2rem;
    }
    
    h1 {
      font-size: 3rem;
    }
    
    .subtitle {
      font-size: 1.5rem;
    }
  }
</style>