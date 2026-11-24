const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running production build...');

// 1. Build client using Vite
console.log('📦 Building Vite client...');
execSync('npm --prefix client run build', { stdio: 'inherit' });

// 2. Mirror client/dist to root dist for standard hosting compatibility
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
const rootDist = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(clientDist)) {
  if (fs.existsSync(rootDist)) {
    fs.rmSync(rootDist, { recursive: true, force: true });
  }
  fs.cpSync(clientDist, rootDist, { recursive: true });
  console.log(`✅ Mirrored ${clientDist} -> ${rootDist}`);
}

console.log('🎉 Production build complete!');
