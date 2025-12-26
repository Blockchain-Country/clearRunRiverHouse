#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Converts and compresses images in src/assets/images/ directory
 * Converts all formats (HEIC, PNG, etc.) to JPG format only
 * 
 * Usage: npm run optimize-images
 */

const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '../src/assets/images');
const OUTPUT_DIR = path.join(__dirname, '../src/assets/images-optimized');

// Configuration
const MIN_SIZE_TO_OPTIMIZE = 5 * 1024 * 1024; // 5MB in bytes - skip smaller images

// Clean and ensure output directory exists
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Cleanup function to remove any leftover temp files
function cleanupTempFiles(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      cleanupTempFiles(filePath);
    } else if (file.name.startsWith('temp_')) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  }
}

// Clean up any temp files in source directory (shouldn't be there, but just in case)
cleanupTempFiles(IMAGES_DIR);

// Configuration
const config = {
  jpeg: {
    quality: 85,
    progressive: true,
  },
};

// Supported image formats (including HEIC)
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|heic|HEIC|JPG|JPEG|PNG)$/i;

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
      console.error('npm install --save-dev imagemin imagemin-mozjpeg sharp heic-convert');
      throw e2;
    }
  }
}

// Convert image to JPG using sharp (handles PNG, etc.) or heic-convert (for HEIC)
// Uses reasonable quality for conversion (will be optimized later if >= 5MB)
async function convertToJpg(inputPath, outputPath, sharp, heicConvert) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    
    // Use heic-convert for HEIC files (sharp doesn't support HEIC without libheif)
    if (ext === '.heic' || ext === '.heif') {
      const fs = require('fs').promises;
      const inputBuffer = await fs.readFile(inputPath);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 0.9
      });
      await fs.writeFile(outputPath, outputBuffer);
      return true;
    } else {
      // Use sharp for other formats (PNG, etc.)
      const image = sharp(inputPath);
      await image
        .jpeg({ quality: 90, progressive: true })
        .toFile(outputPath);
      return true;
    }
  } catch (error) {
    console.error(`   ⚠️  Failed to convert ${path.basename(inputPath)}: ${error.message}`);
    return false;
  }
}

// Optimize JPG using imagemin-mozjpeg
async function optimizeJpg(inputPath, outputPath, mozjpegPlugin, imagemin) {
  try {
    const result = await imagemin([inputPath], {
      destination: path.dirname(outputPath),
      plugins: [mozjpegPlugin],
    });
    
    if (result && result.length > 0) {
      // Rename to desired output name if needed
      const optimizedPath = result[0].destinationPath;
      if (optimizedPath !== outputPath) {
        fs.renameSync(optimizedPath, outputPath);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`   ⚠️  Failed to optimize ${path.basename(inputPath)}: ${error.message}`);
    return false;
  }
}

async function optimizeImages() {
  console.log('🖼️  Starting image optimization (JPG format only)...\n');
  console.log(`📁 Source: ${IMAGES_DIR}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  try {
    // Load required modules
    console.log('📦 Loading modules...');
    const [imagemin, imageminMozjpeg, sharp, heicConvert] = await Promise.all([
      getModule('imagemin'),
      getModule('imagemin-mozjpeg'),
      getModule('sharp'),
      getModule('heic-convert'),
    ]);

    // Create plugin instance
    const mozjpegPlugin = typeof imageminMozjpeg === 'function' 
      ? imageminMozjpeg(config.jpeg) 
      : imageminMozjpeg.default(config.jpeg);

    console.log('   ✓ All modules loaded\n');

    let totalConverted = 0;
    let totalOptimized = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Helper function to check if image should be optimized
    function shouldOptimize(filePath) {
      const stats = fs.statSync(filePath);
      return stats.size >= MIN_SIZE_TO_OPTIMIZE;
    }

    // Helper to get output filename (always .jpg)
    function getOutputFilename(inputFilename) {
      const baseName = path.basename(inputFilename, path.extname(inputFilename));
      return `${baseName}.jpg`;
    }

    // Process root level images
    const rootImages = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && IMAGE_EXTENSIONS.test(dirent.name))
      .map(dirent => dirent.name);

    if (rootImages.length > 0) {
      console.log(`📸 Processing ${rootImages.length} root level image(s)...`);
      
      for (const imageFile of rootImages) {
        const inputPath = path.join(IMAGES_DIR, imageFile);
        const outputFilename = getOutputFilename(imageFile);
        const outputPath = path.join(OUTPUT_DIR, outputFilename);
        const isJpg = /\.(jpg|jpeg)$/i.test(imageFile);
        const needsConversion = !isJpg;
        const needsOptimization = shouldOptimize(inputPath);

          // Always convert to JPG first (if needed)
          if (needsConversion) {
            const tempJpgPath = path.join(OUTPUT_DIR, `temp_${outputFilename}`);
            let tempFileCreated = false;
            try {
              const converted = await convertToJpg(inputPath, tempJpgPath, sharp, heicConvert);
              if (converted) {
                tempFileCreated = true;
                totalConverted++;
                // If >= 5MB, optimize the converted JPG
                if (needsOptimization) {
                  const optimized = await optimizeJpg(tempJpgPath, outputPath, mozjpegPlugin, imagemin);
                  if (optimized) {
                    totalOptimized++;
                  } else {
                    // If optimization failed, keep the converted file
                    if (fs.existsSync(tempJpgPath)) {
                      fs.renameSync(tempJpgPath, outputPath);
                    }
                    totalOptimized++;
                  }
                } else {
                  // < 5MB, just use the converted file without optimization
                  if (fs.existsSync(tempJpgPath)) {
                    fs.renameSync(tempJpgPath, outputPath);
                  }
                  totalSkipped++;
                }
                // Always remove temp file after processing
                if (fs.existsSync(tempJpgPath)) {
                  fs.unlinkSync(tempJpgPath);
                }
              } else {
                totalErrors++;
              }
            } catch (error) {
              // Ensure temp file is cleaned up even on error
              if (tempFileCreated && fs.existsSync(tempJpgPath)) {
                try {
                  fs.unlinkSync(tempJpgPath);
                } catch (e) {
                  // Ignore cleanup errors
                }
              }
              totalErrors++;
              console.error(`   ⚠️  Error processing ${imageFile}: ${error.message}`);
            }
        } else {
          // Already JPG
          if (needsOptimization) {
            // >= 5MB, optimize it
            const optimized = await optimizeJpg(inputPath, outputPath, mozjpegPlugin, imagemin);
            if (optimized) {
              totalOptimized++;
            } else {
              // If optimization failed, copy original
              fs.copyFileSync(inputPath, outputPath);
              totalOptimized++;
            }
          } else {
            // < 5MB, just copy without optimization
            fs.copyFileSync(inputPath, outputPath);
            totalSkipped++;
          }
        }
      }
    }

    // Process each subdirectory to preserve structure
    const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const subdir of subdirs) {
      const subdirPath = path.join(IMAGES_DIR, subdir);
      const outputSubdirPath = path.join(OUTPUT_DIR, subdir);

      // Ensure output subdirectory exists
      if (!fs.existsSync(outputSubdirPath)) {
        fs.mkdirSync(outputSubdirPath, { recursive: true });
      }

      // Get all image files in subdirectory
      const imageFiles = fs.readdirSync(subdirPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && IMAGE_EXTENSIONS.test(dirent.name))
        .map(dirent => dirent.name);

      if (imageFiles.length > 0) {
        console.log(`📸 Processing ${imageFiles.length} image(s) in ${subdir}/...`);

        for (const imageFile of imageFiles) {
          const inputPath = path.join(subdirPath, imageFile);
          const outputFilename = getOutputFilename(imageFile);
          const outputPath = path.join(outputSubdirPath, outputFilename);
          const isJpg = /\.(jpg|jpeg)$/i.test(imageFile);
          const needsConversion = !isJpg;
          const needsOptimization = shouldOptimize(inputPath);

          // Always convert to JPG first (if needed)
          if (needsConversion) {
            const tempJpgPath = path.join(outputSubdirPath, `temp_${outputFilename}`);
            let tempFileCreated = false;
            try {
              const converted = await convertToJpg(inputPath, tempJpgPath, sharp, heicConvert);
              if (converted) {
                tempFileCreated = true;
                totalConverted++;
                // If >= 5MB, optimize the converted JPG
                if (needsOptimization) {
                  const optimized = await optimizeJpg(tempJpgPath, outputPath, mozjpegPlugin, imagemin);
                  if (optimized) {
                    totalOptimized++;
                  } else {
                    // If optimization failed, keep the converted file
                    if (fs.existsSync(tempJpgPath)) {
                      fs.renameSync(tempJpgPath, outputPath);
                    }
                    totalOptimized++;
                  }
                } else {
                  // < 5MB, just use the converted file without optimization
                  if (fs.existsSync(tempJpgPath)) {
                    fs.renameSync(tempJpgPath, outputPath);
                  }
                  totalSkipped++;
                }
                // Always remove temp file after processing
                if (fs.existsSync(tempJpgPath)) {
                  fs.unlinkSync(tempJpgPath);
                }
              } else {
                totalErrors++;
              }
            } catch (error) {
              // Ensure temp file is cleaned up even on error
              if (tempFileCreated && fs.existsSync(tempJpgPath)) {
                try {
                  fs.unlinkSync(tempJpgPath);
                } catch (e) {
                  // Ignore cleanup errors
                }
              }
              totalErrors++;
              console.error(`   ⚠️  Error processing ${imageFile}: ${error.message}`);
            }
          } else {
            // Already JPG
            if (needsOptimization) {
              // >= 5MB, optimize it
              const optimized = await optimizeJpg(inputPath, outputPath, mozjpegPlugin, imagemin);
              if (optimized) {
                totalOptimized++;
              } else {
                // If optimization failed, copy original
                fs.copyFileSync(inputPath, outputPath);
                totalOptimized++;
              }
            } else {
              // < 5MB, just copy without optimization
              fs.copyFileSync(inputPath, outputPath);
              totalSkipped++;
            }
          }
        }
      }
    }

    console.log('\n✨ Optimization complete!');
    if (totalConverted > 0) {
      console.log(`🔄 Converted ${totalConverted} file(s) to JPG format`);
    }
    console.log(`📊 Optimized ${totalOptimized} JPG file(s) (≥ 5MB)`);
    if (totalSkipped > 0) {
      console.log(`⏭️  Copied ${totalSkipped} file(s) without optimization (< 5MB)`);
    }
    if (totalErrors > 0) {
      console.log(`⚠️  ${totalErrors} error(s) encountered`);
    }

    // Calculate size reduction
    const originalSize = getDirectorySize(IMAGES_DIR);
    const optimizedSize = getDirectorySize(OUTPUT_DIR);
    const reduction = originalSize > 0 
      ? ((originalSize - optimizedSize) / originalSize * 100).toFixed(1)
      : 0;

    console.log(`\n📊 Original size: ${formatBytes(originalSize)}`);
    console.log(`📊 Optimized size: ${formatBytes(optimizedSize)}`);
    console.log(`📊 Reduction: ${reduction}%\n`);
    console.log(`💡 Review optimized images in: ${OUTPUT_DIR}`);
    console.log(`💡 To apply: Run "npm run optimize-images:apply"\n`);

    // Final cleanup of any remaining temp files
    cleanupTempFiles(OUTPUT_DIR);

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
