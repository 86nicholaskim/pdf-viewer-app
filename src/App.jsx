import { useState } from "react";
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

  const [url, setUrl] = useState("");

  const handleUrlLoad = () => {
    if (url.trim()) {
      loadPDF(url);
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
