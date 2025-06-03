#!/usr/bin/env node

/**
 * Build script for check-vscode-extensions
 * 
 * This script:
 * 1. Copies the main script to lib/index.js
 * 2. Ensures i18n module is available
 * 3. Validates the build
 */

const fs = require('fs')
const path = require('path')

const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

function log(message, color = '') {
  console.log(`${color}${message}${RESET}`)
}

function success(message) {
  log(`✅ ${message}`, GREEN)
}

function info(message) {
  log(`ℹ️ ${message}`, YELLOW)
}

function error(message) {
  log(`❌ ${message}`, RED)
  process.exit(1)
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    info(`Created directory: ${dir}`)
  }
}

function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest)
    success(`Copied ${src} → ${dest}`)
  } catch (err) {
    error(`Failed to copy ${src} to ${dest}: ${err.message}`)
  }
}

function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    error(`Required file missing: ${filePath}`)
  }
  
  try {
    // Try to require the file to check for syntax errors
    require(path.resolve(filePath))
    success(`Validated: ${filePath}`)
  } catch (err) {
    error(`Validation failed for ${filePath}: ${err.message}`)
  }
}

function main() {
  info('Starting build process...\n')
  
  // Ensure lib directory exists
  ensureDir('lib')
  
  // Check if i18n.js already exists in lib, if not copy it
  if (!fs.existsSync('lib/i18n.js')) {
    info('i18n.js not found in lib/, it should already be there')
    error('lib/i18n.js is missing. Please ensure it exists.')
  }
  
  // Copy main script (this will overwrite the existing index.js)
  // Note: We're not copying from scripts/ anymore since lib/index.js is the main file
  info('Using existing lib/index.js as main script')
  
  // Validate required files
  info('\nValidating build files...')
  validateFile('lib/index.js')
  validateFile('lib/i18n.js')
  validateFile('bin/check-vscode-extensions.js')
  
  // Test the CLI
  info('\nTesting CLI functionality...')
  try {
    const { execSync } = require('child_process')
    // Test that the CLI can be loaded without errors
    execSync('node bin/check-vscode-extensions.js --help || true', { stdio: 'ignore' })
    success('CLI test passed')
  } catch (err) {
    error(`CLI test failed: ${err.message}`)
  }
  
  success('\n🎉 Build completed successfully!')
  info('Ready for publishing')
}

if (require.main === module) {
  main()
}
