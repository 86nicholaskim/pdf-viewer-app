# PDF 뷰어 앱 📄

**React 19**, **Vite**, **PDF.js**를 사용하여 구축된 고성능 응답형 PDF 뷰어입니다. 이 애플리케이션은 웹 워커(Web Workers)를 활용하여 대용량 PDF 파일에서도 부드러운 렌더링과 멈춤 없는 UI를 보장합니다.

## 🚀 주요 기능

- **파일 업로드**: 로컬 PDF 파일을 간편하게 업로드하여 볼 수 있습니다.
- **빠른 렌더링**: 백그라운드 처리를 위해 PDF.js 웹 워커를 사용합니다.
- **페이지 탐색**: 다중 페이지 문서를 쉽게 탐색할 수 있는 제어 기능을 제공합니다.
- **응답형 캔버스**: HTML5 Canvas를 사용하여 고품질 렌더링을 구현합니다.
- **CORS 프리**: `FileReader`를 통해 로컬 파일을 직접 처리하여 일반적인 CORS 문제를 방지합니다.

## 🛠 기술 스택

- **프레임워크**: [React 19](https://react.dev/)
- **번들러**: [Vite](https://vitejs.dev/)
- **라이브러리**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **패키지 매니저**: [pnpm](https://pnpm.io/)

## 🏁 시작하기

### 사전 요구 사항

- Node.js (최신 LTS 권장)
- pnpm 설치 (`npm install -g pnpm`)

### 설치

```bash
# 저장소 복제
git clone <repository-url>

# 의존성 설치
pnpm install
```

### 개발 모드 실행

```bash
# 개발 서버 시작
pnpm dev
```
`dev` 스크립트는 `public/` 디렉토리에 PDF.js 워커를 사용할 수 있도록 `copy-worker`를 자동으로 실행합니다.

### 빌드

```bash
# 프로덕션용 빌드
pnpm build
```

## 📖 상세 문서

상세 문서는 [doc/](./doc/) 디렉토리에서 확인할 수 있습니다.

- [설정 가이드](./doc/setup.md): 기술적 구성 및 워커 연동 방법.
- [아키텍처](./doc/architecture.md): 애플리케이션 구조 개요.
- [기능 및 사용법](./doc/features.md): 제공 기능에 대한 상세 설명.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
