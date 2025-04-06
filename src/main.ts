// src/main.ts
import MainWidget from './lib/components/MainWidget.svelte';

const app = new MainWidget({
  target: document.getElementById('app') || document.body,
});

export default app;