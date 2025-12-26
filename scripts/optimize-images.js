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
const MIN_SIZE_TO_OPTIMIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|heic|HEIC|JPG|JPEG|PNG)$/i;

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
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
}
cleanupTempFiles(IMAGES_DIR);

// Helper to get module (handles both CommonJS and ES modules)
async function getModule(moduleName) {
  try {
    const module = require(moduleName);
    return module.default || module;
  } catch (e) {
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

// Helper function to detect HEIC format by checking file magic bytes
async function isHeicFile(inputPath) {
  try {
    const fsPromises = require('fs').promises;
    const buffer = await fsPromises.readFile(inputPath, { start: 0, end: 12 });
    if (buffer.length >= 12) {
      const ftyp = buffer.toString('ascii', 4, 8);
      if (ftyp === 'ftyp') {
        const brand = buffer.toString('ascii', 8, 12);
        return brand.includes('heic') || brand.includes('mif1') || brand.includes('msf1') || brand.includes('hevc');
      }
    }
  } catch (e) {}
  return false;
}

// Convert HEIC to JPEG using heic-convert, then re-process through sharp
async function convertHeicToJpg(inputPath, outputPath, sharp, heicConvert, quality = 90) {
  const fsPromises = require('fs').promises;
  const inputBuffer = await fsPromises.readFile(inputPath);
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: quality / 100
  });
  const tempHeicPath = outputPath + '.heic_temp';
  await fsPromises.writeFile(tempHeicPath, outputBuffer);
  
  try {
    await sharp(tempHeicPath)
      .jpeg({ quality: quality, progressive: false, mozjpeg: false })
      .toFile(outputPath);
    if (fs.existsSync(tempHeicPath)) fs.unlinkSync(tempHeicPath);
    return true;
  } catch (sharpError) {
    if (fs.existsSync(tempHeicPath)) fs.renameSync(tempHeicPath, outputPath);
    return true;
  }
}

// Convert image to JPG using sharp (handles PNG, etc.) or heic-convert (for HEIC)
async function convertToJpg(inputPath, outputPath, sharp, heicConvert, quality = 90) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const isHeic = ext === '.heic' || ext === '.heif' || await isHeicFile(inputPath);
    
    if (isHeic) {
      return await convertHeicToJpg(inputPath, outputPath, sharp, heicConvert, quality);
    } else {
      await sharp(inputPath)
        .jpeg({ quality: quality, progressive: true })
        .toFile(outputPath);
      return true;
    }
  } catch (error) {
    // Try HEIC conversion as fallback for misnamed files
    const ext = path.extname(inputPath).toLowerCase();
    if (ext !== '.heic' && ext !== '.heif') {
      try {
        if (await isHeicFile(inputPath)) {
          return await convertHeicToJpg(inputPath, outputPath, sharp, heicConvert, quality);
        }
      } catch (e) {}
    }
    return false;
  }
}

// Compress image iteratively until it's under MAX_FILE_SIZE
async function compressUntilUnderLimit(inputPath, outputPath, sharp, heicConvert, imageminMozjpeg, imagemin) {
  const MAX_ATTEMPTS = 10;
  let quality = 85;
  let attempt = 0;
  
  while (attempt < MAX_ATTEMPTS) {
    const tempPath = outputPath + '.temp';
    let converted = false;
    
    try {
      converted = await convertToJpg(inputPath, tempPath, sharp, heicConvert, quality);
    } catch (error) {
      console.error(`   ⚠️  Conversion failed on attempt ${attempt + 1}: ${error.message}`);
    }
    
    if (!converted || !fs.existsSync(tempPath)) {
      if (attempt < MAX_ATTEMPTS - 1) {
        quality = Math.max(50, quality - 10);
        attempt++;
        continue;
      }
      console.error(`   ⚠️  Could not convert ${path.basename(inputPath)} after ${MAX_ATTEMPTS} attempts`);
      return false;
    }
    
    const mozjpegPlugin = typeof imageminMozjpeg === 'function' 
      ? imageminMozjpeg({ quality: quality, progressive: true })
      : imageminMozjpeg.default({ quality: quality, progressive: true });
    
    try {
      const result = await imagemin([tempPath], {
        destination: path.dirname(outputPath),
        plugins: [mozjpegPlugin],
      });
      
      if (result && result.length > 0) {
        const optimizedPath = result[0].destinationPath;
        const stats = fs.statSync(optimizedPath);
        
        if (stats.size <= MAX_FILE_SIZE) {
          if (optimizedPath !== outputPath) fs.renameSync(optimizedPath, outputPath);
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          return true;
        }
        fs.unlinkSync(optimizedPath);
        quality = Math.max(50, quality - 10);
        attempt++;
      } else if (fs.existsSync(tempPath)) {
        const stats = fs.statSync(tempPath);
        if (stats.size <= MAX_FILE_SIZE) {
          fs.renameSync(tempPath, outputPath);
          return true;
        }
        fs.unlinkSync(tempPath);
        quality = Math.max(50, quality - 10);
        attempt++;
      }
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        const stats = fs.statSync(tempPath);
        if (stats.size <= MAX_FILE_SIZE) {
          fs.renameSync(tempPath, outputPath);
          return true;
        }
        fs.unlinkSync(tempPath);
        quality = Math.max(50, quality - 10);
        attempt++;
      } else {
        return false;
      }
    }
    
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
  
  console.error(`   ⚠️  Could not compress ${path.basename(inputPath)} below 5MB after ${MAX_ATTEMPTS} attempts`);
  return false;
}

// Optimize JPG using imagemin-mozjpeg
async function optimizeJpg(inputPath, outputPath, mozjpegPlugin, imagemin) {
  try {
    const result = await imagemin([inputPath], {
      destination: path.dirname(outputPath),
      plugins: [mozjpegPlugin],
    });
    
    if (result && result.length > 0) {
      const optimizedPath = result[0].destinationPath;
      if (optimizedPath !== outputPath) fs.renameSync(optimizedPath, outputPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`   ⚠️  Failed to optimize ${path.basename(inputPath)}: ${error.message}`);
    return false;
  }
}

// Process a single image file
async function processImage(imageFile, inputDir, outputDir, sharp, heicConvert, imageminMozjpeg, imagemin, mozjpegPlugin, stats) {
  const inputPath = path.join(inputDir, imageFile);
  const outputFilename = path.basename(imageFile, path.extname(imageFile)).toLowerCase() + '.jpg';
  const outputPath = path.join(outputDir, outputFilename);
  const ext = path.extname(imageFile).toLowerCase();
  const needsReformat = (ext !== '.jpg' && ext !== '.jpeg') || /\.(JPG|JPEG)$/.test(imageFile);
  const fileSize = fs.statSync(inputPath).size;
  const needsCompression = fileSize > MAX_FILE_SIZE;
  const tempJpgPath = path.join(outputDir, `temp_${outputFilename}`);
  let tempFileCreated = false;

  try {
    if (needsReformat) {
      if (needsCompression) {
        const compressed = await compressUntilUnderLimit(inputPath, outputPath, sharp, heicConvert, imageminMozjpeg, imagemin);
        if (compressed) {
          stats.converted++;
          stats.optimized++;
          console.log(`   ✓ Reformatted and compressed ${imageFile} → ${outputFilename}`);
        } else {
          stats.errors++;
          console.error(`   ⚠️  Failed to compress ${imageFile}`);
        }
      } else {
        const converted = await convertToJpg(inputPath, tempJpgPath, sharp, heicConvert);
        if (converted) {
          tempFileCreated = true;
          stats.converted++;
          const optimized = await optimizeJpg(tempJpgPath, outputPath, mozjpegPlugin, imagemin);
          if (optimized) {
            const stats = fs.statSync(outputPath);
            if (stats.size > MAX_FILE_SIZE) {
              fs.unlinkSync(outputPath);
              fs.renameSync(tempJpgPath, outputPath);
            }
          } else if (fs.existsSync(tempJpgPath)) {
            fs.renameSync(tempJpgPath, outputPath);
          }
          if (fs.existsSync(tempJpgPath)) fs.unlinkSync(tempJpgPath);
          console.log(`   ✓ Reformatted ${imageFile} → ${outputFilename}`);
        } else {
          stats.errors++;
          console.error(`   ⚠️  Could not reformat ${imageFile} - file may be corrupted or in unsupported format`);
          try {
            fs.copyFileSync(inputPath, outputPath);
            console.log(`   ⚠️  Copied original ${imageFile} (reformat failed - may be corrupted)`);
          } catch (e) {
            console.error(`   ❌ Could not process ${imageFile}: ${e.message}`);
          }
        }
      }
    } else {
      if (needsCompression) {
        const compressed = await compressUntilUnderLimit(inputPath, outputPath, sharp, heicConvert, imageminMozjpeg, imagemin);
        if (compressed) {
          stats.optimized++;
          console.log(`   ✓ Compressed ${imageFile} → ${outputFilename}`);
        } else {
          const optimized = await optimizeJpg(inputPath, outputPath, mozjpegPlugin, imagemin);
          if (optimized) stats.optimized++;
          else fs.copyFileSync(inputPath, outputPath);
          stats.optimized++;
        }
      } else {
        fs.copyFileSync(inputPath, outputPath);
        stats.skipped++;
      }
    }
  } catch (error) {
    if (tempFileCreated && fs.existsSync(tempJpgPath)) {
      try { fs.unlinkSync(tempJpgPath); } catch (e) {}
    }
    stats.errors++;
    console.error(`   ⚠️  Error processing ${imageFile}: ${error.message}`);
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
    console.log('📦 Loading modules...');
    const [imagemin, imageminMozjpeg, sharp, heicConvert] = await Promise.all([
      getModule('imagemin'),
      getModule('imagemin-mozjpeg'),
      getModule('sharp'),
      getModule('heic-convert'),
    ]);

    const mozjpegPlugin = typeof imageminMozjpeg === 'function' 
      ? imageminMozjpeg({ quality: 85, progressive: true })
      : imageminMozjpeg.default({ quality: 85, progressive: true });

    console.log('   ✓ All modules loaded\n');

    const stats = { converted: 0, optimized: 0, skipped: 0, errors: 0 };

    // Process root level images
    const rootImages = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && IMAGE_EXTENSIONS.test(dirent.name))
      .map(dirent => dirent.name);

    if (rootImages.length > 0) {
      console.log(`📸 Processing ${rootImages.length} root level image(s)...`);
      for (const imageFile of rootImages) {
        await processImage(imageFile, IMAGES_DIR, OUTPUT_DIR, sharp, heicConvert, imageminMozjpeg, imagemin, mozjpegPlugin, stats);
      }
    }

    // Process subdirectories
    const subdirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const subdir of subdirs) {
      const subdirPath = path.join(IMAGES_DIR, subdir);
      const outputSubdirPath = path.join(OUTPUT_DIR, subdir);
      
      if (!fs.existsSync(outputSubdirPath)) {
        fs.mkdirSync(outputSubdirPath, { recursive: true });
      }

      const imageFiles = fs.readdirSync(subdirPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && IMAGE_EXTENSIONS.test(dirent.name))
        .map(dirent => dirent.name);

      if (imageFiles.length > 0) {
        console.log(`📸 Processing ${imageFiles.length} image(s) in ${subdir}/...`);
        for (const imageFile of imageFiles) {
          await processImage(imageFile, subdirPath, outputSubdirPath, sharp, heicConvert, imageminMozjpeg, imagemin, mozjpegPlugin, stats);
        }
      }
    }

    console.log('\n✨ Optimization complete!');
    if (stats.converted > 0) {
      console.log(`🔄 Converted ${stats.converted} file(s) to JPG format`);
    }
    console.log(`📊 Optimized ${stats.optimized} JPG file(s) (≥ 5MB)`);
    if (stats.skipped > 0) {
      console.log(`⏭️  Copied ${stats.skipped} file(s) without optimization (< 5MB)`);
    }
    if (stats.errors > 0) {
      console.log(`⚠️  ${stats.errors} error(s) encountered`);
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

    cleanupTempFiles(OUTPUT_DIR);

  } catch (error) {
    console.error('❌ Error optimizing images:', error.message);
    if (error.stack) console.error(error.stack);
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
  if (fs.existsSync(dirPath)) calculateSize(dirPath);
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
