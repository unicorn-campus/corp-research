import pptxgen from "pptxgenjs";

const FONT = "Pretendard";
const MIN_FONT = 12;
const fs12 = (n) => { if (n < MIN_FONT) throw new Error(`fontSize ${n} < 12pt 금지`); return n; };

const C = {
  dark:    "2C2926", teal:  "0D9488", green: "059669",
  blue:    "0284C7", amber: "D97706", red:   "DC2626",
  purple:  "7C3AED", slate: "404155", body:  "505060",
  sub:     "59636E", card:  "F5F5F7", border:"DDDDE0",
  hi:      "CCFBF1", white: "FFFFFF", hdrBg: "E2EEF9",
};

function addTitle(slide, text) {
  slide.addText(text, {
    x: 0.4, y: 0.08, w: 15.2, h: 0.65,
    fontFace: FONT, fontSize: fs12(28), bold: true, color: C.dark,
  });
}

function addSubBadge(slide, text, color = C.teal) {
  slide.addShape("roundRect", { x: 0.4, y: 0.75, w: 15.2, h: 0.32, fill: { color: color }, rectRadius: 0.05 });
  slide.addText(text, {
    x: 0.4, y: 0.75, w: 15.2, h: 0.32,
    fontFace: FONT, fontSize: fs12(14), bold: true, color: C.white, align: "center", valign: "middle",
  });
}

function addSectionLabel(slide, text, x, y, w, color = C.slate) {
  slide.addShape("roundRect", { x, y, w, h: 0.38, fill: { color }, rectRadius: 0.06 });
  slide.addText(text, {
    x, y, w, h: 0.38,
    fontFace: FONT, fontSize: fs12(14), bold: true, color: C.white, align: "center", valign: "middle",
  });
}

function addHiBox(slide, text, x, y, w, h) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: C.hi }, rectRadius: 0.08 });
  slide.addText(text, { x: x+0.15, y, w: w-0.3, h, fontFace: FONT, fontSize: fs12(13), color: C.dark, valign: "middle" });
}

function addCodeBlock(slide, lines, x, y, w, h) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, rectRadius: 0.08 });
  slide.addText(lines, { x: x+0.15, y: y+0.1, w: w-0.3, h: h-0.2, fontFace: "Courier New", fontSize: fs12(12), color: C.body, valign: "top", wrap: true });
}

// ─── Slide 1: 대표 이벤트 ────────────────────────────────────────────────────
async function createSlide01(pptx) {
  const slide = pptx.addSlide({ masterName: "MASTER" });
  addTitle(slide, "Hook이란? — 특정 순간에 자동으로 실행되는 규칙");
  addSubBadge(slide, "도구 쓰기 직전 등에 끼어들어  허용 · 차단 · 수정", C.teal);

  const events = [
    { color: C.red,    icon: "PreToolUse",         title: "PreToolUse",         sub: "도구 실행 직전",
      bullets: ["위험한 도구 호출 차단 (decision: block)", "입력값 수정 후 실행 (updatedInput)", "실행 허용/거부 명시 (permissionDecision)"] },
    { color: C.blue,   icon: "PostToolUse",         title: "PostToolUse",        sub: "도구 실행 직후",
      bullets: ["실행 결과 교체 (updatedToolOutput)", "결과에 보충 설명 주입 (additionalContext)", "이미 실행됨 → 차단 효과 없음"] },
    { color: C.amber,  icon: "UserPromptSubmit",    title: "UserPromptSubmit",   sub: "프롬프트 전송 시",
      bullets: ["민감정보 감지 → 전송 차단 (decision: block)", "보안 정책 자동 주입 (additionalContext)", "corp-research 훅 2개 적용 이벤트"] },
    { color: C.green,  icon: "SessionStart",        title: "SessionStart / Stop", sub: "세션 시작·종료 시",
      bullets: ["시작 시: 컨텍스트·환경변수 설정", "종료 시: 빌드 실패 등 중단 가능 (Stop 이벤트)", "CLAUDE_ENV_FILE로 환경변수 영구 설정"] },
  ];

  const cW = 7.5, cH = 3.15, gapX = 0.2, gapY = 0.22, startX = 0.4, startY = 1.15;
  events.forEach((ev, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = startX + col * (cW + gapX);
    const y = startY + row * (cH + gapY);
    // Card bg
    slide.addShape("roundRect", { x, y, w: cW, h: cH, fill: { color: C.white }, line: { color: C.border, width: 0.5 }, rectRadius: 0.1 });
    // Header bar
    slide.addShape("roundRect", { x, y, w: cW, h: 0.6, fill: { color: ev.color }, rectRadius: 0.1 });
    slide.addShape("rectangle",  { x, y: y+0.3, w: cW, h: 0.3, fill: { color: ev.color }, line: { color: ev.color, width: 0 } });
    slide.addText(ev.title, { x: x+0.2, y, w: cW-0.4, h: 0.42, fontFace: FONT, fontSize: fs12(16), bold: true, color: C.white, valign: "middle" });
    slide.addText(ev.sub,   { x: x+0.2, y: y+0.4, w: cW-0.4, h: 0.28, fontFace: FONT, fontSize: fs12(12), color: C.white, valign: "middle" });
    // Bullets
    const bulletItems = ev.bullets.map(b => ({ text: b, options: { bullet: { code: "25B6", color: ev.color }, fontSize: fs12(13), color: C.body, breakLine: true } }));
    slide.addText(bulletItems, { x: x+0.2, y: y+0.72, w: cW-0.4, h: cH-0.85, fontFace: FONT, valign: "top", wrap: true });
  });
}

// ─── Slide 2: 훅 출력 방법 ──────────────────────────────────────────────────
async function createSlide02(pptx) {
  const slide = pptx.addSlide({ masterName: "MASTER" });
  addTitle(slide, "훅 출력(Output) 방법");
  addSubBadge(slide, "JSON을 stdout으로 출력하여 Claude에게 지시  —  exit code 2로도 차단 가능", C.slate);

  // Output methods table
  slide.addTable([
    [
      { text: "출력 방법",         options: { bold: true, fill: { color: C.hdrBg }, color: C.dark, fontSize: fs12(13), fontFace: FONT } },
      { text: "효과",              options: { bold: true, fill: { color: C.hdrBg }, color: C.dark, fontSize: fs12(13), fontFace: FONT } },
      { text: "주요 이벤트",       options: { bold: true, fill: { color: C.hdrBg }, color: C.dark, fontSize: fs12(13), fontFace: FONT } },
    ],
    [
      { text: 'decision: "block"',  options: { bold: true, color: C.red,    fontSize: fs12(13), fontFace: "Courier New" } },
      { text: "프롬프트·도구 실행 차단", options: { color: C.body, fontSize: fs12(13), fontFace: FONT } },
      { text: "UserPromptSubmit · PreToolUse · Stop", options: { color: C.sub, fontSize: fs12(12), fontFace: FONT } },
    ],
    [
      { text: "additionalContext",  options: { bold: true, color: C.blue,   fontSize: fs12(13), fontFace: "Courier New" } },
      { text: "Claude 컨텍스트에 정보 주입 (보안 정책 등)", options: { color: C.body, fontSize: fs12(13), fontFace: FONT } },
      { text: "거의 모든 이벤트 (corp-research 사용)", options: { color: C.sub, fontSize: fs12(12), fontFace: FONT } },
    ],
    [
      { text: "permissionDecision", options: { bold: true, color: C.amber,  fontSize: fs12(13), fontFace: "Courier New" } },
      { text: "allow / deny / ask / defer 제어", options: { color: C.body, fontSize: fs12(13), fontFace: FONT } },
      { text: "PreToolUse 전용", options: { color: C.sub, fontSize: fs12(12), fontFace: FONT } },
    ],
    [
      { text: "updatedToolOutput",  options: { bold: true, color: C.purple, fontSize: fs12(13), fontFace: "Courier New" } },
      { text: "도구 실행 결과 교체·수정 (민감정보 제거 등)", options: { color: C.body, fontSize: fs12(13), fontFace: FONT } },
      { text: "PostToolUse 전용", options: { color: C.sub, fontSize: fs12(12), fontFace: FONT } },
    ],
    [
      { text: 'continue: false',    options: { bold: true, color: C.red,    fontSize: fs12(13), fontFace: "Courier New" } },
      { text: "Claude 세션 전체 즉시 중단", options: { color: C.body, fontSize: fs12(13), fontFace: FONT } },
      { text: "모든 이벤트", options: { color: C.sub, fontSize: fs12(12), fontFace: FONT } },
    ],
    [
      { text: "CLAUDE_ENV_FILE",    options: { bold: true, color: C.green,  fontSize: fs12(13), fontFace: "Courier New" } },
      { text: "환경변수 영구 설정 (NODE_ENV, PATH 등)", options: { color: C.body, fontSize: fs12(13), fontFace: FONT } },
      { text: "SessionStart · Setup · CwdChanged", options: { color: C.sub, fontSize: fs12(12), fontFace: FONT } },
    ],
  ], {
    x: 0.4, y: 1.18, w: 15.2, h: 3.5,
    colW: [3.5, 6.8, 4.9],
    rowH: [0.45, 0.48, 0.48, 0.48, 0.48, 0.48, 0.48],
    border: { type: "solid", color: C.border, pt: 0.5 },
    fill: { color: C.white },
  });

  // Section labels
  addSectionLabel(slide, "additionalContext 예제 — block-keyword.mjs (보안 정책 주입)", 0.4, 4.85, 15.2, C.blue);

  // Code
  const codeLines = [
    { text: "import ", options: { color: "0000FF", fontFace: "Courier New", fontSize: fs12(13) } },
    { text: "{ readFileSync } ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(13) } },
    { text: "from ", options: { color: "0000FF", fontFace: "Courier New", fontSize: fs12(13) } },
    { text: '"node:fs";\n', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(13) } },
    { text: "try { readFileSync(0, ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(13) } },
    { text: '"utf8"', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(13) } },
    { text: "); } catch {}\n\n", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(13) } },
    { text: "const ", options: { color: "0000FF", fontFace: "Courier New", fontSize: fs12(13) } },
    { text: "policy = `[사내 보안 정책]\\n1. '포기', '망했어' 금지\\n위반 시 작업 중단`;\n\n", options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(13) } },
    { text: "process.stdout.write(JSON.stringify({\n  hookSpecificOutput: { hookEventName: ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(13) } },
    { text: '"UserPromptSubmit"', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(13) } },
    { text: ", additionalContext: policy }\n}));", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(13) } },
  ];

  slide.addShape("roundRect", { x: 0.4, y: 5.28, w: 15.2, h: 2.98, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, rectRadius: 0.08 });
  slide.addText(codeLines, { x: 0.6, y: 5.35, w: 14.8, h: 2.85, valign: "top", wrap: true });
}

// ─── Slide 3: 개발 주의사항 ──────────────────────────────────────────────────
async function createSlide03(pptx) {
  const slide = pptx.addSlide({ masterName: "MASTER" });
  addTitle(slide, "훅 프로그램 개발 주의사항");
  addSubBadge(slide, "크로스 플랫폼 호환 · OS 알림 · 플러그인 등록 방식  —  실제 corp-research 적용 사례", C.red);

  // Left: 3 warning cards
  const warnings = [
    {
      color: C.red, num: "1",
      title: "Shell(bash) 대신 Node.js (.mjs) 사용",
      detail: "Windows에서 Claude Code 훅 runner가 bash를 찾지 못해 무음 실패(fail-open)\n→ .mjs 확장자 = ES Module 강제 + import 문법 사용 가능 + cross-platform 보장",
    },
    {
      color: C.amber, num: "2",
      title: "block 시 OS 팝업 표시 필요",
      detail: "Claude Code Desktop 새 세션에서 block reason UI가 표시되지 않음\n→ Windows: PowerShell WScript.Shell.Popup (8초 자동 닫힘)\n→ macOS: osascript display notification + Basso 사운드",
    },
    {
      color: C.blue, num: "3",
      title: "plugin.json hooks 필드에 등록",
      detail: "hooks/hooks.json은 Desktop --setting-sources user 모드에서 미로딩 (GitHub #27398, 수정 계획 없음)\n→ .claude-plugin/plugin.json의 hooks 필드에 직접 정의\n→ ${CLAUDE_PLUGIN_ROOT} 변수로 버전 업 시 경로 자동 추적",
    },
  ];

  warnings.forEach((w, i) => {
    const y = 1.18 + i * 2.28;
    slide.addShape("roundRect", { x: 0.4, y, w: 6.5, h: 2.1, fill: { color: C.white }, line: { color: w.color, width: 1.5 }, rectRadius: 0.1 });
    slide.addShape("roundRect", { x: 0.4, y, w: 0.55, h: 2.1, fill: { color: w.color }, rectRadius: 0.1 });
    slide.addShape("rectangle",  { x: 0.65, y, w: 0.3, h: 2.1, fill: { color: w.color }, line: { color: w.color, width: 0 } });
    slide.addText(w.num, { x: 0.4, y: y+0.6, w: 0.55, h: 0.6, fontFace: FONT, fontSize: fs12(24), bold: true, color: C.white, align: "center" });
    slide.addText(w.title, { x: 1.05, y: y+0.1, w: 5.7, h: 0.5, fontFace: FONT, fontSize: fs12(14), bold: true, color: C.dark });
    slide.addText(w.detail, { x: 1.05, y: y+0.6, w: 5.7, h: 1.4, fontFace: FONT, fontSize: fs12(12), color: C.sub, wrap: true, valign: "top" });
  });

  // Right: code block — block-pii.mjs key part
  addSectionLabel(slide, "block-pii.mjs — decision:block + OS 팝업 핵심 코드", 7.15, 1.18, 8.45, C.red);

  slide.addShape("roundRect", { x: 7.15, y: 1.62, w: 8.45, h: 5.62, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, rectRadius: 0.08 });
  const code3 = [
    { text: "// 1) PII 감지 → block 출력\n", options: { color: "008000", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: "process.stdout.write(\n  JSON.stringify({\n    ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: "decision", options: { color: "0000FF", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: ": ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: '"block"', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: ",\n    ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: "reason", options: { color: "0000FF", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: ": reason,\n    systemMessage: reason,\n  })\n);\n\n", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: "// 2) OS 팝업 (Desktop block reason UI 보완)\n", options: { color: "008000", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: "if", options: { color: "0000FF", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: " (process.platform === ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: '"win32"', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: ") {\n  execFileSync(\n    ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: '"powershell"', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: ",\n    [", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: '"-NonInteractive"', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: ", ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: '"-Command"', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: ",\n     ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: "`$wsh=New-Object -ComObject WScript.Shell;", options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: "\n     ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: " $wsh.Popup('${msg}', 8, '보안 알림', 48)`", options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: "\n    ],\n    { stdio: ", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
    { text: '"ignore"', options: { color: "A31515", fontFace: "Courier New", fontSize: fs12(12) } },
    { text: ", timeout: 10000 }\n  );\n}", options: { color: C.body, fontFace: "Courier New", fontSize: fs12(12) } },
  ];
  slide.addText(code3, { x: 7.3, y: 1.7, w: 8.15, h: 5.45, valign: "top", wrap: true });
}

// ─── Slide 4: 테스트 방법 ────────────────────────────────────────────────────
async function createSlide04(pptx) {
  const slide = pptx.addSlide({ masterName: "MASTER" });
  addTitle(slide, "훅 테스트 방법");
  addSubBadge(slide, "플러그인 훅은 버전 업 + 재시작 후에만 반영됨  —  총 3단계", C.green);

  const steps = [
    {
      color: C.green, num: "STEP 1",
      title: "패치 버전 올리고 플러그인 업데이트",
      detail: "plugin.json의 version 필드를 올림 (예: 1.2.1 → 1.2.2)\n\n프롬프트 창에 입력:\n  'patch 버전 올리고 플러그인 업데이트'\n\nClaude가 자동으로 version bump + claude plugin update 수행",
      cmd: "patch 버전 올리고 플러그인 업데이트",
    },
    {
      color: C.blue, num: "STEP 2",
      title: "Claude Code 재시작",
      detail: "훅 변경사항은 Claude Code 재시작 후에만 적용됨\n\n방법:\n  - Claude Desktop 앱 종료 후 재시작\n  - 또는 터미널 claude 세션 종료 후 재시작\n\n새 대화(New Chat)만으로는 훅이 갱신되지 않음",
      cmd: "앱 종료 후 재시작",
    },
    {
      color: C.amber, num: "STEP 3",
      title: "훅 조건 텍스트 입력하여 테스트",
      detail: "additionalContext 훅 확인:\n  system-reminder에 보안 정책 문구 포함 여부 확인\n\ndecision: block 훅 확인 (PII):\n  테스트용 카드번호 입력 → OS 팝업 + 차단 확인\n  예: 4532 0151 1283 0366\n\n금지어 훅 확인: '포기' 입력 → 작업 중단 확인",
      cmd: "4532 0151 1283 0366",
    },
  ];

  const cW = (15.2 - 0.4) / 3, startX = 0.4, startY = 1.18;
  steps.forEach((s, i) => {
    const x = startX + i * (cW + 0.2);
    const cardH = 5.7;
    slide.addShape("roundRect", { x, y: startY, w: cW, h: cardH, fill: { color: C.white }, line: { color: s.color, width: 1.5 }, rectRadius: 0.1 });
    // Step number bar
    slide.addShape("roundRect", { x, y: startY, w: cW, h: 0.65, fill: { color: s.color }, rectRadius: 0.1 });
    slide.addShape("rectangle",  { x, y: startY+0.32, w: cW, h: 0.33, fill: { color: s.color }, line: { color: s.color, width: 0 } });
    slide.addText(s.num, { x: x+0.15, y: startY, w: cW-0.3, h: 0.65, fontFace: FONT, fontSize: fs12(18), bold: true, color: C.white, align: "center", valign: "middle" });
    // Title
    slide.addText(s.title, { x: x+0.2, y: startY+0.72, w: cW-0.4, h: 0.7, fontFace: FONT, fontSize: fs12(15), bold: true, color: C.dark, wrap: true });
    // Detail
    slide.addText(s.detail, { x: x+0.2, y: startY+1.42, w: cW-0.4, h: 3.4, fontFace: FONT, fontSize: fs12(12), color: C.sub, wrap: true, valign: "top" });
    // Command highlight box
    slide.addShape("roundRect", { x: x+0.15, y: startY+4.95, w: cW-0.3, h: 0.62, fill: { color: C.hi }, rectRadius: 0.06 });
    slide.addText(`▶  ${s.cmd}`, { x: x+0.25, y: startY+4.95, w: cW-0.5, h: 0.62, fontFace: "Courier New", fontSize: fs12(12), bold: true, color: s.color, valign: "middle" });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "CUSTOM", width: 16, height: 9 });
  pptx.layout = "CUSTOM";

  pptx.defineSlideMaster({
    title: "MASTER",
    background: { color: C.white },
    objects: [
      { rect: { x: 0, y: 8.55, w: 16, h: 0.45, fill: { color: "F1F5F9" } } },
      { line: { x: 0, y: 8.55, w: 16, h: 0, line: { color: "E2E8F0", width: 1 } } },
      { text: { text: "Claude Code Hooks Guide  |  corp-research@unicorn-campus", options: { x: 0.4, y: 8.58, w: 12, h: 0.35, fontFace: FONT, fontSize: fs12(12), color: "9CA3AF" } } },
      { text: { text: "무단전재 및 배포 금지", options: { x: 12.4, y: 8.58, w: 3.2, h: 0.35, fontFace: FONT, fontSize: fs12(12), color: "9CA3AF", align: "right" } } },
    ],
    slideNumber: { x: 15.6, y: 8.6, w: 0.4, h: 0.3, fontFace: FONT, fontSize: fs12(12), color: "9CA3AF", align: "right" },
  });

  for (const fn of [createSlide01, createSlide02, createSlide03, createSlide04]) {
    await fn(pptx);
  }

  const outPath = "reports/hooks-slides.pptx";
  await pptx.writeFile({ fileName: outPath });
  console.log(`✅ 생성 완료: ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
