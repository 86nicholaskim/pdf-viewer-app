# 서버 환경에서의 HTML 변환 및 인쇄 가이드 (Server-side)

이 문서는 웹 브라우저 없이 Node.js + TypeScript 환경에서 PDF를 HTML로 변환하고 인쇄용 데이터를 생성하는 방법을 가이드합니다.

## 1. 서버 환경의 기술 스택
브라우저의 UI 없이 백그라운드에서 처리하기 위해 다음 도구들이 필요합니다.
*   **PDF.js (Node.js version)**: PDF 파싱 및 데이터 추출.
*   **node-canvas**: 브라우저의 Canvas API를 서버에서 흉내 내기 위한 라이브러리.
*   **JSDOM**: 서버 환경에서 HTML 요소를 생성하고 만지기 위한 가상 DOM 라이브러리.
*   **Puppeteer (선택 사항)**: 완벽한 인쇄용 레이아웃이 필요할 때 사용하는 Headless 브라우저.

## 2. 서버 측 변환 프로세스
```typescript
// 서버(Node.js)에서의 대략적인 흐름 예시
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

async function convertPdfToHtml(pdfPath: string) {
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  // 1. 텍스트 데이터 추출
  const textContent = await page.getTextContent();

  // 2. 가상 DOM을 이용한 HTML 생성 (JSDOM 등 활용)
  const htmlElements = textContent.items.map(item => {
    return `<div style="position:absolute; left:${item.transform[4]}px; ...">${item.str}</div>`;
  });

  return `<html><body>${htmlElements.join('')}</body></html>`;
}
```

## 3. 인쇄(Print)를 위한 최적화 전략
사용자가 "인쇄를 하고 싶어 한다"면 다음 두 가지 접근법이 있습니다.

### 방법 A: 고정 레이아웃 HTML 생성
*   추출한 텍스트의 좌표를 절대 위치(`position: absolute`)로 고정하여 HTML을 만듭니다.
*   인쇄 시 PDF의 원래 레이아웃과 거의 동일하게 유지됩니다.

### 방법 B: Puppeteer를 이용한 PDF-to-Image-to-Print
*   서버에서 PDF를 이미지로 먼저 렌더링한 뒤, 그 이미지를 꽉 차게 담은 HTML을 생성합니다.
*   폰트 깨짐이나 레이아웃 틀어짐 없이 가장 확실하게 원본과 똑같이 인쇄됩니다.

## 4. 응용 사례
*   **자동 마스킹 후 인쇄**: 서버에서 개인정보를 `replace`로 가린 HTML을 생성하여 인쇄 전용 파일로 제공.
*   **대량 변환**: 수만 장의 PDF 파일을 서버 배치 작업으로 HTML 소스로 변환하여 DB에 저장.

## 5. 주의사항 (Server-side)
*   **폰트 지원**: 서버 환경(Linux 등)에 PDF에 사용된 폰트가 설치되어 있어야 글자가 깨지지 않습니다.
*   **메모리 관리**: 대용량 PDF 처리 시 서버 메모리 사용량이 급증할 수 있으므로 스트림 처리가 권장됩니다.
