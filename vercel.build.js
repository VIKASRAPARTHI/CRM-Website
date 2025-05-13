// This file is used by Vercel to customize the build process
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to copy files recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    // Copy each file in the directory
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    // Copy file
    fs.copyFileSync(src, dest);
  }
}

// Main build function
async function build() {
  console.log('Running Vercel build hooks...');

  // Ensure the dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Ensure the public directory exists
  if (!fs.existsSync('dist/public')) {
    fs.mkdirSync('dist/public', { recursive: true });
  }

  // Copy static assets if they exist
  if (fs.existsSync('public')) {
    copyRecursiveSync('public', 'dist/public');
    console.log('Copied static assets from public to dist/public');
  }

  console.log('Vercel build hooks completed');
}

// Run the build process
build().catch(error => {
  console.error('Build hook error:', error);
  process.exit(1);
});
