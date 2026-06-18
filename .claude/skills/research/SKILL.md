---
name: research
description: 기업명을 입력받아 OpenDART 공시 데이터·웹 검색을 병렬로 수집하고, 기업 분析 레포트·HTML 대시보드·PPT 슬라이드를 생성하는 단일 기업 심층 분析 스킬
triggers:
  - research
  - 기업리서치
  - 기업 리서치
  - 기업조사
  - 기업 조사
  - 리서치
argument-hint: "[기업명]"
---

# Research — 단일 기업 심층 분析 스킬

## 팀 역할 분담

| 역할 | 닉네임 | 담당 Phase | 에이전트 파일 |
|------|--------|------------|-------------|
| 오케스트레이터 | 클로니 | Phase 1·2·5 (기획·조율·통합) | 메인 (직접 수행) |
| 재무 分析가 | 다트 | Phase 3-A (OpenDART 공시 데이터 수집) | `.claude/agents/dart-analyst.md` |
| 시장 조사원 | 서치 | Phase 3-B (WebSearch 시장·경쟁·뉴스 수집) | `.claude/agents/market-researcher.md` |
| 결과물 작성가 | 라이터 | Phase 4 (레포트·HTML·PPT 생성) | `.claude/agents/report-writer.md` |

> **에이전트 호출 방식**: 각 서브에이전트 호출 시 `.claude/agents/{agent-name}.md` 파일을 읽어  
> 해당 파일의 시스템 프롬프트(frontmatter 이후 내용)를 Agent 도구의 프롬프트에 포함하여 호출.

---

## Phase 1. 입력 수집 `[클로니 — 직접 수행]`

AskUserQuestion 도구로 아래 정보를 수집:

**필수**
- `{기업명}`: 분析할 기업명

**선택** (미입력 시 기본값 적용)
- `{활용목적}`: 분析 목적 (예: 투자검토, 경쟁사분析, 사업제휴) → 기본값: "일반조사"
- `{검색기간}`: 웹 서치 범위 → 기본값: "최근 2년"

---

## Phase 2. 기업 확인 및 아젠다 수립 `[클로니 — 직접 수행]`

### 2-1. 기업 확인

`opendart-find_company` 도구로 `{기업명}` 검색하여 `{corp_code}` 확보:

- 검색 성공 → `opendart-get_company_info`로 기본 정보 확인 후 Phase 2-2 진행
- 검색 실패 → 사용자에게 유사 기업명 제시 또는 재입력 요청

### 2-2. 아젠다 초안 생성 및 승인

아래 기본 아젠다를 표 형식으로 사용자에게 제시:

| 순서 | 섹션 | 담당 팀원 | 데이터 소스 |
|------|------|----------|------------|
| 1 | 기업 개요 | 다트 | OpenDART |
| 2 | 재무 分析 | 다트 | OpenDART |
| 3 | 주주·임원 현황 | 다트 | OpenDART |
| 4 | 최근 공시 동향 | 다트 | OpenDART |
| 5 | 시장 포지션·경쟁 환경 | 서치 | WebSearch |
| 6 | 최신 뉴스·이슈 | 서치 | WebSearch |
| 7 | 종합 평가 (SWOT) | 클로니 | 종합 |

사용자 응답 처리:
- 섹션 추가·삭제·순서 변경 요청 시 → 아젠다 수정 후 재제시
- 승인("승인", "진행", "OK") 시 → Phase 3 진행

---

## Phase 3. 병렬 데이터 수집 `[다트 + 서치 — 단일 응답에서 동시 Agent 호출]`

> **핵심 규칙**: Phase 3-A와 Phase 3-B의 Agent 호출을 **단일 응답에서 동시에** 실행.

### Agent 호출 준비

먼저 두 에이전트 파일을 읽어 시스템 프롬프트 확보:
- `Read .claude/agents/dart-analyst.md` → `{dart_system_prompt}` (frontmatter `---` 이후 전체)
- `Read .claude/agents/market-researcher.md` → `{search_system_prompt}` (frontmatter `---` 이후 전체)

### Phase 3-A. OpenDART 데이터 수집 `[다트 서브에이전트]`

Agent 도구 호출 (단일 응답에서 3-B와 동시 실행):

```
prompt: |
  {dart_system_prompt의 전체 내용}

  ---
  [현재 작업]

  [목표]
  {기업명}({corp_code})의 OpenDART 공시 데이터를 수집하여 구조화된 마크다운으로 반환

  [입력정보]
  - 기업명: {기업명}
  - corp_code: {corp_code}
  - 아젠다 섹션: {승인된 아젠다 중 OpenDART 담당 섹션 목록}
```

반환값 → `{dart_data}` 변수에 저장

### Phase 3-B. 웹 검색 수집 `[서치 서브에이전트]`

Agent 도구 호출 (단일 응답에서 3-A와 동시 실행):

```
prompt: |
  {search_system_prompt의 전체 내용}

  ---
  [현재 작업]

  [목표]
  {기업명}의 시장 포지션·경쟁 환경·최신 뉴스를 웹 검색으로 수집하여 구조화된 마크다운으로 반환

  [입력정보]
  - 기업명: {기업명}
  - 검색기간: {검색기간}
  - 아젠다 섹션: {승인된 아젠다 중 WebSearch 담당 섹션 목록}
```

반환값 → `{search_data}` 변수에 저장

---

## Phase 4. 결과물 생성 `[라이터 서브에이전트]`

먼저 에이전트 파일 읽기:
- `Read .claude/agents/report-writer.md` → `{writer_system_prompt}` (frontmatter `---` 이후 전체)

Phase 3 완료 후 Agent 도구로 report-writer 호출:

```
prompt: |
  {writer_system_prompt의 전체 내용}

  ---
  [현재 작업]

  [목표]
  {기업명} 기업 분析 결과물 3종 생성:
  마크다운 레포트, Chart.js HTML 대시보드, pptxgenjs PPT 슬라이드

  [입력정보]
  - 기업명: {기업명}
  - 활용목적: {활용목적}
  - 검색기간: {검색기간}
  - 조사일: {조사일 — 오늘 날짜}
  - OUTPUT_DIR: reports/{기업명}/

  <dart_data>
  {dart_data — Phase 3-A에서 반환된 전체 마크다운 텍스트}
  </dart_data>

  <search_data>
  {search_data — Phase 3-B에서 반환된 전체 마크다운 텍스트}
  </search_data>
```

---

## Phase 5. 완료 보고 `[클로니 — 직접 수행]`

report-writer 에이전트 반환값 확인 후 사용자에게 보고:

```
[分析 완료]

■ 기업명: {기업명}
■ 활용목적: {활용목적}

■ 생성된 산출물
  - 레포트 (MD)      : reports/{기업명}/{기업명}-report.md
  - HTML 대시보드    : reports/{기업명}/{기업명}-dashboard.html
  - PPT 슬라이드     : reports/{기업명}/{기업명}-report.pptx

■ 데이터 기준
  - OpenDART: DART 전자공시 (조회일 기준 최신 공시)
  - WebSearch: {검색기간} 내 수집

브라우저에서 HTML 파일을 열어 재무 차트와 SWOT 요약을 확인하세요.
```

---

## 입력 정보

| 항목 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| 기업명 | 필수 | — | OpenDART 검색 가능한 기업명 |
| 활용목적 | 선택 | 일반조사 | 투자검토·경쟁사分析·사업제휴 등 |
| 검색기간 | 선택 | 최근 2년 | WebSearch 수집 범위 |

---

## 출력

| 산출물 | 경로 |
|--------|------|
| 기업 分析 레포트 (MD) | `reports/{기업명}/{기업명}-report.md` |
| HTML 대시보드 | `reports/{기업명}/{기업명}-dashboard.html` |
| PPT 슬라이드 | `reports/{기업명}/{기업명}-report.pptx` |

---

## 제약조건

### MUST
- Phase 3 Agent 호출 전 `.claude/agents/` 해당 파일을 Read하여 시스템 프롬프트 확보
- Phase 3-A(다트)와 Phase 3-B(서치)는 단일 응답에서 동시 실행
- dart-analyst 에이전트는 OpenDART MCP로 실제 데이터 조회 후 반환
- market-researcher 에이전트는 WebSearch 결과에 출처 URL 반드시 병기
- HTML 파일은 Chart.js CDN만 사용하여 단일 파일로 완결
- PPT 생성은 `references/pptx-guide.md` 준수
- report-writer에 dart_data·search_data 전달 시 XML 태그(`<dart_data>`, `<search_data>`) 사용
- 아젠다 사용자 승인 전까지 Phase 3 시작 금지

### MUST NOT
- 메인 에이전트(클로니)가 Phase 3·4 작업 직접 수행 금지 (사용자 인터랙션 제외)
- MCP 조회 없이 기억·추론만으로 재무 수치 작성 금지
- 출처 불명확한 수치 단독 사용 금지
- `anthropic-skills:pptx` 등 외부 변환 스킬 사용 금지

### 완료조건
- [ ] dart-analyst 에이전트가 OpenDART 데이터를 반환함 (응답 텍스트 존재)
- [ ] market-researcher 에이전트가 웹 검색 데이터를 반환함 (응답 텍스트 존재)
- [ ] `reports/{기업명}/{기업명}-report.md` 파일 생성 확인
- [ ] `reports/{기업명}/{기업명}-dashboard.html` 파일 생성 및 Chart.js 포함 확인
- [ ] `reports/{기업명}/{기업명}-report.pptx` 파일 생성 및 0바이트 초과 확인
