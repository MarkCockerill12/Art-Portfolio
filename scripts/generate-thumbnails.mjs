import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// --- CONFIGURATION ---
const SOURCE_DIR = 'public/media/art/full-size'; 
const DEST_DIR = 'public/media/art/thumbnails';
const MAX_WIDTH = 1000; 
const QUALITY = 80; 

console.log(`🚀 Starting Thumbnail Generator...`);
console.log(`📂 Source: "${SOURCE_DIR}"`);
console.log(`📂 Dest:   "${DEST_DIR}"`);

async function processImages() {
  // 1. Check if source exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`\n❌ ERROR: Source directory "${SOURCE_DIR}" does not exist!`);
    console.error(`   Please double-check that this folder exists in your project.`);
    return;
  }

  // 2. Find files
  console.log(`🔍 Scanning for images...`);
  // Using forward slashes for cross-platform compatibility
  const pattern = `${SOURCE_DIR.replace(/\\/g, '/')}/**/*.{jpg,jpeg,png,tif,tiff,webp}`;
  const files = await glob(pattern);
  
  console.log(`✅ Found ${files.length} images.`);

  if (files.length === 0) {
    console.warn(`   ⚠️ No images found! Check if your images are actually inside "${SOURCE_DIR}"`);
    return;
  }

  let processedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    // Skip existing thumbnails to prevent double-processing
    if (file.includes('_thumb')) continue;

    // Calculate relative path (e.g., "yareli/drawing.png")
    const relativePath = path.relative(SOURCE_DIR, file);
    const relativeDir = path.dirname(relativePath);
    
    // Construct target folder (e.g., "public/art/thumbnails/yareli")
    const targetDir = path.join(DEST_DIR, relativeDir);

    // Create folder if missing
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file);
    const name = path.basename(file, ext);
    const thumbPath = path.join(targetDir, `${name}_thumb.webp`);

    // Skip if thumbnail already exists
    if (fs.existsSync(thumbPath)) {
      skippedCount++;
      continue; 
    }

    try {
      console.log(`   ⚙️ Processing: ${relativePath}`);
      const image = sharp(file);
      const metadata = await image.metadata();

      // Fix orientation (e.g. phone photos)
      image.rotate(); 

      // Resize Logic
      if (metadata.width > MAX_WIDTH) {
        await image
          .resize(MAX_WIDTH, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(thumbPath);
      } else {
        await image
          .webp({ quality: QUALITY })
          .toFile(thumbPath);
      }
      processedCount++;
    } catch (err) {
      console.error(`   ❌ Failed to convert ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 Done! Created ${processedCount} thumbnails. (Skipped ${skippedCount} existing)`);
}

processImages();