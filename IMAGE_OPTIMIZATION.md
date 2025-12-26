# Image Optimization Guide

## Overview

Images in this project are automatically optimized using npm scripts with imagemin. This ensures fast loading times in production without requiring global tools.

## Quick Start

```bash
# Install dependencies
npm install

# Optimize images (creates optimized versions without modifying originals)
npm run optimize-images

# Review optimized images in: public/images-optimized/

# Apply optimized images (backs up originals first)
npm run optimize-images:apply
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run optimize-images` | Optimizes all images in `public/images/` and saves to `public/images-optimized/` |
| `npm run optimize-images:apply` | Backs up originals and applies optimized images |
| `npm run build` | Automatically runs image optimization before building |

## How It Works

The optimization script (`scripts/optimize-images.js`) uses:
- **imagemin-mozjpeg**: Compresses JPG images (quality: 85%, progressive)
- **imagemin-pngquant**: Compresses PNG images (quality: 60-80%)
- **imagemin-webp**: Creates WebP versions for even better compression

## Directory Structure

```
public/
├── images/              # Original images (source)
├── images-optimized/    # Optimized versions (created by script, gitignored)
└── images-backup/       # Backup of originals (created when applying, gitignored)
```

## Configuration

Optimization settings can be adjusted in `scripts/optimize-images.js`:

```javascript
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
```

## Workflow

1. **Development**: Work with original images in `public/images/`
2. **Before Build**: Run `npm run optimize-images` to create optimized versions
3. **Review**: Check `public/images-optimized/` to ensure quality is acceptable
4. **Apply**: Run `npm run optimize-images:apply` to replace originals
5. **Build**: Run `npm run build` (optimization runs automatically)

## Expected Results

- **Original total size**: ~150MB+
- **Optimized total size**: < 5MB
- **Size reduction**: 95%+
- **Load time improvement**: 70-90%

## Additional Optimizations Implemented

1. **Lazy Loading**: Images use `loading="lazy"` for non-critical images
2. **Priority Loading**: Critical images use `fetchpriority="high"`
3. **Async Decoding**: All images use `decoding="async"`
4. **Build Optimizations**: Vite config optimized for better asset handling

## Troubleshooting

### Script fails to run
```bash
# Make sure dependencies are installed
npm install
```

### Restore original images
```bash
# If you have a backup
mv public/images-backup public/images
```

### Customize optimization settings
Edit `scripts/optimize-images.js` and adjust the `config` object.

## Notes

- Original images are never modified until you run `optimize-images:apply`
- WebP versions are created but not used by default (you can update code to use them)
- The build process automatically optimizes images, so you don't need to run it manually before deployment

