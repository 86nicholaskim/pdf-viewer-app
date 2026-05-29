# 🖨️ PDF 인쇄 구현 전략 가이드

이 문서는 PDF 데이터를 인쇄할 때 상황에 맞는 두 가지 핵심 구현 전략(Canvas 렌더링 vs HTML 추출)을 비교하고 가이드합니다.

---

## 1. 전략 A: Canvas 기반 고화질 렌더링 (`getPage` 활용)

PDF의 레이아웃, 이미지, 그래픽 요소를 원본과 100% 동일하게 유지해야 할 때 사용하는 방식입니다.

### ✅ 구현 흐름
1.  **전체 페이지 순회**: `pdfDoc.numPages`를 활용해 모든 페이지를 비동기 루프로 처리합니다.
2.  **고해상도 뷰포트 설정**: 인쇄 시 선명도를 위해 `scale: 2.0` 이상을 권장합니다.
3.  **오프스크린 렌더링**: 화면에 보이지 않는 임시 Canvas를 생성하여 `page.render()`를 실행합니다.
4.  **이미지화 또는 직접 삽입**: 렌더링된 Canvas를 `toDataURL()`로 이미지화하거나, Canvas 객체 자체를 인쇄 전용 컨테이너에 추가합니다.

### 💻 핵심 코드 예시
```javascript
async function prepareCanvasPrint(pdfDoc) {
  const container = document.getElementById('print-area');
  
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // 고해상도
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({ canvasContext: context, viewport }).promise;
    container.appendChild(canvas);
  }
}
```

### 🎨 CSS 팁
```css
@media print {
  canvas {
    page-break-after: always; /* 페이지별 강제 줄바꿈 */
    max-width: 100%;
    height: auto;
  }
}
```

---

## 2. 전략 B: HTML/TextLayer 기반 스타일 가공

인쇄 전 텍스트 내용을 수정(Replace)하거나, CSS를 통해 폰트, 색상 등 디자인을 자유롭게 조정해야 할 때 적합합니다.

### ✅ 구현 흐름
1.  **텍스트 데이터 추출**: `page.getTextContent()`를 통해 PDF 내 텍스트와 좌표 정보를 가져옵니다.
2.  **데이터 치환**: 획득한 데이터 객체 내부의 문자열(`item.str`)을 정규식 등으로 수정합니다.
3.  **TextLayer 렌더링**: 수정된 데이터를 `pdfjsLib.TextLayer`에 전달하여 HTML 구조를 생성합니다.
4.  **CSS 오버라이드**: 생성된 HTML(`span` 태그들)에 커스텀 스타일을 적용하여 최종 인쇄본을 만듭니다.

### 💻 핵심 코드 예시
```javascript
async function prepareHtmlPrint(page) {
  const textContent = await page.getTextContent();
  
  // 데이터 가공 (예: 기밀 정보 마스킹)
  textContent.items.forEach(item => {
    item.str = item.str.replace("비공개", "******");
  });

  const container = document.createElement('div');
  container.className = 'textLayer'; // PDF.js 기본 CSS 클래스 활용
  
  const textLayer = new pdfjsLib.TextLayer({
    textContentSource: textContent,
    container: container,
    viewport: page.getViewport({ scale: 1.5 })
  });
  
  await textLayer.render();
  return container.innerHTML; // 가공된 HTML 반환
}
```

---

## 3. 전략 C: 이미지 변환 인쇄 (세부 옵션)

Canvas 객체를 직접 인쇄하는 대신, 다양한 형식의 이미지로 변환하여 새 창에서 인쇄하는 방식입니다.

### 1) PNG/JPG 스트링 방식 (DataURL / Base64)
*   **패턴**: **값(Value) 전달 방식**
*   **특징**: 이진 데이터를 텍스트 문자열로 인코딩하여 직접 전달.
*   **성능 분석 (Trace 결과)**:
    *   **메모리**: JS Heap 메모리에 거대한 문자열이 직접 할당되어 점유율이 매우 높음 (PNG > JPG).
    *   **소요 시간**: 인코딩/디코딩 연산 부하로 인해 소요 시간이 가장 김 (약 1.2s+).
*   **비유**: 책 한 권의 내용을 전부 외워서 남에게 읊어주는 방식.

### 2) Blob 객체 방식 (ObjectURL / Binary)
*   **패턴**: **참조(Reference) 전달 방식**
*   **특징**: 데이터를 브라우저 네이티브 메모리에 보관하고, JS는 짧은 주소(URL)만 관리.
*   **성능 분석 (Trace 결과)**:
    *   **메모리**: 실제 데이터는 JS 외부(Native) 영역에 있어 **JS Heap 점유율이 매우 낮음 (최적)**.
    *   **소요 시간**: 인코딩 과정이 생략되어 처리 속도가 빠르고 안정적 (약 0.7s~0.8s).
*   **비유**: 물건이 보관된 창고 번호표(주소)만 전달하는 방식.

---

## 4. 전략 및 데이터 형식 비교 요약

| 비교 항목 | **Base64 (PNG/JPG)** | **Binary (Blob)** |
| :--- | :--- | :--- |
| **데이터 본질** | 텍스트(String)화된 데이터 | 순수 이진 데이터 (덩어리) |
| **메모리 패턴** | **값(Value)**에 의한 전달 | **참조(Reference)**에 의한 전달 |
| **JS Heap 부하** | 높음 (GC 관리 부담 증가) | **낮음 (최상)** |
| **CPU 연산** | 인코딩/디코딩 부하 발생 | 연산 거의 없음 (직접 처리) |
| **뒷정리** | 가비지 컬렉터가 자동 처리 | **`revokeObjectURL()`로 수동 반납 권장** |

---

## 5. 최종 권장사항
1.  **대용량/다중 페이지 인쇄**: 무조건 **Blob(ObjectURL) 방식**을 사용하여 브라우저 크래시를 방지하십시오.
2.  **속도 최적화**: 화질 저하가 크지 않은 텍스트 문서라면 **JPG(0.7 퀄리티) 스트링** 방식이 가장 빠른 인쇄 창 로딩 속도를 보입니다.
3.  **관리 편의성**: 1~2장의 소형 이미지 처리는 **Base64(DataURL)**가 구현 및 디버깅 면에서 유리할 수 있습니다.

---

## 4. 통합 권장사항

1.  **인쇄 전 전용 창(Popup) 사용**: `window.open()`을 통해 인쇄 전용 페이지를 띄우면 메인 앱의 상태(State)를 오염시키지 않고 깔끔하게 인쇄 로직을 수행할 수 있습니다.
2.  **비동기 처리 주의**: 모든 페이지의 렌더링(`Canvas`든 `TextLayer`든)이 완전히 끝난 후 `window.print()`를 호출해야 누락되는 페이지가 없습니다.
3.  **폰트 로딩**: HTML 방식 사용 시, 인쇄용 시스템에 해당 폰트가 없으면 레이아웃이 깨질 수 있으므로 웹 폰트(Web Font)를 함께 임베딩하는 것이 안전합니다.
