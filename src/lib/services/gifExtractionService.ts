/**
 * GIF Extraction Service
 * Extracts direct GIF URLs from animation providers like JugglingLab
 */

export interface GifExtractionResult {
  success: boolean;
  gifUrl?: string;
  error?: string;
  originalUrl: string;
  provider: string;
}

export class GifExtractionService {
  /**
   * Extract direct GIF URL from JugglingLab
   */
  static async extractJugglingLabGif(jugglingLabUrl: string): Promise<GifExtractionResult> {
    try {
      // JugglingLab's format=gif parameter returns HTML with embedded GIF
      const url = new URL(jugglingLabUrl);

      // Add format=gif parameter to get GIF-containing HTML
      url.searchParams.set('format', 'gif');

      // Remove any HTML-specific parameters
      url.searchParams.delete('embed');
      url.searchParams.delete('redirect');

      const gifPageUrl = url.toString();

      // Fetch the HTML page and extract the direct GIF URL
      return await this.extractGifFromHtml(gifPageUrl);

    } catch (error) {
      return {
        success: false,
        error: `Failed to extract GIF from JugglingLab: ${error}`,
        originalUrl: jugglingLabUrl,
        provider: 'jugglinglab'
      };
    }
  }

  /**
   * Extract GIF by parsing HTML content
   */
  private static async extractGifFromHtml(htmlUrl: string): Promise<GifExtractionResult> {
    try {
      // Use a proxy approach to avoid CORS issues
      const proxyUrl = this.createProxyUrl(htmlUrl);

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Look for Google Storage GIF URLs (JugglingLab specific pattern)
      const googleStorageMatch = html.match(/https:\/\/storage\.googleapis\.com\/download\/storage\/v1\/b\/jugglinglab\/o\/gif[^"'\s<>]+/);

      if (googleStorageMatch) {
        const gifUrl = googleStorageMatch[0];

        return {
          success: true,
          gifUrl,
          originalUrl: htmlUrl,
          provider: 'jugglinglab'
        };
      }

      // Fallback: Look for any GIF URLs in the HTML content
      const gifMatches = html.match(/https?:\/\/[^\s"'<>]+\.gif[^\s"'<>]*/gi);

      if (gifMatches && gifMatches.length > 0) {
        // Use the first GIF found
        const gifUrl = gifMatches[0];

        return {
          success: true,
          gifUrl,
          originalUrl: htmlUrl,
          provider: 'jugglinglab'
        };
      }

      // Look for base64 encoded GIFs
      const base64Match = html.match(/data:image\/gif;base64,([A-Za-z0-9+/=]+)/);
      if (base64Match) {
        return {
          success: true,
          gifUrl: base64Match[0],
          originalUrl: htmlUrl,
          provider: 'jugglinglab'
        };
      }

      throw new Error('No GIF found in HTML content');

    } catch (error) {
      return {
        success: false,
        error: `Failed to extract GIF from HTML: ${error}`,
        originalUrl: htmlUrl,
        provider: 'jugglinglab'
      };
    }
  }

  /**
   * Create a proxy URL to avoid CORS issues
   */
  private static createProxyUrl(targetUrl: string): string {
    // For development, we can use a public CORS proxy
    // In production, you'd want to use your own proxy server
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/'
    ];
    
    // Use the first available proxy
    return `${corsProxies[0]}${encodeURIComponent(targetUrl)}`;
  }

  /**
   * Extract GIF from any supported provider
   */
  static async extractGif(url: string, provider: string): Promise<GifExtractionResult> {
    switch (provider.toLowerCase()) {
      case 'jugglinglab':
        return await this.extractJugglingLabGif(url);
      
      case 'gunswap':
        // Gunswap doesn't provide direct GIF exports
        return {
          success: false,
          error: 'Gunswap does not support direct GIF extraction',
          originalUrl: url,
          provider: 'gunswap'
        };
      
      default:
        return {
          success: false,
          error: `Unsupported provider: ${provider}`,
          originalUrl: url,
          provider
        };
    }
  }

  /**
   * Generate optimized GIF URL with specific dimensions
   */
  static generateOptimizedGifUrl(baseUrl: string, width: number, height: number): string {
    try {
      const url = new URL(baseUrl);
      
      // Set optimal dimensions for space utilization
      url.searchParams.set('width', width.toString());
      url.searchParams.set('height', height.toString());
      url.searchParams.set('format', 'gif');
      
      // Optimize for web display
      url.searchParams.set('fps', '30');
      url.searchParams.set('slowdown', '2.0');
      url.searchParams.set('border', '0');
      
      return url.toString();
    } catch (error) {
      console.warn('Failed to generate optimized GIF URL:', error);
      return baseUrl;
    }
  }

  /**
   * Validate that a URL points to a GIF
   */
  static async validateGifUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && (contentType?.includes('image/gif') || url.includes('data:image/gif'));
    } catch (error) {
      console.warn('GIF URL validation failed:', error);
      return false;
    }
  }

  /**
   * Get fallback GIF URL if extraction fails
   */
  static getFallbackGifUrl(pattern: string): string {
    // Generate a simple placeholder or use a default animation service
    return `https://via.placeholder.com/400x300/3b82f6/ffffff?text=${encodeURIComponent(pattern)}`;
  }

  /**
   * Extract multiple GIF variants (different sizes)
   */
  static async extractGifVariants(baseUrl: string, provider: string): Promise<{
    small: GifExtractionResult;
    medium: GifExtractionResult;
    large: GifExtractionResult;
  }> {
    const variants = {
      small: { width: 300, height: 250 },
      medium: { width: 500, height: 400 },
      large: { width: 800, height: 600 }
    };

    const results = await Promise.all([
      this.extractGif(this.generateOptimizedGifUrl(baseUrl, variants.small.width, variants.small.height), provider),
      this.extractGif(this.generateOptimizedGifUrl(baseUrl, variants.medium.width, variants.medium.height), provider),
      this.extractGif(this.generateOptimizedGifUrl(baseUrl, variants.large.width, variants.large.height), provider)
    ]);

    return {
      small: results[0],
      medium: results[1],
      large: results[2]
    };
  }

  /**
   * Cache GIF URLs to avoid repeated extraction
   */
  private static gifCache = new Map<string, GifExtractionResult>();

  static async extractGifCached(url: string, provider: string): Promise<GifExtractionResult> {
    const cacheKey = `${provider}:${url}`;
    
    if (this.gifCache.has(cacheKey)) {
      return this.gifCache.get(cacheKey)!;
    }
    
    const result = await this.extractGif(url, provider);
    
    // Only cache successful results
    if (result.success) {
      this.gifCache.set(cacheKey, result);
    }
    
    return result;
  }

  /**
   * Clear the GIF cache
   */
  static clearCache(): void {
    this.gifCache.clear();
  }
}
