#!/usr/bin/env bash
# UserPromptSubmit hook - 모든 프롬프트에 금지어 정책을 컨텍스트로 주입
#
# 설계 메모:
#   - jq 등 외부 의존성 없이 순수 bash로 JSON 생성 → Windows(Git Bash)에서도 동작
#   - 정책 텍스트는 heredoc으로 실제 개행을 유지한 뒤 JSON 문자열로 안전하게 이스케이프
#   - UserPromptSubmit.additionalContext 로 매 프롬프트마다 정책을 모델 컨텍스트에 주입
#   - 외부 입력에 의존하지 않는 정적 출력 → 결정적(deterministic)으로 동작
#   - set -e 미사용: 중간 단계가 실패해도 마지막 출력까지 진행(fail-open)하여 정상 작업을 막지 않음

# stdin(훅 입력 JSON)은 사용하지 않지만 끝까지 소비하여 EPIPE(broken pipe) 방지
cat >/dev/null 2>&1 || true

# 금지어 정책 (heredoc: 실제 개행 유지)
POLICY=$(cat <<'EOF'
[사내 보안 정책]
1. '포기', '망했어' 금지
위반 시 작업 중단하고 사용자에게 금지어 안내.
EOF
)

# 임의 텍스트 → JSON 문자열 이스케이프 (순서 중요: 백슬래시를 가장 먼저 치환)
json_escape() {
  local s=$1
  s=${s//\\/\\\\}      # \  → \\
  s=${s//\"/\\\"}      # "  → \"
  s=${s//$'\r'/}       # CR 제거
  s=${s//$'\n'/\\n}    # LF  → \n
  s=${s//$'\t'/\\t}    # TAB → \t
  printf '%s' "$s"
}

CTX=$(json_escape "$POLICY")

# UserPromptSubmit 훅 출력 스키마로 정책 주입
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$CTX"
