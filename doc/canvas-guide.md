# HTML5 Canvas 및 React Ref 이해하기

`PDFCanvas.jsx` 컴포넌트에서 PDF를 화면에 그릴 때 사용하는 핵심 기술인 HTML5 Canvas와 React의 `useRef`에 대해 설명합니다.

## 1. `<canvas>` 태그란?
`<canvas>`는 웹 브라우저 상에서 그래픽(그림, 애니메이션, 사진 등)을 그리기 위한 **"빈 도화지"**입니다. 

*   **HTML의 역할:** 도화지의 크기와 위치만 지정합니다. (`<canvas width="500" height="800"></canvas>`)
*   **JavaScript의 역할:** 실제 그림을 그리는 도구(붓) 역할을 합니다. JavaScript 없이는 아무것도 그려지지 않습니다.

## 2. 왜 `ref` (useRef)를 사용하나요?
React는 일반적으로 "선언적"으로 UI를 다룹니다. 하지만 Canvas는 **"명령형" API**입니다.

1.  **직접 접근 필요:** "도화지에 선을 그어라", "사각형을 채워라" 같은 명령을 내리려면 실제 DOM에 있는 `<canvas>` 엘리먼트에 직접 접근해야 합니다.
2.  **참조(Reference):** React의 `useRef`는 특정 DOM 엘리먼트에 대한 '빨대'를 꽂는 것과 같습니다. 또한, 비동기 작업 중인 `renderTask`를 추적하고 취소하기 위해 사용하기도 합니다.

## 3. 인메모리 캔버스(In-memory Canvas)와 이미지 변환
최신 구현에서는 `<canvas>`를 DOM에 직접 렌더링하지 않고 메모리 상에서만 활용한 뒤 `<img>` 태그로 결과를 보여줍니다.

### 왜 이 방식을 사용하나요?
1.  **렌더링 충돌 방지**: 동일한 Canvas 엘리먼트에 여러 번 `render()`를 호출하면 에러가 발생합니다. 메모리에서 매번 새로운 `document.createElement('canvas')`를 생성하면 이 문제를 원천적으로 해결할 수 있습니다.
2.  **UI 응답성**: 이미지가 생성된 후에는 브라우저가 일반적인 이미지처럼 다룰 수 있어, 캔버스보다 메모리 관리와 리렌더링 속도면에서 유리합니다.
3.  **상태 저장 용이**: 렌더링된 결과를 `Data URL`로 변환하여 React 상태에 저장하면, 페이지를 다시 그릴 필요 없이 즉시 이미지를 보여줄 수 있습니다.

### 구현 코드 예시
```javascript
// 1. 메모리 내 캔버스 생성
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

// 2. 렌더링 수행
const renderTask = page.render({ canvasContext: context, viewport });
await renderTask.promise;

// 3. 이미지 데이터로 변환 (Data URL)
const imgSrc = canvas.toDataURL("image/webp", 0.8);

// 4. JSX에서 사용
return <img src={imgSrc} alt="PDF Page" />;
```

## 4. 렌더링 에러 해결: "multiple render() operations"
PDF.js 사용 중 가장 흔히 발생하는 에러는 다음과 같습니다:
`Error: Cannot use the same canvas during multiple render() operations.`

### 원인
하나의 `<canvas>` 요소에 대해 `page.render()`가 아직 끝나지 않았는데, 또 다른 `page.render()`가 호출될 때 발생합니다. (예: 사용자가 페이지를 매우 빠르게 넘길 때)

### 해결 방법
1.  **인메모리 캔버스 사용**: 위에서 설명한 것처럼 매번 새로운 캔버스 객체를 생성합니다.
2.  **작업 취소 (Cancellation)**: `useEffect`의 클린업 함수에서 `renderTask.cancel()`을 호출하여 이전 작업을 명확히 종료합니다.
3.  **isCancelled 플래그**: 비동기 작업 완료 후 상태를 업데이트하기 전에 컴포넌트가 여전히 유효한지 체크합니다.

## 5. 스케일(Scale)과 고해상도 렌더링
`page.getViewport({ scale: 2.0 })` 부분에서 `scale` 값은 매우 중요합니다.

1.  **배율 조절:** 기본값 `1.0`은 PDF의 실제 물리적 크기(72 DPI 기준)로 그립니다. `2.0`은 200% 크기로 렌더링하겠다는 뜻입니다.
2.  **선명도(DPI) 문제:** 
    - 웹 브라우저의 Canvas는 기본적으로 '비트맵' 방식이라서, 1.0으로 그린 뒤 CSS로 강제로 키우면 글자가 뿌옇게(Blurry) 보입니다.
    - 처음부터 `scale: 2.0`으로 크게 그린 뒤 화면에 맞게 보여주면, 마치 레티나(Retina) 디스플레이처럼 **글자가 매우 또렷하게** 보입니다.
3.  **성능과 화질의 트레이드오프:**
    - 스케일이 높을수록 화질은 좋아지지만, 그만큼 Canvas가 차지하는 메모리와 그리는 시간이 늘어납니다. 보통 `1.5`에서 `2.0` 사이가 웹 뷰어에서 가장 적당한 균형점입니다.

## 6. 컴포넌트 구조 가이드
라이브러리를 사용하는 리액트 컴포넌트는 보통 다음과 같은 **"준비 - 실행 - 결과"**의 일관된 구조를 가집니다.

```jsx
export function PDFCanvas({ pdfDoc, pageNum }) {
  const [imgSrc, setImgSrc] = useState(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(pageNum);
      if (isCancelled) return;

      const canvas = document.createElement("canvas");
      // ... 렌더링 로직 ...
      
      const renderTask = page.render({ ... });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

        if (!isCancelled) {
        setImgSrc(canvas.toDataURL("image/webp", 0.8));
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) renderTaskRef.current.cancel();
    };
  }, [pdfDoc, pageNum]);

  return <div>{imgSrc && <img src={imgSrc} />}</div>;
}
```

## 7. 주의사항
*   **해상도**: Canvas는 비트맵 기반이므로 고해상도 렌더링을 위해 스케일(1.5 이상) 조절이 필수입니다.
*   **비동기성**: 렌더링 및 데이터 추출은 모두 비동기(`Promise`)로 동작하므로 완료 시점을 정확히 체크해야 합니다.
*   **보안**: 외부 URL 로드 시 CORS 설정이 되어 있지 않으면 브라우저에서 차단될 수 있습니다.
