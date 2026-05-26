# 📄 문서 인덱스

PDF 뷰어 앱 문서 센터입니다. PDF.js와 React를 활용한 뷰어 구현의 핵심 정보가 담겨 있습니다.

## 📚 주요 문서

1. [**PDF 렌더링 흐름 (Flow)**](./pdf-flow.md)
   - 파일 선택부터 화면 출력까지의 전체 파이프라인.
2. [**Canvas & HTML 가공 가이드**](./canvas-guide.md)
   - **사용 기술**: HTML5 Canvas, React Ref, PDF.js API.
   - **핵심 로직**: 스케일 조절, 컴포넌트 구조, 고해상도 처리.
   - **응용 방법**: 텍스트 추출(getTextContent), 리플레이스(Replace), HTML 변환 및 외부 전송 시나리오.
3. [**아키텍처 개요**](./architecture.md)
   - 프로젝트 구조 및 성능 최적화(Web Worker).

---

## 🚀 빠른 요약 (Quick Guide)

| 구분 | 내용 |
| :--- | :--- |
| **기본 형태** | 파일 업로드 및 URL 경로 입력 기반 PDF 뷰어 |
| **핵심 기술** | React, PDF.js, HTML5 Canvas, Web Worker |
| **구현 특징** | 비동기 렌더링 취소 처리, 1.5배율 고해상도 지원 |
| **확장 응용** | PDF -> Text 데이터 추출 -> DOM 가공 -> HTML 문자열 출력 |

---
🔗 [루트 README.md](../README.md) | [소스 코드](../src/)
