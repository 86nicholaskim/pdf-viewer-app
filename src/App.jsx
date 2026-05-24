import { usePDFViewer } from "./hooks/usePDFViewer";
import { FileUploader } from "./components/FileUploader";
import { PDFControls } from "./components/PDFControls";
import { PDFCanvas } from "./components/PDFCanvas";

function App() {
  const {
    loading,
    pdfDoc,
    pageNum,
    loadPDF,
    goToNextPage,
    goToPrevPage,
  } = usePDFViewer();

  return (
    <div
      style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}
    >
      <h1>PDF.js 파일 첨부형 워커 뷰어</h1>

      <FileUploader onFileChange={loadPDF} />

      {loading && (
        <p style={{ color: "#007bff" }}>
          ⚠️ 워커가 백그라운드에서 첨부된 파일을 처리 중입니다...
        </p>
      )}

      {!loading && pdfDoc && (
        <PDFControls
          pageNum={pageNum}
          totalPages={pdfDoc.numPages}
          onPrev={goToPrevPage}
          onNext={goToNextPage}
        />
      )}

      {pdfDoc && !loading && (
        <PDFCanvas pdfDoc={pdfDoc} pageNum={pageNum} />
      )}
    </div>
  );
}

export default App;
