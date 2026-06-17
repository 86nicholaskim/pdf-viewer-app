import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "@myorg/pdfjs";
import "./TextLayer.css";

interface PDFCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNum: number;
}

export function PDFCanvas({ pdfDoc, pageNum }: PDFCanvasProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [renderScale, setRenderScale] = useState<number>(1.5);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!pdfDoc) return;

    let isCancelled = false;
    setLoading(true);

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const scale = 1.5;
        setRenderScale(scale);
        const viewport = page.getViewport({ scale });
        
        setDimensions({
          width: viewport.width,
          height: viewport.height
        });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        
        if (!isCancelled && textLayerRef.current) {
          textLayerRef.current.innerHTML = "";
          
          const textContent = await page.getTextContent();
          const pdfjsLib = (window as any).pdfjsLib;
          
          if (pdfjsLib && pdfjsLib.TextLayer) {
            // pdf.js 4.x TextLayer constructor calls setLayerDimensions
            // which relies on --total-scale-factor CSS variable.
            const textLayer = new pdfjsLib.TextLayer({
              textContentSource: textContent,
              container: textLayerRef.current,
              viewport: viewport,
            });
            await textLayer.render();
          }
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
        position: "relative",
        backgroundColor: "#fff",
        maxWidth: "100%",
        overflow: "auto"
      }}
    >
      {loading && (
        <div style={{
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          background: "rgba(255,255,255,0.8)",
          padding: "10px",
          borderRadius: "4px"
        }}>
          로딩 중...
        </div>
      )}
      <div 
        className="pdf-page-container"
        style={{ 
          position: "relative",
          width: dimensions ? `${dimensions.width}px` : "auto",
          height: dimensions ? `${dimensions.height}px` : "auto",
          // Standard variables for PDF.js 4.x layers
          "--total-scale-factor": renderScale,
          "--scale-round-x": "1px",
          "--scale-round-y": "1px",
        } as any}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%"
          }}
        />
        <div
          ref={textLayerRef}
          className="textLayer"
        />
      </div>
    </div>
  );
}
