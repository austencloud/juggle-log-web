/**
 * Animation Service for Siteswap Patterns
 * Integrates with external animation APIs like JugglingLab, Gunswap, etc.
 *
 * Enhanced with canonical pattern normalization and authentic naming system.
 */

import { normalizeSiteswapPattern, type NormalizationResult } from '../utils/siteswapNormalization';
import { PATTERN_GIF_DATABASE } from '../data/patternGifMappings';

export interface AnimationOptions {
  width?: number;
  height?: number;
  fps?: number;
  slowdown?: number;
  colors?: string;
  prop?: 'ball' | 'ring' | 'image';
  propdiam?: number;
  bps?: number;
  dwell?: number;
  stereo?: boolean;
  showground?: boolean | 'auto';
  camangle?: string;
  border?: number;
  gravity?: number;
  bouncefrac?: number;
}

export interface AnimationResult {
  url: string;
  embedUrl: string;
  directUrl: string;
  gifUrl?: string; // Direct GIF URL for img display
  provider: 'jugglinglab' | 'gunswap' | 'custom';
  options: AnimationOptions;
  pattern: string;
}

export interface AnimationProvider {
  name: string;
  description: string;
  baseUrl: string;
  supportsEmbedding: boolean;
  supportsCustomization: boolean;
  maxPatternLength?: number;
}

export class AnimationService {
  private static readonly PROVIDERS: Record<string, AnimationProvider> = {
    jugglinglab: {
      name: 'JugglingLab',
      description: 'Comprehensive animation with customizable props and physics',
      baseUrl: 'https://jugglinglab.org/anim',
      supportsEmbedding: true,
      supportsCustomization: true
    },
    gunswap: {
      name: 'Gunswap',
      description: 'Real-time pattern visualization and editing',
      baseUrl: 'https://gunswap.co',
      supportsEmbedding: false,
      supportsCustomization: true,
      maxPatternLength: 20
    }
  };

  private static readonly DEFAULT_OPTIONS: AnimationOptions = {
    width: 400,
    height: 450,
    fps: 30,
    slowdown: 2.0,
    colors: 'mixed',
    prop: 'ball',
    propdiam: 10.0,
    stereo: false,
    showground: 'auto',
    border: 0
  };

  /**
   * Generate animation URL for a siteswap pattern with canonical normalization
   */
  static async generateAnimation(
    pattern: string,
    provider: string = 'jugglinglab',
    options: Partial<AnimationOptions> = {}
  ): Promise<AnimationResult> {
    const providerInfo = this.PROVIDERS[provider];
    if (!providerInfo) {
      throw new Error(`Unknown animation provider: ${provider}`);
    }

    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };

    switch (provider) {
      case 'jugglinglab':
        return await this.generateJugglingLabAnimation(pattern, finalOptions);
      case 'gunswap':
        return this.generateGunswapAnimation(pattern, finalOptions);
      default:
        throw new Error(`Animation generation not implemented for provider: ${provider}`);
    }
  }

  /**
   * Generate best animation with pattern validation and normalization
   */
  static async generateBestAnimation(
    pattern: string,
    options: Partial<AnimationOptions> = {}
  ): Promise<AnimationResult & { normalizationResult?: NormalizationResult }> {
    // Normalize and validate pattern
    const normalizationResult = normalizeSiteswapPattern(pattern);

    if (!normalizationResult.mathematicallyValid) {
      console.warn(`Pattern validation failed for "${pattern}":`, normalizationResult.validationErrors);
      // Continue with original pattern but include validation info
    }

    // Use canonical pattern for animation generation
    const patternToUse = normalizationResult.mathematicallyValid ? normalizationResult.canonical : pattern;

    // Generate animation
    const animationResult = await this.generateAnimation(patternToUse, 'jugglinglab', options);

    // Enhance result with normalization info
    return {
      ...animationResult,
      pattern: patternToUse, // Use canonical pattern
      normalizationResult
    };
  }

  /**
   * Import comprehensive pattern database (generated at build time)
   * Falls back to basic patterns if database is not available
   */
  private static getPatternDatabase() {
    try {
      // TEMPORARILY DISABLED DYNAMIC IMPORT TO FIX INFINITE RELOAD
      // return import('../data/patternGifMappings.ts').then(module => module.PATTERN_GIF_DATABASE);

      // Use static import instead (imported at top of file)
      return Promise.resolve(PATTERN_GIF_DATABASE);
    } catch (error) {
      console.warn('Pattern database not available, using fallback patterns');
      return Promise.resolve({
        // Fallback patterns for development
        '3': {
          gifUrl: 'https://storage.googleapis.com/download/storage/v1/b/jugglinglab/o/gif%2F747e4972a2077c310a676b44.gif?generation=1665986559471987&alt=media',
          ballCount: 3,
          patternType: 'async',
          difficulty: 1,
          description: '3-ball cascade',
          lastVerified: new Date().toISOString()
        },
        '333': {
          gifUrl: 'https://storage.googleapis.com/download/storage/v1/b/jugglinglab/o/gif%2F747e4972a2077c310a676b44.gif?generation=1665986559471987&alt=media',
          ballCount: 3,
          patternType: 'async',
          difficulty: 1,
          description: '3-ball cascade',
          lastVerified: new Date().toISOString()
        },
        '441': {
          gifUrl: 'https://storage.googleapis.com/download/storage/v1/b/jugglinglab/o/gif%2F91592fbf59a2514aac83f0cb.gif?generation=1665987095047869&alt=media',
          ballCount: 3,
          patternType: 'async',
          difficulty: 2.5,
          description: '3-ball flash',
          lastVerified: new Date().toISOString()
        },
        '531': {
          gifUrl: 'https://storage.googleapis.com/download/storage/v1/b/jugglinglab/o/gif%2Fe4831ade5146040954643e4b.gif?generation=1665987182761487&alt=media',
          ballCount: 3,
          patternType: 'async',
          difficulty: 3,
          description: '3-ball box',
          lastVerified: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Generate dynamic GIF URL for JugglingLab patterns using comprehensive database
   * Enhanced with canonical pattern normalization
   */
  private static async generateDynamicGifUrl(pattern: string, width: number, height: number): Promise<string> {
    console.log(`🔍 [GIF URL Generation] Starting for pattern: ${pattern}, dimensions: ${width}x${height}`);

    try {
      // Normalize pattern to canonical form
      const normalizationResult = normalizeSiteswapPattern(pattern);

      if (!normalizationResult.mathematicallyValid) {
        console.warn(`⚠️ [GIF URL Generation] Pattern ${pattern} is mathematically invalid:`, normalizationResult.validationErrors);
        // Continue with original pattern for fallback handling
      }

      const canonicalPattern = normalizationResult.canonical;
      const authenticName = normalizationResult.authenticName;

      if (canonicalPattern !== pattern) {
        console.log(`🔄 [GIF URL Generation] Normalized ${pattern} → ${canonicalPattern}${authenticName ? ` (${authenticName})` : ''}`);
      }

      // Get comprehensive pattern database
      const patternDatabase = await this.getPatternDatabase();

      // Primary: Exact canonical pattern match
      if (patternDatabase[canonicalPattern]) {
        const patternData = patternDatabase[canonicalPattern];
        const displayName = patternData.authenticName || patternData.description || canonicalPattern;
        console.log(`✅ [GIF URL Generation] Found canonical match for pattern ${pattern} → ${canonicalPattern}: ${displayName}`);
        return patternData.gifUrl;
      }

      // Secondary: Try original pattern if different from canonical
      if (pattern !== canonicalPattern && patternDatabase[pattern]) {
        const patternData = patternDatabase[pattern];
        const displayName = patternData.authenticName || patternData.description || pattern;
        console.log(`✅ [GIF URL Generation] Found original pattern match for ${pattern}: ${displayName}`);
        return patternData.gifUrl;
      }

      // Secondary: Find patterns with same ball count and similar structure
      const ballCount = this.calculateBallCount(pattern);
      const similarPatterns = Object.entries(patternDatabase)
        .filter(([_, data]) => data.ballCount === ballCount)
        .sort(([a], [b]) => a.length - b.length); // Prefer simpler patterns

      if (similarPatterns.length > 0) {
        const [fallbackPattern, fallbackData] = similarPatterns[0];
        console.log(`⚠️ [GIF URL Generation] Using similar pattern fallback for ${pattern}: ${fallbackPattern} (${fallbackData.description})`);
        return fallbackData.gifUrl;
      }

      // Tertiary: Default to simplest pattern of same ball count
      const fallbackPatterns: Record<number, string> = {
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9'
      };

      const fallbackPattern = fallbackPatterns[ballCount];
      if (fallbackPattern && patternDatabase[fallbackPattern]) {
        const fallbackData = patternDatabase[fallbackPattern];
        console.log(`⚠️ [GIF URL Generation] Using ball count fallback for ${pattern}: ${fallbackPattern} (${fallbackData.description})`);
        return fallbackData.gifUrl;
      }

      // Final: 3-ball cascade as absolute fallback
      if (patternDatabase['3']) {
        const defaultData = patternDatabase['3'];
        console.log(`🔄 [GIF URL Generation] Using default fallback for ${pattern}: 3-ball cascade`);
        return defaultData.gifUrl;
      }

      throw new Error('No patterns available in database');

    } catch (error) {
      console.error(`❌ [GIF URL Generation] Database lookup failed for pattern ${pattern}:`, error);

      // Ultimate fallback to hardcoded URL
      const ultimateFallback = 'https://storage.googleapis.com/download/storage/v1/b/jugglinglab/o/gif%2F747e4972a2077c310a676b44.gif?generation=1665986559471987&alt=media';
      console.log(`🆘 [GIF URL Generation] Using ultimate fallback for pattern ${pattern}`);
      return ultimateFallback;
    }
  }

  /**
   * Calculate ball count for a siteswap pattern
   */
  private static calculateBallCount(pattern: string): number {
    // Handle synchronous patterns
    if (pattern.includes('(') && pattern.includes(')')) {
      const throws = pattern.match(/\([^)]+\)/g);
      if (throws) {
        let maxThrow = 0;
        throws.forEach(throwPair => {
          const values = throwPair.match(/[0-9a-f]/gi);
          if (values) {
            values.forEach(val => {
              const num = parseInt(val, 16);
              if (!isNaN(num)) maxThrow = Math.max(maxThrow, num);
            });
          }
        });
        return Math.ceil(maxThrow / 2);
      }
    }

    // Handle multiplex patterns
    if (pattern.includes('[') && pattern.includes(']')) {
      let totalObjects = 0;
      const multiplexMatches = pattern.match(/\[[^\]]+\]/g);
      if (multiplexMatches) {
        multiplexMatches.forEach(multiplex => {
          const objects = multiplex.match(/[0-9a-f]/gi);
          if (objects) totalObjects += objects.length;
        });
      }
      return Math.max(totalObjects, 3);
    }

    // Standard async patterns
    const throws = pattern.match(/[0-9a-f]/gi) || [];
    if (throws.length === 0) return 3;

    const sum = throws.reduce((acc, throw_) => {
      const num = parseInt(throw_, 16);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

    return Math.round(sum / throws.length);
  }

  /**
   * Generate JugglingLab animation URLs
   */
  private static async generateJugglingLabAnimation(pattern: string, options: AnimationOptions): Promise<AnimationResult> {
    const baseUrl = 'https://jugglinglab.org/anim';
    
    // Build URL parameters
    const params = new URLSearchParams();
    params.set('pattern', pattern);
    
    // Add optional parameters
    if (options.width !== this.DEFAULT_OPTIONS.width) {
      params.set('width', options.width!.toString());
    }
    if (options.height !== this.DEFAULT_OPTIONS.height) {
      params.set('height', options.height!.toString());
    }
    if (options.fps !== this.DEFAULT_OPTIONS.fps) {
      params.set('fps', options.fps!.toString());
    }
    if (options.slowdown !== this.DEFAULT_OPTIONS.slowdown) {
      params.set('slowdown', options.slowdown!.toString());
    }
    if (options.colors !== this.DEFAULT_OPTIONS.colors) {
      params.set('colors', options.colors!);
    }
    if (options.prop !== this.DEFAULT_OPTIONS.prop) {
      params.set('prop', options.prop!);
    }
    if (options.propdiam !== this.DEFAULT_OPTIONS.propdiam) {
      params.set('propdiam', options.propdiam!.toString());
    }
    if (options.bps) {
      params.set('bps', options.bps.toString());
    }
    if (options.dwell) {
      params.set('dwell', options.dwell.toString());
    }
    if (options.stereo) {
      params.set('stereo', 'true');
    }
    if (options.showground !== this.DEFAULT_OPTIONS.showground) {
      params.set('showground', options.showground!.toString());
    }
    if (options.camangle) {
      params.set('camangle', options.camangle);
    }
    if (options.border !== this.DEFAULT_OPTIONS.border) {
      params.set('border', options.border!.toString());
    }
    if (options.gravity) {
      params.set('gravity', options.gravity.toString());
    }
    if (options.bouncefrac) {
      params.set('bouncefrac', options.bouncefrac.toString());
    }

    const url = `${baseUrl}?${params.toString()}`;

    // Create direct GIF URL for embedding
    const directParams = new URLSearchParams(params);
    directParams.set('redirect', 'true');
    const directUrl = `${baseUrl}?${directParams.toString()}`;

    // Generate dynamic GIF URL for this specific pattern
    console.log(`🎯 [Animation Generation] Generating GIF URL for pattern: ${pattern}`);
    const gifUrl = await this.generateDynamicGifUrl(pattern, options.width, options.height);
    console.log(`🎯 [Animation Generation] Final GIF URL for pattern ${pattern}: ${gifUrl}`);

    const result = {
      url,
      embedUrl: url,
      directUrl,
      gifUrl,
      provider: 'jugglinglab',
      options,
      pattern
    };

    console.log(`🎯 [Animation Generation] Complete result for pattern ${pattern}:`, result);
    return result;
  }

  /**
   * Generate Gunswap animation URLs
   */
  private static generateGunswapAnimation(pattern: string, options: AnimationOptions): AnimationResult {
    const baseUrl = 'https://gunswap.co';
    
    // Gunswap uses a different URL structure
    const encodedPattern = encodeURIComponent(pattern);
    const url = `${baseUrl}/?pattern=${encodedPattern}`;

    return {
      url,
      embedUrl: url, // Gunswap doesn't support embedding
      directUrl: url,
      provider: 'gunswap',
      options,
      pattern
    };
  }

  /**
   * Get available animation providers
   */
  static getProviders(): AnimationProvider[] {
    return Object.values(this.PROVIDERS);
  }

  /**
   * Get provider information
   */
  static getProvider(name: string): AnimationProvider | null {
    return this.PROVIDERS[name] || null;
  }

  /**
   * Validate pattern for animation
   */
  static validatePatternForAnimation(pattern: string, provider: string = 'jugglinglab'): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    const providerInfo = this.PROVIDERS[provider];
    if (!providerInfo) {
      result.isValid = false;
      result.errors.push(`Unknown provider: ${provider}`);
      return result;
    }

    // Check pattern length limits
    if (providerInfo.maxPatternLength && pattern.length > providerInfo.maxPatternLength) {
      result.isValid = false;
      result.errors.push(`Pattern too long for ${providerInfo.name} (max ${providerInfo.maxPatternLength} characters)`);
    }

    // Check for complex patterns that might not animate well
    if (pattern.includes('[') && pattern.includes(']')) {
      result.warnings.push('Multiplex patterns may not animate correctly in all providers');
    }

    if (pattern.includes('(') && pattern.includes(')')) {
      result.warnings.push('Synchronous patterns require provider support');
    }

    // Check for very high throws
    const throws = pattern.match(/[0-9a-f]/gi) || [];
    const maxThrow = Math.max(...throws.map(t => {
      const num = parseInt(t, 16);
      return isNaN(num) ? 0 : num;
    }));

    if (maxThrow > 12) {
      result.warnings.push('Very high throws may not display well in animation');
    }

    return result;
  }

  /**
   * Get animation presets for different use cases
   */
  static getPresets(): Record<string, Partial<AnimationOptions>> {
    return {
      'high-quality': {
        width: 600,
        height: 600,
        fps: 60,
        slowdown: 1.5,
        border: 10
      },
      'web-embed': {
        width: 400,
        height: 300,
        fps: 30,
        slowdown: 2.0,
        border: 0
      },
      'mobile': {
        width: 300,
        height: 400,
        fps: 24,
        slowdown: 2.5,
        border: 5
      },
      'presentation': {
        width: 800,
        height: 600,
        fps: 30,
        slowdown: 1.0,
        border: 20,
        showground: true
      },
      'stereo': {
        width: 600,
        height: 450,
        fps: 30,
        slowdown: 2.0,
        stereo: true
      }
    };
  }

  /**
   * Generate multiple animation variants
   */
  static generateVariants(pattern: string, provider: string = 'jugglinglab'): AnimationResult[] {
    const presets = this.getPresets();
    const variants: AnimationResult[] = [];

    for (const [presetName, presetOptions] of Object.entries(presets)) {
      try {
        const animation = this.generateAnimation(pattern, provider, presetOptions);
        animation.url += `&preset=${presetName}`;
        variants.push(animation);
      } catch (error) {
        console.warn(`Failed to generate ${presetName} variant:`, error);
      }
    }

    return variants;
  }

  /**
   * Check if a provider supports a specific feature
   */
  static supportsFeature(provider: string, feature: 'embedding' | 'customization' | 'stereo' | 'multiplex'): boolean {
    const providerInfo = this.PROVIDERS[provider];
    if (!providerInfo) return false;

    switch (feature) {
      case 'embedding':
        return providerInfo.supportsEmbedding;
      case 'customization':
        return providerInfo.supportsCustomization;
      case 'stereo':
        return provider === 'jugglinglab'; // Only JugglingLab supports stereo
      case 'multiplex':
        return provider === 'jugglinglab'; // Only JugglingLab supports multiplex well
      default:
        return false;
    }
  }


}
