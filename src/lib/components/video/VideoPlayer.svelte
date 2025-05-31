<!-- src/lib/components/video/VideoPlayer.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { VideoService } from '../../services/videoService';
  
  export let videoUrl: string;
  export let startTime: number = 0;
  export let endTime: number | null = null;
  export let autoplay: boolean = false;
  export let controls: boolean = true;
  export let width: string = '100%';
  export let height: string = '315px';
  
  let embedUrl: string | null = null;
  let thumbnailUrl: string | null = null;
  let isLoading = true;
  let error: string | null = null;
  let showPlayer = false;
  
  onMount(async () => {
    try {
      embedUrl = VideoService.generateEmbedUrl(videoUrl, startTime, endTime);
      thumbnailUrl = VideoService.getVideoThumbnail(videoUrl);
      
      if (!embedUrl) {
        error = 'Unable to generate embed URL for this video';
      }
    } catch (err) {
      error = 'Error loading video';
      console.error('Video player error:', err);
    } finally {
      isLoading = false;
    }
  });
  
  function handlePlayClick() {
    showPlayer = true;
  }
  
  function getEmbedUrlWithParams(): string {
    if (!embedUrl) return '';
    
    const url = new URL(embedUrl);
    
    if (autoplay) {
      url.searchParams.set('autoplay', '1');
    }
    
    if (!controls) {
      url.searchParams.set('controls', '0');
    }
    
    return url.toString();
  }
</script>

<div class="video-player" style="width: {width}; height: {height};">
  {#if isLoading}
    <div class="video-loading">
      <div class="loading-spinner"></div>
      <p>Loading video...</p>
    </div>
  {:else if error}
    <div class="video-error">
      <p>❌ {error}</p>
      <a href={videoUrl} target="_blank" rel="noopener noreferrer" class="external-link">
        Open video in new tab
      </a>
    </div>
  {:else if !showPlayer && thumbnailUrl}
    <div class="video-thumbnail" on:click={handlePlayClick} on:keydown={(e) => e.key === 'Enter' && handlePlayClick()} tabindex="0" role="button">
      <img src={thumbnailUrl} alt="Video thumbnail" />
      <div class="play-overlay">
        <div class="play-button">
          <svg width="68" height="48" viewBox="0 0 68 48">
            <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
            <path d="M 45,24 27,14 27,34" fill="#fff"></path>
          </svg>
        </div>
      </div>
    </div>
  {:else if embedUrl}
    <iframe
      src={getEmbedUrlWithParams()}
      title="Video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      style="width: 100%; height: 100%;"
    ></iframe>
  {:else}
    <div class="video-fallback">
      <p>Unable to embed video</p>
      <a href={videoUrl} target="_blank" rel="noopener noreferrer" class="external-link">
        Open video in new tab
      </a>
    </div>
  {/if}
</div>

<style>
  .video-player {
    position: relative;
    background: #000;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .video-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: white;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .video-error,
  .video-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: white;
    text-align: center;
    padding: 1rem;
  }
  
  .video-error p {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }
  
  .external-link {
    color: #60a5fa;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 1px solid #60a5fa;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }
  
  .external-link:hover {
    background: #60a5fa;
    color: white;
  }
  
  .video-thumbnail {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    overflow: hidden;
  }
  
  .video-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    transition: background-color 0.2s;
  }
  
  .video-thumbnail:hover .play-overlay {
    background: rgba(0, 0, 0, 0.5);
  }
  
  .play-button {
    transition: transform 0.2s;
  }
  
  .video-thumbnail:hover .play-button {
    transform: scale(1.1);
  }
  
  .play-button svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  @media (max-width: 768px) {
    .video-player {
      border-radius: 0.25rem;
    }
    
    .play-button svg {
      width: 48px;
      height: 36px;
    }
  }
</style>
