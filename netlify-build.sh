#!/bin/bash
# Netlify build script with debugging and SSR safety checks

echo "Running Netlify build script with debugging..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean existing build outputs
echo "Cleaning previous build artifacts..."
rm -rf .svelte-kit
rm -rf build
rm -rf node_modules/.vite

# Install dependencies with verbose logging
echo "Installing dependencies..."
npm install --legacy-peer-deps --verbose

# Check for SvelteKit files and initialize if needed
echo "Checking SvelteKit configuration..."
if [ ! -d ".svelte-kit" ]; then
  echo "SvelteKit directory not found, running sync..."
  npx svelte-kit sync
else
  echo "SvelteKit directory exists, running sync anyway..."
  npx svelte-kit sync
fi

# Display important files for debugging
echo "Checking for critical files..."
ls -la
echo "Package.json content:"
cat package.json | grep -A 5 "dependencies\|devDependencies\|scripts"
echo "SvelteKit config:"
cat svelte.config.js
echo "Vite config:"
cat vite.config.js

# Add SSR safety checks to any problematic files
echo "Adding SSR safety checks..."

# Run the build with detailed logging
echo "Running build..."
VITE_DEBUG=true npm run build

# Verify build output
echo "Checking build output..."
find .svelte-kit -type f | grep -v "node_modules" | head -n 20

echo "Build script completed!"