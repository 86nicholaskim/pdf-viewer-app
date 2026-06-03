# 🛠 기술 설정 및 구성 (Setup & Configuration)

이 문서는 PDF 뷰어의 핵심인 PDF.js 워커 설정과 빌드 시 주의사항을 다룹니다.

## 1. PDF.js 워커(Worker) 설정
PDF.js는 성능을 위해 별도의 워커 파일을 사용합니다. 본 프로젝트는 빌드 시 생성된 해시가 포함된 파일명을 동적으로 사용합니다.

### 워커 및 라이브러리 로드
`src/utils/pdfjsLoader.js`를 통해 최신 해시가 적용된 라이브러리와 워커 정보를 가져옵니다.
`src/hooks/usePDFViewer.js`에서 다음과 같이 워커 경로가 자동 지정됩니다.
```javascript
const { pdfjsLib, workerFileName } = await loadPDFJS();
pdfjsLib.GlobalWorkerOptions.workerSrc = `/${workerFileName}`;
```

## 2. 해시 버저닝 및 동적 로딩
캐싱 효율과 버전 관리를 위해 다음과 같은 메커니즘을 사용합니다.

*   **해시 생성**: Rollup 빌드 시 파일 내용에 따라 `8자리 MD5 해시`를 파일명에 추가합니다.
*   **버전 맵**: `public/pdfjs-version-map.json` 파일이 현재 활성화된 해시 파일명 정보를 담고 있습니다.
*   **동적 주입**: 앱 실행 시 버전 맵을 읽어 `<script>` 태그를 동적으로 생성하여 PDF.js를 로드합니다.

## 3. Vite / Rollup 통합 시 주의사항
*   **External 설정**: `vite.config.js`에서 `pdfjs-dist`를 external로 설정하여 Vite 번들에서 제외하고, 전역 변수 `pdfjsLib`를 사용하도록 구성합니다.
*   **Sync 스크립트**: `pnpm dev`나 `pnpm build` 실행 시 `scripts/sync-pdfjs.cjs`가 동작하여 `libs/pdfjs`의 빌드 결과물을 `public` 폴더로 동기화합니다.

## 4. 라이브러리 버전 관리
`pdfjs-dist` 라이브러리와 `pdf.worker` 파일은 반드시 **버전이 일치**해야 합니다. 라이브러리를 업데이트했다면 `public` 폴더의 워커 파일도 새로운 버전으로 교체해 주세요.
