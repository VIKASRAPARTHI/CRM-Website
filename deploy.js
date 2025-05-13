#!/usr/bin/env node

/**
 * Deployment script for the Xeno CRM application
 * 
 * This script automates the deployment process by:
 * 1. Building the client and server
 * 2. Copying the necessary files to the deployment directory
 * 3. Setting up environment variables
 * 
 * Usage: node deploy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Use .env.production for deployment
  envFile: '.env.production',
  // Files to include in the deployment
  includeFiles: [
    'package.json',
    'package-lock.json',
    '.env.production',
    'dist',
  ],
  // Commands to run
  commands: {
    build: 'npm run build',
    install: 'npm ci --production',
    start: 'npm start',
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let color = colors.reset;
  
  switch (type) {
    case 'success':
      color = colors.green;
      break;
    case 'warning':
      color = colors.yellow;
      break;
    case 'error':
      color = colors.red;
      break;
    default:
      color = colors.reset;
  }
  
  console.log(`${colors.bright}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  try {
    log(`Running: ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      ...options
    });
    return true;
  } catch (error) {
    log(`Failed to run command: ${command}`, 'error');
    log(error.message, 'error');
    return false;
  }
}

// Main deployment function
async function deploy() {
  log('Starting deployment process...', 'info');
  
  // Check if .env.production exists
  if (!fs.existsSync(config.envFile)) {
    log(`${config.envFile} file not found. Please create it first.`, 'error');
    process.exit(1);
  }
  
  // Build the application
  log('Building the application...', 'info');
  if (!runCommand(config.commands.build)) {
    log('Build failed. Aborting deployment.', 'error');
    process.exit(1);
  }
  
  log('Build completed successfully!', 'success');
  log('Your application is ready for deployment.', 'success');
  log('\nTo deploy, copy the following files to your server:', 'info');
  config.includeFiles.forEach(file => {
    log(`- ${file}`, 'info');
  });
  
  log('\nThen run the following commands on your server:', 'info');
  log(`1. ${config.commands.install}`, 'info');
  log(`2. ${config.commands.start}`, 'info');
  
  log('\nDeployment preparation completed!', 'success');
}

// Run the deployment
deploy().catch(error => {
  log(`Deployment failed: ${error.message}`, 'error');
  process.exit(1);
});
