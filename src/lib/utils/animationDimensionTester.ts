// Animation Dimension Testing Utility
// Comprehensive testing framework for animation space utilization

export interface DimensionMeasurement {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface ContainerHierarchy {
  iframe: DimensionMeasurement;
  animationFrame: DimensionMeasurement;
  animationResult: DimensionMeasurement;
  rightPanel: DimensionMeasurement;
  viewport: DimensionMeasurement;
}

export interface SpaceUtilizationReport {
  widthUtilization: number; // Percentage of available width used
  heightUtilization: number; // Percentage of available height used
  aspectRatio: number; // Current aspect ratio of animation
  limitingFactor: 'width' | 'height' | 'container'; // What's limiting the size
  recommendations: string[]; // Specific optimization suggestions
  measurements: ContainerHierarchy;
  passed: boolean; // Whether utilization meets minimum thresholds
}

export class AnimationDimensionTester {
  private minWidthUtilization = 80; // Minimum 80% width utilization
  private minHeightUtilization = 80; // Minimum 80% height utilization

  /**
   * Measure dimensions of an element
   */
  private measureElement(element: Element | null): DimensionMeasurement | null {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom
    };
  }

  /**
   * Get viewport dimensions
   */
  private getViewportDimensions(): DimensionMeasurement {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight
    };
  }

  /**
   * Measure the complete container hierarchy
   */
  public measureContainerHierarchy(): ContainerHierarchy | null {
    // Try to find either iframe or img element
    const iframe = document.querySelector('.animation-frame iframe') as HTMLIFrameElement;
    const img = document.querySelector('.animation-frame .animation-gif') as HTMLImageElement;
    const animationElement = img || iframe;

    const animationFrame = document.querySelector('.animation-frame') as HTMLElement;
    const animationResult = document.querySelector('.animation-result') as HTMLElement;
    const rightPanel = document.querySelector('.right-panel') as HTMLElement;

    const animationElementMeasurement = this.measureElement(animationElement);
    const animationFrameMeasurement = this.measureElement(animationFrame);
    const animationResultMeasurement = this.measureElement(animationResult);
    const rightPanelMeasurement = this.measureElement(rightPanel);
    const viewportMeasurement = this.getViewportDimensions();

    if (!animationElementMeasurement || !animationFrameMeasurement || !animationResultMeasurement || !rightPanelMeasurement) {
      return null;
    }

    return {
      iframe: animationElementMeasurement, // This represents the animation element (iframe or img)
      animationFrame: animationFrameMeasurement,
      animationResult: animationResultMeasurement,
      rightPanel: rightPanelMeasurement,
      viewport: viewportMeasurement
    };
  }

  /**
   * Calculate space utilization metrics
   */
  public calculateSpaceUtilization(): SpaceUtilizationReport | null {
    const measurements = this.measureContainerHierarchy();
    if (!measurements) {
      return null;
    }

    const { iframe, animationFrame, animationResult, rightPanel } = measurements;

    // Calculate utilization percentages
    const widthUtilization = (iframe.width / animationFrame.width) * 100;
    const heightUtilization = (iframe.height / animationFrame.height) * 100;

    // Calculate aspect ratio
    const aspectRatio = iframe.width / iframe.height;

    // Determine limiting factor
    let limitingFactor: 'width' | 'height' | 'container' = 'container';
    if (widthUtilization < heightUtilization) {
      limitingFactor = 'width';
    } else {
      limitingFactor = 'height';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (widthUtilization < this.minWidthUtilization) {
      recommendations.push(`Increase width utilization from ${widthUtilization.toFixed(1)}% to at least ${this.minWidthUtilization}%`);
      recommendations.push('Consider reducing animation-frame padding or adjusting object-fit properties');
    }

    if (heightUtilization < this.minHeightUtilization) {
      recommendations.push(`Increase height utilization from ${heightUtilization.toFixed(1)}% to at least ${this.minHeightUtilization}%`);
      recommendations.push('Consider increasing min-height of animation-frame or reducing vertical spacing');
    }

    // Check container chain efficiency
    const frameToResultRatio = (animationFrame.width / animationResult.width) * 100;
    const resultToPanelRatio = (animationResult.width / rightPanel.width) * 100;

    if (frameToResultRatio < 90) {
      recommendations.push(`Animation frame only uses ${frameToResultRatio.toFixed(1)}% of animation-result width`);
    }

    if (resultToPanelRatio < 90) {
      recommendations.push(`Animation result only uses ${resultToPanelRatio.toFixed(1)}% of right-panel width`);
    }

    // Check if utilization meets minimum thresholds
    const passed = widthUtilization >= this.minWidthUtilization || heightUtilization >= this.minHeightUtilization;

    return {
      widthUtilization,
      heightUtilization,
      aspectRatio,
      limitingFactor,
      recommendations,
      measurements,
      passed
    };
  }

  /**
   * Run comprehensive dimensional analysis
   */
  public async runComprehensiveTest(): Promise<SpaceUtilizationReport | null> {
    // Wait for layout to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    const report = this.calculateSpaceUtilization();
    if (!report) return null;

    // Log detailed measurements for debugging
    console.group('🔍 Animation Dimension Analysis');
    console.log('Container Hierarchy Measurements:');
    console.table({
      'Iframe': `${report.measurements.iframe.width}×${report.measurements.iframe.height}`,
      'Animation Frame': `${report.measurements.animationFrame.width}×${report.measurements.animationFrame.height}`,
      'Animation Result': `${report.measurements.animationResult.width}×${report.measurements.animationResult.height}`,
      'Right Panel': `${report.measurements.rightPanel.width}×${report.measurements.rightPanel.height}`,
      'Viewport': `${report.measurements.viewport.width}×${report.measurements.viewport.height}`
    });

    console.log('Space Utilization:');
    console.table({
      'Width Utilization': `${report.widthUtilization.toFixed(1)}%`,
      'Height Utilization': `${report.heightUtilization.toFixed(1)}%`,
      'Aspect Ratio': report.aspectRatio.toFixed(2),
      'Limiting Factor': report.limitingFactor,
      'Test Result': report.passed ? '✅ PASS' : '❌ FAIL'
    });

    if (report.recommendations.length > 0) {
      console.log('Optimization Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.groupEnd();

    return report;
  }

  /**
   * Create visual debugging overlay
   */
  public createVisualDebugOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'dimension-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
    `;

    const report = this.calculateSpaceUtilization();
    if (!report) {
      overlay.innerHTML = '<div>❌ Unable to measure dimensions</div>';
      return overlay;
    }

    overlay.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 0.5rem;">
        🔍 Animation Dimensions
      </div>
      <div>Width Utilization: ${report.widthUtilization.toFixed(1)}%</div>
      <div>Height Utilization: ${report.heightUtilization.toFixed(1)}%</div>
      <div>Aspect Ratio: ${report.aspectRatio.toFixed(2)}</div>
      <div>Limiting Factor: ${report.limitingFactor}</div>
      <div style="margin-top: 0.5rem; color: ${report.passed ? '#10b981' : '#ef4444'};">
        ${report.passed ? '✅ PASS' : '❌ FAIL'}
      </div>
      ${report.recommendations.length > 0 ? `
        <div style="margin-top: 0.5rem; font-size: 10px;">
          <div style="font-weight: bold;">Recommendations:</div>
          ${report.recommendations.slice(0, 2).map(rec => `<div>• ${rec}</div>`).join('')}
        </div>
      ` : ''}
    `;

    return overlay;
  }

  /**
   * Set custom utilization thresholds
   */
  public setThresholds(minWidth: number, minHeight: number): void {
    this.minWidthUtilization = minWidth;
    this.minHeightUtilization = minHeight;
  }
}

// Export singleton instance
export const dimensionTester = new AnimationDimensionTester();
