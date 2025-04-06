import './app.css';
import App from './lib/components/App.svelte';

const app = new App({
  target: document.getElementById('app') || document.body,
});

export default app;