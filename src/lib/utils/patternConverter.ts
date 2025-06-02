/**
 * Pattern Converter Utility
 *
 * IMPORTANT: AlphaJuggle and Siteswap are fundamentally different notation systems
 * that represent different semantic models of juggling patterns. Direct conversion
 * between them is not implemented to prevent semantic confusion and data corruption.
 *
 * AlphaJuggle uses semantic descriptors (S=Single, D=Double, L=Lazy, etc.) that
 * represent specific juggling techniques and styles, while siteswap uses mathematical
 * throw heights (3, 4, 5, etc.) that represent timing and hand destinations.
 *
 * These systems must remain completely isolated until proper semantic mapping
 * research is completed.
 */

export interface ConversionResult {
  converted: string | null;
  confidence: 'high' | 'medium' | 'low';
  limitations: string[];
  metadata?: {
    originalType: string;
    convertedType: string;
    preservedElements: string[];
    lostElements: string[];
  };
}

export interface ConversionMapping {
  custom: string;
  siteswap: string;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export class PatternConverter {
  /**
   * CONVERSION METHODS INTENTIONALLY DISABLED
   *
   * Direct conversion between AlphaJuggle and siteswap notation systems
   * has been disabled to prevent semantic confusion. These notation systems
   * represent fundamentally different approaches to describing juggling patterns:
   *
   * - AlphaJuggle: Semantic descriptors for techniques and styles
   * - Siteswap: Mathematical timing and trajectory notation
   *
   * Future implementation will require comprehensive research into proper
   * semantic mapping between these paradigms.
   */

  /**
   * DISABLED: Convert custom notation pattern to siteswap
   *
   * This method has been intentionally disabled to prevent semantic confusion
   * between AlphaJuggle and siteswap notation systems.
   */
  static customToSiteswap(customPattern: string): ConversionResult {
    return {
      converted: null,
      confidence: 'low',
      limitations: [
        'Direct conversion between AlphaJuggle and siteswap notation is disabled',
        'These notation systems represent fundamentally different semantic models',
        'Manual entry in both formats is required for dual notation records'
      ],
      metadata: {
        originalType: 'alphajuggle',
        convertedType: 'siteswap',
        preservedElements: [],
        lostElements: ['All elements (conversion disabled)']
      }
    };
  }

  /**
   * DISABLED: Convert siteswap pattern to custom notation
   *
   * This method has been intentionally disabled to prevent semantic confusion
   * between AlphaJuggle and siteswap notation systems.
   */
  static siteswapToCustom(siteswap: string): ConversionResult {
    return {
      converted: null,
      confidence: 'low',
      limitations: [
        'Direct conversion between siteswap and AlphaJuggle notation is disabled',
        'These notation systems represent fundamentally different semantic models',
        'Manual entry in both formats is required for dual notation records'
      ],
      metadata: {
        originalType: 'siteswap',
        convertedType: 'alphajuggle',
        preservedElements: [],
        lostElements: ['All elements (conversion disabled)']
      }
    };
  }

  /**
   * DISABLED: Validate that a conversion is mathematically sound
   *
   * Cross-notation validation is disabled since conversion is not supported.
   */
  static validateConversion(original: string, converted: string, originalType: 'custom' | 'siteswap'): boolean {
    // Always return false since conversion is disabled
    return false;
  }

  /**
   * DISABLED: Get suggested conversions for a pattern
   *
   * Conversion suggestions are disabled since cross-notation conversion is not supported.
   */
  static getSuggestedConversions(pattern: string): ConversionMapping[] {
    // Return empty array since conversion is disabled
    return [];
  }

  /**
   * Get conversion confidence explanation
   *
   * Maintained for interface compatibility, but conversion is disabled.
   */
  static getConfidenceExplanation(confidence: 'high' | 'medium' | 'low'): string {
    switch (confidence) {
      case 'high':
        return 'Conversion disabled - manual entry required for both notation systems';
      case 'medium':
        return 'Conversion disabled - manual entry required for both notation systems';
      case 'low':
        return 'Conversion disabled - manual entry required for both notation systems';
      default:
        return 'Conversion disabled - manual entry required for both notation systems';
    }
  }
}
