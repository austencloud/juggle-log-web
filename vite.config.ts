import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 9000,
    strictPort: false,
    host: true,
    open: true,
    hmr: {
      overlay: true,
      clientPort: 9000,
      port: 9000
    },
    watch: {
      usePolling: false,
      interval: 50,
      binaryInterval: 300,
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    middlewareMode: false,
    fs: {
      strict: false
    },
    warmup: {
      clientFiles: ['./src/app.html', './src/main.ts', './src/lib/**/*.{ts,js,svelte}']
    }
  },
  preview: {
    port: 9001,
    open: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte'],
          utils: ['src/lib/utils']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['svelte', '@supabase/supabase-js'],
    force: false
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __MAGICAL_F5__: JSON.stringify(true)
  },
  css: {
    devSourcemap: true
  },
  esbuild: {
    keepNames: true
  }
});
