# pdf.js ESM → iife 번들링 전환 정리

## 배경

- `pdfjs-dist` v4+ 부터 UMD/IIFE 공식 빌드 제공 안 함 (ESM only)
- pdf.js 레포 gulpfile에서도 UMD 타겟 제거됨
- 기존 external + globals 패턴 유지하면서 최신 버전 사용하려면 Rollup으로 ESM → iife 변환 필요

## 핵심 개념

Rollup 본연의 기능으로 ESM 파일을 읽어서 iife 포맷으로 변환 가능.  
iife 번들은 브라우저 script 태그로 로드 시 `window.pdfjsLib` 전역변수로 노출됨.

```
var pdfjsLib = (function(exports) {
  ...
  exports.getDocument = ...
  return exports;
})({});
```

## 작업 내용

| 단계 | 작업 | 비고 |
|------|------|------|
| ① 파일 배치 | 외부 레포 ESM 파일 → `libs/pdfjs/esm/` | 기존 방식대로 |
| ② rollup.config.js 추가 | `libs/pdfjs/rollup.config.js` 생성 | esm/ → dist/ iife 변환 |
| ③ package.json 수정 | `"build": "rollup -c"` 추가 | Turborepo가 자동 인식 |
| ④ turbo.json 확인 | `"dependsOn": ["^build"]` 있는지 확인 | 있으면 그대로 |
| ⑤ 각 앱 | external + globals 그대로 유지 | 변경 없음 |
| ⑥ v5output | dist/ 파일 해시 붙여서 등록 | 기존과 동일 |

**추가/변경 파일은 딱 2개**
- `libs/pdfjs/rollup.config.js` 신규 생성
- `libs/pdfjs/package.json` build 스크립트 추가

## 디렉토리 구조

```
libs/pdfjs/
  esm/
    pdf.mjs          ← 외부 레포 ESM 파일 배치
    pdf.worker.mjs
  dist/
    pdfjs.js         ← Rollup iife 결과물 (window.pdfjsLib)
    pdf.worker.js    ← Rollup iife 결과물 (window.pdfjsWorker)
  rollup.config.js   ← 신규 추가
  package.json       ← build 스크립트 추가
```

## 빌드 흐름

```
외부 레포 ESM 파일
  → libs/pdfjs/esm/ 배치
       ↓ Rollup (rollup -c)
  libs/pdfjs/dist/pdfjs.js  (iife)
       ↓ Turborepo 빌드
  v5output/ 해시 붙여서 등록 + versionMap 업데이트
```

## 파일 내용

### libs/pdfjs/rollup.config.js

```js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'esm/pdf.mjs',
    output: {
      file: 'dist/pdfjs.js',
      format: 'iife',
      name: 'pdfjsLib'  // window.pdfjsLib
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'esm/pdf.worker.mjs',
    output: {
      file: 'dist/pdf.worker.js',
      format: 'iife',
      name: 'pdfjsWorker'  // window.pdfjsWorker
    },
    plugins: [resolve(), commonjs()]
  }
]
```

### libs/pdfjs/package.json

```json
{
  "name": "@myorg/pdfjs",
  "scripts": {
    "build": "rollup -c"
  }
}
```

### turbo.json 확인

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

`"^build"` 있으면 libs/pdfjs 가 각 앱보다 먼저 빌드됨. 별도 수정 불필요.

## 각 앱 변경 사항

없음. 기존 external + globals 패턴 그대로 유지.

```js
// 각 앱 rollup.config.js — 변경 없음
external: ['pdfjs-dist'],
globals: {
  'pdfjs-dist': 'pdfjsLib'
}
```

## 기존 방식과 비교

| | 기존 | 변경 후 |
|---|---|---|
| 소스 | UMD 빌드 파일 (v3.11.174 고정) | ESM 파일 (최신 버전) |
| 번들링 | 없음 (파일 그대로 사용) | Rollup이 iife로 변환 |
| 전역변수 | `window.pdfjsLib` | `window.pdfjsLib` (동일) |
| script 태그 | CDN 또는 UMD 파일 직접 | libs/dist 번들 파일 |
| 각 앱 코드 | external + globals | external + globals (동일) |
| 버전 업데이트 | UMD 빌드 없으면 불가 | ESM 파일 교체만 하면 됨 |

## 버전 업데이트 방법

1. 외부 레포에서 새 ESM 빌드 결과물 가져오기
2. `libs/pdfjs/esm/` 파일 교체
3. Turborepo 빌드 실행

## 검증 결과

실제 테스트에서 `pdfjs-dist@6.0.227` ESM 파일을 Rollup으로 iife 번들링 확인.

- iife 포맷 정상 생성 ✅
- `window.pdfjsLib` 전역변수 노출 ✅
- `getDocument` 등 API export 포함 ✅
- 번들 사이즈: 871KB ✅
