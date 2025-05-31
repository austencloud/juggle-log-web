// src/lib/services/videoService.ts
import { supabase } from '../supabase';
import type { Database } from '../types/database';

type VideoMetadata = Database['public']['Tables']['video_metadata']['Row'];
type VideoMetadataInsert = Database['public']['Tables']['video_metadata']['Insert'];

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  uploadDate: Date;
  channelId: string;
  channelName: string;
  viewCount: number;
  thumbnailUrl: string;
  isEmbeddable: boolean;
  platform: 'youtube' | 'vimeo' | 'direct' | 'other';
}

export interface VideoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  videoInfo?: VideoInfo;
}

export class VideoService {
  private static readonly YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  private static readonly YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

  /**
   * Validate and extract information from a video URL
   */
  static async validateVideoUrl(url: string): Promise<VideoValidationResult> {
    const result: VideoValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      // Basic URL validation
      new URL(url);
    } catch {
      result.errors.push('Invalid URL format');
      return result;
    }

    const platform = this.detectPlatform(url);
    
    switch (platform) {
      case 'youtube':
        return await this.validateYouTubeVideo(url);
      case 'vimeo':
        return await this.validateVimeoVideo(url);
      case 'direct':
        return this.validateDirectVideo(url);
      default:
        result.errors.push('Unsupported video platform');
        return result;
    }
  }

  /**
   * Extract video metadata and store in database
   */
  static async extractAndStoreMetadata(videoUrl: string, recordId?: string): Promise<VideoMetadata | null> {
    const validation = await this.validateVideoUrl(videoUrl);
    
    if (!validation.isValid || !validation.videoInfo) {
      console.error('Invalid video URL:', validation.errors);
      return null;
    }

    const videoInfo = validation.videoInfo;
    
    const metadataInsert: VideoMetadataInsert = {
      record_id: recordId || null,
      video_url: videoUrl,
      platform: videoInfo.platform,
      video_id: videoInfo.id,
      title: videoInfo.title,
      description: videoInfo.description,
      duration_seconds: videoInfo.duration,
      upload_date: videoInfo.uploadDate.toISOString(),
      channel_id: videoInfo.channelId,
      channel_name: videoInfo.channelName,
      view_count: videoInfo.viewCount,
      thumbnail_url: videoInfo.thumbnailUrl,
      is_embeddable: videoInfo.isEmbeddable,
      quality_score: this.calculateQualityScore(videoInfo),
      last_checked: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('video_metadata')
      .insert(metadataInsert)
      .select()
      .single();

    if (error) {
      console.error('Error storing video metadata:', error);
      return null;
    }

    return data;
  }

  /**
   * Detect video platform from URL
   */
  private static detectPlatform(url: string): 'youtube' | 'vimeo' | 'direct' | 'other' {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      return 'direct';
    } else {
      return 'other';
    }
  }

  /**
   * Validate YouTube video
   */
  private static async validateYouTubeVideo(url: string): Promise<VideoValidationResult> {
    const result: VideoValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    const videoId = this.extractYouTubeVideoId(url);
    if (!videoId) {
      result.errors.push('Could not extract YouTube video ID');
      return result;
    }

    if (!this.YOUTUBE_API_KEY) {
      result.warnings.push('YouTube API key not configured - using basic validation');
      result.isValid = true;
      result.videoInfo = {
        id: videoId,
        title: 'Unknown Title',
        description: '',
        duration: 0,
        uploadDate: new Date(),
        channelId: '',
        channelName: 'Unknown Channel',
        viewCount: 0,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        isEmbeddable: true,
        platform: 'youtube'
      };
      return result;
    }

    try {
      const response = await fetch(
        `${this.YOUTUBE_API_BASE}/videos?id=${videoId}&part=snippet,contentDetails,statistics,status&key=${this.YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        result.errors.push(`YouTube API error: ${response.status}`);
        return result;
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        result.errors.push('Video not found or is private');
        return result;
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      const statistics = video.statistics;
      const status = video.status;

      // Check if video is embeddable
      if (!status.embeddable) {
        result.warnings.push('Video is not embeddable');
      }

      // Check if video is available
      if (status.privacyStatus !== 'public') {
        result.errors.push('Video is not public');
        return result;
      }

      // Parse duration
      const duration = this.parseYouTubeDuration(contentDetails.duration);

      result.isValid = true;
      result.videoInfo = {
        id: videoId,
        title: snippet.title,
        description: snippet.description,
        duration,
        uploadDate: new Date(snippet.publishedAt),
        channelId: snippet.channelId,
        channelName: snippet.channelTitle,
        viewCount: parseInt(statistics.viewCount || '0'),
        thumbnailUrl: snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
        isEmbeddable: status.embeddable,
        platform: 'youtube'
      };

      // Quality checks
      if (duration < 10) {
        result.warnings.push('Video is very short (less than 10 seconds)');
      }

      if (duration > 3600) {
        result.warnings.push('Video is very long (over 1 hour)');
      }

    } catch (error) {
      result.errors.push(`Failed to fetch video information: ${error}`);
    }

    return result;
  }

  /**
   * Validate Vimeo video (basic implementation)
   */
  private static async validateVimeoVideo(url: string): Promise<VideoValidationResult> {
    const result: VideoValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    const videoId = this.extractVimeoVideoId(url);
    if (!videoId) {
      result.errors.push('Could not extract Vimeo video ID');
      return result;
    }

    // Basic validation - Vimeo API requires authentication
    result.warnings.push('Vimeo validation is limited - manual review recommended');
    result.isValid = true;
    result.videoInfo = {
      id: videoId,
      title: 'Vimeo Video',
      description: '',
      duration: 0,
      uploadDate: new Date(),
      channelId: '',
      channelName: 'Vimeo User',
      viewCount: 0,
      thumbnailUrl: '',
      isEmbeddable: true,
      platform: 'vimeo'
    };

    return result;
  }

  /**
   * Validate direct video file
   */
  private static validateDirectVideo(url: string): VideoValidationResult {
    const result: VideoValidationResult = {
      isValid: true,
      errors: [],
      warnings: ['Direct video files require manual verification']
    };

    result.videoInfo = {
      id: url,
      title: 'Direct Video File',
      description: '',
      duration: 0,
      uploadDate: new Date(),
      channelId: '',
      channelName: 'Direct Upload',
      viewCount: 0,
      thumbnailUrl: '',
      isEmbeddable: true,
      platform: 'direct'
    };

    return result;
  }

  /**
   * Extract YouTube video ID from URL
   */
  private static extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract Vimeo video ID from URL
   */
  private static extractVimeoVideoId(url: string): string | null {
    const pattern = /vimeo\.com\/(?:video\/)?(\d+)/;
    const match = url.match(pattern);
    return match ? match[1] : null;
  }

  /**
   * Parse YouTube duration format (PT1H2M3S) to seconds
   */
  private static parseYouTubeDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Calculate video quality score based on various factors
   */
  private static calculateQualityScore(videoInfo: VideoInfo): number {
    let score = 0.5; // Base score

    // Duration scoring
    if (videoInfo.duration >= 30 && videoInfo.duration <= 1800) {
      score += 0.2; // Good duration range
    } else if (videoInfo.duration < 10) {
      score -= 0.3; // Too short
    }

    // View count scoring (logarithmic)
    if (videoInfo.viewCount > 0) {
      score += Math.min(0.2, Math.log10(videoInfo.viewCount) / 50);
    }

    // Embeddable bonus
    if (videoInfo.isEmbeddable) {
      score += 0.1;
    }

    // Platform reliability
    if (videoInfo.platform === 'youtube') {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate embed URL for video
   */
  static generateEmbedUrl(videoUrl: string, startTime?: number, endTime?: number): string | null {
    const platform = this.detectPlatform(videoUrl);

    switch (platform) {
      case 'youtube': {
        const videoId = this.extractYouTubeVideoId(videoUrl);
        if (!videoId) return null;

        let embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const params = new URLSearchParams();

        if (startTime) {
          params.set('start', startTime.toString());
        }
        if (endTime) {
          params.set('end', endTime.toString());
        }

        if (params.toString()) {
          embedUrl += `?${params.toString()}`;
        }

        return embedUrl;
      }

      case 'vimeo': {
        const videoId = this.extractVimeoVideoId(videoUrl);
        if (!videoId) return null;
        return `https://player.vimeo.com/video/${videoId}`;
      }

      case 'direct':
        return videoUrl;

      default:
        return null;
    }
  }

  /**
   * Get video thumbnail URL
   */
  static getVideoThumbnail(videoUrl: string): string | null {
    const platform = this.detectPlatform(videoUrl);

    switch (platform) {
      case 'youtube': {
        const videoId = this.extractYouTubeVideoId(videoUrl);
        return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
      }

      case 'vimeo': {
        // Vimeo thumbnails require API call
        return null;
      }

      default:
        return null;
    }
  }
}
