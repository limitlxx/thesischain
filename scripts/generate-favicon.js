const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const inputPath = path.join(__dirname, '../public/thesischain_logo.jpg');
  const outputDir = path.join(__dirname, '../public');

  console.log('Generating favicon files from thesischain_logo.jpg...');

  try {
    // Generate favicon.ico (32x32)
    await sharp(inputPath)
      .resize(32, 32, { fit: 'cover' })
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico (32x32)');

    // Generate favicon-16x16.png
    await sharp(inputPath)
      .resize(16, 16, { fit: 'cover' })
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16.png');

    // Generate favicon-32x32.png
    await sharp(inputPath)
      .resize(32, 32, { fit: 'cover' })
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    // Generate apple-touch-icon.png (180x180)
    await sharp(inputPath)
      .resize(180, 180, { fit: 'cover' })
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png (180x180)');

    // Generate android-chrome-192x192.png
    await sharp(inputPath)
      .resize(192, 192, { fit: 'cover' })
      .png()
      .toFile(path.join(outputDir, 'android-chrome-192x192.png'));
    console.log('✓ Generated android-chrome-192x192.png');

    // Generate android-chrome-512x512.png
    await sharp(inputPath)
      .resize(512, 512, { fit: 'cover' })
      .png()
      .toFile(path.join(outputDir, 'android-chrome-512x512.png'));
    console.log('✓ Generated android-chrome-512x512.png');

    console.log('\n✅ All favicon files generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
