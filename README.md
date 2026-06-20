# 기업정보 리서치팀 — `corp-research` 플러그인

기업명을 입력받아 **OpenDART 공시 데이터**와 **웹 검색**을 병렬로 수집하고,
**분석 레포트(MD)·HTML 대시보드·PPT 슬라이드**를 자동 생성하는 Claude Code 플러그인.

투자 검토·사업 제휴·경쟁사 분석 등 의사결정 참고용 단일 기업 심층 분석을 자동화함.

---

## 주요 기능

- **단일 명령 심층 분석**: `/corp-research:research 삼성전자` 한 번으로 5단계 워크플로우(입력→확인→병렬수집→산출물→보고) 수행
- **멀티 에이전트 분업**: 재무·시장 데이터를 전담 서브에이전트가 병렬 수집 후, 결과물 작성 에이전트가 통합
- **3종 산출물 동시 생성**
  - 마크다운 레포트 — 기업개요·재무·주주/임원·공시·시장·뉴스·SWOT 종합
  - HTML 대시보드 — Chart.js 기반 재무추이 Bar·주주구성 Doughnut·SWOT 카드 (단일 파일)
  - PPT 슬라이드 — `pptxgenjs` 기반 4장 (표지·재무·시장·SWOT)
- **출처 기반 신뢰성** — 재무수치는 DART 공시 출처 병기, 웹 정보는 URL·날짜 병기

---

## 구성 요소

| 유형 | 이름 | 네임스페이스 호출 | 역할 |
|------|------|------------------|------|
| 스킬 | `research` | `/corp-research:research` | 오케스트레이션·5단계 워크플로우 |
| 에이전트 | `dart-analyst` | `corp-research:dart-analyst` | OpenDART 재무·주주·임원·공시 수집 |
| 에이전트 | `market-researcher` | `corp-research:market-researcher` | 웹 검색 기반 시장·경쟁·뉴스 수집 |
| 에이전트 | `report-writer` | `corp-research:report-writer` | 레포트·HTML·PPT 산출물 생성 |
| 참조 | `references/pptx-guide.md` | — | PPT 디자인 스타일 가이드(에이전트가 참조) |

> 스킬은 설치 시 자동으로 `/corp-research:research` 슬래시 명령으로 등록되며, 자연어(`기업 리서치 해줘` 등)로도
> 모델이 자동 호출함. 에이전트 3종도 플러그인 네임스페이스로 독립 호출 가능.

---

## 사전 요구사항

플러그인 자체는 스킬·에이전트·참조 가이드만 패키징함. 아래 런타임 의존성은 **사용자 환경에 별도 준비**가 필요함.

| 의존성 | 용도 | 준비 방법 |
|--------|------|----------|
| **OpenDART MCP** | `dart-analyst`의 재무·공시 수집 | 사용자 환경에 OpenDART MCP 서버 연결 (아래 "알려진 제약" 참조) |
| **Node.js + `pptxgenjs`** | `report-writer`의 PPT 빌드(`node build.js`) | 작업 프로젝트에서 `npm install pptxgenjs` (또는 `npm install -g pptxgenjs`) |
| **인터넷 접속** | `market-researcher`의 WebSearch/WebFetch | Claude Code 기본 환경 |

---

## 설치

### 1. 마켓플레이스 추가

```bash
# GitHub 리포지토리 기준 (배포본)
claude plugin marketplace add unicorn-campus/corp-research

# 대화형 세션 내에서
/plugin marketplace add unicorn-campus/corp-research
```

> 로컬 개발/테스트 시: 리포지토리 루트에서 `claude plugin marketplace add .`
> 또는 설치 없이 일회성 로드: `claude --plugin-dir .`

### 2. 플러그인 설치

```bash
claude plugin install corp-research@unicorn-campus

# 팀 공유(프로젝트 스코프, .claude/settings.json에 기록)
claude plugin install corp-research@unicorn-campus --scope project
```

설치 스코프: `user`(기본·전체 프로젝트) / `project`(팀 공유) / `local`(gitignore 대상).

### 3. 사용

```text
/corp-research:research 삼성전자
```

또는 자연어로 `엔비디아 기업 리서치 해줘` 입력 시 모델이 `research` 스킬을 자동 호출함.

---

## 조회

```bash
claude plugin list                                   # 설치된 플러그인 + 버전·상태
claude plugin list --json                            # JSON 출력
claude plugin details corp-research@unicorn-campus    # 컴포넌트 인벤토리·세션 토큰 비용
claude plugin marketplace list                       # 등록된 마켓플레이스 목록

# 대화형
/plugin                                              # Discover·설치·관리 UI
/plugin list                                         # 인라인 목록
```

---

## 업그레이드

```bash
claude plugin marketplace update unicorn-campus       # 1) 마켓플레이스 카탈로그 갱신
claude plugin update corp-research@unicorn-campus      # 2) 플러그인 업데이트
```

> **버전 정책**: `plugin.json`에 `version: "1.0.0"`이 명시되어 있어, 사용자는 이 버전이 **상향될 때만** 업데이트를 받음.
> 따라서 배포자는 변경 릴리스 시 `plugin.json`의 `version`을 반드시 올린 뒤 push해야 함(semver 권장).
> 빠른 반복 개발 중이라면 `version`을 제거하여 커밋 SHA 기반 자동 갱신으로 운영 가능.

---

## 삭제

```bash
claude plugin uninstall corp-research@unicorn-campus   # 플러그인 제거
claude plugin marketplace remove unicorn-campus         # 마켓플레이스 제거(연결된 플러그인도 함께 제거됨)
```

비활성화/재활성화(삭제 없이 일시 중지):

```bash
claude plugin disable corp-research@unicorn-campus
claude plugin enable corp-research@unicorn-campus
```

---

## 디렉토리 구조

```text
corp-research/                     # 리포 루트 = 마켓플레이스 루트 = 플러그인 루트
├── .claude-plugin/
│   ├── marketplace.json           # 마켓플레이스 카탈로그 (name: unicorn-campus)
│   └── plugin.json                # 플러그인 매니페스트 (name: corp-research)
├── skills/
│   └── research/
│       └── SKILL.md               # research 스킬 (Phase 1~5 워크플로우)
├── agents/
│   ├── dart-analyst.md            # OpenDART 수집 에이전트
│   ├── market-researcher.md       # 웹 검색 에이전트
│   └── report-writer.md           # 산출물 생성 에이전트
├── references/
│   └── pptx-guide.md              # PPT 스타일 가이드 (에이전트가 ${CLAUDE_PLUGIN_ROOT} 기준 참조)
├── reports/                       # 분석 산출물 출력 위치 (예: reports/ICTK)
└── README.md
```

> 스킬·에이전트 본문의 플러그인 내부 파일 참조는 모두 `${CLAUDE_PLUGIN_ROOT}/...` 변수를 사용함.
> 설치 시 플러그인이 캐시로 복사되어도 경로가 안전하게 해석됨.

---

## 알려진 제약

- **OpenDART MCP 환경 의존성**: `dart-analyst` 에이전트의 `tools` 목록에는 현재 **이 환경 고유의 OpenDART MCP
  서버 식별자**가 명시되어 있음. 다른 사용자가 설치할 경우, 동일한 OpenDART MCP를 연결해야 하며 서버 식별자가
  다르면 에이전트의 도구 화이트리스트와 불일치하여 재무 수집이 동작하지 않을 수 있음.
  - 현재는 "최소 패키징" 방침에 따른 의도적 범위임.
  - 완전 자립형이 필요하면 향후 `.mcp.json`으로 OpenDART MCP를 동봉하고 `userConfig`로 API 키를 입력받는
    방식으로 확장 가능(서버 실행 방식·키 발급 정보 필요).
- **산출물 출력 경로**: 레포트·대시보드·PPT는 플러그인 디렉토리가 아닌 **현재 작업 디렉토리 기준 `reports/{기업명}/`**
  에 생성됨.
- **PPT 런타임**: `report-writer`가 생성하는 `build.js`는 `pptxgenjs`를 `require`함. 실행 환경(작업 프로젝트)에
  `pptxgenjs`가 설치되어 있어야 PPT가 정상 빌드됨.

---

## 라이선스

ISC · © unicorn-campus / corp-research팀
