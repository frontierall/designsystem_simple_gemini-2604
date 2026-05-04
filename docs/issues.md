# 기술적 문제 해결 기록 (Technical Issues & Solutions)

이 프로젝트를 개발하면서 발생한 주요 문제들과 그에 대한 해결책을 정리한 문서입니다.

---

## 1. 정적 호스팅의 한계와 서버리스 아키텍처 (v1.x)
- **문제**: GitHub Pages는 Node.js 실행 불가.
- **해결**: GitHub Actions를 가상 서버로 활용하여 분석 결과를 `data/` 폴더에 커밋하는 방식 적용.

## 2. 실시간 분석을 위한 아키텍처 대전환 (v2.x)
- **문제**: 사용자가 URL 수정 후 반영될 때까지 약 1~2분 대기해야 함. 즉각적인 피드백 부족.
- **해결**: **Next.js API Routes**로 전환하여 실시간 응답 구조 구축. 분석 요청 즉시 서버리스 함수가 실행되도록 개편.

## 3. Vercel Serverless 환경에서의 Puppeteer 구동 (Critical)
- **문제**: Vercel의 서버리스 함수는 용량 제한(50MB)이 있어, 약 100MB가 넘는 일반 Chromium/Puppeteer를 배포할 수 없음.
- **해결**: 
  - `@sparticuz/chromium`: 압축된 경량 브라우저 바이너리 사용.
  - `puppeteer-core`: 브라우저 본체 없이 제어 로직만 포함된 라이브러리 사용.
  - `executablePath`: 실행 시점에 `chromium`의 경로를 동적으로 할당하여 용량 제약 극복.

## 4. 코드 누락으로 인한 Syntax Error 해결
- **문제**: 배포 중 `ails: error.message`와 같은 구문 오류 발생. 코드가 전송/복사 과정에서 잘려 나가 `details` 속성이 오염된 현상.
- **해결**: Next.js의 표준 `NextResponse.json()` 구조를 엄격히 준수하도록 수정하고, `catch` 블록의 에러 핸들링 로직을 완결성 있게 재작성함.

## 5. 실행 시간 초과 (Timeout) 대응
- **문제**: 고도화된 사이트 분석 시 Vercel 기본 타임아웃(10초)을 초과함.
- **해결**: `export const maxDuration = 60;` 설정을 통해 실행 가능 시간을 늘려 복잡한 페이지도 끝까지 분석하도록 조치.

---
## 💡 교안 활용 포인트
- **서버리스의 특성 이해**: 왜 일반적인 설치 방식이 서버리스 환경에서 통하지 않는지 설명 가능.
- **아키텍처의 트레이드오프**: 비용/관리(GitHub Actions) vs 속도/경험(Vercel)의 차이를 비교 학습 가능.
