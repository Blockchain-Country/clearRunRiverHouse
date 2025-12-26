#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Compresses images in public/images/ directory using imagemin
 * Supports: JPG, PNG, and creates WebP versions
 * 
 * Usage: npm run optimize-images
 */

const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const OUTPUT_DIR = path.join(__dirname, '../public/images-optimized');

// Configuration
const MIN_SIZE_TO_OPTIMIZE = 5 * 1024 * 1024; // 5MB in bytes - skip smaller images

// Clean and ensure output directory exists
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Configuration
const config = {
  jpeg: {
    quality: 85,
    progressive: true,
  },
  webp: {
    quality: 85,
  },
};

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

// Helper to get module (handles both CommonJS and ES modules)
async function getModule(moduleName) {
  try {
    // Try CommonJS require first
    const module = require(moduleName);
    // If it's an ES module, it might have a default export
    return module.default || module;
  } catch (e) {
    // Try dynamic import for ES modules
    try {
      const module = await import(moduleName);
      return module.default || module;
    } catch (e2) {
      console.error(`❌ Failed to load ${moduleName}`);
      console.error('Please ensure dependencies are installed:');
      console.error('npm install --save-dev imagemin imagemin-mozjpeg imagemin-pngquant imagemin-webp');
      throw e2;
    }
  }
}

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');
  console.log(`📁 Source: ${IMAGES_DIR}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  // Remove duplicate formats before optimizing
  console.log('🔍 Checking for duplicate image formats...');
  removeDuplicateFormats();

  try {
    // Load imagemin and plugins (all may be ES modules)
    // Only JPG and WebP since we remove PNG duplicates
    console.log('📦 Loading imagemin and plugins...');
    const [imagemin, imageminMozjpeg, imageminWebp] = await Promise.all([
      getModule('imagemin'),
      getModule('imagemin-mozjpeg'),
      getModule('imagemin-webp'),
    ]);

    // Create plugin instances
    const mozjpegPlugin = typeof imageminMozjpeg === 'function' 
      ? imageminMozjpeg(config.jpeg) 
      : imageminMozjpeg.default(config.jpeg);
    
    const webpPlugin = typeof imageminWebp === 'function'
      ? imageminWebp(config.webp)
      : imageminWebp.default(config.webp);

    console.log('   ✓ All modules loaded\n');

    let totalJpg = 0;
    let totalSkipped = 0;
    let totalWebp = 0;

    // Process each subdirectory to preserve structure
    const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Helper function to check if image should be optimized
    function shouldOptimize(filePath) {
      const stats = fs.statSync(filePath);
      return stats.size >= MIN_SIZE_TO_OPTIMIZE;
    }

    // Process root level images (only JPG since we remove PNG duplicates)
    const rootImages = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && /\.(jpg|jpeg|JPG|JPEG)$/i.test(dirent.name))
      .map(dirent => dirent.name);

    if (rootImages.length > 0) {
      const imagesToOptimize = rootImages.filter(img => {
        const imgPath = path.join(IMAGES_DIR, img);
        return shouldOptimize(imgPath);
      });

      const imagesToSkip = rootImages.filter(img => {
        const imgPath = path.join(IMAGES_DIR, img);
        return !shouldOptimize(imgPath);
      });

      totalSkipped += imagesToSkip.length;
      if (imagesToSkip.length > 0) {
        console.log(`   ⏭️  Skipped ${imagesToSkip.length} small image(s) (< 5MB)`);
      }

      if (imagesToOptimize.length > 0) {
        const rootJpg = await imagemin(
          imagesToOptimize.map(img => path.join(IMAGES_DIR, img)),
          {
            destination: OUTPUT_DIR,
            plugins: [mozjpegPlugin],
          }
        );
        totalJpg += rootJpg.length;

        // Create WebP versions only for optimized images
        const rootWebp = await imagemin(
          imagesToOptimize.map(img => path.join(IMAGES_DIR, img)),
          {
            destination: OUTPUT_DIR,
            plugins: [webpPlugin],
          }
        );
        totalWebp += rootWebp.length;
      }
    }

    // Process each subdirectory (only JPG files, skip small ones)
    for (const subdir of subdirs) {
      const subdirPath = path.join(IMAGES_DIR, subdir);
      const outputSubdirPath = path.join(OUTPUT_DIR, subdir);

      // Ensure output subdirectory exists
      if (!fs.existsSync(outputSubdirPath)) {
        fs.mkdirSync(outputSubdirPath, { recursive: true });
      }

      // Get all JPG files in subdirectory
      const jpgFiles = fs.readdirSync(subdirPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && /\.(jpg|jpeg|JPG|JPEG)$/i.test(dirent.name))
        .map(dirent => dirent.name);

      if (jpgFiles.length > 0) {
        // Separate files by size
        const filesToOptimize = [];
        const filesToSkip = [];

        jpgFiles.forEach(file => {
          const filePath = path.join(subdirPath, file);
          if (shouldOptimize(filePath)) {
            filesToOptimize.push(filePath);
          } else {
            filesToSkip.push(file);
            totalSkipped++;
          }
        });

        if (filesToSkip.length > 0) {
          console.log(`   ⏭️  Skipped ${filesToSkip.length} small file(s) in ${subdir}/`);
        }

        // Optimize only large JPG images
        if (filesToOptimize.length > 0) {
          const optimizedJpg = await imagemin(filesToOptimize, {
            destination: outputSubdirPath,
            plugins: [mozjpegPlugin],
          });
          totalJpg += optimizedJpg.length;

          // Create WebP versions only for optimized images
          const webpFiles = await imagemin(filesToOptimize, {
            destination: outputSubdirPath,
            plugins: [webpPlugin],
          });
          totalWebp += webpFiles.length;
        }
      }
    }

    console.log(`   ✓ Optimized ${totalJpg} JPG file(s) (≥ 5MB)`);
    if (totalSkipped > 0) {
      console.log(`   ⏭️  Skipped ${totalSkipped} small file(s) (< 5MB - already optimized)`);
    }
    console.log(`   ✓ Created ${totalWebp} WebP file(s)`);

    // Calculate size reduction
    const originalSize = getDirectorySize(IMAGES_DIR);
    const optimizedSize = getDirectorySize(OUTPUT_DIR);
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

    console.log('\n✨ Optimization complete!');
    console.log(`📊 Original size: ${formatBytes(originalSize)}`);
    console.log(`📊 Optimized size: ${formatBytes(optimizedSize)}`);
    console.log(`📊 Reduction: ${reduction}%\n`);
    console.log(`💡 Review optimized images in: ${OUTPUT_DIR}`);
    console.log(`💡 To apply: Run "npm run optimize-images:apply"\n`);

  } catch (error) {
    console.error('❌ Error optimizing images:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        calculateSize(filePath);
      } else {
        totalSize += stat.size;
      }
    });
  }
  
  if (fs.existsSync(dirPath)) {
    calculateSize(dirPath);
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Run optimization
optimizeImages();
