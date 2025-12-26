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

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Configuration
const config = {
  jpeg: {
    quality: 85,
    progressive: true,
  },
  png: {
    quality: [0.6, 0.8],
  },
  webp: {
    quality: 85,
  },
};

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

  try {
    // Load imagemin and plugins (all may be ES modules)
    console.log('📦 Loading imagemin and plugins...');
    const [imagemin, imageminMozjpeg, imageminPngquant, imageminWebp] = await Promise.all([
      getModule('imagemin'),
      getModule('imagemin-mozjpeg'),
      getModule('imagemin-pngquant'),
      getModule('imagemin-webp'),
    ]);

    // Create plugin instances
    const mozjpegPlugin = typeof imageminMozjpeg === 'function' 
      ? imageminMozjpeg(config.jpeg) 
      : imageminMozjpeg.default(config.jpeg);
    
    const pngquantPlugin = typeof imageminPngquant === 'function'
      ? imageminPngquant(config.png)
      : imageminPngquant.default(config.png);
    
    const webpPlugin = typeof imageminWebp === 'function'
      ? imageminWebp(config.webp)
      : imageminWebp.default(config.webp);

    console.log('   ✓ All modules loaded\n');

    let totalJpg = 0;
    let totalPng = 0;
    let totalWebp = 0;

    // Process each subdirectory to preserve structure
    const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Also process root level images
    const rootImages = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(dirent.name))
      .map(dirent => dirent.name);

    // Process root level images
    if (rootImages.length > 0) {
      const rootJpg = await imagemin([`${IMAGES_DIR}/*.{jpg,JPG,jpeg,JPEG}`], {
        destination: OUTPUT_DIR,
        plugins: [mozjpegPlugin],
      });
      totalJpg += rootJpg.length;

      const rootPng = await imagemin([`${IMAGES_DIR}/*.{png,PNG}`], {
        destination: OUTPUT_DIR,
        plugins: [pngquantPlugin],
      });
      totalPng += rootPng.length;

      const rootWebp = await imagemin([`${IMAGES_DIR}/*.{jpg,jpeg,png,JPG,JPEG,PNG}`], {
        destination: OUTPUT_DIR,
        plugins: [webpPlugin],
      });
      totalWebp += rootWebp.length;
    }

    // Process each subdirectory
    for (const subdir of subdirs) {
      const subdirPath = path.join(IMAGES_DIR, subdir);
      const outputSubdirPath = path.join(OUTPUT_DIR, subdir);

      // Optimize JPG images in subdirectory
      const jpgFiles = await imagemin([`${subdirPath}/**/*.{jpg,JPG,jpeg,JPEG}`], {
        destination: outputSubdirPath,
        plugins: [mozjpegPlugin],
      });
      totalJpg += jpgFiles.length;

      // Optimize PNG images in subdirectory
      const pngFiles = await imagemin([`${subdirPath}/**/*.{png,PNG}`], {
        destination: outputSubdirPath,
        plugins: [pngquantPlugin],
      });
      totalPng += pngFiles.length;

      // Create WebP versions in subdirectory
      const webpFiles = await imagemin([`${subdirPath}/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}`], {
        destination: outputSubdirPath,
        plugins: [webpPlugin],
      });
      totalWebp += webpFiles.length;
    }

    console.log(`   ✓ Optimized ${totalJpg} JPG file(s)`);
    console.log(`   ✓ Optimized ${totalPng} PNG file(s)`);
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
