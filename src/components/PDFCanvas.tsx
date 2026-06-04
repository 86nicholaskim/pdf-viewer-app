import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "@myorg/pdfjs";

interface PDFCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNum: number;
}

export function PDFCanvas({ pdfDoc, pageNum }: PDFCanvasProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const renderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    if (!pdfDoc) return;

    let isCancelled = false;
    setLoading(true);

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        // Create in-memory canvas
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Cancel previous task if exists
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        
        if (!isCancelled) {
          // Convert canvas to image
          setImgSrc(canvas.toDataURL("image/png"));
          setLoading(false);
        }
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("렌더링 에러:", err);
          setLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNum]);

  return (
    <div
      style={{
        display: "inline-block",
        border: "1px solid #ccc",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        minHeight: "500px",
        minWidth: "300px",
        position: "relative",
        backgroundColor: "#fff"
      }}
    >
      {loading && !imgSrc && (
        <div style={{
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)"
        }}>
          로딩 중...
        </div>
      )}
      {imgSrc && (
        <img 
          src={imgSrc} 
          alt={`Page ${pageNum}`} 
          style={{ 
            maxWidth: "100%", 
            height: "auto", 
            display: "block" 
          }} 
        />
      )}
    </div>
  );
}
