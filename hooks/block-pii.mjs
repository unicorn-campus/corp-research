#!/usr/bin/env node
// .claude/hooks/mask-pii.mjs  —  corp-research
// UserPromptSubmit 훅: 사용자 프롬프트에서 신용카드 번호 / 주민등록번호 패턴을 감지하면 제출을 차단함.
//
// 배경: Claude Code의 UserPromptSubmit 훅은 프롬프트 원문 수정(in-place 마스킹)을 지원하지 않음.
//       원문이 모델·트랜스크립트에 전달되지 않도록 '차단(decision: block)' 방식으로 보호.
//       Claude Code Desktop 새 세션에서 block reason UI가 표시되지 않으므로 OS 알림으로 보완.
//         - Windows: PowerShell WScript.Shell.Popup (8초 자동 닫힘)
//         - macOS:   osascript display notification (토스트)
//
// 동작:
//   - 감지됨  → OS 알림 표시 후 {"decision":"block","reason":...} 출력
//   - 깨끗함  → 아무 출력 없이 exit 0 (프롬프트 정상 통과)
//   - 내부오류 → fail-open(exit 0). 스크립트 버그로 정상 작업 흐름을 막지 않음.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Luhn 체크: 신용카드 번호 오탐(false positive)을 크게 줄이기 위한 검증
function luhnValid(d) {
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48;
    if (n < 0 || n > 9) return false;
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detect(text) {
  const found = [];

  // 주민등록번호: YYMMDD-GXXXXXX (MM 01-12, DD 01-31, 성별자리 1-4, 구분자 하이픈/공백 선택)
  const rrnRe = /(?<!\d)(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[-\s]?([1-4]\d{6})(?!\d)/g;
  for (const m of text.matchAll(rrnRe)) {
    found.push({ type: '주민등록 번호', masked: `${m[1]}${m[2]}${m[3]}-${m[4][0]}******` });
  }

  // 신용카드: 13~19자리(공백/하이픈 구분자 허용) 후보를 추출하고 Luhn 통과분만 채택
  const cardRe = /(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g;
  for (const m of text.matchAll(cardRe)) {
    const digits = m[0].replace(/[ -]/g, '');
    if (digits.length < 13 || digits.length > 19) continue;
    if (!luhnValid(digits)) continue;
    found.push({ type: '신용카드 번호', masked: `**** **** **** ${digits.slice(-4)}` });
  }

  return found;
}

function main() {
  let raw;
  try { raw = readFileSync(0, 'utf8'); } catch { process.exit(0); }

  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }

  const prompt = typeof input?.prompt === 'string' ? input.prompt : '';
  if (!prompt) process.exit(0);

  const found = detect(prompt);
  if (found.length === 0) process.exit(0); // 깨끗 → 통과

  const items = [...new Set(found.map((f) => `  - ${f.type}: ${f.masked}`))];
  const reason = [
    '⚠️ 민감정보(개인정보) 감지로 프롬프트 제출이 차단되었습니다.',
    '',
    '감지된 항목(마스킹 표시):',
    ...items,
    '',
    '해당 번호를 직접 마스킹하거나 제거한 뒤 다시 보내주세요.',
    '(예: 신용카드 **** **** **** 1234 / 주민번호 900101-1******)',
  ].join('\n');

  // OS 알림: Claude Code Desktop 새 세션에서 block reason UI 미표시 보완
  try {
    const title = 'Claude 보안 알림';
    const body = `민감정보 감지로 전송이 차단되었습니다.\n${items.join('\n')}\n마스킹 후 다시 보내주세요.`;
    if (process.platform === 'win32') {
      const safe = body.replace(/'/g, '`');
      execFileSync('powershell', ['-NonInteractive', '-Command',
        `$wsh = New-Object -ComObject WScript.Shell; $wsh.Popup('${safe}', 8, '${title}', 48)`],
        { stdio: 'ignore', timeout: 10000 });
    } else if (process.platform === 'darwin') {
      const escaped = body.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      execFileSync('osascript', ['-e',
        `display notification "${escaped}" with title "${title}" sound name "Basso"`],
        { stdio: 'ignore', timeout: 5000 });
    }
  } catch { /* fail-open: 알림 실패해도 차단은 유지 */ }

  process.stdout.write(JSON.stringify({ decision: 'block', reason, systemMessage: reason }));
  process.exit(0);
}

try { main(); } catch { process.exit(0); }
