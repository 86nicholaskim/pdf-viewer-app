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

## 3. 전략 C: Canvas-to-Image 변환 (안정성 우선)

Canvas 객체를 직접 인쇄하는 대신, `toDataURL()`을 통해 이미지(`<img>`) 태그로 변환하여 인쇄하는 방식입니다. 브라우저가 인쇄 중 Canvas를 초기화하거나 레이아웃이 깨지는 문제를 방지할 수 있습니다.

### ✅ 구현 흐름
1.  **이미지 데이터 추출**: `canvas.toDataURL("image/png")`를 호출하여 Base64 문자열을 얻습니다.
2.  **HTML 팝업 생성**: 새 창(`window.open`)을 열고 `<img>` 태그에 해당 데이터를 넣습니다.
3.  **자동 인쇄**: 창 로드가 완료되면 `window.print()`를 실행합니다.

### 💻 핵심 코드 예시
```javascript
const images = [];
for (let i = 1; i <= pdfDoc.numPages; i++) {
  const page = await pdfDoc.getPage(i);
  const canvas = document.createElement("canvas");
  // ... 렌더링 로직 (전략 A와 동일) ...
  images.push(canvas.toDataURL("image/png"));
}

const printWindow = window.open("", "_blank");
printWindow.document.write(images.map(img => `<img src="${img}" />`).join(""));
printWindow.onload = () => printWindow.print();
```

---

## 4. 전략 비교 및 선택 가이드

| 비교 항목 | 전략 A (Canvas) | 전략 B (HTML/TextLayer) |
| :--- | :--- | :--- |
| **결과물 품질** | 원본과 완벽 동일 (이미지 포함) | 텍스트 중심, 레이아웃 미세 오차 가능 |
| **커스터마이징** | 거의 불가능 (이미지 형태) | **매우 자유로움 (CSS/텍스트 수정)** |
| **성능 (메모리)** | 높음 (페이지당 대형 비트맵 생성) | 낮음 (경량 HTML 태그) |
| **추천 문서** | 설계도, 사진첩, 화려한 카탈로그 | **계약서, 공문서, 텍스트 리포트** |

---

## 4. 통합 권장사항

1.  **인쇄 전 전용 창(Popup) 사용**: `window.open()`을 통해 인쇄 전용 페이지를 띄우면 메인 앱의 상태(State)를 오염시키지 않고 깔끔하게 인쇄 로직을 수행할 수 있습니다.
2.  **비동기 처리 주의**: 모든 페이지의 렌더링(`Canvas`든 `TextLayer`든)이 완전히 끝난 후 `window.print()`를 호출해야 누락되는 페이지가 없습니다.
3.  **폰트 로딩**: HTML 방식 사용 시, 인쇄용 시스템에 해당 폰트가 없으면 레이아웃이 깨질 수 있으므로 웹 폰트(Web Font)를 함께 임베딩하는 것이 안전합니다.
