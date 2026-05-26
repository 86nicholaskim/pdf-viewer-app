# PDF 렌더링 흐름 (PDF Rendering Flow)

이 문서는 애플리케이션에서 PDF 파일이 어떻게 업로드되고 Canvas에 렌더링되는지의 전체 흐름을 설명합니다.

## 1. 파일 선택 및 경로 호출 (Loading Phase)
**관련 파일:** `src/hooks/usePDFViewer.js`, `src/App.jsx`

이 애플리케이션은 두 가지 방식으로 PDF를 불러옵니다.

1. **로컬 파일 선택**: 사용자가 `FileUploader`로 파일을 선택하면 `FileReader`가 `ArrayBuffer`로 읽어 처리합니다.
2. **서버/외부 URL 호출**: 사용자가 URL 주소를 입력하면 `pdfjsLib.getDocument(url)`가 직접 해당 경로의 파일을 호출합니다.
3. **PDF.js 문서 로드**: 
   - 입력된 소스(바이너리 혹은 URL)를 바탕으로 `loadingTask`를 생성합니다.
   - 로드가 완료되면 `pdfDoc` 상태(State)를 업데이트하여 렌더링 준비를 마칩니다.

## 2. 워커(Worker) 설정
**관련 파일:** `src/hooks/usePDFViewer.js`, `public/pdf.worker.min.mjs`

- PDF.js는 무거운 연산을 메인 스레드에서 분리하기 위해 웹 워커를 사용합니다.
- `pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"` 설정을 통해 `public` 폴더에 위치한 워커 파일을 참조합니다.

## 3. 렌더링 프로세스 (Rendering Phase)
**관련 파일:** `src/components/PDFCanvas.jsx`

`pdfDoc`이나 `pageNum`이 변경될 때마다 `PDFCanvas` 컴포넌트 내의 `useEffect`가 실행됩니다.

1. **페이지 객체 획득:** `pdfDoc.getPage(pageNum)`을 호출하여 현재 렌더링할 특정 페이지 객체를 가져옵니다.
2. **뷰포트 계산:** `page.getViewport({ scale: 1.5 })`를 사용하여 설정된 배율(scale)에 따른 렌더링 크기를 계산합니다.
3. **Canvas 크기 설정:** 계산된 뷰포트의 `width`와 `height`를 HTML5 Canvas 엘리먼트의 속성에 할당합니다.
4. **그리기(Drawing):**
   - Canvas의 2D 컨텍스트(`context`)를 가져옵니다.
   - `renderContext` 객체에 `canvasContext`와 `viewport` 정보를 담습니다.
   - `page.render(renderContext)`를 호출하여 Canvas에 실제 PDF 내용을 그립니다.

## 4. 최적화 및 정리 (Cleanup)
- **렌더링 취소:** 사용자가 페이지를 빠르게 넘길 경우 이전 렌더링 작업이 충돌할 수 있습니다. 이를 방지하기 위해 `useEffect`의 cleanup 함수에서 `renderTask.cancel()`을 호출하여 이전 작업을 취소합니다.
- **로딩 상태 관리:** `loading` 상태 변수를 통해 PDF 처리 중에는 사용자에게 로딩 메시지를 표시합니다.

---

### 데이터 흐름 요약
`File (Blob)` -> `ArrayBuffer` -> `pdfjsLib Document` -> `Page Object` -> `Canvas 2D Context` -> **화면 출력**
