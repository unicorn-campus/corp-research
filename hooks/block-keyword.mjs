#!/usr/bin/env node
// UserPromptSubmit hook - 모든 프롬프트에 금지어 정책을 컨텍스트로 주입
// block-keyword.sh의 Node.js 대체 버전 (Windows 호환)
import { readFileSync } from "node:fs";

try { readFileSync(0, "utf8"); } catch {} // stdin 소비

const policy = `[사내 보안 정책]
1. '포기', '망했어' 금지
위반 시 작업 중단하고 사용자에게 금지어 안내.`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: policy
  }
}));
