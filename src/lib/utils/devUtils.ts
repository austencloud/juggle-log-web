import './hmr-debug';

declare global {
  const __DEV__: boolean;
}

class DevUtils {
  static init() {
    if (!__DEV__) return;

    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    this.setupQuickActions();
    this.addDevOverlay();
  }

  private static setupErrorHandling() {
    window.addEventListener('error', (e) => {
      console.group('🚨 Runtime Error');
      console.error(e.error);
      console.groupEnd();
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.group('🚨 Unhandled Promise Rejection');
      console.error(e.reason);
      console.groupEnd();
    });
  }

  private static setupPerformanceMonitoring() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 100) {
          console.warn(`⚠️ Slow operation: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
        }
      });
    });
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  }

  private static setupQuickActions() {
    const actions = {
      'F5': () => window.location.reload(),
      'Ctrl+Shift+R': () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      },
      'Ctrl+Shift+D': () => document.body.classList.toggle('debug-mode'),
      'Ctrl+Shift+L': () => {
        const logs = document.querySelectorAll('.dev-log');
        logs.forEach(log => log.remove());
      }
    };

    document.addEventListener('keydown', (e) => {
      const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
      if (actions[key]) {
        e.preventDefault();
        actions[key]();
      }
    });
  }

  private static addDevOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'dev-overlay';
    overlay.innerHTML = `
      <div class="dev-controls">
        <button onclick="window.location.reload()">🔄 Reload</button>
        <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload()">🗑️ Clear & Reload</button>
        <button onclick="document.body.classList.toggle('debug-mode')">🐛 Debug</button>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed; top: 10px; right: 10px; z-index: 9999;
      background: rgba(0,0,0,0.8); color: white; padding: 10px;
      border-radius: 8px; font-size: 12px; display: none;
    `;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12') {
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
      }
    });

    document.body.appendChild(overlay);
  }

  static log(message: string, type: 'info' | 'warn' | 'error' = 'info') {
    if (!__DEV__) return;
    
    const emoji = { info: 'ℹ️', warn: '⚠️', error: '❌' }[type];
    console.log(`${emoji} ${message}`);
  }
}

if (typeof window !== 'undefined') {
  DevUtils.init();
}

export default DevUtils;