#!/usr/bin/env node

/**
 * Custom build script for Vercel deployment
 *
 * This script:
 * 1. Builds the frontend (Vite)
 * 2. Builds the backend (Node.js)
 * 3. Prepares the dist directory for deployment
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Helper function for logging
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let prefix = '';

  switch (type) {
    case 'success':
      prefix = `${colors.green}✓${colors.reset}`;
      break;
    case 'info':
      prefix = `${colors.blue}ℹ${colors.reset}`;
      break;
    case 'warning':
      prefix = `${colors.yellow}⚠${colors.reset}`;
      break;
    case 'error':
      prefix = `${colors.red}✗${colors.reset}`;
      break;
    default:
      prefix = `${colors.blue}ℹ${colors.reset}`;
  }

  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${prefix} ${message}`);
}

// Helper function to run shell commands
function runCommand(command) {
  log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    return false;
  }
}

// Main build function
async function build() {
  log('Starting build process...', 'info');

  // Set environment to production
  process.env.NODE_ENV = 'production';

  // Step 1: Build the frontend (Vite)
  log('Building frontend with Vite...', 'info');
  if (!runCommand('npx vite build')) {
    log('Frontend build failed', 'error');
    process.exit(1);
  }
  log('Frontend build completed', 'success');

  // Step 2: Build the backend (Node.js)
  log('Building backend with esbuild...', 'info');
  if (!runCommand('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist')) {
    log('Backend build failed', 'error');
    process.exit(1);
  }
  log('Backend build completed', 'success');

  // Step 3: Create a Vercel serverless function to serve the API
  log('Creating Vercel serverless function...', 'info');

  // Create api directory if it doesn't exist
  const apiDir = path.join(process.cwd(), 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  // Create serverless function entry point
  const serverlessFunction = `
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from '../dist/index.js';

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO if needed
// const io = new Server(server);

// Export for serverless use
export default server;
`;

  fs.writeFileSync(path.join(apiDir, 'index.js'), serverlessFunction);
  log('Serverless function created', 'success');

  // Step 4: Create a package.json for the api directory
  const apiPackageJson = {
    "name": "api",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "dependencies": {
      "socket.io": "^4.7.2"
    }
  };

  fs.writeFileSync(
    path.join(apiDir, 'package.json'),
    JSON.stringify(apiPackageJson, null, 2)
  );

  log('Build process completed successfully!', 'success');
}

// Run the build process
build().catch(error => {
  log(`Build failed: ${error.message}`, 'error');
  process.exit(1);
});
