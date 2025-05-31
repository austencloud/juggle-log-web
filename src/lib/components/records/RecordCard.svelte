<!-- src/lib/components/records/RecordCard.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WorldRecordWithHolders } from '../../stores/worldRecordsStore';
  
  export let record: WorldRecordWithHolders;
  export let showVideo = false;
  export let compact = false;
  
  const dispatch = createEventDispatcher<{
    viewDetails: string;
    playVideo: string;
  }>();
  
  function formatValue(value: number, unit: string): string {
    if (unit === 'seconds') {
      if (value >= 3600) {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        const seconds = Math.floor(value % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (value >= 60) {
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}m ${seconds}s`;
      } else {
        return `${value}s`;
      }
    } else if (unit === 'minutes') {
      if (value >= 60) {
        const hours = Math.floor(value / 60);
        const minutes = Math.floor(value % 60);
        return `${hours}h ${minutes}m`;
      } else {
        return `${value}m`;
      }
    } else if (unit === 'hours') {
      return `${value}h`;
    } else {
      return `${value} ${unit}`;
    }
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'verified': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'disputed': return '#8b5cf6';
      default: return '#6b7280';
    }
  }
  
  function getStatusText(status: string): string {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      case 'disputed': return 'Disputed';
      default: return 'Unknown';
    }
  }
  
  function getCategoryIcon(category: string): string {
    switch (category) {
      case 'balls': return '⚽';
      case 'clubs': return '🎳';
      case 'rings': return '⭕';
      case 'bounce': return '🏀';
      case 'diabolo': return '🪀';
      default: return '🤹';
    }
  }
  
  function getRecordTypeIcon(type: string): string {
    switch (type) {
      case 'endurance': return '⏱️';
      case 'flash': return '⚡';
      case 'technical': return '🎯';
      case 'speed': return '🏃';
      default: return '🏆';
    }
  }
  
  function getPrimaryHolder(): string {
    const primaryHolder = record.record_holders.find(h => h.is_primary_holder);
    return primaryHolder?.juggler_name || 'Unknown';
  }
  
  function getAllHolders(): string {
    return record.record_holders
      .sort((a, b) => a.order_position - b.order_position)
      .map(h => h.juggler_name)
      .join(', ');
  }
  
  function extractVideoId(url: string): string | null {
    // YouTube video ID extraction
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  }
  
  function getVideoThumbnail(url: string): string | null {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  }
  
  function handleViewDetails() {
    dispatch('viewDetails', record.id);
  }
  
  function handlePlayVideo() {
    dispatch('playVideo', record.video_url);
  }
</script>

<div class="record-card" class:compact>
  <div class="record-header">
    <div class="record-title">
      <span class="category-icon">{getCategoryIcon(record.category)}</span>
      <span class="type-icon">{getRecordTypeIcon(record.record_type)}</span>
      <h3>
        {record.object_count} {record.category}
        {#if record.pattern_description}
          - {record.pattern_description}
        {:else if record.pattern_siteswap}
          - {record.pattern_siteswap}
        {:else if record.pattern_custom}
          - {record.pattern_custom}
        {/if}
      </h3>
    </div>
    
    <div class="verification-status" style="background-color: {getStatusColor(record.verification_status)}">
      {getStatusText(record.verification_status)}
    </div>
  </div>
  
  <div class="record-content">
    <div class="record-value">
      <span class="value-number">{formatValue(record.value_number, record.value_unit)}</span>
      <span class="record-type">{record.record_type}</span>
    </div>
    
    <div class="record-details">
      <div class="detail-item">
        <span class="detail-label">Holder:</span>
        <span class="detail-value">{getAllHolders()}</span>
      </div>
      
      <div class="detail-item">
        <span class="detail-label">Date:</span>
        <span class="detail-value">{formatDate(record.date_set)}</span>
      </div>
      
      {#if record.location}
        <div class="detail-item">
          <span class="detail-label">Location:</span>
          <span class="detail-value">{record.location}</span>
        </div>
      {/if}
      
      {#if record.event_name}
        <div class="detail-item">
          <span class="detail-label">Event:</span>
          <span class="detail-value">{record.event_name}</span>
        </div>
      {/if}
    </div>
    
    {#if showVideo && getVideoThumbnail(record.video_url)}
      <div class="video-preview">
        <img 
          src={getVideoThumbnail(record.video_url)} 
          alt="Video thumbnail"
          on:click={handlePlayVideo}
          on:keydown={(e) => e.key === 'Enter' && handlePlayVideo()}
          tabindex="0"
          role="button"
        />
        <div class="play-button" on:click={handlePlayVideo}>▶</div>
      </div>
    {/if}
    
    {#if record.tags && record.tags.length > 0}
      <div class="record-tags">
        {#each record.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}
  </div>
  
  <div class="record-actions">
    <button class="action-button primary" on:click={handleViewDetails}>
      View Details
    </button>
    
    <button class="action-button secondary" on:click={handlePlayVideo}>
      Watch Video
    </button>
  </div>
</div>

<style>
  .record-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  
  .record-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .record-card.compact {
    padding: 1rem;
  }
  
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .record-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }
  
  .category-icon,
  .type-icon {
    font-size: 1.2rem;
  }
  
  .record-title h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .verification-status {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .record-content {
    margin-bottom: 1rem;
  }
  
  .record-value {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .value-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
  }
  
  .record-type {
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: capitalize;
  }
  
  .record-details {
    display: grid;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .detail-item {
    display: flex;
    gap: 0.5rem;
  }
  
  .detail-label {
    font-weight: 500;
    color: #6b7280;
    min-width: 80px;
  }
  
  .detail-value {
    color: #1e293b;
  }
  
  .video-preview {
    position: relative;
    margin-bottom: 1rem;
    border-radius: 0.25rem;
    overflow: hidden;
    cursor: pointer;
  }
  
  .video-preview img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: background-color 0.2s;
  }
  
  .play-button:hover {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .record-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .tag {
    background: #f1f5f9;
    color: #475569;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }
  
  .record-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-button.primary {
    background: var(--primary-color);
    color: white;
  }
  
  .action-button.primary:hover {
    background: var(--primary-color-dark);
  }
  
  .action-button.secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  
  .action-button.secondary:hover {
    background: #e2e8f0;
  }
  
  @media (max-width: 768px) {
    .record-header {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .record-actions {
      flex-direction: column;
    }
    
    .action-button {
      width: 100%;
    }
  }
</style>
