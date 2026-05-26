# 모듈 빌드 및 통합 가이드 (pnpm, Turbo, Rollup)

이 문서는 `pnpm` 워크스페이스, `Turborepo`, `Rollup` 기반의 빌드 환경에서 PDF.js 라이브러리를 효율적으로 통합하고 관리하는 방법을 설명합니다.

## 1. 패키지 관리 (pnpm)
워크스페이스 환경에서 PDF.js는 대용량 라이브러리이므로 관리가 중요합니다.

*   **의존성 설치**: 라이브러리나 공통 UI 패키지에서 사용한다면 해당 패키지의 `package.json`에 포함합니다.
    ```bash
    pnpm add pdfjs-dist
    ```
*   **공유 패키지 전략**: 여러 앱에서 PDF 기능을 쓴다면 `packages/pdf-core`와 같이 별도의 내부 패키지로 분리하여 다른 앱에서 `pnpm` 참조로 가져가는 것이 좋습니다.

## 2. 빌드 파이프라인 (Turborepo)
`turbo.json`에서 PDF 관련 빌드 태스크를 정의합니다.

*   **캐싱 설정**: PDF.js는 빌드 시간이 길기 때문에 결과물을 캐싱하는 것이 필수입니다.
*   **태스크 정의**:
    ```json
    {
      "pipeline": {
        "build": {
          "outputs": ["dist/**", ".next/**", "public/pdf.worker.min.mjs"],
          "dependsOn": ["^build"]
        }
      }
    }
    ```
*   **Worker 복사**: 빌드 시점에 `pdf.worker.min.mjs` 파일을 각 앱의 `public` 폴더로 자동 복사하는 스크립트를 `turbo` 실행 과정에 포함시킵니다.

## 3. 번들링 전략 (Rollup)
라이브러리 형태로 빌드할 때 `rollup.config.js` 설정 가이드입니다.

### 1) External 처리
PDF.js는 용량이 크기 때문에 라이브러리 번들에 직접 포함시키기보다는 사용처에서 설치하도록 `external`로 처리하는 것이 권장됩니다.
```javascript
export default {
  input: 'src/index.ts',
  external: ['pdfjs-dist'], // 번들에 포함시키지 않음
  plugins: [
    // ... resolve, commonjs 등
  ]
};
```

### 2) Worker Entry 분리
Worker 파일은 메인 스레드와 별도로 돌아가야 하므로, Rollup 빌드 시 별도의 엔트리 포인트로 지정하거나 `copy` 플러그인을 사용해 정적 파일로 내보냅니다.
```javascript
import copy from 'rollup-plugin-copy';

export default {
  plugins: [
    copy({
      targets: [
        { src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs', dest: 'dist' }
      ]
    })
  ]
};
```

## 4. 통합 위치 (어디에 들어가야 하나?)

| 단계 | 역할 | 수행 도구 |
| :--- | :--- | :--- |
| **Dependency** | `pdfjs-dist` 설치 및 버전 관리 | `pnpm` |
| **Source Logic** | `usePDFViewer`, `PDFCanvas` 등 구현 | `React` / `TypeScript` |
| **Bundling** | 메인 로직과 워커 분리, Tree-shaking | `Rollup` |
| **Orchestration** | 전체 빌드 순서 조율 및 결과물 캐싱 | `Turborepo` |
| **Asset Deployment** | 워커 파일을 `public`에 배치하여 런타임 로드 보장 | `Build Script` |

## 5. 추가 응용 (Advanced)
*   **Lazy Loading**: 사용자가 PDF를 보기 전까지는 PDF.js 모듈을 로드하지 않도록 `import()` 동적 로딩을 활용합니다.
*   **CDN 활용**: 빌드 결과물 크기를 줄이기 위해 워커 파일만 외부 CDN(예: unpkg)에서 불러오도록 설정할 수도 있습니다.
