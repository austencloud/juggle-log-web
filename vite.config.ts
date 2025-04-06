import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
	  hmr: {
		protocol: 'ws',
		timeout: 5000,
		overlay: true,
		clientPort: 5173 // Add this line
	  },
	  watch: {
		usePolling: true,
		interval: 1000
	  },
	  host: true // Add this line to listen on all network interfaces
	}
  });