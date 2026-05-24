# 🏗 Architecture Overview

The PDF Viewer App follows a clean, component-based architecture leveraging React's functional components and hooks.

## 📁 Directory Structure

```text
pdf-viewer-app/
├── public/              # Static assets (including the PDF worker)
├── src/
│   ├── assets/          # Images and SVGs
│   ├── App.jsx          # Main application component & PDF logic
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── doc/                 # Detailed documentation
└── package.json         # Project configuration & scripts
```

## 🔄 Data Flow

1.  **File Input**: The user selects a PDF file using a standard HTML `<input type="file">`.
2.  **FileReader**: The file is read as an `ArrayBuffer` using the browser's `FileReader` API.
3.  **PDF.js Loading**: The `ArrayBuffer` (as a `Uint8Array`) is passed to `pdfjsLib.getDocument()`.
4.  **Worker Processing**: PDF.js offloads the parsing and decompression to the Web Worker (`pdf.worker.min.mjs`).
5.  **State Management**: The resulting `pdfDoc` object is stored in React state.
6.  **Canvas Rendering**:
    -   When `pdfDoc` or `pageNum` changes, a `useEffect` hook triggers.
    -   The specific page is retrieved from the document.
    -   The page's `render()` method is called, drawing the content onto an HTML5 `<canvas>` element.

## 🛠 Performance Optimizations

-   **Web Workers**: Keeps the UI responsive by moving heavy computations to a background thread.
-   **Render Cancellation**: If the user quickly flips through pages, pending render tasks are cancelled using `renderTask.cancel()` to prevent memory leaks and visual artifacts.
-   **Canvas Scaling**: High-DPI support is handled via the `viewport` scale configuration.
