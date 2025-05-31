<!-- src/lib/components/auth/AuthModal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { signInWithPassword, signUpWithPassword } from '../../supabase';
  import { enhancedUserStore } from '../../stores/enhancedUserStore';
  
  export let isOpen = false;
  export let mode: 'signin' | 'signup' = 'signin';
  
  const dispatch = createEventDispatcher();
  
  let email = '';
  let password = '';
  let username = '';
  let confirmPassword = '';
  let isLoading = false;
  let error = '';
  
  function closeModal() {
    isOpen = false;
    dispatch('close');
    resetForm();
  }
  
  function resetForm() {
    email = '';
    password = '';
    username = '';
    confirmPassword = '';
    error = '';
    isLoading = false;
  }
  
  function switchMode() {
    mode = mode === 'signin' ? 'signup' : 'signin';
    resetForm();
  }
  
  async function handleSubmit() {
    if (isLoading) return;
    
    error = '';
    
    // Validation
    if (!email || !password) {
      error = 'Email and password are required';
      return;
    }
    
    if (mode === 'signup') {
      if (!username) {
        error = 'Username is required';
        return;
      }
      
      if (password !== confirmPassword) {
        error = 'Passwords do not match';
        return;
      }
      
      if (password.length < 6) {
        error = 'Password must be at least 6 characters';
        return;
      }
    }
    
    isLoading = true;
    
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password);
      } else {
        await signUpWithPassword(email, password, username);
      }
      
      closeModal();
    } catch (err: any) {
      error = err.message || 'An error occurred';
    } finally {
      isLoading = false;
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    } else if (event.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
        <button class="close-button" on:click={closeModal}>×</button>
      </div>
      
      <form on:submit|preventDefault={handleSubmit}>
        {#if mode === 'signup'}
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              bind:value={username}
              placeholder="Enter your username"
              required
            />
          </div>
        {/if}
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="Enter your password"
            required
          />
        </div>
        
        {#if mode === 'signup'}
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              bind:value={confirmPassword}
              placeholder="Confirm your password"
              required
            />
          </div>
        {/if}
        
        {#if error}
          <div class="error-message">{error}</div>
        {/if}
        
        <button type="submit" class="submit-button" disabled={isLoading}>
          {#if isLoading}
            {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
          {:else}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          {/if}
        </button>
      </form>
      
      <div class="modal-footer">
        <p>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <button class="link-button" on:click={switchMode}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .modal-header h2 {
    margin: 0;
    color: var(--primary-color);
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .close-button:hover {
    color: #333;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }
  
  .error-message {
    background: #fee;
    color: #c33;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .submit-button {
    width: 100%;
    padding: 0.75rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .submit-button:hover:not(:disabled) {
    background: var(--primary-color-dark);
  }
  
  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .modal-footer {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .modal-footer p {
    margin: 0;
    color: #666;
  }
  
  .link-button {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    text-decoration: underline;
    font-size: inherit;
  }
  
  .link-button:hover {
    color: var(--primary-color-dark);
  }
</style>
