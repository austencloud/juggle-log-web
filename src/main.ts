// src/main.ts
import MainWidget from './lib/components/MainWidget.svelte';
import { userStore } from './lib/stores/userStore';
import { achievementStore } from './lib/stores/achievementStore';
import { isBrowser } from './lib/utils/browser';
import DevUtils from './lib/utils/devUtils';

// Import F5 Magic in development
if (import.meta.env.DEV) {
  import('./hmr-debug');
}

// Initialize stores
if (isBrowser) {
  DevUtils.init();
  
  // Initialize achievements
  achievementStore.init();
  
  // Check if there's a current user and ensure their data is loaded
  const currentUser = userStore.getCurrentUser();
  if (currentUser) {
    DevUtils.log(`User session restored: ${currentUser.username}`);
  } else {
    DevUtils.log('No active user session');
  }
}

const app = new MainWidget({
  target: document.getElementById('app') || document.body,
});

export default app;