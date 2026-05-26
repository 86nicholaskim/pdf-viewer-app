# 🛠 기술 설정 및 구성 (Setup & Configuration)

이 문서는 PDF 뷰어의 핵심인 PDF.js 워커 설정과 빌드 시 주의사항을 다룹니다.

## 1. PDF.js 워커(Worker) 설정
PDF.js는 성능을 위해 별도의 워커 파일을 사용합니다.

### 워커 경로 지정
`src/hooks/usePDFViewer.js`에서 워커의 위치를 지정합니다.
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

## 2. 확장자 선택 (.mjs vs .js)
현재 프로젝트는 최신 표준인 `.mjs`를 사용하고 있으나, 필요에 따라 `.js`로 변경 가능합니다.

*   **`.mjs` 사용 시**: 최신 ESM 표준을 따르며, Vite/Rollup 환경에서 최적의 성능을 냅니다.
*   **`.js` 사용 시**: 
    - 서버 환경(Nginx, Apache 등)에서 `.mjs` MIME 타입을 지원하지 않을 경우 해결책이 됩니다.
    - 파일명을 `pdf.worker.min.js`로 변경하고 `workerSrc` 경로도 함께 수정해야 합니다.
    - 기능적으로는 완전히 동일하게 작동합니다.

## 3. Vite / Rollup 통합 시 주의사항
*   **Static Assets**: 워커 파일은 번들링 과정에서 코드가 섞이지 않도록 `public` 폴더에 위치시켜야 합니다.
*   **Base URL**: 프로젝트가 루트가 아닌 하위 경로(예: `domain.com/app/`)에 배포된다면 `workerSrc` 경로 앞에 `import.meta.env.BASE_URL` 등을 붙여줘야 합니다.

## 4. 라이브러리 버전 관리
`pdfjs-dist` 라이브러리와 `pdf.worker` 파일은 반드시 **버전이 일치**해야 합니다. 라이브러리를 업데이트했다면 `public` 폴더의 워커 파일도 새로운 버전으로 교체해 주세요.
