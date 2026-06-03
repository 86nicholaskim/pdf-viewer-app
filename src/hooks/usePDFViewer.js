import { useState, useEffect } from "react";
import { loadPDFJS } from "../utils/pdfjsLoader";

export function usePDFViewer() {
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [pdfjs, setPdfjs] = useState(null);

  useEffect(() => {
    loadPDFJS().then(({ pdfjsLib, workerFileName }) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/${workerFileName}`;
      setPdfjs(pdfjsLib);
    }).catch(err => {
      console.error("Failed to load PDF.js:", err);
    });
  }, []);

  const loadPDF = (source) => {
    if (!source || !pdfjs) return;

    setLoading(true);
    setPageNum(1);

    if (typeof source === "string") {
      const loadingTask = pdfjs.getDocument({ url: source });
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
      const fileReader = new FileReader();
      fileReader.onload = function () {
        const typedArray = new Uint8Array(this.result);
        const loadingTask = pdfjs.getDocument({ data: typedArray });

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
