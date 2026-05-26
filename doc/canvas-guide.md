# HTML5 Canvas 및 React Ref 이해하기

`PDFCanvas.jsx` 컴포넌트에서 PDF를 화면에 그릴 때 사용하는 핵심 기술인 HTML5 Canvas와 React의 `useRef`에 대해 설명합니다.

## 1. `<canvas>` 태그란?
`<canvas>`는 웹 브라우저 상에서 그래픽(그림, 애니메이션, 사진 등)을 그리기 위한 **"빈 도화지"**입니다. 

*   **HTML의 역할:** 도화지의 크기와 위치만 지정합니다. (`<canvas width="500" height="800"></canvas>`)
*   **JavaScript의 역할:** 실제 그림을 그리는 도구(붓) 역할을 합니다. JavaScript 없이는 아무것도 그려지지 않습니다.

## 2. 왜 `ref` (useRef)를 사용하나요?
React는 일반적으로 "선언적"으로 UI를 다룹니다. 하지만 Canvas는 **"명령형" API**입니다.

1.  **직접 접근 필요:** "도화지에 선을 그어라", "사각형을 채워라" 같은 명령을 내리려면 실제 DOM에 있는 `<canvas>` 엘리먼트에 직접 접근해야 합니다.
2.  **참조(Reference):** React의 `useRef`는 특정 DOM 엘리먼트에 대한 '빨대'를 꽂는 것과 같습니다. 이를 통해 `canvasRef.current`라는 값으로 실제 브라우저의 Canvas 객체를 만질 수 있게 됩니다.

## 3. 렌더링 컨텍스트 (2D Context)
Canvas를 사용할 때 가장 중요한 개념은 **컨텍스트(Context)**입니다.

```javascript
const canvas = canvasRef.current;
const context = canvas.getContext("2d");
```

*   `canvas`: 도화지 그 자체입니다.
*   `context`: 도화지에 그림을 그리는 **"붓과 팔레트"**가 포함된 도구함입니다. PDF.js는 이 `context`를 넘겨받아 그 위에 PDF의 텍스트와 이미지를 '직접' 그려넣습니다.

## 4. PDF.js와 Canvas의 협업 과정
우리 코드(`PDFCanvas.jsx`)에서의 흐름은 다음과 같습니다:

1.  **도화지 준비:** `<canvas ref={canvasRef}></canvas>`를 렌더링합니다.
2.  **크기 맞춤:** PDF 페이지의 원래 크기(viewport)를 계산하여 Canvas의 가로/세로 길이를 PDF와 똑같이 맞춥니다.
    - `canvas.width = viewport.width;`
3.  **그리기 도구 전달:** PDF.js에게 "이 도화지의 붓(`context`)을 줄게, 여기다 그려줘"라고 요청합니다.
    - `const renderContext = { canvasContext: context, viewport: viewport };`
    - `page.render(renderContext);`

## 5. 스케일(Scale)과 고해상도 렌더링
`page.getViewport({ scale: 1.5 })` 부분에서 `scale` 값은 매우 중요합니다.

1.  **배율 조절:** 기본값 `1.0`은 PDF의 실제 물리적 크기(72 DPI 기준)로 그립니다. `1.5`는 150% 크기로 렌더링하겠다는 뜻입니다.
2.  **선명도(DPI) 문제:** 
    - 웹 브라우저의 Canvas는 기본적으로 '비트맵' 방식이라서, 1.0으로 그린 뒤 CSS로 강제로 키우면 글자가 뿌옇게(Blurry) 보입니다.
    - 처음부터 `scale: 1.5`나 `2.0`으로 크게 그린 뒤 화면에 맞게 보여주면, 마치 레티나(Retina) 디스플레이처럼 **글자가 매우 또렷하게** 보입니다.
3.  **성능과 화질의 트레이드오프:**
    - 스케일이 높을수록 화질은 좋아지지만, 그만큼 Canvas가 차지하는 메모리와 그리는 시간이 늘어납니다. 보통 `1.5`에서 `2.0` 사이가 웹 뷰어에서 가장 적당한 균형점입니다.

## 6. 컴포넌트 구조 가이드 (라이브러리 로직 vs JSX)
라이브러리를 사용하는 리액트 컴포넌트는 보통 다음과 같은 **"준비 - 실행 - 결과"**의 일관된 구조를 가집니다.

```jsx
// 1. 준비: 필요한 도구들을 가져옵니다.
import { useEffect, useRef } from "react";

export function PDFCanvas({ pdfDoc, pageNum }) {
  // 2. 참조: 외부 라이브러리가 만질 DOM 요소(도화지)를 설정합니다.
  const canvasRef = useRef(null);

  // 3. 실행 (라이브러리 함수 호출 위치): 
  // 화면이 나타난 후(또는 데이터 변경 시) '명령형' 라이브러리 함수를 호출합니다.
  useEffect(() => {
    // [라이브러리 로직 시작]
    if (!pdfDoc || !canvasRef.current) return;
    
    pdfDoc.getPage(pageNum).then((page) => {
      // PDF.js 같은 외부 라이브러리가 직접 Canvas에 그림을 그리는 시점
      const context = canvasRef.current.getContext("2d");
      page.render({ canvasContext: context, ... });
    });
    // [라이브러리 로직 끝]
  }, [pdfDoc, pageNum]); // 의존성 배열: 이 값들이 바뀔 때마다 라이브러리 함수 재실행

  // 4. 결과 (JSX 반환 위치):
  // 리액트가 관리하는 가상 DOM 구조를 반환합니다. 
  // 라이브러리는 여기서 반환된 실제 HTML 요소(canvas)를 찾아가서 작업을 수행합니다.
  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
```

### 요약:
*   **라이브러리 함수 호출**: 반드시 `useEffect` 내부에서 수행합니다. (DOM이 실제로 생성된 이후여야 하기 때문)
*   **JSX 반환**: 컴포넌트의 가장 하단에서 최종적인 UI 구조만 정의합니다.
*   **연결 고리**: `ref`가 JSX와 라이브러리 로직 사이의 다리 역할을 합니다.

## 7. PDF 내용을 HTML/텍스트로 추출하기
Canvas는 "그림"일 뿐이지만, PDF.js는 내부의 **실제 텍스트 데이터**를 추출하는 기능도 제공합니다. 이를 통해 PDF 내용을 HTML로 가공하거나 외부로 전달할 수 있습니다.

### 1) 데이터 추출의 핵심: `getTextContent()`
Canvas에 그리는 `render()` 함수 대신 `page.getTextContent()`를 사용하면 다음과 같은 데이터를 얻을 수 있습니다.
*   **items**: 각 글자 뭉치(텍스트)와 그 위치 정보(좌표, 크기).
*   **styles**: 해당 글자에 적용된 폰트 이름과 스타일.

### 2) HTML 가공 포인트 (Text Layer)
추출한 데이터를 바탕으로 리액트에서 다음과 같이 HTML 요소를 생성할 수 있습니다.
```javascript
// 예시: 텍스트 데이터를 추출하고 중간에 수정(Replace)하는 흐름
page.getTextContent().then((textContent) => {
  const modifiedHtml = textContent.items.map(item => {
    // [리플레이스 포인트]
    // 원본 데이터(item.str)를 가공합니다.
    const processedText = item.str.replace("비밀번호", "********");
    
    const style = `left: ${item.transform[4]}px; top: ${item.transform[5]}px;`;
    return `<span style="${style}">${processedText}</span>`;
  });
});
```

### 3) 텍스트 리플레이스(Replace) 활용
*   **민감 정보 마스킹**: 주민번호, 연락처 등 노출되면 안 되는 정보를 HTML로 보여주기 전에 가공할 수 있습니다.
*   **키워드 하이라이트**: 특정 검색어를 `<b>` 태그나 배경색이 있는 `<span>`으로 감싸서 강조할 수 있습니다.
*   **언어 번역**: 추출된 텍스트를 번역 API에 보낸 뒤, 번역된 결과로 교체해서 HTML을 구성할 수도 있습니다.

## 8. 최종 응용 시나리오: HTML 추출 파이프라인
단순 뷰어를 넘어 PDF 데이터를 가공하여 외부로 보내야 할 때 사용하는 최종 단계입니다.

**[데이터 -> DOM -> 수정 -> HTML 추출] 흐름**
1.  **데이터 추출**: `page.getTextContent()`로 원본 텍스트와 좌표를 가져옵니다.
2.  **DOM 변환**: 리액트 컴포넌트나 임시 돔 요소를 생성하여 텍스트를 담습니다.
3.  **수정(Replace)**: 생성된 DOM 혹은 텍스트 상태에서 특정 단어를 리플레이스하거나 태그를 입힙니다.
4.  **최종 HTML 출력**: 가공이 완료된 DOM 객체에서 `.innerHTML`을 호출하여 완성된 HTML 문자열을 획득합니다.
5.  **외부 전송**: 획득한 HTML 문자열을 API를 통해 서버로 보내거나, 다른 서비스의 입력값으로 전달합니다.

## 9. 주의사항
*   **해상도**: Canvas는 비트맵 기반이므로 고해상도 렌더링을 위해 스케일(1.5 이상) 조절이 필수입니다.
*   **비동기성**: 렌더링 및 데이터 추출은 모두 비동기(`Promise`)로 동작하므로 완료 시점을 정확히 체크해야 합니다.
*   **보안**: 외부 URL 로드 시 CORS 설정이 되어 있지 않으면 브라우저에서 차단될 수 있습니다.

