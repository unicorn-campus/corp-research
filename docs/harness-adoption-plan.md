# 하네스 적용 계획 — corp-research 기업정보 리서치

**수립일**: 2026-06-18  
**작성**: 오케스트레이터 클로니 (harness 메타스킬 Phase 0 감사 기반)  
**상태**: 계획 확정, **실행 대기** (파일 변경 미수행 — 다음 지시 시점에 P0부터 실행)

---

## 1. 개요

### 목적
기존 corp-research 하네스(에이전트 3종 + research 스킬)를 harness 메타스킬 표준에 정합시키기 위한 단계별 적용 계획.

### 확정된 결정 사항
| 결정 항목 | 선택 | 비고 |
|----------|------|------|
| 모델 정책 | **하이브리드** | report-writer만 `opus`, dart·search는 `sonnet-4-6` 유지 (품질·비용 균형) |
| 실행 범위 | **계획만 확정** | 본 문서로 확정, 실제 파일 변경은 후속 지시 시 P0부터 수행 |

---

## 2. 감사 결과 (Phase 0)

### 현재 구성 (정상)
| 구성요소 | 파일 | 상태 |
|---------|------|------|
| 에이전트 | `.claude/agents/dart-analyst.md` · `market-researcher.md` · `report-writer.md` | frontmatter·tools 스코핑 완비 |
| 오케스트레이터 스킬 | `.claude/skills/research/SKILL.md` | Phase 1~5 워크플로우·역할분담 완비 |
| 참조 | `references/{pptx,xlsx,prompt}-guide.md` | 정상 |
| 실행 증거 | `reports/ICTK/` (report.md·dashboard.html·report.pptx·build.js·index.html) | 1회 end-to-end 완주 확인 |

### 실행 모드 평가
서브에이전트 fan-out (Phase 3 다트·서치 병렬 → Phase 4 라이터 순차).  
다트·서치가 상호 통신 없이 독립 수집하므로 팀 모드 불필요 — **현 선택이 도메인에 적합**, 유지.

---

## 3. Gap 분석 (하네스 표준 대비)

| # | 항목 | 현재 | 표준 | 우선 |
|---|------|------|------|:---:|
| G1 | 에이전트 호출 경로 | `.md` 수동 Read → 프롬프트 임베딩 | `subagent_type` 네이티브 호출 | P0 |
| G2 | 모델 정책 | 전부 `sonnet-4-6` | 하이브리드(확정) 반영 | P0 |
| G3 | CLAUDE.md 하네스 포인터 | 없음 | 트리거 규칙 + 변경이력 테이블 | P0 |
| G4 | 스킬 description 후속 키워드 | 없음 | 재실행·업데이트·갱신·보완 등 | P1 |
| G5 | 컨텍스트 확인 단계 | 없음 | 초기/후속/부분재실행 판별 | P1 |
| G6 | 데이터 전달 | 반환값(프롬프트 텍스트) | 대용량은 `_workspace/` 파일 기반 | P2 |
| G7 | 검증 단계 | 없음 | 수치-출처-차트 정합성 점검 | P2 |
| G8 | 보안 점검 차원 | 없음 (harness 표준에도 부재) | S1~S7 점검·강화 (별도 수행, 6절 참조) | P1 |

> **최대 리스크 (Advisor)**: G1에서 *네이티브 등록*과 *수동 임베딩*이 공존하면 호출 충돌·중복 실행.  
> 반드시 단일 경로(`subagent_type`)로 정리.

---

## 4. 적용 계획 (단계별·실행 가능 수준)

### P0 — 즉시 (정합성 핵심)

#### P0-1. G1: research 스킬 호출 경로 리팩토링
**대상**: `.claude/skills/research/SKILL.md` Phase 3·4

**변경 전** (Phase 3-A 예):
```
먼저 두 에이전트 파일을 읽어 시스템 프롬프트 확보:
- Read .claude/agents/dart-analyst.md → {dart_system_prompt}
Agent 도구 호출:
  prompt: |
    {dart_system_prompt의 전체 내용}
    ---
    [현재 작업] ...
```

**변경 후**:
```
Agent 도구 호출 (subagent_type 네이티브, Phase 3-B와 단일 응답 동시 실행):
  subagent_type: "dart-analyst"
  model: "sonnet"
  prompt: |
    [목표] {기업명}({corp_code})의 OpenDART 공시 데이터를 구조화 마크다운으로 반환
    [입력정보] 기업명·corp_code·아젠다 담당 섹션
```
- `Read .md → 임베딩` 단계 전부 제거 (역할·원칙은 에이전트 정의가 보유)
- Phase 3-B(market-researcher)·Phase 4(report-writer)도 동일 패턴으로 변환
- 메모 유지: 에이전트 `.md`를 세션 중 수정하면 해당 세션은 변경 미반영 — 다음 세션부터 적용  
  (현재 3종은 등록 완료 상태)

#### P0-2. G2: 하이브리드 모델 반영
| 에이전트 | frontmatter `model` | research 내 Agent 호출 `model` |
|---------|--------------------|------------------------------|
| dart-analyst | `claude-sonnet-4-6` (유지) | `"sonnet"` |
| market-researcher | `claude-sonnet-4-6` (유지) | `"sonnet"` |
| report-writer | **`claude-opus-4-8`** (변경) | **`"opus"`** |

#### P0-3. G3: AGENTS.md 하네스 포인터 신설
**대상**: `AGENTS.md` 하단에 아래 블록 추가
```markdown
## 하네스: 기업정보 리서치

**목표:** 단일 기업의 공시·시장 데이터를 병렬 수집하여 분석 레포트·HTML 대시보드·PPT 생성

**트리거:** 기업 리서치/조사/분석 요청 시 `research` 스킬 사용. 단순 질문은 직접 응답.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-18 | 하네스 적용 계획 수립 | 전체 | harness 표준 정합 |
```

---

### P1 — 단기 (후속 작업 지원)

#### P1-1. G4: research description 후속 키워드 확장
**대상**: `research/SKILL.md` frontmatter
- `description` 끝에 추가: "기존 분석의 재실행·업데이트·갱신·수정·보완·특정 섹션만 다시 요청 시 반드시 사용."
- `triggers`에 추가: `재실행`, `업데이트`, `갱신`, `보완`

#### P1-2. G5: 컨텍스트 확인 단계 추가
**대상**: `research/SKILL.md` 맨 앞에 Phase 0 신설
```
## Phase 0. 컨텍스트 확인 [클로니]
- reports/{기업명}/ 미존재 → 초기 실행 (Phase 1부터)
- 존재 + 특정 섹션 수정 요청 → 부분 재실행 (해당 에이전트만 재호출, 나머지 산출물 재사용)
- 존재 + 전체 갱신/새 입력 → 기존을 reports/{기업명}_prev/로 이동 후 전체 재실행
```
**대상**: 각 에이전트 `.md`에 "이전 산출물 존재 시 행동" 1줄 추가
- 예: "이전 결과 파일이 있으면 읽고 변경분만 반영, 피드백 지정 섹션만 수정"

---

### P2 — 개선 (선택)

| 항목 | 내용 | 대상 |
|------|------|------|
| G6 | `reports/{기업명}/_workspace/`에 `01_dart_data.md`·`02_search_data.md` 저장 → report-writer가 파일 읽기. 대용량 안정성·감사 추적 | research·report-writer |
| G7 | report-writer 완료조건에 "수치 출처 일관성·차트-데이터 일치 자가점검" 추가, 또는 별도 검증 에이전트(general-purpose) 도입 | report-writer / 신규 |
| 확장 | 다중기업 비교·배치 분석 모드 | research |

---

## 5. 실행 체크리스트 (다음 세션용)

- [ ] **P0-1** research Phase 3·4를 `subagent_type` 네이티브 호출로 리팩토링, 수동 임베딩 제거
- [ ] **P0-2** report-writer frontmatter `model: claude-opus-4-8`로 변경 (dart·search 유지)
- [ ] **P0-2** research 내 Agent 호출에 `model` 명시 (report-writer=opus, 나머지=sonnet)
- [ ] **P0-3** AGENTS.md에 하네스 포인터 + 변경이력 테이블 추가
- [ ] **P1-1** research description·triggers에 후속 키워드 추가
- [ ] **P1-2** research Phase 0 컨텍스트 확인 단계 + 에이전트 재호출 지침 추가
- [ ] **검증 1단계 (변경 세션)** 구조 검증(frontmatter·YAML 문법), description·triggers 문구 확인까지만 수행  
  ⚠️ *재실행 드라이런 금지* — 변경한 `agents`는 다음 세션부터 인식되므로 같은 세션의 실행 검증은 옛 경로로 깨져 오판 발생
- [ ] **검증 2단계 (신규 세션)** 새 세션에서 reports/ICTK 재실행 드라이런 → `subagent_type` 네이티브 호출·산출물 5종 정상 생성 확인
- [ ] **보안 S1·S2 (High)** report-writer에 기업명 화이트리스트 검증 + `build.js` 템플릿/데이터 분리(웹 데이터를 코드에 직접 삽입 금지)
- [ ] **보안 S3·S4 (Med)** 수집물 데이터-취급 원칙·Bash 사용 범위 제약 명문화
- [ ] **보안 S5·S6 (Low, 선택)** CDN SRI·버전핀, reports/ 개인정보 .gitignore 정책
- [ ] **기록** 변경 항목을 AGENTS.md 변경이력에 추가

---

## 6. 보안 점검 결과 및 강화 계획

> harness 표준 체크리스트에는 보안 점검 항목이 **없음**. 본 절은 corp-research 하네스에 대해  
> 별도로 수행한 보안 점검 결과임 (점검일 2026-06-18). 향후 harness 실행 시 보안을 표준 차원으로 포함.

### 6-1. 점검 결과 요약

| # | 영역 | 위험 시나리오 | 심각도 | 증거 | 권고 |
|:--:|------|--------------|:---:|------|------|
| S1 | 코드 생성·실행 | 웹 수집(신뢰불가) 데이터가 report-writer 프롬프트로 유입 → `build.js` 생성·`node` 실행. 간접 프롬프트 인젝션 → 코드 실행 체인 | High | report-writer.md Step4 `node {기업명}-build.js`, 입력에 search_data 포함 | 데이터를 코드에 직접 삽입 금지(템플릿/데이터 분리), 실행 전 스크립트 검토, 웹 텍스트는 리터럴로만 |
| S2 | 명령·경로 주입 | `cd reports/{기업명} && node {기업명}-build.js` — 기업명에 쉘 메타문자·`../` 포함 시 명령 주입/경로 탈출 | High | report-writer.md Step4-3, OUTPUT_DIR=`reports/{기업명}/` | 기업명 화이트리스트 검증(한글·영숫자·공백), 경로 안전 조합, 변수 인용 |
| S3 | 간접 프롬프트 인젝션 | WebFetch 콘텐츠가 지시로 해석되거나 허위 재무(데이터 포이즈닝) | Med | market-researcher tools: WebSearch/WebFetch | 수집물은 데이터로만 취급, 출처·미확인 표기(일부 적용됨), 핵심 수치 교차검증 |
| S4 | 최소권한 | report-writer의 Bash = 임의 명령 실행 권한(빌드용이나 광범위) | Med | report-writer.md tools: Bash | 빌드 한정 실행 원칙 명시, 디렉토리 생성은 Write로 대체 검토 |
| S5 | 공급망 | dashboard.html이 chart.js를 버전핀·SRI 없이 CDN 로드 | Low | report-writer Step3 `cdn.jsdelivr.net/npm/chart.js` | 버전 고정 + SRI 해시 또는 로컬 벤더링 |
| S6 | 개인정보 | 임원·최대주주(개인) 정보 수집 → reports/ 커밋(ICTK 사례) | Low | report-writer 섹션3, git에 reports/ICTK 포함 | 공개데이터(DART)이나 집적·영속화 인지, .gitignore 정책 검토 |
| S7 | 자격증명 노출 | OpenDART API key 등 시크릿 repo 커밋 | PASS | 프로젝트 내 시크릿 패턴·.mcp.json·.env **미발견**; 키는 글로벌 MCP 설정에 위치(정상) | 현행 유지, repo 인라인 금지 |

### 6-2. 강화 계획 (실행 대기, P1 편입)
- **우선(High)**: S1·S2 — report-writer 스킬에 기업명 검증·템플릿/데이터 분리 규칙 추가
- **차순(Med)**: S3 수집물 데이터-취급 원칙 명문화, S4 Bash 사용 범위 제약 명시
- **선택(Low)**: S5 SRI·버전핀, S6 reports/ 개인정보 .gitignore 정책
- **검증(PASS)**: S7 — 변경 시 회귀 점검만

---

## 7. 비고
- 본 계획은 harness 메타스킬 Phase 0(현황 감사) 결과이며, "기존 확장 — 스킬/에이전트 수정" 분기에 해당.
- 실행 시 변경은 한 번에 하나씩, 각 변경 후 즉시 검증·변경이력 갱신 (운영/유지보수 워크플로우 Step 2~4).

### 전환기 검증 정책 (중요)
- 에이전트 `.md` 변경과 `subagent_type` 네이티브 호출 전환은 **다음 세션부터 인식**됨.  
  따라서 **검증은 변경 세션이 아닌 신규 세션에서 실행**해야 유효함 (섹션 5의 2단 분리 참조).
- 이중 경로(네이티브 + 수동 임베딩) 공존은 G1의 핵심 리스크(호출 충돌·중복 실행)이므로  
  **임베딩 폴백을 남기지 않음**. 대신 검증을 신규 세션으로 분리하여 안전을 확보함.
- 권장 실행 순서: P0 전체 편집 → 1단계 검증(문법) → 커밋 → **새 세션에서** 2단계 검증(ICTK 재실행).
