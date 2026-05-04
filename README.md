# 🎨 Design System Extractor v1 (GitHub Actions)

이 버전은 **GitHub Actions**와 **배치 처리(Batch Processing)** 방식을 사용하는 안정적인 디자인 시스템 추출 도구입니다.

### 🛠️ 핵심 기능
1. **GitHub Actions 기반 분석**: `url.txt` 파일의 주소가 변경되면 GitHub 서버가 자동으로 분석을 시작합니다.
2. **정적 데이터 보관**: 모든 분석 결과(스크린샷, JSON)가 `data/` 폴더에 커밋되어 히스토리가 남습니다.
3. **배포 방식**: GitHub Pages를 통해 `index.html`을 정적 대시보드로 사용합니다.

### 📂 주요 파일
- `extractor.js`: Puppeteer 기반 분석 엔진 (Node.js CLI)
- `index.html`: 분석 결과를 보여주는 정적 웹뷰어
- `url.txt`: 분석 대상 사이트 주소 설정 파일
- `.github/workflows/extract.yml`: 자동화 워크플로우 설정

---

## 🚀 사용 순서
1. `url.txt`를 수정하고 커밋/푸시합니다.
2. GitHub의 **Actions** 탭에서 분석이 완료될 때까지 기다립니다 (약 1-2분).
3. 배포된 GitHub Pages 주소에서 결과를 확인합니다.
