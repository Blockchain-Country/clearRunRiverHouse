#!/usr/bin/env node

/**
 * Remove Duplicate Image Formats Script
 * 
 * Removes duplicate image files with the same base name but different extensions.
 * Prefers JPG over PNG (JPG is usually smaller for photos).
 * 
 * Usage: npm run remove-duplicates
 */

const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '../public/images');

// Priority order: prefer formats that are typically smaller/better for web
const FORMAT_PRIORITY = {
  'jpg': 1,
  'jpeg': 1,
  'JPG': 1,
  'JPEG': 1,
  'png': 2,
  'PNG': 2,
  'webp': 3,
  'WEBP': 3,
};

function getBaseName(filename) {
  // Remove extension to get base name
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
  console.log('🔍 Scanning for duplicate image formats...\n');
  console.log(`📁 Scanning: ${IMAGES_DIR}\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  let totalRemoved = 0;
  let totalSaved = 0;

  // Process each subdirectory
  const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const subdir of subdirs) {
    const subdirPath = path.join(IMAGES_DIR, subdir);
    const files = fs.readdirSync(subdirPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(name => /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(name));

    // Group files by base name
    const fileGroups = {};
    files.forEach(file => {
      const baseName = getBaseName(file);
      if (!fileGroups[baseName]) {
        fileGroups[baseName] = [];
      }
      fileGroups[baseName].push(file);
    });

    // Find duplicates (same base name, different extensions)
    Object.keys(fileGroups).forEach(baseName => {
      const group = fileGroups[baseName];
      if (group.length > 1) {
        // Sort by priority (lower number = higher priority)
        group.sort((a, b) => {
          const extA = getExtension(a);
          const extB = getExtension(b);
          return getPriority(extA) - getPriority(extB);
        });

        // Keep the first one (highest priority), remove the rest
        const keepFile = group[0];
        const removeFiles = group.slice(1);

        console.log(`📁 ${subdir}/${baseName}:`);
        console.log(`   ✓ Keeping: ${keepFile}`);

        removeFiles.forEach(file => {
          const filePath = path.join(subdirPath, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          
          fs.unlinkSync(filePath);
          totalRemoved++;
          totalSaved += stats.size;
          
          console.log(`   ✗ Removed: ${file} (${sizeMB} MB)`);
        });
        console.log('');
      }
    });
  }

  if (totalRemoved > 0) {
    const savedMB = (totalSaved / (1024 * 1024)).toFixed(2);
    console.log(`✨ Done! Removed ${totalRemoved} duplicate file(s), freed ${savedMB} MB\n`);
  } else {
    console.log('✨ No duplicates found. All good!\n');
  }
}

// Run the script
removeDuplicateFormats();

