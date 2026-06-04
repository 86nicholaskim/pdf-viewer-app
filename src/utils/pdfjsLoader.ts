declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface PDFJSLoadResult {
  pdfjsLib: any;
  workerFileName: string;
}

let loadingPromise: Promise<PDFJSLoadResult> | null = null;

export async function loadPDFJS(): Promise<PDFJSLoadResult> {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch('/pdfjs-version-map.json');
      const versionMap = await response.json();
      const pdfjsFileName = versionMap['pdfjs'];

      return new Promise<PDFJSLoadResult>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `/${pdfjsFileName}`;
        script.onload = () => {
          // pdfjsLib is now available globally
          resolve({
            pdfjsLib: window.pdfjsLib,
            workerFileName: versionMap['pdf.worker']
          });
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } catch (error) {
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}
