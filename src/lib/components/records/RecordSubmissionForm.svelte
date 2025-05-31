<!-- src/lib/components/records/RecordSubmissionForm.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { worldRecordsStore, type RecordSubmission } from '../../stores/worldRecordsStore';
  import { enhancedUserStore } from '../../stores/enhancedUserStore';
  import VideoValidator from '../video/VideoValidator.svelte';
  import type { VideoValidationResult } from '../../services/videoService';
  
  const dispatch = createEventDispatcher<{
    submitted: RecordSubmission;
    cancelled: void;
  }>();
  
  // Form data
  let formData: Partial<RecordSubmission> = {
    category: 'balls',
    record_type: 'endurance',
    value_unit: 'catches',
    video_platform: 'youtube',
    video_start_time: 0,
    holder_names: [''],
    tags: []
  };
  
  let isSubmitting = false;
  let submitError = '';
  let videoValidation: { isValid: boolean; result?: VideoValidationResult } = { isValid: false };
  
  // Form validation
  $: isFormValid = 
    formData.category &&
    formData.object_count &&
    formData.object_count > 0 &&
    formData.record_type &&
    formData.value_number &&
    formData.value_number > 0 &&
    formData.value_unit &&
    formData.date_set &&
    formData.video_url &&
    videoValidation.isValid &&
    formData.holder_names &&
    formData.holder_names.length > 0 &&
    formData.holder_names.every(name => name.trim().length > 0);
  
  // Options
  const categories = [
    { value: 'balls', label: 'Balls' },
    { value: 'clubs', label: 'Clubs' },
    { value: 'rings', label: 'Rings' },
    { value: 'bounce', label: 'Ball Bouncing' },
    { value: 'diabolo', label: 'Diabolo' },
    { value: 'other', label: 'Other' }
  ];
  
  const recordTypes = [
    { value: 'endurance', label: 'Endurance' },
    { value: 'flash', label: 'Flash' },
    { value: 'technical', label: 'Technical' },
    { value: 'speed', label: 'Speed' }
  ];
  
  const valueUnits = [
    { value: 'catches', label: 'Catches' },
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' }
  ];
  
  function addHolder() {
    if (formData.holder_names) {
      formData.holder_names = [...formData.holder_names, ''];
    }
  }
  
  function removeHolder(index: number) {
    if (formData.holder_names && formData.holder_names.length > 1) {
      formData.holder_names = formData.holder_names.filter((_, i) => i !== index);
    }
  }
  
  function addTag() {
    const tagInput = document.getElementById('new-tag') as HTMLInputElement;
    const newTag = tagInput.value.trim();
    
    if (newTag && (!formData.tags || !formData.tags.includes(newTag))) {
      formData.tags = [...(formData.tags || []), newTag];
      tagInput.value = '';
    }
  }
  
  function removeTag(tag: string) {
    if (formData.tags) {
      formData.tags = formData.tags.filter(t => t !== tag);
    }
  }
  
  function handleVideoValidation(event: CustomEvent) {
    videoValidation = event.detail;
  }
  
  async function handleSubmit() {
    if (!isFormValid || isSubmitting) return;
    
    isSubmitting = true;
    submitError = '';
    
    try {
      // Ensure user is authenticated
      if (!$enhancedUserStore.isAuthenticated) {
        throw new Error('You must be logged in to submit a record');
      }
      
      // Clean up holder names
      const cleanHolderNames = formData.holder_names!
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      const submission: RecordSubmission = {
        category: formData.category!,
        subcategory: formData.subcategory,
        object_count: formData.object_count!,
        pattern_siteswap: formData.pattern_siteswap,
        pattern_custom: formData.pattern_custom,
        pattern_description: formData.pattern_description,
        record_type: formData.record_type!,
        value_number: formData.value_number!,
        value_unit: formData.value_unit!,
        date_set: formData.date_set!,
        location: formData.location,
        event_name: formData.event_name,
        video_url: formData.video_url!,
        video_platform: formData.video_platform,
        video_start_time: formData.video_start_time,
        video_end_time: formData.video_end_time,
        notes: formData.notes,
        tags: formData.tags,
        holder_names: cleanHolderNames
      };
      
      await worldRecordsStore.submitRecord(submission);
      
      dispatch('submitted', submission);
      
    } catch (error: any) {
      submitError = error.message || 'Failed to submit record';
      console.error('Submission error:', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  function handleCancel() {
    dispatch('cancelled');
  }
  
  // Set default date to today
  if (!formData.date_set) {
    formData.date_set = new Date().toISOString().split('T')[0];
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="record-submission-form">
  <div class="form-header">
    <h2>Submit World Record</h2>
    <p>Submit a new juggling world record for community verification.</p>
  </div>
  
  {#if submitError}
    <div class="error-message">
      ❌ {submitError}
    </div>
  {/if}
  
  <div class="form-grid">
    <!-- Category and Object Count -->
    <div class="form-group">
      <label for="category">Category *</label>
      <select id="category" bind:value={formData.category} required>
        {#each categories as category}
          <option value={category.value}>{category.label}</option>
        {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label for="object_count">Object Count *</label>
      <input
        id="object_count"
        type="number"
        bind:value={formData.object_count}
        min="1"
        max="50"
        required
      />
    </div>
    
    <!-- Pattern Information -->
    <div class="form-group full-width">
      <label for="pattern_description">Pattern Description</label>
      <input
        id="pattern_description"
        type="text"
        bind:value={formData.pattern_description}
        placeholder="e.g., 3-ball cascade, 5-ball flash, etc."
      />
    </div>
    
    <div class="form-group">
      <label for="pattern_siteswap">Siteswap Notation</label>
      <input
        id="pattern_siteswap"
        type="text"
        bind:value={formData.pattern_siteswap}
        placeholder="e.g., 531, 97531, etc."
      />
    </div>
    
    <div class="form-group">
      <label for="pattern_custom">Custom Notation</label>
      <input
        id="pattern_custom"
        type="text"
        bind:value={formData.pattern_custom}
        placeholder="e.g., SDF, BPSO, etc."
      />
    </div>
    
    <!-- Record Details -->
    <div class="form-group">
      <label for="record_type">Record Type *</label>
      <select id="record_type" bind:value={formData.record_type} required>
        {#each recordTypes as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label for="value_number">Record Value *</label>
      <input
        id="value_number"
        type="number"
        bind:value={formData.value_number}
        min="0.01"
        step="0.01"
        required
      />
    </div>
    
    <div class="form-group">
      <label for="value_unit">Unit *</label>
      <select id="value_unit" bind:value={formData.value_unit} required>
        {#each valueUnits as unit}
          <option value={unit.value}>{unit.label}</option>
        {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label for="date_set">Date Set *</label>
      <input
        id="date_set"
        type="date"
        bind:value={formData.date_set}
        max={new Date().toISOString().split('T')[0]}
        required
      />
    </div>
    
    <!-- Location and Event -->
    <div class="form-group">
      <label for="location">Location</label>
      <input
        id="location"
        type="text"
        bind:value={formData.location}
        placeholder="City, Country"
      />
    </div>
    
    <div class="form-group">
      <label for="event_name">Event Name</label>
      <input
        id="event_name"
        type="text"
        bind:value={formData.event_name}
        placeholder="Competition or event name"
      />
    </div>
  </div>
  
  <!-- Video Validation -->
  <div class="form-section">
    <h3>Video Evidence *</h3>
    <VideoValidator
      bind:videoUrl={formData.video_url}
      required={true}
      showPreview={true}
      on:validationChange={handleVideoValidation}
    />
    
    <div class="video-timing">
      <div class="form-group">
        <label for="video_start_time">Start Time (seconds)</label>
        <input
          id="video_start_time"
          type="number"
          bind:value={formData.video_start_time}
          min="0"
          placeholder="0"
        />
      </div>
      
      <div class="form-group">
        <label for="video_end_time">End Time (seconds)</label>
        <input
          id="video_end_time"
          type="number"
          bind:value={formData.video_end_time}
          min="0"
          placeholder="Optional"
        />
      </div>
    </div>
  </div>
  
  <!-- Record Holders -->
  <div class="form-section">
    <h3>Record Holders *</h3>
    {#each formData.holder_names || [''] as holderName, index}
      <div class="holder-input">
        <input
          type="text"
          bind:value={formData.holder_names[index]}
          placeholder="Juggler name"
          required
        />
        {#if (formData.holder_names?.length || 0) > 1}
          <button type="button" class="remove-button" on:click={() => removeHolder(index)}>
            Remove
          </button>
        {/if}
      </div>
    {/each}
    
    <button type="button" class="add-button" on:click={addHolder}>
      Add Another Holder
    </button>
  </div>
  
  <!-- Tags -->
  <div class="form-section">
    <h3>Tags</h3>
    <div class="tag-input">
      <input
        id="new-tag"
        type="text"
        placeholder="Add a tag"
        on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
      />
      <button type="button" on:click={addTag}>Add Tag</button>
    </div>
    
    {#if formData.tags && formData.tags.length > 0}
      <div class="tag-list">
        {#each formData.tags as tag}
          <span class="tag">
            {tag}
            <button type="button" on:click={() => removeTag(tag)}>×</button>
          </span>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- Notes -->
  <div class="form-section">
    <label for="notes">Additional Notes</label>
    <textarea
      id="notes"
      bind:value={formData.notes}
      rows="3"
      placeholder="Any additional information about this record..."
    ></textarea>
  </div>
  
  <!-- Form Actions -->
  <div class="form-actions">
    <button type="button" class="cancel-button" on:click={handleCancel}>
      Cancel
    </button>
    
    <button type="submit" class="submit-button" disabled={!isFormValid || isSubmitting}>
      {isSubmitting ? 'Submitting...' : 'Submit Record'}
    </button>
  </div>
</form>

<style>
  .record-submission-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .form-header {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .form-header h2 {
    margin: 0 0 0.5rem 0;
    color: #1e293b;
  }
  
  .form-header p {
    margin: 0;
    color: #6b7280;
  }
  
  .error-message {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 0.375rem;
    margin-bottom: 1.5rem;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  .form-group label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
  }
  
  .form-section {
    margin-bottom: 2rem;
  }
  
  .form-section h3 {
    margin: 0 0 1rem 0;
    color: #1e293b;
    font-size: 1.1rem;
  }
  
  .video-timing {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .holder-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .holder-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
  }
  
  .remove-button {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .add-button {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .tag-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .tag-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
  }
  
  .tag-input button {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .tag {
    background: #f1f5f9;
    color: #475569;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .tag button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }
  
  .cancel-button {
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 0.375rem;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .submit-button {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.375rem;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .submit-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .record-submission-form {
      padding: 1rem;
    }
    
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .video-timing {
      grid-template-columns: 1fr;
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
</style>
