# 🎨 Real-time Design System Extractor

URL 하나로 웹사이트의 디자인 시스템(색상, 폰트, CSS 변수, 스크린샷)을 **실시간**으로 추출하고 시각화하는 도구입니다. Vercel Serverless Functions와 Next.js를 기반으로 구축되었습니다.

---

## 🚀 주요 기능 (Features)
- **실시간 분석**: 대시보드에서 URL 입력 즉시 분석 시작 및 결과 출력.
- **서버리스 자동화**: Vercel의 서버리스 인프라를 활용하여 별도의 서버 관리 없이 운영.
- **자동 캡처**: 대상 사이트의 스크린샷을 Base64 형태로 즉시 생성.
- **디자인 토큰 추출**: 실시간 DOM 분석을 통한 색상, 폰트, CSS 변수 수집.
- **최신 웹 대응**: 레이지 로딩 대응을 위한 자동 스크롤 및 브라우저 위장 로직 탑재.

---

## 📅 업데이트 기록 (Version History)

### **v2.0.0 (Latest)** - *실시간 분석 시스템으로의 대전환*
- **아키텍처 변경**: GitHub Actions(배치 처리) 방식에서 **Vercel + Next.js API Routes(실시간)** 방식으로 전면 개편.
- **서버리스 브라우저 최적화**: `@sparticuz/chromium`을 도입하여 Vercel Serverless 환경에서 Puppeteer 구동 성공.
- **UX 혁신**: `url.txt` 수정 방식에서 벗어나 웹 화면에서 직접 입력하고 결과를 즉시 확인하는 구조로 변경.

### **v1.2.0** - *GitHub Actions 안정화*
- 복잡한 사이트 대응(자동 스크롤, User-Agent 위장) 및 Node.js 24 업그레이드.

### **v1.1.0** - *워크플로우 개선*
- `url.txt` 직접 편집 링크 도입을 통한 사용자 번거로움 해소.

---

## 💡 프롬프트 및 응답 개선 요약 (Prompt & Response Optimization)

1.  **실시간성 확보 (Batch to Real-time)**: 
    - "1~2분의 대기 시간조차 없애고 싶다"는 요구사항에 맞춰, 서버리스 API 응답 구조로 전환하여 수 초 내에 결과를 보여주는 방식으로 진화.
2.  **서버리스 제약 극복 (Chromium Optimization)**: 
    - 일반적인 Puppeteer는 용량 문제로 Vercel 배포가 불가능하지만, 경량화된 Chromium 바이너리를 사용하여 제약을 해결하는 전문적인 아키텍처 제시.
3.  **에러 핸들링 고도화 (Syntax Error Resolution)**: 
    - 코드 잘림 등으로 발생할 수 있는 구문 오류를 방지하기 위해 정형화된 Next.js API 응답 패턴(try-catch-finally)을 엄격히 적용.

---

## 🛠️ 설치 및 사용법 (Setup & Usage)

1.  이 저장소를 **Fork** 합니다.
2.  **Vercel** 사이트에 접속하여 해당 저장소를 연동(Import)합니다.
3.  별도의 설정 없이 **Deploy** 버튼을 누릅니다.
4.  배포 완료된 주소로 접속하여 URL을 입력하고 **"지금 분석하기"**를 누릅니다.

---

## 📝 상세 기술 문서
- [기술적 문제 해결 기록 (docs/issues.md)](docs/issues.md)
