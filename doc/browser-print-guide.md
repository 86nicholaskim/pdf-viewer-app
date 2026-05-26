# 브라우저 팝업 인쇄 가이드 (React & Hook)

브라우저 환경에서 새로운 창(Popup)을 띄워 PDF 내용을 HTML로 렌더링하고 바로 인쇄하는 방법을 가이드합니다.

## 1. 구현 전략
1.  **전용 루트(Route) 생성**: `/print`와 같은 인쇄 전용 페이지를 만듭니다.
2.  **훅 재사용**: 기존 `usePDFViewer` 훅을 사용하여 PDF 데이터를 로드합니다.
3.  **HTML 변환**: `getTextContent()`로 텍스트 레이어를 생성합니다.
4.  **자동 인쇄**: 로딩이 완료되면 `window.print()`를 실행합니다.

## 2. 코드 구조 예시
```jsx
// PrintPage.jsx (인쇄 전용 컴포넌트)
export function PrintPage() {
  const { pdfDoc, loadPDF } = usePDFViewer();
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    // 1. URL 파라미터 등에서 PDF 경로를 받아 로드
    const pdfUrl = new URLSearchParams(window.location.search).get("url");
    loadPDF(pdfUrl);
  }, []);

  useEffect(() => {
    if (!pdfDoc) return;
    
    // 2. 모든 페이지를 HTML로 변환하는 로직 (텍스트 추출)
    renderAllPagesToHtml(pdfDoc).then(html => {
      setHtmlContent(html);
      // 3. 렌더링 완료 후 인쇄창 띄우기
      setTimeout(() => window.print(), 500);
    });
  }, [pdfDoc]);

  return <div className="print-container" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
```

## 3. 팝업 실행 방법
메인 앱에서 버튼 클릭 시 인쇄 전용 창을 띄웁니다.
```javascript
const handlePrintOpen = (pdfUrl) => {
  window.open(`/print?url=${encodeURIComponent(pdfUrl)}`, '_blank', 'width=800,height=900');
};
```

## 4. 장점
*   **실시간성**: 사용자가 보고 있는 즉시 인쇄 화면으로 연결 가능합니다.
*   **브라우저 자원 활용**: Web Worker와 PDF.js의 브라우저 최적화 기능을 그대로 사용합니다.
*   **별도 서버 불필요**: 인쇄를 위한 서버 리소스를 사용하지 않습니다.
