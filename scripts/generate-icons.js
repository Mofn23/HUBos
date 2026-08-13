import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgBuffer = Buffer.from(`
<svg viewBox="0 0 1024 1024" width="1024" height="1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid OLED Black Background -->
  <rect width="1024" height="1024" fill="#0B0B0D"/>
  
  <!-- Subtle Ambient Glow -->
  <circle cx="512" cy="512" r="380" fill="url(#hub_glow)" opacity="0.2"/>

  <!-- Minimalist H Nexus Frame -->
  <rect x="238" y="256" width="118" height="512" rx="59" fill="url(#hub_silver)"/>
  <rect x="668" y="256" width="118" height="512" rx="59" fill="url(#hub_silver)"/>
  <rect x="238" y="453" width="548" height="118" rx="59" fill="url(#hub_silver)"/>

  <!-- Core Electric Green Nexus Dot -->
  <circle cx="512" cy="512" r="50" fill="#34C759"/>

  <defs>
    <radialGradient id="hub_glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(512 512) rotate(90) scale(380)">
      <stop stopColor="#34C759"/>
      <stop offset="1" stopColor="#0B0B0D" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="hub_silver" x1="238" y1="256" x2="786" y2="768" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFFFFF"/>
      <stop offset="0.5" stopColor="#E2E8F0"/>
      <stop offset="1" stopColor="#94A3B8"/>
    </linearGradient>
  </defs>
</svg>
`);

async function generate() {
  const iosIconPath = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
  const publicIcon512 = path.join(__dirname, '../public/icon-512.png');
  const publicIcon192 = path.join(__dirname, '../public/icon-192.png');
  const publicAppleIcon = path.join(__dirname, '../public/apple-touch-icon.png');

  await sharp(svgBuffer).resize(1024, 1024).png().toFile(iosIconPath);
  console.log('✅ Generated iOS AppIcon-512@2x.png (1024x1024)');

  await sharp(svgBuffer).resize(512, 512).png().toFile(publicIcon512);
  console.log('✅ Generated public/icon-512.png');

  await sharp(svgBuffer).resize(192, 192).png().toFile(publicIcon192);
  console.log('✅ Generated public/icon-192.png');

  await sharp(svgBuffer).resize(180, 180).png().toFile(publicAppleIcon);
  console.log('✅ Generated public/apple-touch-icon.png');
}

generate().catch(console.error);
