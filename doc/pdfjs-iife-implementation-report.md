# PDF.js IIFE 변환 및 pnpm 연동 구현 보고서

본 문서는 `pdfjs-dist` v4+ 이상의 ESM 전용 버전을 Rollup을 사용하여 IIFE 형식으로 변환하고, 이를 pnpm 워크스페이스 구조에 통합한 과정을 기록합니다.

## 1. 개요
최신 버전의 PDF.js는 ESM 형식만 제공하므로, 기존의 `external + globals` 패턴(전역 변수 `pdfjsLib` 사용)을 유지하기 위해 별도의 번들링 단계가 필요합니다. 이를 위해 `libs/pdfjs`라는 별도 패키지를 구성하여 IIFE로 변환하는 워크플로우를 구축했습니다.

## 2. 디렉토리 구조
```text
libs/pdfjs/
├── esm/              # 원본 ESM 파일 (node_modules에서 복사됨)
│   ├── pdf.mjs
│   └── pdf.worker.mjs
├── dist/             # Rollup 빌드 결과물 (IIFE 형식)
│   ├── pdfjs.js      # window.pdfjsLib 노출
│   └── pdf.worker.js # window.pdfjsWorker 노출
├── rollup.config.js  # 변환 설정 파일
└── package.json      # 빌드 스크립트 정의
```

## 3. 주요 설정 및 변경 사항

### 3.1. Rollup 변환 설정 (`libs/pdfjs/rollup.config.js`)
ESM 파일을 읽어 브라우저 전역 변수 방식으로 사용할 수 있도록 `iife` 포맷으로 변환합니다.
- `pdf.mjs` → `window.pdfjsLib`
- `pdf.worker.mjs` → `window.pdfjsWorker`

### 3.2. 워크스페이스 연동 (`pnpm-workspace.yaml`)
`libs/**` 경로를 추가하여 pnpm이 내부 패키지를 관리할 수 있도록 설정했습니다.

### 3.3. 루트 빌드 프로세스 통합 (`package.json`)
`build:pdfjs` 스크립트를 통해 다음 과정을 자동화했습니다:
1. `libs/pdfjs`에서 Rollup 빌드 실행
2. 생성된 `dist/*.js` 파일들을 프로젝트의 `public/` 폴더로 복사

### 3.4. Vite 및 앱 설정
- **`index.html`**: `<script src="/pdfjs.js"></script>`를 추가하여 전역 로드.
- **`vite.config.js`**: `pdfjs-dist`를 `external`로 설정하고 `pdfjsLib` 전역 변수와 매핑하여 번들 크기 최적화.
- **`usePDFViewer.js`**: 워커 경로를 `/pdf.worker.js`로 변경.

## 4. 사용 및 유지보수 방법

### 개발 및 빌드
- `pnpm dev` 또는 `pnpm build` 실행 시 자동으로 변환 프로세스가 먼저 동작합니다.

### PDF.js 버전 업데이트 시
1. `node_modules/pdfjs-dist/build/` 내의 새로운 `.mjs` 파일들을 `libs/pdfjs/esm/`으로 복사합니다.
2. `pnpm build:pdfjs` 명령을 실행하여 IIFE 파일을 새로 갱신합니다.

## 5. 기대 효과
- 최신 버전의 PDF.js 기능을 유지하면서도 기존의 전역 변수 기반 코드를 수정 없이 사용 가능.
- Vite 메인 번들에 대용량 PDF.js가 포함되지 않아 초기 로딩 속도 개선.
- pnpm 워크스페이스를 통한 체계적인 외부 라이브러리 관리.
