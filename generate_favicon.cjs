const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createFavicons() {
  const input = path.join(__dirname, 'assets', 'portrait_cutout_ref.png');
  
  if (!fs.existsSync(input)) {
    throw new Error('Input image not found: ' + input);
  }

  // 1. Extract head/face crop from landing page portrait
  // Image is 1023 x 1538.
  // Head/face region: left: 140, top: 60, width: 750, height: 750
  const faceCrop = await sharp(input)
    .extract({ left: 140, top: 60, width: 750, height: 750 })
    .toBuffer();

  const size = 512;
  const radius = size / 2;
  const strokeWidth = 14;

  // Face size inside circle
  const faceSize = size - 36;
  const faceRadius = faceSize / 2;

  // Resize face to fit nicely
  const resizedFace = await sharp(faceCrop)
    .resize(faceSize, faceSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Circular clipping mask matching faceSize
  const circleMask = Buffer.from(
    `<svg width="${faceSize}" height="${faceSize}">
      <circle cx="${faceRadius}" cy="${faceRadius}" r="${faceRadius - 2}" fill="white" />
    </svg>`
  );

  // Clip the face to circle
  const clippedFace = await sharp(resizedFace)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .toBuffer();

  // Circular background SVG (dark matte black #080808)
  const circleBg = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius - 1}" fill="#080808" />
    </svg>`
  );

  // Neon yellow border rim SVG
  const neonBorder = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius - strokeWidth / 2 - 2}" fill="none" stroke="#DFFF00" stroke-width="${strokeWidth}" />
    </svg>`
  );

  // Combine into final master badge
  const masterBadge = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: circleBg, top: 0, left: 0 },
    { input: clippedFace, top: 18, left: 18 },
    { input: neonBorder, top: 0, left: 0 }
  ])
  .png()
  .toBuffer();

  // Generate transparent cutout version
  const transparentSquare = await sharp(faceCrop)
    .resize(512, 512)
    .png()
    .toBuffer();

  // Write all standard favicon sizes to assets/
  const assetsDir = path.join(__dirname, 'assets');
  await sharp(masterBadge).resize(512, 512).toFile(path.join(assetsDir, 'favicon-512x512.png'));
  await sharp(masterBadge).resize(192, 192).toFile(path.join(assetsDir, 'favicon-192x192.png'));
  await sharp(masterBadge).resize(180, 180).toFile(path.join(assetsDir, 'apple-touch-icon.png'));
  await sharp(masterBadge).resize(64, 64).toFile(path.join(assetsDir, 'favicon-64x64.png'));
  await sharp(masterBadge).resize(32, 32).toFile(path.join(assetsDir, 'favicon-32x32.png'));
  await sharp(masterBadge).resize(16, 16).toFile(path.join(assetsDir, 'favicon-16x16.png'));
  await sharp(masterBadge).resize(48, 48).toFile(path.join(assetsDir, 'favicon.png'));
  await sharp(transparentSquare).resize(192, 192).toFile(path.join(assetsDir, 'favicon-cutout.png'));

  // Also write to root directory favicon.ico / favicon.png for browser direct requests
  await sharp(masterBadge).resize(32, 32).toFile(path.join(__dirname, 'favicon.ico'));
  await sharp(masterBadge).resize(48, 48).toFile(path.join(__dirname, 'favicon.png'));

  console.log('SUCCESS: All landing page portrait favicons created successfully!');
}

createFavicons().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
