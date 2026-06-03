# 🏗 아키텍처 개요

PDF 뷰어 앱은 React의 함수형 컴포넌트와 훅을 활용하여 깔끔한 컴포넌트 기반 아키텍처를 따릅니다.

## 📁 디렉토리 구조

```text
pdf-viewer-app/
├── libs/
│   └── pdfjs/           # PDF.js ESM → IIFE 변환 패키지
├── public/              # 정적 에셋 (해시된 PDFjs & 워커 포함)
├── scripts/             # 빌드 및 동기화 도구 (sync-pdfjs.cjs)
├── src/
│   ├── assets/          # 이미지 및 SVG
│   ├── components/      # UI 컴포넌트
│   ├── hooks/           # 커스텀 훅 (pdfjsLoader 연동)
│   ├── utils/           # 유틸리티 (pdfjsLoader.js)
│   ├── App.jsx          # 메인 애플리케이션 컴포넌트
│   └── main.jsx         # 애플리케이션 진입점
├── doc/                 # 상세 문서
└── package.json         # 워크스페이스 및 빌드 구성
```

## 🔄 데이터 흐름

1.  **PDF.js 로딩**:
    -   앱이 로드될 때 `utils/pdfjsLoader.js`가 `public/pdfjs-version-map.json`을 읽습니다.
    -   현재 해시가 적용된 `pdfjs.[hash].js` 파일을 동적으로 로드합니다.
2.  **워커 설정**: 로드된 `pdfjsLib` 객체에 해시된 워커 경로(`pdf.worker.[hash].js`)를 지정합니다.
3.  **파일 입력**: 사용자가 표준 HTML `<input type="file">`을 사용하여 PDF 파일을 선택합니다.
...
5.  **PDF.js 파싱**: 동적으로 로드된 `pdfjsLib.getDocument()`에 데이터를 전달합니다.
6.  **이미지 기반 렌더링**:
    -   성능과 안정성을 위해 메모리 내 임시 캔버스(In-memory Canvas)를 생성합니다.
    -   페이지를 캔버스에 렌더링한 후, `toDataURL()`을 통해 이미지 데이터로 변환합니다.
    -   최종적으로 JSX에서는 `<img>` 태그를 사용하여 변환된 이미지를 출력합니다.

## 🛠 성능 최적화

-   **웹 워커**: 무거운 계산 작업을 백그라운드 스레드로 이동시켜 UI 응답성을 유지합니다.
-   **렌더링 충돌 방지**: 각 렌더링 작업마다 독립된 메모리 캔버스를 사용하고, `renderTask.cancel()`을 철저히 호출하여 "Cannot use the same canvas during multiple render() operations" 에러를 원천 차단합니다.
-   **이미지 캐싱**: 렌더링된 이미지는 React 상태로 관리되어, 불필요한 재렌더링 시에도 캔버스를 다시 그리지 않고 이미지를 그대로 보여줍니다.
-   **캔버스 스케일링**: `viewport` 스케일 설정을 통해 고해상도(DPI) 디스플레이를 지원합니다.
