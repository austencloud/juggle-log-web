// Enhanced HMR and F5 Magic for Juggle Log Web
if (import.meta.hot) {
	// Enhanced HMR with visual feedback
	import.meta.hot.accept(() => {
		console.log('🔄 HMR update detected');
		showUpdateNotification('Hot reload complete', 'success');
	});

	// Enhanced error handling with visual feedback
	import.meta.hot.on('vite:error', (err) => {
		console.error('❌ Vite error:', err);
		showUpdateNotification('Build error - check console', 'error');
	});

	// Log successful updates with animation
	import.meta.hot.on('vite:afterUpdate', () => {
		console.log('✅ Hot reload complete');
		showUpdateNotification('Changes applied', 'success');
	});

	// F5 Magic Enhancement System
	const createMagicalF5Experience = () => {
		// Create update notification system
		const createNotificationElement = () => {
			const notification = document.createElement('div');
			notification.id = 'dev-notification';
			notification.style.cssText = `
				position: fixed;
				top: 20px;
				right: 20px;
				z-index: 10000;
				padding: 12px 20px;
				border-radius: 8px;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
				font-size: 14px;
				font-weight: 500;
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
				transform: translateX(100%);
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				backdrop-filter: blur(10px);
				border: 1px solid rgba(255, 255, 255, 0.1);
			`;
			document.body.appendChild(notification);
			return notification;
		};

		// Show update notifications
		window.showUpdateNotification = (message, type = 'info') => {
			let notification = document.getElementById('dev-notification');
			if (!notification) {
				notification = createNotificationElement();
			}

			const colors = {
				success: { bg: 'rgba(16, 185, 129, 0.9)', text: '#ffffff' },
				error: { bg: 'rgba(239, 68, 68, 0.9)', text: '#ffffff' },
				info: { bg: 'rgba(59, 130, 246, 0.9)', text: '#ffffff' },
				magic: { bg: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', text: '#ffffff' }
			};

			const color = colors[type] || colors.info;
			notification.style.background = color.bg;
			notification.style.color = color.text;
			notification.textContent = message;
			notification.style.transform = 'translateX(0)';

			// Auto-hide after 2 seconds
			setTimeout(() => {
				notification.style.transform = 'translateX(100%)';
			}, 2000);
		};

		// Enhanced keyboard shortcuts with F5 magic
		const performMagicalRefresh = () => {
			const overlay = document.createElement('div');
			overlay.id = 'magic-overlay';
			overlay.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: linear-gradient(45deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
				z-index: 99999;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				backdrop-filter: blur(4px);
				opacity: 0;
				transition: opacity 0.3s ease;
			`;
			
			const magicContainer = document.createElement('div');
			magicContainer.style.cssText = `
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 20px;
				animation: magicalPulse 1.5s ease-in-out infinite;
			`;
			
			const spinner = document.createElement('div');
			spinner.style.cssText = `
				width: 80px;
				height: 80px;
				border: 6px solid rgba(255, 255, 255, 0.2);
				border-top: 6px solid #667eea;
				border-radius: 50%;
				animation: spin 1s linear infinite;
			`;
			
			const magicText = document.createElement('div');
			magicText.style.cssText = `
				color: white;
				font-size: 18px;
				font-weight: 600;
				text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
				text-align: center;
			`;
			magicText.textContent = '✨ F5 Magic in Progress ✨';
			
			const sparkles = document.createElement('div');
			sparkles.style.cssText = `
				font-size: 24px;
				animation: magicalPulse 0.8s ease-in-out infinite alternate;
			`;
			sparkles.textContent = '🪄 ⭐ 🌟 ⭐ 🪄';
			
			magicContainer.appendChild(spinner);
			magicContainer.appendChild(magicText);
			magicContainer.appendChild(sparkles);
			overlay.appendChild(magicContainer);
			document.body.appendChild(overlay);
			
			requestAnimationFrame(() => {
				overlay.style.opacity = '1';
			});
			
			showUpdateNotification('🪄 F5 Magic activated!', 'magic');
			
			const preloadPromises = [
				fetch(window.location.href, { method: 'HEAD' }),
				fetch('/src/main.ts').catch(() => {}),
				...document.querySelectorAll('link[rel="stylesheet"]').forEach(link => 
					fetch(link.href, { method: 'HEAD' }).catch(() => {})
				)
			].filter(Boolean);
			
			Promise.allSettled(preloadPromises).then(() => {
				setTimeout(() => {
					overlay.style.opacity = '0';
					setTimeout(() => {
						window.location.reload();
					}, 300);
				}, 800);
			});
		};

		// Global F5 capture - works even when page isn't focused
		window.addEventListener('keydown', (e) => {
			if (e.key === 'F5') {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				performMagicalRefresh();
				return false;
			}
		}, { capture: true, passive: false });

		document.addEventListener('keydown', (e) => {
			if (e.key === 'F5') {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				
				performMagicalRefresh();
				return false;
			}

			// Enhanced existing shortcuts
			if (e.ctrlKey || e.metaKey) {
				switch (e.key) {
					case 'r':
						if (e.shiftKey) {
							e.preventDefault();
							showUpdateNotification('🔄 Force refresh with cache clear', 'info');
							// Clear all caches
							if ('caches' in window) {
								caches.keys().then(names => {
									names.forEach(name => caches.delete(name));
								});
							}
							sessionStorage.clear();
							localStorage.removeItem('vite:hmr');
							setTimeout(() => window.location.reload(), 100);
						}
						break;
					case 'd':
						if (e.shiftKey) {
							e.preventDefault();
							document.body.classList.toggle('debug-mode');
							const isDebug = document.body.classList.contains('debug-mode');
							showUpdateNotification(
								isDebug ? '🐛 Debug mode enabled' : '🐛 Debug mode disabled',
								'info'
							);
						}
						break;
					case 'l':
						if (e.shiftKey) {
							e.preventDefault();
							console.clear();
							showUpdateNotification('🧹 Console cleared', 'info');
						}
						break;
				}
			}

			// F12 - Toggle development overlay
			if (e.key === 'F12') {
				e.preventDefault();
				toggleDevOverlay();
			}
		}, { capture: true, passive: false });

		document.addEventListener('keyup', (e) => {
			if (e.key === 'F5') {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		}, { capture: true });

		// Development overlay toggle
		window.toggleDevOverlay = () => {
			let overlay = document.getElementById('dev-overlay');
			
			if (!overlay) {
				overlay = document.createElement('div');
				overlay.id = 'dev-overlay';
				overlay.style.cssText = `
					position: fixed;
					bottom: 20px;
					left: 20px;
					background: rgba(0, 0, 0, 0.9);
					color: white;
					padding: 15px;
					border-radius: 8px;
					font-family: monospace;
					font-size: 12px;
					z-index: 10000;
					max-width: 300px;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255, 255, 255, 0.1);
				`;
				
				overlay.innerHTML = `
					<div style="font-weight: bold; margin-bottom: 10px;">🛠️ Dev Tools</div>
					<div>F5 - Magical refresh</div>
					<div>Ctrl+Shift+R - Clear & reload</div>
					<div>Ctrl+Shift+D - Debug mode</div>
					<div>Ctrl+Shift+L - Clear console</div>
					<div>F12 - Toggle this overlay</div>
					<div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
						HMR: Active | Port: 9000
					</div>
				`;
				
				document.body.appendChild(overlay);
				showUpdateNotification('📋 Dev overlay shown', 'info');
			} else {
				overlay.remove();
				showUpdateNotification('📋 Dev overlay hidden', 'info');
			}
		};

		// Preload common routes for instant navigation
		const preloadRoutes = ['/profile', '/siteswap-generator', '/world-records'];
		preloadRoutes.forEach(route => {
			const link = document.createElement('link');
			link.rel = 'prefetch';
			link.href = route;
			document.head.appendChild(link);
		});

		// Enhanced error boundary for development
		window.addEventListener('error', (e) => {
			showUpdateNotification(`💥 ${e.error?.name || 'Error'}: Check console`, 'error');
		});

		window.addEventListener('unhandledrejection', (e) => {
			showUpdateNotification('🚫 Unhandled promise rejection', 'error');
		});

		console.log('🪄 Magical F5 experience activated!');
		showUpdateNotification('🪄 F5 Magic activated!', 'magic');
	};

	// Initialize magic when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', createMagicalF5Experience);
	} else {
		createMagicalF5Experience();
	}
}
