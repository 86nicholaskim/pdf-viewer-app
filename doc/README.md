# 📄 PDF.js 웹 워커(Web Worker) 로컬 빌드 연동 가이드

브라우저 환경에서 대용량 PDF를 파싱하거나 렌더링할 때 메인 스레드가 멈추는 현상을 방지하기 위해, **PDF.js 웹 워커**를 로컬 빌드 프로세스에 포함하여 백그라운드 스레드에서 안정적으로 연동하는 가이드입니다.

pnpm 가상 스토어 구조 및 Rollup/Vite 빌드 환경에서 가장 트러블슈팅이 적고 확실한 **'정적 에셋 복사(Public) 방식'**을 채택하여 구현합니다.

---

## 1. 패키지 설치

프로젝트 루트 경로에서 `pnpm`을 통해 PDF.js 공식 배포본 패키지를 설치합니다.

```bash
pnpm add pdfjs-dist
```

## 2. 빌드 및 개발용 워커 자동 복사 설정 (`package.json`)

pnpm 환경에서 의존성 깊숙이 숨어있는 워커 스크립트를 브라우저가 바로 읽을 수 있도록, 개발 서버 가동 및 프로덕션 빌드 시 `public/` 폴더로 자동 복사하는 스크립트를 등록합니다.

`package.json` 파일의 `scripts` 항목을 다음과 같이 변경합니다:

```json
"scripts": {
  "dev": "pnpm copy-worker && vite",
  "build": "pnpm copy-worker && vite build",
  "preview": "vite preview",
  "copy-worker": "node -e \"fs.mkdirSync('public', {recursive: true}); fs.copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf.worker.min.mjs')\""
}
```

> ⚠️ **주의**: PDF.js 최신 버전(4.x 이상)은 내부적으로 ESM 모듈을 전면 도입했으므로, 워커 파일 확장자가 `.js`가 아닌 `.mjs`여야 정상 작동합니다.

## 3. 리액트 컴포넌트 실무 구현 예시

사용자가 직접 PDF 파일을 첨부(`input type="file"`)하면 `FileReader`를 통해 `ArrayBuffer` 형태로 변환한 뒤, 웹 워커 스레드로 넘겨주어 화면 차단 없이 실시간으로 파싱 및 렌더링을 처리하는 전체 소스 코드입니다.

### `src/App.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// 1. 빌드/개발 시 public 폴더로 복사되도록 매핑한 로컬 워커 경로 바인딩
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function App() {
  const canvasRef = useRef(null);

  // 상태 관리: 파일이 처리 중일 때만 로딩 활성화
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);

  // [기능] 파일 첨부 시 바이너리 배열로 읽어 워커에 전달
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("올바른 PDF 파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    setPageNum(1); // 새 파일 로드 시 1페이지로 초기화

    const fileReader = new FileReader();

    fileReader.onload = function () {
      const typedArray = new Uint8Array(this.result);

      // 워커에게 메모리 상의 바이너리 파일 데이터를 주입
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

  // [렌더링] 워커의 가공 데이터를 받아 메인 스레드 멈춤 없이 캔버스에 그리기
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask = null;

    pdfDoc
      .getPage(pageNum)
      .then((page) => {
        const viewport = page.getViewport({ scale: 1.5 }); // 1.5배율 확대
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
        // 페이지 연속 클릭 등으로 연산이 취소된 예외는 콘솔 에러에서 제외
        if (err.name !== "RenderingCancelledException") {
          console.error("렌더링 에러:", err);
        }
      });

    // 컴포넌트 언마운트 혹은 페이지 전환 시 진행 중이던 드로잉 태스크 취소 (잔상/메모리 꼬임 방지)
    return () => {
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, pageNum]);

  return (
    <div
      style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}
    >
      <h1>PDF.js 파일 첨부형 워커 뷰어</h1>

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
```

---

## 4. 실무 운영 핵심 팁

- **버전 싱크 엄수**: 설치된 `pdfjs-dist` 라이브러리 버전과 복사해 오는 `pdf.worker.min.mjs` 파일의 버전이 다르면 `API version does not match Worker version` 에러가 발생하므로 자동 스크립트(`copy-worker`)를 통한 동기화를 유지해야 합니다.
- **CORS 프리패스**: 해당 에셋 복사 및 FileReader 방식은 로컬 메모리의 바이트 배열을 파싱하므로, 원격 URL 로드 시 발생하는 고질적인 CORS(보안 정책) 에러를 원천 차단합니다.
