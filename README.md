# PDF Viewer App 📄

A high-performance, responsive PDF viewer built with **React 19**, **Vite**, and **PDF.js**. This application leverages Web Workers to ensure smooth rendering and a non-blocking UI even with large PDF files.

## 🚀 Features

- **File Upload**: Easily upload local PDF files for viewing.
- **Fast Rendering**: Uses PDF.js Web Workers for background processing.
- **Page Navigation**: Simple controls to navigate through multi-page documents.
- **Responsive Canvas**: High-quality rendering using HTML5 Canvas.
- **CORS-Free**: Handles local files directly via `FileReader`, avoiding common CORS issues.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Library**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🏁 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm installed (`npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```
The `dev` script automatically runs `copy-worker` to ensure the PDF.js worker is available in the `public/` directory.

### Build

```bash
# Build for production
pnpm build
```

## 📖 Documentation

Detailed documentation can be found in the [doc/](./doc/) directory:

- [Setup Guide](./doc/setup.md): Technical configuration and worker integration.
- [Architecture](./doc/architecture.md): Overview of how the application is structured.
- [Features & Usage](./doc/features.md): Detailed explanation of available features.

## 📄 License

This project is licensed under the MIT License.
