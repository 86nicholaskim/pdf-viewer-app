# 🏗 아키텍처 개요

PDF 뷰어 앱은 React의 함수형 컴포넌트와 훅을 활용하여 깔끔한 컴포넌트 기반 아키텍처를 따릅니다.

## 📁 디렉토리 구조

```text
pdf-viewer-app/
├── public/              # 정적 에셋 (PDF 워커 포함)
├── src/
│   ├── assets/          # 이미지 및 SVG
│   ├── components/      # UI 컴포넌트 (Uploader, Controls, Canvas)
│   ├── hooks/           # 커스텀 훅 (PDF 로직)
│   ├── App.jsx          # 메인 애플리케이션 컴포넌트
│   ├── main.jsx         # 애플리케이션 진입점
│   └── index.css        # 글로벌 스타일
├── doc/                 # 상세 문서
└── package.json         # 프로젝트 구성 및 스크립트
```

## 🔄 데이터 흐름

1.  **파일 입력**: 사용자가 표준 HTML `<input type="file">`을 사용하여 PDF 파일을 선택합니다.
2.  **FileReader**: 브라우저의 `FileReader` API를 사용하여 파일을 `ArrayBuffer`로 읽습니다.
3.  **PDF.js 로딩**: 읽어온 `ArrayBuffer`를 `Uint8Array`로 변환하여 `pdfjsLib.getDocument()`에 전달합니다.
4.  **워커 처리**: PDF.js가 파싱 및 압축 해제 작업을 웹 워커(`pdf.worker.min.mjs`)로 오프로드합니다.
5.  **상태 관리**: 처리된 `pdfDoc` 객체가 React 상태(State)에 저장됩니다.
6.  **캔버스 렌더링**:
    -   `pdfDoc`이나 `pageNum`이 변경되면 `useEffect` 훅이 트리거됩니다.
    -   문서에서 특정 페이지를 가져옵니다.
    -   페이지의 `render()` 메서드를 호출하여 HTML5 `<canvas>` 요소에 내용을 그립니다.

## 🛠 성능 최적화

-   **웹 워커**: 무거운 계산 작업을 백그라운드 스레드로 이동시켜 UI 응답성을 유지합니다.
-   **렌더링 취소**: 사용자가 페이지를 빠르게 넘길 때, `renderTask.cancel()`을 사용하여 대기 중인 렌더링 작업을 취소함으로써 메모리 누수와 시각적 오류를 방지합니다.
-   **캔버스 스케일링**: `viewport` 스케일 설정을 통해 고해상도(DPI) 디스플레이를 지원합니다.
