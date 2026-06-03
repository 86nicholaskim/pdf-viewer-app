let loadingPromise = null;

export async function loadPDFJS() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch('/pdfjs-version-map.json');
      const versionMap = await response.json();
      const pdfjsFileName = versionMap['pdfjs'];

      return new Promise((resolve, reject) => {
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
