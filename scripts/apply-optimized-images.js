#!/usr/bin/env node

/**
 * Apply Optimized Images Script
 * 
 * Replaces original images with optimized versions
 * Creates a backup of original images first
 * 
 * Usage: npm run optimize-images:apply
 */

const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const OPTIMIZED_DIR = path.join(__dirname, '../public/images-optimized');
const BACKUP_DIR = path.join(__dirname, '../public/images-backup');

function applyOptimizedImages() {
  console.log('🔄 Applying optimized images...\n');

  // Check if optimized directory exists
  if (!fs.existsSync(OPTIMIZED_DIR)) {
    console.error('❌ Optimized images directory not found!');
    console.error('   Run "npm run optimize-images" first.\n');
    process.exit(1);
  }

  // Create backup of original images
  if (fs.existsSync(IMAGES_DIR)) {
    console.log('📦 Creating backup of original images...');
    if (fs.existsSync(BACKUP_DIR)) {
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
    fs.cpSync(IMAGES_DIR, BACKUP_DIR, { recursive: true });
    console.log(`   ✓ Backup created: ${BACKUP_DIR}\n`);
  }

  // Copy optimized images to images directory
  console.log('📋 Copying optimized images...');
  copyDirectory(OPTIMIZED_DIR, IMAGES_DIR);
  console.log('   ✓ Optimized images applied!\n');

  console.log('✨ Done! Original images backed up to:', BACKUP_DIR);
  console.log('💡 To restore originals: mv public/images-backup public/images\n');
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      // Only copy image files (exclude WebP - not used by default)
      if (entry.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Run the script
applyOptimizedImages();

