<!-- src/lib/components/auth/UserProfile.svelte -->
<script lang="ts">
  import { enhancedUserStore, type User } from '../../stores/enhancedUserStore';
  import { createEventDispatcher } from 'svelte';
  
  export let user: User;
  export let isEditing = false;
  
  const dispatch = createEventDispatcher();
  
  let editForm = {
    display_name: user.display_name || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    youtube_channel: user.youtube_channel || '',
    instagram_handle: user.instagram_handle || ''
  };
  
  let isLoading = false;
  let error = '';
  let successMessage = '';
  
  function startEditing() {
    isEditing = true;
    // Reset form with current user data
    editForm = {
      display_name: user.display_name || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      youtube_channel: user.youtube_channel || '',
      instagram_handle: user.instagram_handle || ''
    };
    error = '';
    successMessage = '';
  }
  
  function cancelEditing() {
    isEditing = false;
    error = '';
    successMessage = '';
  }
  
  async function saveProfile() {
    if (isLoading) return;
    
    isLoading = true;
    error = '';
    successMessage = '';
    
    try {
      await enhancedUserStore.updateProfile(editForm);
      successMessage = 'Profile updated successfully!';
      isEditing = false;
      dispatch('profileUpdated');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage = '';
      }, 3000);
    } catch (err: any) {
      error = err.message || 'Failed to update profile';
    } finally {
      isLoading = false;
    }
  }
  
  function getVerificationBadgeColor(level: string) {
    switch (level) {
      case 'admin': return '#dc2626';
      case 'moderator': return '#7c3aed';
      case 'verified': return '#059669';
      default: return '#6b7280';
    }
  }
  
  function getVerificationBadgeText(level: string) {
    switch (level) {
      case 'admin': return 'Admin';
      case 'moderator': return 'Moderator';
      case 'verified': return 'Verified';
      default: return 'Basic';
    }
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="user-profile">
  <div class="profile-header">
    <div class="user-info">
      <h2>{user.display_name || user.username}</h2>
      {#if user.display_name && user.display_name !== user.username}
        <p class="username">@{user.username}</p>
      {/if}
      <div class="verification-badge" style="background-color: {getVerificationBadgeColor(user.verification_level)}">
        {getVerificationBadgeText(user.verification_level)}
      </div>
    </div>
    
    <div class="profile-actions">
      {#if !isEditing}
        <button class="edit-button" on:click={startEditing}>
          Edit Profile
        </button>
      {/if}
    </div>
  </div>
  
  {#if successMessage}
    <div class="success-message">{successMessage}</div>
  {/if}
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  
  {#if isEditing}
    <form on:submit|preventDefault={saveProfile} class="edit-form">
      <div class="form-group">
        <label for="display_name">Display Name</label>
        <input
          id="display_name"
          type="text"
          bind:value={editForm.display_name}
          placeholder="Your display name"
        />
      </div>
      
      <div class="form-group">
        <label for="bio">Bio</label>
        <textarea
          id="bio"
          bind:value={editForm.bio}
          placeholder="Tell us about yourself..."
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="location">Location</label>
        <input
          id="location"
          type="text"
          bind:value={editForm.location}
          placeholder="Your location"
        />
      </div>
      
      <div class="form-group">
        <label for="website">Website</label>
        <input
          id="website"
          type="url"
          bind:value={editForm.website}
          placeholder="https://your-website.com"
        />
      </div>
      
      <div class="form-group">
        <label for="youtube_channel">YouTube Channel</label>
        <input
          id="youtube_channel"
          type="url"
          bind:value={editForm.youtube_channel}
          placeholder="https://youtube.com/@yourchannel"
        />
      </div>
      
      <div class="form-group">
        <label for="instagram_handle">Instagram Handle</label>
        <input
          id="instagram_handle"
          type="text"
          bind:value={editForm.instagram_handle}
          placeholder="@yourusername"
        />
      </div>
      
      <div class="form-actions">
        <button type="button" class="cancel-button" on:click={cancelEditing}>
          Cancel
        </button>
        <button type="submit" class="save-button" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  {:else}
    <div class="profile-details">
      {#if user.bio}
        <div class="detail-section">
          <h3>About</h3>
          <p>{user.bio}</p>
        </div>
      {/if}
      
      <div class="detail-section">
        <h3>Details</h3>
        <div class="detail-grid">
          {#if user.location}
            <div class="detail-item">
              <span class="detail-label">Location:</span>
              <span class="detail-value">{user.location}</span>
            </div>
          {/if}
          
          {#if user.website}
            <div class="detail-item">
              <span class="detail-label">Website:</span>
              <a href={user.website} target="_blank" rel="noopener noreferrer" class="detail-link">
                {user.website}
              </a>
            </div>
          {/if}
          
          {#if user.youtube_channel}
            <div class="detail-item">
              <span class="detail-label">YouTube:</span>
              <a href={user.youtube_channel} target="_blank" rel="noopener noreferrer" class="detail-link">
                {user.youtube_channel}
              </a>
            </div>
          {/if}
          
          {#if user.instagram_handle}
            <div class="detail-item">
              <span class="detail-label">Instagram:</span>
              <span class="detail-value">{user.instagram_handle}</span>
            </div>
          {/if}
          
          <div class="detail-item">
            <span class="detail-label">Member since:</span>
            <span class="detail-value">{formatDate(user.created_at)}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Reputation:</span>
            <span class="detail-value">{user.reputation_score} points</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .user-profile {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .user-info h2 {
    margin: 0 0 0.5rem 0;
    color: #111827;
  }
  
  .username {
    margin: 0 0 0.5rem 0;
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .verification-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .edit-button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .edit-button:hover {
    background: var(--primary-color-dark);
  }
  
  .success-message {
    background: #d1fae5;
    color: #065f46;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .error-message {
    background: #fee2e2;
    color: #991b1b;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .edit-form {
    background: #f9fafb;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.9rem;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }
  
  .form-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }
  
  .cancel-button {
    padding: 0.5rem 1rem;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .cancel-button:hover {
    background: #4b5563;
  }
  
  .save-button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  .save-button:hover:not(:disabled) {
    background: var(--primary-color-dark);
  }
  
  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .detail-section {
    margin-bottom: 2rem;
  }
  
  .detail-section h3 {
    margin: 0 0 1rem 0;
    color: #111827;
    font-size: 1.1rem;
  }
  
  .detail-grid {
    display: grid;
    gap: 0.75rem;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .detail-label {
    font-weight: 500;
    color: #6b7280;
    min-width: 120px;
  }
  
  .detail-value {
    color: #111827;
  }
  
  .detail-link {
    color: var(--primary-color);
    text-decoration: none;
  }
  
  .detail-link:hover {
    text-decoration: underline;
  }
</style>
