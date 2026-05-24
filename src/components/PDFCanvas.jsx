import { useEffect, useRef } from "react";

export function PDFCanvas({ pdfDoc, pageNum }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask = null;

    pdfDoc
      .getPage(pageNum)
      .then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        return renderTask.promise;
      })
      .catch((err) => {
        if (err.name !== "RenderingCancelledException") {
          console.error("렌더링 에러:", err);
        }
      });

    return () => {
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, pageNum]);

  return (
    <div
      style={{
        display: "inline-block",
        border: "1px solid #ccc",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
