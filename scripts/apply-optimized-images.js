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

const IMAGES_DIR = path.join(__dirname, '../src/assets/images');
const OPTIMIZED_DIR = path.join(__dirname, '../src/assets/images-optimized');
const BACKUP_DIR = path.join(__dirname, '../src/assets/images-backup');

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

async function applyOptimizedImages() {
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

  // Remove uppercase .JPG files FIRST (before copying)
  // This is critical on macOS which has case-insensitive filesystem
  // mb_3.JPG and mb_3.jpg are treated as the same file!
  console.log('🗑️  Removing uppercase .JPG files (must be done before copying on macOS)...');
  removeUppercaseJpgFilesBeforeCopy();

  // Small delay to ensure filesystem operations complete
  await new Promise(resolve => setTimeout(resolve, 100));

  // Copy optimized images to images directory
  console.log('📋 Copying optimized images...');
  copyDirectory(OPTIMIZED_DIR, IMAGES_DIR);
  console.log('   ✓ Optimized images applied!\n');

  // Remove duplicate formats after copying
  console.log('🔍 Removing duplicate formats...');
  removeDuplicateFormats();

  // Remove original non-JPG files that were converted (HEIC, PNG, etc.)
  console.log('🗑️  Removing original non-JPG files (HEIC, PNG, etc.)...');
  removeOriginalNonJpgFiles();

  console.log('✨ Done! Original images backed up to:', BACKUP_DIR);
  console.log('💡 To restore originals: mv src/assets/images-backup src/assets/images\n');
}

function removeOriginalNonJpgFiles() {
  let totalRemoved = 0;
  let totalSaved = 0;

  // Process root level files
  if (fs.existsSync(IMAGES_DIR)) {
    const rootFiles = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(name => /\.(heic|heif|HEIC|HEIF|png|PNG)$/i.test(name));

    rootFiles.forEach(file => {
      const filePath = path.join(IMAGES_DIR, file);
      const baseName = path.basename(file, path.extname(file));
      const jpgPath = path.join(IMAGES_DIR, `${baseName}.jpg`);
      
      // Only remove if JPG version exists (meaning it was converted)
      if (fs.existsSync(jpgPath)) {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        totalRemoved++;
        totalSaved += stats.size;
      }
    });
  }

  // Process subdirectories
  const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const subdir of subdirs) {
    const subdirPath = path.join(IMAGES_DIR, subdir);
    const files = fs.readdirSync(subdirPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(name => /\.(heic|heif|HEIC|HEIF|png|PNG)$/i.test(name));

    files.forEach(file => {
      const filePath = path.join(subdirPath, file);
      const baseName = path.basename(file, path.extname(file));
      const jpgPath = path.join(subdirPath, `${baseName}.jpg`);
      
      // Only remove if JPG version exists (meaning it was converted)
      if (fs.existsSync(jpgPath)) {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        totalRemoved++;
        totalSaved += stats.size;
      }
    });
  }

  if (totalRemoved > 0) {
    const savedMB = (totalSaved / (1024 * 1024)).toFixed(2);
    console.log(`   ✓ Removed ${totalRemoved} original non-JPG file(s), freed ${savedMB} MB\n`);
  } else {
    console.log('   ✓ No original non-JPG files to remove\n');
  }
}

// Remove uppercase .JPG files BEFORE copying (for case-insensitive filesystems like macOS)
// We check if the lowercase version exists in optimized folder
function removeUppercaseJpgFilesBeforeCopy() {
  let totalRemoved = 0;
  let totalSaved = 0;

  // Process root level files
  if (fs.existsSync(IMAGES_DIR)) {
    const rootFiles = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(name => /\.(JPG|JPEG)$/.test(name));

    rootFiles.forEach(file => {
      const filePath = path.join(IMAGES_DIR, file);
      const baseName = path.basename(file, path.extname(file));
      const lowercaseInOptimized = path.join(OPTIMIZED_DIR, `${baseName.toLowerCase()}.jpg`);
      
      // Remove if lowercase version exists in optimized folder (we're about to copy it)
      if (fs.existsSync(lowercaseInOptimized)) {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        totalRemoved++;
        totalSaved += stats.size;
      }
    });
  }

  // Process subdirectories
  const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const subdir of subdirs) {
    const subdirPath = path.join(IMAGES_DIR, subdir);
    const optimizedSubdirPath = path.join(OPTIMIZED_DIR, subdir);
    const files = fs.readdirSync(subdirPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(name => /\.(JPG|JPEG)$/.test(name));

    files.forEach(file => {
      const filePath = path.join(subdirPath, file);
      const baseName = path.basename(file, path.extname(file));
      const lowercaseInOptimized = path.join(optimizedSubdirPath, `${baseName.toLowerCase()}.jpg`);
      
      // Remove if lowercase version exists in optimized folder (we're about to copy it)
      if (fs.existsSync(lowercaseInOptimized)) {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        totalRemoved++;
        totalSaved += stats.size;
      }
    });
  }

  if (totalRemoved > 0) {
    const savedMB = (totalSaved / (1024 * 1024)).toFixed(2);
    console.log(`   ✓ Removed ${totalRemoved} uppercase .JPG file(s), freed ${savedMB} MB\n`);
  } else {
    console.log('   ✓ No uppercase .JPG files to remove\n');
  }
}

// Remove uppercase .JPG files AFTER copying (for cleanup)
function removeUppercaseJpgFiles() {
  let totalRemoved = 0;
  let totalSaved = 0;

  // Process root level files
  if (fs.existsSync(IMAGES_DIR)) {
    const rootFiles = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(name => /\.(JPG|JPEG)$/.test(name));

    rootFiles.forEach(file => {
      const filePath = path.join(IMAGES_DIR, file);
      const baseName = path.basename(file, path.extname(file));
      const lowercasePath = path.join(IMAGES_DIR, `${baseName.toLowerCase()}.jpg`);
      
      // Only remove if lowercase version exists (meaning it was converted)
      if (fs.existsSync(lowercasePath)) {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        totalRemoved++;
        totalSaved += stats.size;
      }
    });
  }

  // Process subdirectories
  const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const subdir of subdirs) {
    const subdirPath = path.join(IMAGES_DIR, subdir);
    const files = fs.readdirSync(subdirPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(name => /\.(JPG|JPEG)$/.test(name));

    files.forEach(file => {
      const filePath = path.join(subdirPath, file);
      const baseName = path.basename(file, path.extname(file));
      const lowercasePath = path.join(subdirPath, `${baseName.toLowerCase()}.jpg`);
      
      // Only remove if lowercase version exists (meaning it was converted)
      if (fs.existsSync(lowercasePath)) {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        totalRemoved++;
        totalSaved += stats.size;
      }
    });
  }

  if (totalRemoved > 0) {
    const savedMB = (totalSaved / (1024 * 1024)).toFixed(2);
    console.log(`   ✓ Removed ${totalRemoved} uppercase .JPG file(s), freed ${savedMB} MB\n`);
  } else {
    console.log('   ✓ No uppercase .JPG files to remove\n');
  }
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

