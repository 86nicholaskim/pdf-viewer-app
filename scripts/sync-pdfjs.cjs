const fs = require('fs');
const path = require('path');

const libDist = 'libs/pdfjs/dist';
const publicDir = 'public';
const versionMapFile = path.join(libDist, 'version-map.json');

if (!fs.existsSync(versionMapFile)) {
  console.error('version-map.json not found!');
  process.exit(1);
}

const versionMap = JSON.parse(fs.readFileSync(versionMapFile, 'utf8'));

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy hashed files to public
for (const [baseName, hashedName] of Object.entries(versionMap)) {
  const src = path.join(libDist, hashedName);
  const dest = path.join(publicDir, hashedName);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${hashedName} to public/`);
}

// Also copy version-map.json to public so the app can read it
fs.copyFileSync(versionMapFile, path.join(publicDir, 'pdfjs-version-map.json'));
console.log('Copied version-map.json to public/pdfjs-version-map.json');
