<script lang="ts">
  import { userStore, type User } from '$lib/stores/userStore';
  import { fade, slide } from 'svelte/transition';
  import { showToast } from '$lib/stores/uiStore';

  let showingPanel = false;
  let username = '';
  let confirmingReset = false;
  let confirmingDelete = false;
  let deletingUserId: string | null = null;
  
  $: currentUser = $userStore.currentUserId 
    ? $userStore.users.find(u => u.id === $userStore.currentUserId)
    : null;

  function togglePanel() {
    showingPanel = !showingPanel;
    username = '';
    confirmingReset = false;
    confirmingDelete = false;
    deletingUserId = null;
  }
  
  function createUser() {
    if (!username.trim()) {
      showToast('Please enter a username', 'error');
      return;
    }
    
    try {
      userStore.createUser(username);
      username = '';
      showToast('User created and logged in successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Error creating user', 'error');
    }
  }
  
  function handleLogin(userId: string) {
    userStore.loginUser(userId);
    showToast('Logged in successfully', 'success');
  }
  
  function handleLogout() {
    userStore.logout();
    showToast('Logged out successfully', 'info');
  }
  
  function startDeleteUser(userId: string) {
    deletingUserId = userId;
    confirmingDelete = true;
  }
  
  function confirmDeleteUser() {
    if (!deletingUserId) return;
    
    try {
      userStore.deleteUser(deletingUserId);
      showToast('User deleted successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Error deleting user', 'error');
    } finally {
      confirmingDelete = false;
      deletingUserId = null;
    }
  }
  
  function startResetData() {
    confirmingReset = true;
  }
  
  function confirmResetData() {
    userStore.resetUserData();
    showToast('All progress data has been reset', 'info');
    confirmingReset = false;
  }
  
  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
</script>

<button 
  class="user-button" 
  on:click={togglePanel}
  aria-label={showingPanel ? "Close user panel" : "Open user panel"}
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
  {#if currentUser}
    <span class="username">{currentUser.username}</span>
  {/if}
</button>

{#if showingPanel}
  <div class="user-panel" transition:slide={{ duration: 300 }}>
    <div class="panel-header">
      <h3>User Management</h3>
      <button class="close-button" on:click={togglePanel} aria-label="Close">×</button>
    </div>
    
    <div class="panel-content">
      {#if currentUser}
        <div class="current-user">
          <h4>Current User</h4>
          <div class="user-card active">
            <div class="user-info">
              <strong>{currentUser.username}</strong>
              <span>Joined: {formatDate(currentUser.createdAt)}</span>
            </div>
            <div class="user-actions">
              <button class="button secondary" on:click={startResetData}>Reset Data</button>
              <button class="button secondary" on:click={handleLogout}>Logout</button>
            </div>
          </div>
          
          {#if confirmingReset}
            <div class="confirm-dialog" transition:fade={{ duration: 200 }}>
              <p>Are you sure you want to reset all your progress data? This cannot be undone.</p>
              <div class="dialog-actions">
                <button class="button secondary" on:click={() => confirmingReset = false}>Cancel</button>
                <button class="button danger" on:click={confirmResetData}>Reset Data</button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
      
      <div class="create-user">
        <h4>Create New User</h4>
        <form on:submit|preventDefault={createUser}>
          <input 
            type="text" 
            bind:value={username} 
            placeholder="Username"
            required
            minlength="2"
            maxlength="20"
          />
          <button type="submit" class="button primary">Create User</button>
        </form>
      </div>
      
      {#if $userStore.users.length > 0}
        <div class="user-list">
          <h4>Available Users</h4>
          {#each $userStore.users as user}
            <div class="user-card {user.id === $userStore.currentUserId ? 'active' : ''}">
              <div class="user-info">
                <strong>{user.username}</strong>
                <span>Last active: {formatDate(user.lastLogin)}</span>
              </div>
              <div class="user-actions">
                {#if user.id !== $userStore.currentUserId}
                  <button class="button primary" on:click={() => handleLogin(user.id)}>Login</button>
                  <button class="button danger icon" on:click={() => startDeleteUser(user.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/>
                    </svg>
                  </button>
                {/if}
              </div>
            </div>
          {/each}
          
          {#if confirmingDelete && deletingUserId}
            <div class="confirm-dialog" transition:fade={{ duration: 200 }}>
              <p>Are you sure you want to delete this user? All their data will be permanently removed.</p>
              <div class="dialog-actions">
                <button class="button secondary" on:click={() => { confirmingDelete = false; deletingUserId = null; }}>Cancel</button>
                <button class="button danger" on:click={confirmDeleteUser}>Delete User</button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .user-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 20px;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .user-button:hover {
    background: var(--color-surface-hover);
  }
  
  .username {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .user-panel {
    position: absolute;
    top: 60px;
    right: 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 320px;
    max-width: 90vw;
    z-index: 1000;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 18px;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px 8px;
    color: var(--color-text-secondary);
  }
  
  .panel-content {
    padding: 16px;
    max-height: 70vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .user-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    margin-bottom: 8px;
    background: var(--color-background);
  }
  
  .user-card.active {
    border-color: var(--color-primary);
    background: var(--color-primary-transparent);
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-info span {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
  
  .user-actions {
    display: flex;
    gap: 8px;
  }
  
  .create-user form {
    display: flex;
    gap: 8px;
  }
  
  input {
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    flex-grow: 1;
  }
  
  .button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .button.primary {
    background: var(--color-primary);
    color: var(--text-on-primary);
  }
  
  .button.secondary {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }
  
  .button.danger {
    background: var(--color-error);
    color: white;
  }
  
  .button.icon {
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .current-user, .user-list, .create-user {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  h4 {
    margin: 0;
    font-size: 16px;
    color: var(--color-text-secondary);
  }
  
  .confirm-dialog {
    background: var(--color-surface);
    border: 1px solid var(--color-error);
    border-radius: 6px;
    padding: 16px;
    margin-top: 8px;
  }
  
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
</style>