import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Bind local worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export function usePDFViewer() {
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);

  const loadPDF = (file) => {
    if (!file || file.type !== "application/pdf") {
      alert("올바른 PDF 파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    setPageNum(1);

    const fileReader = new FileReader();

    fileReader.onload = function () {
      const typedArray = new Uint8Array(this.result);
      const loadingTask = pdfjsLib.getDocument({ data: typedArray });

      loadingTask.promise
        .then((pdf) => {
          setPdfDoc(pdf);
          setLoading(false);
        })
        .catch((err) => {
          console.error("PDF 파일 분석 실패:", err);
          setLoading(false);
        });
    };

    fileReader.readAsArrayBuffer(file);
  };

  const goToNextPage = () => {
    if (pdfDoc && pageNum < pdfDoc.numPages) {
      setPageNum((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (pageNum > 1) {
      setPageNum((prev) => prev - 1);
    }
  };

  return {
    loading,
    pdfDoc,
    pageNum,
    loadPDF,
    goToNextPage,
    goToPrevPage,
  };
}
