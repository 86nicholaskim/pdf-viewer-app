import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Bind local worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export function usePDFViewer() {
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);

  const loadPDF = (source) => {
    if (!source) return;

    setLoading(true);
    setPageNum(1);

    if (typeof source === "string") {
      // URL 경로 처리
      const loadingTask = pdfjsLib.getDocument(source);
      loadingTask.promise
        .then((pdf) => {
          setPdfDoc(pdf);
          setLoading(false);
        })
        .catch((err) => {
          console.error("URL PDF 로드 실패:", err);
          alert("PDF URL을 불러오는 데 실패했습니다.");
          setLoading(false);
        });
    } else if (source instanceof File) {
      // 로컬 파일 처리
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
      fileReader.readAsArrayBuffer(source);
    }
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
