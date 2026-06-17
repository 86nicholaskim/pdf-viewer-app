import { useState } from "react";
import { usePDFViewer } from "./hooks/usePDFViewer";
import { FileUploader } from "./components/FileUploader";
import { PDFControls } from "./components/PDFControls";
import { PDFCanvas } from "./components/PDFCanvas";
import type { PDFDocumentProxy } from "@myorg/pdfjs";

function App() {
  const {
    loading,
    pdfDoc,
    pageNum,
    loadPDF,
    goToNextPage,
    goToPrevPage,
  } = usePDFViewer();

  const [url, setUrl] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [printPreviewHtml, setPrintPreviewHtml] = useState<string>("");
  const [printPreviewUrls, setPrintPreviewUrls] = useState<string[]>([]);

  const handleUrlLoad = () => {
    if (url.trim()) {
      loadPDF(url);
    }
  };

  const cleanupPrintPreview = () => {
    printPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setPrintPreviewUrls([]);
    setPrintPreviewHtml("");
  };

  const generateStandaloneHtmlJPG = async () => {
    if (!pdfDoc) return;
    setIsPrinting(true);
    setGeneratedHtml("");
    performance.mark("gen-html-jpg-start");

    try {
      const images: string[] = [];
      const scale = 1.5;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.8));
      }

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PDF JPG Document</title><style>body { margin: 0; padding: 20px; background: #f0f0f0; font-family: sans-serif; }.page-container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-bottom: 20px; }img { width: 100%; height: auto; display: block; }@media print { body { background: white; padding: 0; }.page-container { box-shadow: none; margin-bottom: 0; page-break-after: always; }}</style></head><body>${images.map(img => `<div class="page-container"><img src="${img}" /></div>`).join("")}</body></html>`;
      setGeneratedHtml(htmlContent);
      performance.mark("gen-html-jpg-end");
      performance.measure("HTML Gen (JPG) Duration", "gen-html-jpg-start", "gen-html-jpg-end");
      console.log("HTML (JPG) 생성 시간:", performance.getEntriesByName("HTML Gen (JPG) Duration")[0].duration, "ms");
    } catch (error) {
      console.error("HTML JPG 생성 오류:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const generateStandaloneHtmlPNG = async () => {
    if (!pdfDoc) return;
    setIsPrinting(true);
    setGeneratedHtml("");
    performance.mark("gen-html-png-start");

    try {
      const images = [];
      const scale = 1.5;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/png"));
      }

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PDF PNG Document</title><style>body { margin: 0; padding: 20px; background: #f0f0f0; font-family: sans-serif; }.page-container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-bottom: 20px; }img { width: 100%; height: auto; display: block; }@media print { body { background: white; padding: 0; }.page-container { box-shadow: none; margin-bottom: 0; page-break-after: always; }}</style></head><body>${images.map(img => `<div class="page-container"><img src="${img}" /></div>`).join("")}</body></html>`;
      setGeneratedHtml(htmlContent);
      performance.mark("gen-html-png-end");
      performance.measure("HTML Gen (PNG) Duration", "gen-html-png-start", "gen-html-png-end");
      console.log("HTML (PNG) 생성 시간:", performance.getEntriesByName("HTML Gen (PNG) Duration")[0].duration, "ms");
    } catch (error) {
      console.error("HTML PNG 생성 오류:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const generateStandaloneHtmlWebP = async () => {
    if (!pdfDoc) return;
    setIsPrinting(true);
    setGeneratedHtml("");
    performance.mark("gen-html-webp-start");

    try {
      const images: string[] = [];
      const scale = 1.5;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/webp", 0.8));
      }

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PDF WebP Document</title><style>body { margin: 0; padding: 20px; background: #f0f0f0; font-family: sans-serif; }.page-container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-bottom: 20px; }img { width: 100%; height: auto; display: block; }@media print { body { background: white; padding: 0; }.page-container { box-shadow: none; margin-bottom: 0; page-break-after: always; }}</style></head><body>${images.map(img => `<div class="page-container"><img src="${img}" /></div>`).join("")}</body></html>`;
      setGeneratedHtml(htmlContent);
      performance.mark("gen-html-webp-end");
      performance.measure("HTML Gen (WebP) Duration", "gen-html-webp-start", "gen-html-webp-end");
      console.log("HTML (WebP) 생성 시간:", performance.getEntriesByName("HTML Gen (WebP) Duration")[0].duration, "ms");
    } catch (error) {
      console.error("HTML WebP 생성 오류:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadHtml = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pdf-document.html";
    link.click();
  };

  const handlePrint = async () => {
    if (!pdfDoc) return;
    setIsPrinting(true);
    performance.mark("print-png-start");

    try {
      const images = [];
      const scale = 2;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/png"));
      }

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>PDF Print (PNG String)</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; display: block; page-break-after: always; }
            </style>
          </head>
          <body>
            ${images.map(img => `<img src="${img}" />`).join("")}
            <script>window.onload = () => { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      performance.mark("print-png-end");
      performance.measure("PNG Print Duration", "print-png-start", "print-png-end");
      console.log("PNG 인쇄 소요 시간:", performance.getEntriesByName("PNG Print Duration")[0].duration, "ms");
    } catch (error) {
      console.error("인쇄 오류:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintJPG = async () => {
    if (!pdfDoc) return;
    setIsPrinting(true);
    performance.mark("print-jpg-start");

    try {
      const images = [];
      const scale = 2;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.7));
      }

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>PDF Print (JPG String)</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; display: block; page-break-after: always; }
            </style>
          </head>
          <body>
            ${images.map(img => `<img src="${img}" />`).join("")}
            <script>window.onload = () => { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      performance.mark("print-jpg-end");
      performance.measure("JPG Print Duration", "print-jpg-start", "print-jpg-end");
      console.log("JPG 인쇄 소요 시간:", performance.getEntriesByName("JPG Print Duration")[0].duration, "ms");
    } catch (error) {
      console.error("JPG 인쇄 오류:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintWebP = async () => {
    if (!pdfDoc) return;
    setIsPrinting(true);
    performance.mark("print-webp-start");

    try {
      const images = [];
      const scale = 2;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/webp", 0.7));
      }

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>PDF Print (WebP String)</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; display: block; page-break-after: always; }
            </style>
          </head>
          <body>
            ${images.map(img => `<img src="${img}" />`).join("")}
            <script>window.onload = () => { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      performance.mark("print-webp-end");
      performance.measure("WebP Print Duration", "print-webp-start", "print-webp-end");
      console.log("WebP 인쇄 소요 시간:", performance.getEntriesByName("WebP Print Duration")[0].duration, "ms");
    } catch (error) {
      console.error("WebP 인쇄 오류:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintBlob = async () => {
    if (!pdfDoc) return;
    setIsPrinting(true);
    performance.mark("print-blob-start");

    try {
      const imageUrls = [];
      const scale = 2;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
        const url = URL.createObjectURL(blob);
        imageUrls.push(url);
      }

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>PDF Print (Blob ObjectURL)</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; display: block; page-break-after: always; }
            </style>
          </head>
          <body>
            ${imageUrls.map(url => `<img src="${url}" />`).join("")}
            <script>
              window.onload = () => { 
                window.print(); 
                window.close(); 
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      performance.mark("print-blob-end");
      performance.measure("Blob Print Duration", "print-blob-start", "print-blob-end");
      console.log("Blob 인쇄 소요 시간:", performance.getEntriesByName("Blob Print Duration")[0].duration, "ms");
    } catch (error) {
      console.error("Blob 인쇄 오류:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintIframe = async () => {
    if (!pdfDoc) return;
    
    // 기존 프리뷰 리소스 정리
    cleanupPrintPreview();
    
    setIsPrinting(true);
    performance.mark("print-iframe-start");

    const imageUrls: string[] = [];

    try {
      const scale = 2;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.95));
        if (blob) {
          const url = URL.createObjectURL(blob);
          imageUrls.push(url);
        }
      }

      setPrintPreviewUrls(imageUrls);

      const htmlContent = `
        <html>
          <head>
            <title>PDF Print Preview</title>
            <style>
              body { margin: 0; padding: 20px; background: #525659; display: flex; flex-direction: column; align-items: center; gap: 20px; font-family: sans-serif; }
              img { width: 100%; max-width: 800px; height: auto; display: block; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
              @media print {
                body { background: white; padding: 0; display: block; }
                img { box-shadow: none; max-width: none; page-break-after: always; }
              }
            </style>
          </head>
          <body>
            <h2 style="color: white; @media print { display: none; }">인쇄 미리보기</h2>
            ${imageUrls.map(url => `<img src="${url}" />`).join("")}
          </body>
        </html>
      `;
      
      setPrintPreviewHtml(htmlContent);

      performance.mark("print-iframe-end");
      performance.measure("Iframe Print Duration", "print-iframe-start", "print-iframe-end");
      console.log("Iframe 인쇄 데이터 생성 시간:", performance.getEntriesByName("Iframe Print Duration")[0].duration, "ms");

    } catch (error) {
      console.error("Iframe 인쇄 준비 오류:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const executeIframePrint = () => {
    const iframe = document.getElementById("print-preview-iframe") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  return (
    <div
      style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}
    >
      <h1>PDF.js 파일 및 경로 뷰어</h1>

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
        <FileUploader onFileChange={loadPDF} />
        
        <div style={{ borderLeft: "1px solid #ccc", height: "40px", margin: "0 10px" }}></div>

        <div>
          <input 
            type="text" 
            placeholder="PDF URL 입력 (https://...)" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ padding: "10px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button 
            onClick={handleUrlLoad}
            style={{ padding: "10px 20px", marginLeft: "5px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
          >
            URL 로드
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <small style={{ color: "#666" }}>
          테스트용 샘플: 
          <button onClick={() => { setUrl("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"); loadPDF("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"); }} style={{ margin: "0 5px", cursor: "pointer", border: "none", background: "none", color: "#007bff", textDecoration: "underline" }}>샘플1</button>
        </small>
      </div>

      {(loading || isPrinting) && (
        <p style={{ color: "#007bff" }}>
          {isPrinting ? "🖨️ 인쇄용 이미지를 생성 중입니다..." : "⚠️ 워커가 백그라운드에서 첨부된 파일을 처리 중입니다..."}
        </p>
      )}

      {!loading && !isPrinting && pdfDoc && (
        <PDFControls
          pageNum={pageNum}
          totalPages={pdfDoc.numPages}
          onPrev={goToPrevPage}
          onNext={goToNextPage}
          onPrint={handlePrint}
          onPrintJPG={handlePrintJPG}
          onPrintWebP={handlePrintWebP}
          onPrintBlob={handlePrintBlob}
          onPrintIframe={handlePrintIframe}
          onGenerateHtmlJPG={generateStandaloneHtmlJPG}
          onGenerateHtmlPNG={generateStandaloneHtmlPNG}
          onGenerateHtmlWebP={generateStandaloneHtmlWebP}
        />
      )}

      {printPreviewHtml && (
        <div style={{ marginTop: "30px", padding: "20px", border: "2px solid #007bff", borderRadius: "8px", backgroundColor: "#f8f9fa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0 }}>🖨️ 인쇄 미리보기 및 재인쇄</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={executeIframePrint}
                style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
              >
                지금 인쇄하기
              </button>
              <button 
                onClick={cleanupPrintPreview}
                style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                닫기
              </button>
            </div>
          </div>
          <iframe 
            id="print-preview-iframe"
            srcDoc={printPreviewHtml} 
            style={{ width: "100%", height: "600px", border: "1px solid #ccc", borderRadius: "4px" }}
            title="Print Preview"
          />
        </div>
      )}

      {generatedHtml && (
        <div style={{ marginTop: "20px", padding: "20px", border: "2px solid #17a2b8", borderRadius: "8px" }}>
          <h3>📄 외부 문서용 HTML 미리보기 (Iframe)</h3>
          <p>아래 영역은 생성된 독립형 HTML의 미리보기입니다. 이 파일을 다운로드하여 이메일 등에 첨부할 수 있습니다.</p>
          <button 
            onClick={handleDownloadHtml}
            style={{ marginBottom: "10px", padding: "10px 20px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            HTML 파일 다운로드 (.html)
          </button>
          <iframe 
            srcDoc={generatedHtml} 
            style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
            title="Standalone HTML Preview"
          />
        </div>
      )}

      {pdfDoc && !loading && !isPrinting && !generatedHtml && !printPreviewHtml && (
        <PDFCanvas pdfDoc={pdfDoc} pageNum={pageNum} />
      )}
    </div>
  );
}

export default App;
