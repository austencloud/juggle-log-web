#!/bin/bash

# Install dependencies with legacy peer deps flag
npm install --legacy-peer-deps

# Initialize SvelteKit
npx svelte-kit sync

# Build the project
npm run build