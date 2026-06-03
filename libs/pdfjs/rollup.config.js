import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function hashPlugin() {
  return {
    name: 'hash-plugin',
    writeBundle(options, bundle) {
      const versionMapFile = 'dist/version-map.json';
      let versionMap = {};
      if (fs.existsSync(versionMapFile)) {
        versionMap = JSON.parse(fs.readFileSync(versionMapFile, 'utf8'));
      }

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          const hash = crypto.createHash('md5').update(chunk.code).digest('hex').slice(0, 8);
          const ext = path.extname(fileName);
          const baseName = path.basename(fileName, ext);
          const hashedName = `${baseName}.${hash}${ext}`;
          
          fs.writeFileSync(`dist/${hashedName}`, chunk.code);
          versionMap[baseName] = hashedName;
          console.log(`Created hashed file: dist/${hashedName}`);
        }
      }
      fs.writeFileSync(versionMapFile, JSON.stringify(versionMap, null, 2));
    }
  };
}

export default [
  {
    input: 'esm/pdf.mjs',
    output: {
      file: 'dist/pdfjs.js',
      format: 'iife',
      name: 'pdfjsLib'
    },
    plugins: [resolve(), commonjs(), hashPlugin()]
  },
  {
    input: 'esm/pdf.worker.mjs',
    output: {
      file: 'dist/pdf.worker.js',
      format: 'iife',
      name: 'pdfjsWorker'
    },
    plugins: [resolve(), commonjs(), hashPlugin()]
  }
]
