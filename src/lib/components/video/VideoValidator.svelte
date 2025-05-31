<!-- src/lib/components/video/VideoValidator.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { VideoService, type VideoValidationResult } from '../../services/videoService';
  import VideoPlayer from './VideoPlayer.svelte';
  
  export let videoUrl: string = '';
  export let required: boolean = true;
  export let showPreview: boolean = true;
  
  const dispatch = createEventDispatcher<{
    validationChange: { isValid: boolean; videoUrl: string; result?: VideoValidationResult };
  }>();
  
  let validationResult: VideoValidationResult | null = null;
  let isValidating = false;
  let validationTimeout: number;
  
  // Reactive validation
  $: {
    if (videoUrl.trim()) {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        validateVideo();
      }, 500); // Debounce validation
    } else {
      validationResult = null;
      dispatch('validationChange', { isValid: !required, videoUrl });
    }
  }
  
  async function validateVideo() {
    if (!videoUrl.trim()) return;
    
    isValidating = true;
    
    try {
      const result = await VideoService.validateVideoUrl(videoUrl);
      validationResult = result;
      
      dispatch('validationChange', {
        isValid: result.isValid,
        videoUrl,
        result
      });
    } catch (error) {
      console.error('Validation error:', error);
      validationResult = {
        isValid: false,
        errors: ['Failed to validate video'],
        warnings: []
      };
      
      dispatch('validationChange', {
        isValid: false,
        videoUrl,
        result: validationResult
      });
    } finally {
      isValidating = false;
    }
  }
  
  function getValidationIcon(): string {
    if (isValidating) return '⏳';
    if (!validationResult) return '';
    if (validationResult.isValid) return '✅';
    return '❌';
  }
  
  function getValidationClass(): string {
    if (isValidating) return 'validating';
    if (!validationResult) return '';
    if (validationResult.isValid) return 'valid';
    return 'invalid';
  }
</script>

<div class="video-validator">
  <div class="url-input-group">
    <label for="video-url">
      Video URL {required ? '*' : '(optional)'}
    </label>
    
    <div class="input-with-validation">
      <input
        id="video-url"
        type="url"
        bind:value={videoUrl}
        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
        class="video-url-input {getValidationClass()}"
        {required}
      />
      
      <div class="validation-indicator">
        {getValidationIcon()}
      </div>
    </div>
    
    <div class="validation-help">
      <p class="help-text">
        Supported platforms: YouTube, Vimeo, and direct video files (.mp4, .webm, .ogg)
      </p>
    </div>
  </div>
  
  {#if isValidating}
    <div class="validation-status validating">
      <p>🔍 Validating video...</p>
    </div>
  {:else if validationResult}
    <div class="validation-status {validationResult.isValid ? 'valid' : 'invalid'}">
      {#if validationResult.isValid}
        <div class="validation-success">
          <h4>✅ Video validated successfully</h4>
          
          {#if validationResult.videoInfo}
            <div class="video-info">
              <p><strong>Title:</strong> {validationResult.videoInfo.title}</p>
              <p><strong>Duration:</strong> {Math.floor(validationResult.videoInfo.duration / 60)}:{(validationResult.videoInfo.duration % 60).toString().padStart(2, '0')}</p>
              <p><strong>Channel:</strong> {validationResult.videoInfo.channelName}</p>
              <p><strong>Platform:</strong> {validationResult.videoInfo.platform}</p>
            </div>
          {/if}
          
          {#if validationResult.warnings.length > 0}
            <div class="validation-warnings">
              <h5>⚠️ Warnings:</h5>
              <ul>
                {#each validationResult.warnings as warning}
                  <li>{warning}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {:else}
        <div class="validation-errors">
          <h4>❌ Video validation failed</h4>
          <ul>
            {#each validationResult.errors as error}
              <li>{error}</li>
            {/each}
          </ul>
          
          {#if validationResult.warnings.length > 0}
            <div class="validation-warnings">
              <h5>⚠️ Additional issues:</h5>
              <ul>
                {#each validationResult.warnings as warning}
                  <li>{warning}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  {#if showPreview && validationResult?.isValid && videoUrl}
    <div class="video-preview">
      <h4>Video Preview</h4>
      <VideoPlayer 
        {videoUrl} 
        width="100%" 
        height="200px"
        autoplay={false}
        controls={true}
      />
    </div>
  {/if}
</div>

<style>
  .video-validator {
    margin-bottom: 1rem;
  }
  
  .url-input-group {
    margin-bottom: 1rem;
  }
  
  .url-input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }
  
  .input-with-validation {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .video-url-input {
    flex: 1;
    padding: 0.75rem;
    padding-right: 3rem;
    border: 2px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .video-url-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
  }
  
  .video-url-input.validating {
    border-color: #f59e0b;
  }
  
  .video-url-input.valid {
    border-color: #10b981;
  }
  
  .video-url-input.invalid {
    border-color: #ef4444;
  }
  
  .validation-indicator {
    position: absolute;
    right: 0.75rem;
    font-size: 1.25rem;
    pointer-events: none;
  }
  
  .validation-help {
    margin-top: 0.5rem;
  }
  
  .help-text {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }
  
  .validation-status {
    padding: 1rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
  }
  
  .validation-status.validating {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    color: #92400e;
  }
  
  .validation-status.valid {
    background: #d1fae5;
    border: 1px solid #10b981;
    color: #065f46;
  }
  
  .validation-status.invalid {
    background: #fee2e2;
    border: 1px solid #ef4444;
    color: #991b1b;
  }
  
  .validation-status h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  .validation-status h5 {
    margin: 0.75rem 0 0.25rem 0;
    font-size: 0.875rem;
  }
  
  .validation-status ul {
    margin: 0.5rem 0 0 1.5rem;
    padding: 0;
  }
  
  .validation-status li {
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }
  
  .video-info {
    margin-top: 0.75rem;
    font-size: 0.875rem;
  }
  
  .video-info p {
    margin: 0.25rem 0;
  }
  
  .validation-warnings {
    margin-top: 0.75rem;
  }
  
  .video-preview {
    margin-top: 1.5rem;
  }
  
  .video-preview h4 {
    margin: 0 0 1rem 0;
    color: #374151;
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    .video-url-input {
      font-size: 1rem; /* Prevent zoom on iOS */
    }
    
    .validation-status {
      padding: 0.75rem;
    }
    
    .video-preview {
      margin-top: 1rem;
    }
  }
</style>
