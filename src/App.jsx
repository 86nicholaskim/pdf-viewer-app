import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// 1. 빌드/개발 시 public 폴더로 복사된 로컬 워커 경로 바인딩
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function App() {
  const canvasRef = useRef(null);

  // 상태 관리: loading의 초기값은 false로 시작 (파일이 첨부되면 true로 변경)
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);

  // [기능 추가] 파일 선택 시 실행되는 핸들러 함수
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("올바른 PDF 파일을 선택해주세요.");
      return;
    }

    setLoading(true); // 비동기 파일 읽기 시작하므로 로딩 켬
    setPageNum(1); // 새 파일이므로 1페이지로 리셋

    const fileReader = new FileReader();

    // 파일을 바이너리 배열 데이터(ArrayBuffer)로 읽어옵니다.
    fileReader.onload = function () {
      const typedArray = new Uint8Array(this.result);

      // 워커에게 원격 URL 대신 메모리 상의 파일 데이터를 전달합니다.
      const loadingTask = pdfjsLib.getDocument({ data: typedArray });

      loadingTask.promise
        .then((pdf) => {
          setPdfDoc(pdf);
          setLoading(false); // 로드 완료 시 로딩 끔
        })
        .catch((err) => {
          console.error("PDF 파일 분석 실패:", err);
          setLoading(false);
        });
    };

    fileReader.readAsArrayBuffer(file);
  };

  // [렌더링 로직] 워커 보조 하에 캔버스에 그리기 (이전과 동일)
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
      style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}
    >
      <h1>PDF.js 파일 첨부형 워커 뷰어</h1>

      {/* 파일 업로드 인풋 UI */}
      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ cursor: "pointer" }}
        />
      </div>

      {loading && (
        <p style={{ color: "#007bff" }}>
          ⚠️ 워커가 백그라운드에서 첨부된 파일을 처리 중입니다...
        </p>
      )}

      {!loading && pdfDoc && (
        <div style={{ marginBottom: "15px" }}>
          <button
            disabled={pageNum <= 1}
            onClick={() => setPageNum((prev) => prev - 1)}
          >
            이전 페이지
          </button>
          <span style={{ margin: "0 15px" }}>
            {pageNum} / {pdfDoc.numPages}
          </span>
          <button
            disabled={pageNum >= pdfDoc.numPages}
            onClick={() => setPageNum((prev) => prev + 1)}
          >
            다음 페이지
          </button>
        </div>
      )}

      {pdfDoc && !loading && (
        <div
          style={{
            display: "inline-block",
            border: "1px solid #ccc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <canvas ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  );
}

export default App;
