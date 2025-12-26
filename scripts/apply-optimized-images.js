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

// Format priority for duplicate removal (lower number = higher priority)
const FORMAT_PRIORITY = {
  'jpg': 1, 'jpeg': 1, 'JPG': 1, 'JPEG': 1,
  'png': 2, 'PNG': 2,
  'webp': 3, 'WEBP': 3,
};

function getBaseName(filename) {
  return filename.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG|webp|WEBP)$/i, '');
}

function getExtension(filename) {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1] : '';
}

function getPriority(ext) {
  return FORMAT_PRIORITY[ext] || 999;
}

function removeDuplicateFormats() {
  let totalRemoved = 0;
  let totalSaved = 0;

  const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const subdir of subdirs) {
    const subdirPath = path.join(IMAGES_DIR, subdir);
    const files = fs.readdirSync(subdirPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(name => /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(name));

    const fileGroups = {};
    files.forEach(file => {
      const baseName = getBaseName(file);
      if (!fileGroups[baseName]) {
        fileGroups[baseName] = [];
      }
      fileGroups[baseName].push(file);
    });

    Object.keys(fileGroups).forEach(baseName => {
      const group = fileGroups[baseName];
      if (group.length > 1) {
        group.sort((a, b) => {
          const extA = getExtension(a);
          const extB = getExtension(b);
          return getPriority(extA) - getPriority(extB);
        });

        const keepFile = group[0];
        const removeFiles = group.slice(1);

        removeFiles.forEach(file => {
          const filePath = path.join(subdirPath, file);
          const stats = fs.statSync(filePath);
          fs.unlinkSync(filePath);
          totalRemoved++;
          totalSaved += stats.size;
        });
      }
    });
  }

  if (totalRemoved > 0) {
    const savedMB = (totalSaved / (1024 * 1024)).toFixed(2);
    console.log(`🔍 Removed ${totalRemoved} duplicate format(s), freed ${savedMB} MB\n`);
  }
}

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

  // Remove duplicate formats after copying
  console.log('🔍 Removing duplicate formats...');
  removeDuplicateFormats();

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

