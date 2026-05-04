# 기술적 문제 해결 기록 (Technical Issues & Solutions)

이 프로젝트를 개발하면서 발생한 주요 문제들과 그에 대한 해결책을 정리한 문서입니다. 교육 및 추후 유지보수를 위해 작성되었습니다.

---

## 1. 정적 호스팅의 한계와 서버리스 아키텍처 (GitHub Pages vs. Actions)

### **문제점 (Challenge)**
- GitHub Pages는 정적(Static) 파일만 호스팅할 수 있어, Node.js나 Puppeteer 같은 서버 사이드 스크립트를 직접 실행할 수 없음.
- 브라우저의 CORS 보안 정책으로 인해 클라이언트 JS만으로는 다른 사이트의 상세 정보를 가져오는 것이 불가능함.

### **해결책 (Solution)**
- **GitHub Actions를 Backend로 활용**: 사용자가 `url.txt`를 수정하면 GitHub Actions(가상 서버)가 구동되어 Puppeteer를 실행하는 방식 채택.
- **Data-as-a-Service**: 분석 결과를 저장소 내 `data/` 폴더에 커밋하여, 프론트엔드(`index.html`)가 이를 데이터베이스처럼 읽어오도록 설계함.

---

## 2. 사용자 트리거 방식의 진화 (GitHub Issues vs. Direct Edit)

### **문제점 (Challenge)**
- 처음에는 사용자가 웹 UI에서 입력하고 분석을 시작하게 하려 했으나, 저장소 제어 권한(Token)을 정적 페이지에 노출할 수 없는 보안 문제가 발생함.

### **해결책 (Solution)**
- **GitHub Issues 활용 (1안)**: 권한이 필요 없는 Issue 생성 기능을 트리거로 사용하려 했으나, 매번 Issue를 생성해야 하는 사용자 번거로움이 큼.
- **직접 편집 링크 제공 (최종안)**: `index.html`에서 GitHub의 `url.txt` 편집 화면으로 바로 이동하는 버튼을 배치. 사용자는 GitHub의 자체 보안 환경에서 안전하게 URL을 수정하고, 저장 즉시 Actions가 트리거되는 가장 직관적인 워크플로우를 구축함.

---

## 3. GitHub 환경 변화에 따른 Node.js 버전 관리

### **문제점 (Challenge)**
- GitHub Actions 실행 중 "Node.js 20 사용 중단(Deprecation)" 경고 발생. 2026년 이후에는 워크플로우가 중단될 위험이 있었음.

### **해결책 (Solution)**
- `.github/workflows/extract.yml`의 `node-version`을 `24`로 업그레이드.
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` 환경 변수를 추가하여 미래의 런너 환경 변화에도 선제적으로 대응함.

---

## 4. 고도화된 사이트 분석의 어려움 (Case: toss.im)

### **문제점 (Challenge)**
- 토스(`toss.im`)와 같은 최신 사이트들은 봇 차단, 레이지 로딩(Lazy Loading), 복잡한 애니메이션을 사용하여 단순한 접근으로는 데이터 추출이 실패함.

### **해결책 (Solution)**
- **브라우저 위장**: 실제 사용자의 브라우저인 것처럼 `User-Agent`를 설정하여 봇 감지 우회.
- **자동 스크롤 (Auto Scroll)**: 분석 전 페이지를 하단까지 자동으로 스크롤하여 레이지 로딩된 콘텐츠를 모두 활성화함.
- **네트워크 안정화 대기**: `networkidle0` 옵션을 사용하여 모든 리소스(이미지, 스크립트 등)가 완전히 로드된 후 분석을 시작하도록 타임아웃을 90초로 연장함.
- **보안 완화**: `--disable-web-security` 옵션을 통해 크로스 도메인에 있는 CSS 변수 데이터 수집율을 높임.

---

## 5. 브라우저 캐시로 인한 결과 반영 지연

### **문제점 (Challenge)**
- 서버에서 데이터가 바뀌어도 사용자의 브라우저가 이전 스크린샷이나 JSON을 계속 보여주는 현상 발생.

### **해결책 (Solution)**
- 사용자 가이드에 `Ctrl + F5` (강력 새로고침) 안내 문구 추가.
- (향후 개선) 파일명에 타임스탬프를 붙이거나 쿼리 스트링(`data.json?v=123`)을 추가하여 캐시 버스팅(Cache Busting) 기법 적용 고려 중.
