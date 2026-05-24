# 🛠 기술 설정 및 구성

이 문서는 PDF.js와 웹 워커(Web Workers)가 이 프로젝트에 어떻게 통합되었는지, 특히 **pnpm**과 **Vite**를 사용할 때 발생하는 문제들을 어떻게 해결했는지 설명합니다.

## 1. PDF.js 워커 통합

대용량 PDF 처리 중에 메인 UI 스레드가 멈추는 것을 방지하기 위해 PDF.js 웹 워커를 사용합니다. 그러나 심볼릭 링크 구조를 사용하는 `pnpm` 환경에서는 Vite가 `node_modules` 내의 워커 파일을 찾는 데 어려움을 겪을 수 있습니다.

### 정적 에셋 복사 전략

우리는 "정적 에셋 복사" 전략을 사용합니다. 빌드 및 개발 프로세스 중에 워커 파일을 `node_modules`에서 `public/` 디렉토리로 복사합니다.

#### `package.json` 설정

```json
"scripts": {
  "copy-worker": "node -e \"fs.mkdirSync('public', {recursive: true}); fs.copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf.worker.min.mjs')\"",
  "dev": "pnpm copy-worker && vite",
  "build": "pnpm copy-worker && vite build"
}
```

이를 통해 브라우저가 항상 루트 경로인 `/pdf.worker.min.mjs`에서 워커 파일을 찾을 수 있도록 보장합니다.

## 2. 글로벌 워커 옵션 설정

`src/hooks/usePDFViewer.js`에서 PDF.js가 이 워커를 어디에서 찾을 수 있는지 명시적으로 지정합니다.

```javascript
import * as pdfjsLib from "pdfjs-dist";

// 로컬 워커 경로 바인딩
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

## 3. 버전 동기화

`package.json`에 정의된 `pdfjs-dist` 라이브러리 버전과 워커 파일의 버전이 일치하는 것이 매우 중요합니다.

- **주의**: 버전이 일치하지 않으면 콘솔에 `API version does not match Worker version` 에러가 발생합니다.
- **해결책**: `copy-worker` 스크립트가 설치된 패키지에서 직접 워커를 복사해 오므로, 항상 동기화된 상태를 유지합니다.

## 4. 왜 `.mjs` 인가요?

최신 버전의 PDF.js(4.x 및 5.x)는 ECMAScript 모듈(ESM)을 사용합니다. `.mjs` 확장자는 브라우저가 워커를 모듈로 처리하도록 보장하는 데 사용됩니다.
