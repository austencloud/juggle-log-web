export class LayoutService {
  private static readonly WIDE_LAYOUT_THRESHOLD = 1200;
  private static readonly TABLET_THRESHOLD = 768;

  static isWideLayout(width: number): boolean {
    return width >= this.WIDE_LAYOUT_THRESHOLD;
  }

  static isTabletLayout(width: number): boolean {
    return width >= this.TABLET_THRESHOLD && width < this.WIDE_LAYOUT_THRESHOLD;
  }

  static isMobileLayout(width: number): boolean {
    return width < this.TABLET_THRESHOLD;
  }

  static getLayoutType(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (this.isMobileLayout(width)) return 'mobile';
    if (this.isTabletLayout(width)) return 'tablet';
    return 'desktop';
  }
}