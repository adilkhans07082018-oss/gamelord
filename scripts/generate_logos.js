const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/SHARIK/.gemini/antigravity/brain/dec76035-ad79-486c-bea2-6d341f3f2704';
const publicDir = path.resolve(__dirname, '../public');

// 1. Square App Icon (512x512)
const svgIcon512 = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#1d4ed8" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect x="36" y="36" width="440" height="440" rx="96" fill="url(#blueGrad)" filter="url(#shadow)"/>
  <g transform="translate(106, 106) scale(12.5)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <line x1="6" x2="10" y1="11" y2="11"/>
    <line x1="8" x2="8" y1="9" y2="13"/>
    <line x1="15" x2="15.01" y1="12" y2="12"/>
    <line x1="18" x2="18.01" y1="10" y2="10"/>
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
  </g>
</svg>
`;

// 2. Full Horizontal Brand Logo for Dark Backgrounds (Transparent 1350x300)
const svgHorizontalDark = `
<svg xmlns="http://www.w3.org/2000/svg" width="1350" height="300" viewBox="0 0 1350 300">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <!-- Icon Mark -->
  <rect x="35" y="40" width="220" height="220" rx="50" fill="url(#blueGrad)"/>
  <g transform="translate(71.5, 76.5) scale(6.125)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <line x1="6" x2="10" y1="11" y2="11"/>
    <line x1="8" x2="8" y1="9" y2="13"/>
    <line x1="15" x2="15.01" y1="12" y2="12"/>
    <line x1="18" x2="18.01" y1="10" y2="10"/>
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
  </g>
  
  <!-- Text Brand -->
  <text x="300" y="195" font-family="Montserrat, Arial Black, Arial, sans-serif" font-weight="900" font-size="130" fill="#ffffff" letter-spacing="3">GAMELORD</text>
</svg>
`;

// 3. Full Horizontal Brand Logo for Light Backgrounds (Transparent 1350x300)
const svgHorizontalLight = `
<svg xmlns="http://www.w3.org/2000/svg" width="1350" height="300" viewBox="0 0 1350 300">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <!-- Icon Mark -->
  <rect x="35" y="40" width="220" height="220" rx="50" fill="url(#blueGrad)"/>
  <g transform="translate(71.5, 76.5) scale(6.125)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <line x1="6" x2="10" y1="11" y2="11"/>
    <line x1="8" x2="8" y1="9" y2="13"/>
    <line x1="15" x2="15.01" y1="12" y2="12"/>
    <line x1="18" x2="18.01" y1="10" y2="10"/>
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
  </g>
  
  <!-- Text Brand -->
  <text x="300" y="195" font-family="Montserrat, Arial Black, Arial, sans-serif" font-weight="900" font-size="130" fill="#0f172a" letter-spacing="3">GAMELORD</text>
</svg>
`;

// 4. Dark Badge Banner with dark background (1400x340)
const svgBannerDark = `
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="340" viewBox="0 0 1400 340">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="340" rx="28" fill="#0a0a0a"/>
  <!-- Icon Mark -->
  <rect x="50" y="55" width="230" height="230" rx="50" fill="url(#blueGrad)"/>
  <g transform="translate(88, 93) scale(6.4)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <line x1="6" x2="10" y1="11" y2="11"/>
    <line x1="8" x2="8" y1="9" y2="13"/>
    <line x1="15" x2="15.01" y1="12" y2="12"/>
    <line x1="18" x2="18.01" y1="10" y2="10"/>
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
  </g>
  
  <!-- Text Brand -->
  <text x="325" y="195" font-family="Montserrat, Arial Black, Arial, sans-serif" font-weight="900" font-size="130" fill="#ffffff" letter-spacing="3">GAMELORD</text>
  <text x="330" y="245" font-family="Arial, sans-serif" font-weight="600" font-size="30" fill="#60a5fa" letter-spacing="6">FREE PC GAMES DOWNLOAD</text>
</svg>
`;

async function run() {
  // Generate square logo PNG (512x512)
  const bufIcon = await sharp(Buffer.from(svgIcon512)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'logo.png'), bufIcon);
  fs.writeFileSync(path.join(publicDir, 'logo-icon.png'), bufIcon);
  fs.writeFileSync(path.join(artifactDir, 'gamelord-icon.png'), bufIcon);

  // Generate horizontal dark PNG
  const bufDark = await sharp(Buffer.from(svgHorizontalDark)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'logo-horizontal-dark.png'), bufDark);
  fs.writeFileSync(path.join(artifactDir, 'gamelord-logo-dark.png'), bufDark);

  // Generate horizontal light PNG
  const bufLight = await sharp(Buffer.from(svgHorizontalLight)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'logo-horizontal-light.png'), bufLight);
  fs.writeFileSync(path.join(artifactDir, 'gamelord-logo-light.png'), bufLight);

  // Generate banner dark PNG
  const bufBanner = await sharp(Buffer.from(svgBannerDark)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'logo-banner.png'), bufBanner);
  fs.writeFileSync(path.join(artifactDir, 'gamelord-banner.png'), bufBanner);

  console.log('All logos updated and generated successfully!');
}

run().catch(console.error);
