# 🛠 Technical Setup & Configuration

This document explains how PDF.js and Web Workers are integrated into this project, specifically addressing the challenges of using them with **pnpm** and **Vite**.

## 1. PDF.js Worker Integration

To prevent the main UI thread from freezing during heavy PDF processing, we use the PDF.js Web Worker. However, in a `pnpm` environment with its symbolic link structure, Vite sometimes struggles to locate the worker file within `node_modules`.

### Static Asset Strategy

We use a "Static Asset Copy" strategy. The worker file is copied from `node_modules` to the `public/` directory during the build and development process.

#### Configuration in `package.json`

```json
"scripts": {
  "copy-worker": "node -e \"fs.mkdirSync('public', {recursive: true}); fs.copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf.worker.min.mjs')\"",
  "dev": "pnpm copy-worker && vite",
  "build": "pnpm copy-worker && vite build"
}
```

This ensures that `public/pdf.worker.min.mjs` is always available to the browser at the root path `/pdf.worker.min.mjs`.

## 2. Global Worker Options

In `src/App.jsx`, we explicitly tell PDF.js where to find this worker:

```javascript
import * as pdfjsLib from "pdfjs-dist";

// Bind the local worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

## 3. Version Synchronization

It is critical that the version of `pdfjs-dist` in `package.json` matches the version of the worker file. 

- **Warning**: If the versions mismatch, you will see an `API version does not match Worker version` error in the console. 
- **Solution**: The `copy-worker` script handles this by copying the worker directly from the installed package, ensuring they are always in sync.

## 4. Why `.mjs`?

Modern versions of PDF.js (4.x and 5.x) use ECMAScript Modules (ESM). The `.mjs` extension is used to ensure the browser treats the worker as a module.
