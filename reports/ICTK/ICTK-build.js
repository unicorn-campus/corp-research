"use strict";
/**
 * ICTK Corporate Analysis Report - PPT Build Script
 * Slides: 4
 *   Slide 1: Cover
 *   Slide 2: Company Overview + Financial Analysis (Pattern D - Table)
 *   Slide 3: Market Position + Competition (Pattern B - 2-column)
 *   Slide 4: SWOT Summary (Pattern E - 2x2 Card Grid)
 *
 * Based on: references/pptx-guide.md
 */
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// 6-1. Minimum font size enforcement (12pt)
const MIN_FONT = 12;
const fs12 = (size) => {
  if (size < MIN_FONT)
    throw new Error(`fontSize ${size} < ${MIN_FONT}pt prohibited! Split the slide.`);
  return size;
};

// Common constants
const FONT = "Pretendard";
const OUT_PATH = path.join(__dirname, "ICTK-report.pptx");

// Color palette (HEX without #)
const C = {
  darkBrown:  "2C2926",
  green:      "059669",
  teal:       "0D9488",
  bodyText:   "505060",
  slate:      "59636E",
  midGray:    "6B6B7B",
  white:      "FFFFFF",
  cardBg:     "F5F5F7",
  border:     "DDDDE0",
  divider:    "E2E8F0",
  tableHdr:   "E2EEF9",
  accent1:    "4472C4",
  darkSlate:  "404155",
  red:        "DC2626",
  amber:      "D97706",
  blue:       "2563EB",
  orange:     "EA580C",
  // SWOT
  strengthBg: "EFF6FF",
  strengthBd: "2563EB",
  weakBg:     "FEF2F2",
  weakBd:     "DC2626",
  oppBg:      "ECFDF5",
  oppBd:      "059669",
  thrBg:      "FFF7ED",
  thrBd:      "EA580C",
  // Step
  step2: "0284C7",
  step3: "D97706",
  step4: "DC2626",
};

// Slide dimensions (inches) - 6-4: 16x9 layout
const W = 16;
const H = 9;
const MARGIN = 0.42;
const CX = MARGIN;
const CW = W - MARGIN * 2;

// Global shapes reference - injected in main()
let SHP;

// ── Helper: white background rectangle ──
function addBgRect(slide, x, y, w, h, fill) {
  slide.addShape(SHP.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill || C.white },
    line: { color: C.divider, width: 0.5 },
  });
}

// ── Helper: page header bar ──
function addPageHeader(slide, title, sub) {
  slide.addShape(SHP.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.75,
    fill: { color: C.darkBrown },
    line: { color: C.darkBrown, width: 0 },
  });
  slide.addText(title, {
    x: CX, y: 0.08, w: CW * 0.7, h: 0.55,
    fontFace: FONT, fontSize: fs12(24), bold: true, color: C.white,
    valign: "middle",
  });
  if (sub) {
    slide.addText(sub, {
      x: CX + CW * 0.7, y: 0.08, w: CW * 0.3, h: 0.55,
      fontFace: FONT, fontSize: fs12(13), color: "AAAAAA",
      valign: "middle", align: "right",
    });
  }
}

// ── Helper: section badge ──
function addBadge(slide, text, x, y, w, color) {
  var bw = w || 2.2;
  var bc = color || C.darkSlate;
  slide.addShape(SHP.ROUNDED_RECTANGLE, {
    x: x, y: y, w: bw, h: 0.32,
    fill: { color: bc },
    line: { color: bc, width: 0 },
    rectRadius: 0.05,
  });
  slide.addText(text, {
    x: x, y: y, w: bw, h: 0.32,
    fontFace: FONT, fontSize: fs12(13), bold: true, color: C.white,
    align: "center", valign: "middle",
  });
}

// ─────────────────────────────────────────────────────────────────────
// Slide 1: Cover (표지)
// ─────────────────────────────────────────────────────────────────────
async function createSlide01(pptx) {
  var slide = pptx.addSlide();

  // Background - dark blue
  slide.addShape(SHP.RECTANGLE, {
    x: 0, y: 0, w: W, h: H,
    fill: { color: "1A365D" },
    line: { color: "1A365D", width: 0 },
  });
  // Right accent block
  slide.addShape(SHP.RECTANGLE, {
    x: W * 0.58, y: 0, w: W * 0.42, h: H,
    fill: { color: "2B6CB0", transparency: 50 },
    line: { color: "2B6CB0", width: 0 },
  });

  // Company name (Korean)
  slide.addText("아이씨싰케이 (ICTK)", {
    x: 0.8, y: 1.8, w: 10, h: 1.0,
    fontFace: FONT, fontSize: fs12(40), bold: true, color: C.white,
  });
  // English name
  slide.addText("ICTK Co., Ltd.", {
    x: 0.8, y: 2.8, w: 10, h: 0.5,
    fontFace: FONT, fontSize: fs12(20), color: "90CAF9",
  });

  // Divider line
  slide.addShape(SHP.LINE, {
    x: 0.8, y: 3.45, w: 6, h: 0,
    line: { color: C.green, width: 3 },
  });

  // Report type
  slide.addText("기업 分析 레포트", {
    x: 0.8, y: 3.65, w: 8, h: 0.5,
    fontFace: FONT, fontSize: fs12(22), color: "B3E5FC",
  });

  // Keyword badges
  var badges = [
    "PUF 보안반도체",
    "기술특레 상장",
    "PQC 융합 보안"
  ];
  badges.forEach(function(b, i) {
    slide.addShape(SHP.ROUNDED_RECTANGLE, {
      x: 0.8 + i * 2.7, y: 4.3, w: 2.5, h: 0.38,
      fill: { color: "FFFFFF", transparency: 80 },
      line: { color: "FFFFFF", width: 1 },
      rectRadius: 0.1,
    });
    slide.addText(b, {
      x: 0.8 + i * 2.7, y: 4.3, w: 2.5, h: 0.38,
      fontFace: FONT, fontSize: fs12(13), bold: true, color: C.white,
      align: "center", valign: "middle",
    });
  });

  // Date
  slide.addText("조사 기준일: 2026년 06월 17일", {
    x: 0.8, y: 8.1, w: 8, h: 0.35,
    fontFace: FONT, fontSize: fs12(13), color: "90CAF9",
  });
  slide.addText("출처: DART 전자공시 · 이데일리 · 지디넷코리아 · 프라임경제 외", {
    x: 0.8, y: 8.45, w: 12, h: 0.3,
    fontFace: FONT, fontSize: fs12(12), color: "64B5F6",
  });

  // Right info card
  var infoItems = [
    ["종목코드", "456010 (코스닥)"],
    ["설립일", "2017.10.18"],
    ["대표이사", "이정원"],
    ["업종", "반도체·전자부품"],
    ["임직원", "62명 (2024)"],
    ["특허", "150개 이상"],
  ];
  var cardX = W * 0.62;
  var cardW = 5.6;
  slide.addShape(SHP.ROUNDED_RECTANGLE, {
    x: cardX, y: 1.5, w: cardW, h: 5.8,
    fill: { color: "FFFFFF", transparency: 85 },
    line: { color: "FFFFFF", width: 1 },
    rectRadius: 0.15,
  });
  slide.addText("기업 개요", {
    x: cardX + 0.2, y: 1.65, w: cardW - 0.4, h: 0.4,
    fontFace: FONT, fontSize: fs12(14), bold: true, color: "90CAF9",
  });
  infoItems.forEach(function(item, i) {
    var label = item[0];
    var value = item[1];
    var rowY = 2.15 + i * 0.78;
    slide.addText(label, {
      x: cardX + 0.25, y: rowY, w: 1.6, h: 0.35,
      fontFace: FONT, fontSize: fs12(12), color: "B0BEC5",
    });
    slide.addText(value, {
      x: cardX + 0.25, y: rowY + 0.3, w: cardW - 0.5, h: 0.35,
      fontFace: FONT, fontSize: fs12(14), bold: true, color: C.white,
    });
  });

  return slide;
}

// ─────────────────────────────────────────────────────────────────────
// Slide 2: Company Overview + Financial Analysis (Pattern D)
// ─────────────────────────────────────────────────────────────────────
async function createSlide02(pptx) {
  var slide = pptx.addSlide();
  addBgRect(slide, 0, 0, W, H);
  addPageHeader(
    slide,
    "기업 개요 · 재무 分析",
    "출처: DART 전자공시 (개별 기준)"
  );

  var y0 = 0.9;
  var leftW = 6.8;

  // Left: Company Overview Table
  addBadge(slide, "기업 개요", CX, y0, 2.0, C.darkSlate);
  var companyRows = [
    [
      { text: "항목", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "내용", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
    ],
    ["기업명", "아이씨싰케이 (ICTK Co., Ltd.)"],
    ["종목코드", "456010 (코스닥)"],
    ["업종", "반도체 및 전자부품 (261)"],
    ["대표자", "이정원"],
    ["설립일", "2017년 10월 18일"],
    ["상장", "2024년 5월 코스닥 기술특레 (공모가 13,000원)"],
    ["본사", "서울 강남구 강남대룀84길 16 제이스타워"],
    ["핵심기술", "VIA PUF™ (복제불가 HW 보안키)"],
    ["특허", "150개 이상 국제 특허"],
    ["임직원", "62명 (2024) / 전년 대비 +18명"],
  ];
  slide.addTable(companyRows, {
    x: CX, y: y0 + 0.38, w: leftW,
    colW: [1.8, leftW - 1.8],
    fontSize: fs12(12), fontFace: FONT,
    border: { type: "solid", color: C.border, pt: 0.5 },
    rowH: 0.43,
    valign: "middle",
  });

  // Right: Two financial tables side-by-side (each <= 5 rows -> side-by-side rule)
  var rightX = CX + leftW + 0.3;
  var rightW = CW - leftW - 0.3;
  var halfW = (rightW - 0.2) / 2;

  addBadge(slide, "손익·자산 추이 (억원)", rightX, y0, rightW, C.step2);

  // Left sub-table: Income Statement
  var incomeRows = [
    [
      { text: "계정", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "2022", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "2023", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "2024", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
    ],
    ["매출액", "26", "62", "67"],
    [
      "영업이익(손실)",
      { text: "╂33", options: { color: C.red } },
      { text: "╂24", options: { color: C.red } },
      { text: "╂67", options: { color: C.red } },
    ],
    [
      "순이익(손실)",
      { text: "╂108", options: { color: C.red } },
      { text: "╂90",  options: { color: C.red } },
      { text: "╂58",  options: { color: C.red } },
    ],
    ["자산총계", "98", "104", "458"],
    [
      "자본총계",
      { text: "╂311", options: { color: C.red } },
      { text: "94", options: { color: C.green } },
      { text: "430", options: { color: C.green } },
    ],
  ];
  var colUnit = (halfW - 1.5) / 3;
  slide.addTable(incomeRows, {
    x: rightX, y: y0 + 0.38, w: halfW,
    colW: [1.5, colUnit, colUnit, colUnit],
    fontSize: fs12(12), fontFace: FONT,
    border: { type: "solid", color: C.border, pt: 0.5 },
    rowH: 0.46,
    valign: "middle",
  });

  // Right sub-table: Financial Ratios
  var ratioRows = [
    [
      { text: "지표", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "2024년", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "2023년", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
    ],
    ["매출총이익률",
      { text: "45.04%", options: { color: C.green } },
      { text: "54.36%", options: { color: C.green } }],
    ["영업이익률",
      { text: "╂100%", options: { color: C.red } },
      { text: "╂38%",  options: { color: C.red } }],
    ["부채비율",
      { text: "6.47%",  options: { color: C.green } },
      { text: "10.68%", options: { color: C.green } }],
    ["유동비율",
      { text: "2,988%", options: { color: C.green } },
      { text: "1,009%", options: { color: C.green } }],
    ["매출증가율",
      { text: "+8.02%", options: { color: C.green } },
      { text: "+141%",  options: { color: C.green } }],
  ];
  var halfR = halfW + 0.2;
  var colR = (halfW - 1.7) / 2;
  slide.addTable(ratioRows, {
    x: rightX + halfR, y: y0 + 0.38, w: halfW,
    colW: [1.7, colR, colR],
    fontSize: fs12(12), fontFace: FONT,
    border: { type: "solid", color: C.border, pt: 0.5 },
    rowH: 0.46,
    valign: "middle",
  });

  // Note box (highlight)
  slide.addShape(SHP.ROUNDED_RECTANGLE, {
    x: rightX, y: 7.4, w: rightW, h: 0.8,
    fill: { color: "CCFBF1" },
    line: { color: C.teal, width: 0.5 },
    rectRadius: 0.08,
  });
  slide.addText(
    "※ 2024년 자산·자본 급증은 코스닥 IPO 공모자금 유입 효과(추정)" +
    "    ※ 매출총이익률 45%로 기술력 기반 마진 구조 확인 — 영업비용 구조 개선이 수익화 핵심 과제",
    {
      x: rightX + 0.12, y: 7.44, w: rightW - 0.24, h: 0.72,
      fontFace: FONT, fontSize: fs12(12), color: "065F46",
      valign: "middle",
    }
  );

  return slide;
}

// ─────────────────────────────────────────────────────────────────────
// Slide 3: Market Position + Competitive Environment (Pattern B)
// ─────────────────────────────────────────────────────────────────────
async function createSlide03(pptx) {
  var slide = pptx.addSlide();
  addBgRect(slide, 0, 0, W, H);
  addPageHeader(
    slide,
    "시장 포지션 · 경쟁 환경",
    "출처: 웹 검색 (언론보도 종합)"
  );

  var y0 = 0.9;
  var leftW = 7.2;
  var rightX = CX + leftW + 0.3;
  var rightW = CW - leftW - 0.3;

  // Left: Key Customers
  addBadge(slide, "주요 고객사 & 레퍼런스", CX, y0, 3.2, C.step2);

  var clients = [
    {
      name: "Microsoft",
      color: C.step2,
      desc: "Xbox 디바이스 액세서리 보안칩 'STR' 초도 납품\n(2026.05, 4년 프로젝트 완성)"
    },
    {
      name: "LG유플러스",
      color: C.green,
      desc: "G5 칕·PQC PUF-eSIM 공동개발·PQC KMS·MOU 체결\n(세계 최초 PQC PUF-eSIM 상용화 2025.04)"
    },
    {
      name: "KT",
      color: C.amber,
      desc: "양자보안 국책과제(70억, 2026.04~2029.12)\n수요기업 참여 — 산업부 선정"
    },
  ];

  clients.forEach(function(c, i) {
    var cy = y0 + 0.45 + i * 1.52;
    slide.addShape(SHP.ROUNDED_RECTANGLE, {
      x: CX, y: cy, w: leftW, h: 1.38,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 0.5 },
      rectRadius: 0.1,
    });
    slide.addShape(SHP.ROUNDED_RECTANGLE, {
      x: CX, y: cy, w: 1.8, h: 0.38,
      fill: { color: c.color },
      line: { color: c.color, width: 0 },
      rectRadius: 0.1,
    });
    slide.addText(c.name, {
      x: CX, y: cy, w: 1.8, h: 0.38,
      fontFace: FONT, fontSize: fs12(13), bold: true, color: C.white,
      align: "center", valign: "middle",
    });
    slide.addText(c.desc, {
      x: CX + 0.15, y: cy + 0.44, w: leftW - 0.3, h: 0.85,
      fontFace: FONT, fontSize: fs12(13), color: C.bodyText,
      valign: "middle",
    });
  });

  // Positioning bar
  var posY = y0 + 0.45 + 3 * 1.52;
  slide.addShape(SHP.ROUNDED_RECTANGLE, {
    x: CX, y: posY, w: leftW, h: 0.5,
    fill: { color: "DBEAFE" },
    line: { color: C.accent1, width: 0.5 },
    rectRadius: 0.08,
  });
  slide.addText(
    "국내 유일 PUF 보안반도체 독립 팩리스 | WIPO 글로벌 어워드 2025·2026 2년 연속 파이널리스트",
    {
      x: CX + 0.12, y: posY, w: leftW - 0.24, h: 0.5,
      fontFace: FONT, fontSize: fs12(13), bold: true, color: "1D4ED8",
      valign: "middle",
    }
  );

  // Right: Competition Table
  addBadge(slide, "경쟁사 비교", rightX, y0, 2.2, C.step4);
  var compRows = [
    [
      { text: "구분",    options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "아이씨싰케이", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "Infineon (독)", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
      { text: "NXP (네덜란드)", options: { bold: true, fill: { color: C.tableHdr }, color: C.darkBrown } },
    ],
    [
      "핵심기술",
      { text: "VIA PUF™ 자체개발", options: { bold: true, color: C.blue } },
      "OPTIGA TPM",
      "SE (Secure Element)",
    ],
    [
      "PUF 상용화",
      { text: "세계 최초 주장", options: { bold: true, color: C.green } },
      "일부 적용",
      "일부 적용",
    ],
    [
      "PQC 통합",
      { text: "PUF+PQC 결합 상용화", options: { bold: true, color: C.green } },
      "일부 지원",
      "일부 지원",
    ],
    ["주요고객", "MS·LG유플·KT", "글로벌 자동차·IoT", "글로벌 NFC·결제"],
    [
      "기업규모",
      { text: "국내 팩리스 독립", options: { color: C.amber } },
      "글로벌 대기업",
      "글로벌 대기업",
    ],
  ];
  var cUnit = (rightW - 1.5) / 3;
  slide.addTable(compRows, {
    x: rightX, y: y0 + 0.38, w: rightW,
    colW: [1.5, cUnit, cUnit, cUnit],
    fontSize: fs12(12), fontFace: FONT,
    border: { type: "solid", color: C.border, pt: 0.5 },
    rowH: 0.52,
    valign: "middle",
  });

  // Industry Trend Card
  var trendY = y0 + 0.38 + 6 * 0.52 + 0.22;
  addBadge(slide, "산업 트렌드", rightX, trendY, 2.0, C.step3);
  var trends = [
    "PUF+PQC 융합 보안 패러다임 전환 (SW→칩 수준)",
    "SKT 해킹 사태 → 하드웨어 보안 수요 급증",
    "AI·IoT 디바이스 인증 수요 확대",
    "정보보호 공시 대상 상장사 전체 확대 예정 (666→2,700개)",
    "글로벌 양자보안 표준 경쟁 가속화",
  ];
  slide.addShape(SHP.ROUNDED_RECTANGLE, {
    x: rightX, y: trendY + 0.38, w: rightW, h: 2.0,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 0.5 },
    rectRadius: 0.08,
  });
  slide.addText(
    trends.map(function(t, i) { return (i + 1) + ". " + t; }).join("\n"),
    {
      x: rightX + 0.15, y: trendY + 0.45, w: rightW - 0.3, h: 1.85,
      fontFace: FONT, fontSize: fs12(13), color: C.bodyText,
      valign: "middle",
      paraSpaceAfter: 4,
    }
  );

  return slide;
}

// ─────────────────────────────────────────────────────────────────────
// Slide 4: SWOT Summary (Pattern E - 2x2 card grid)
// ─────────────────────────────────────────────────────────────────────
async function createSlide04(pptx) {
  var slide = pptx.addSlide();
  addBgRect(slide, 0, 0, W, H);
  addPageHeader(
    slide,
    "SWOT 蒍합 評價",
    "클로니 종합 · 2026-06-17 기준"
  );

  var y0 = 0.88;
  var cardW = (CW - 0.25) / 2;
  var cardH = 3.05;
  var gapX = 0.25;
  var gapY = 0.18;

  var swotData = [
    {
      label: "강점 (Strengths)",
      color: C.strengthBd,
      bg:    C.strengthBg,
      items: [
        "VIA PUF™ 세계 최초 상용화 + 150개 이상 국제 특허",
        "글로벌 빅테크(MS) 밸류체인 진입 / 통신사(LG유플·KT) 레퍼런스 확보",
        "IPO 후 재무 안정화: 부채비율 6.47%, 유동비율 2,988%",
        "국내 유일 PUF 보안반도체 독립 팩리스 — 진입장벽 높음",
      ],
      col: 0, row: 0,
    },
    {
      label: "약점 (Weaknesses)",
      color: C.weakBd,
      bg:    C.weakBg,
      items: [
        "지속 영업손실 (2024 영업이익률 ╂100%, 누적 결손금 382억)",
        "매출 성장 둔화: 2023년 +141% → 2024년 +8%",
        "과도한 CB 발행으로 주주 희석 리스크",
        "소규모 팀(62명) — 글로벌 경쟁 대비 인력·자원 제약",
      ],
      col: 1, row: 0,
    },
    {
      label: "기회 (Opportunities)",
      color: C.oppBd,
      bg:    C.oppBg,
      items: [
        "SKT 해킹 이후 하드웨어 보안 수요 급증 · 정책 규제 강화",
        "양자컴퓨터 위협 가속 → PQC+PUF 수요 폭발 전망",
        "MS 납품 본격화 및 통신사 커버리지 확대 가능",
        "정보보호 공시 대상 확대(2,700개) → 솔루션 수요 기반 확대",
      ],
      col: 0, row: 1,
    },
    {
      label: "위협 (Threats)",
      color: C.thrBd,
      bg:    C.thrBg,
      items: [
        "글로벌 대기업(Infineon·NXP) 대비 규모·자원 열위",
        "CB 전환 지속에 따른 주가 희석 압력",
        "적자 지속 시 자금 조달 어려움 및 R&D 투자 제약",
        "글로벌 양자보안 표준 경쟁 — 미국·유럽 대기업 대응 가속",
      ],
      col: 1, row: 1,
    },
  ];

  swotData.forEach(function(item) {
    var cx = CX + item.col * (cardW + gapX);
    var cy = y0 + item.row * (cardH + gapY);

    // Card background
    slide.addShape(SHP.ROUNDED_RECTANGLE, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: item.bg },
      line: { color: item.color, width: 1.5 },
      rectRadius: 0.1,
    });
    // Header bar
    slide.addShape(SHP.ROUNDED_RECTANGLE, {
      x: cx, y: cy, w: cardW, h: 0.42,
      fill: { color: item.color },
      line: { color: item.color, width: 0 },
      rectRadius: 0.1,
    });
    // Header text
    slide.addText(item.label, {
      x: cx + 0.15, y: cy, w: cardW - 0.3, h: 0.42,
      fontFace: FONT, fontSize: fs12(14), bold: true, color: C.white,
      valign: "middle",
    });
    // Bullet items
    slide.addText(
      item.items.map(function(t) {
        return { text: "▸ " + t, options: { breakLine: true } };
      }),
      {
        x: cx + 0.15, y: cy + 0.5, w: cardW - 0.3, h: cardH - 0.62,
        fontFace: FONT, fontSize: fs12(14), color: C.bodyText,
        valign: "top",
        paraSpaceAfter: 6,
      }
    );
  });

  // Summary highlight box
  var summaryY = y0 + 2 * cardH + gapY + 0.14;
  slide.addShape(SHP.ROUNDED_RECTANGLE, {
    x: CX, y: summaryY, w: CW, h: 0.56,
    fill: { color: "CCFBF1" },
    line: { color: C.teal, width: 1 },
    rectRadius: 0.08,
  });
  slide.addText(
    "한 줄 총평:  PUF 기술 독보성과 글로벌 레퍼런스는 확보했으나, 수익화 속도가 관건인 기술특레 스타트업 단계 기업.",
    {
      x: CX + 0.18, y: summaryY, w: CW - 0.36, h: 0.56,
      fontFace: FONT, fontSize: fs12(14), bold: true, color: "065F46",
      valign: "middle",
    }
  );

  return slide;
}

// ─────────────────────────────────────────────────────────────────────
// Main entry point (6-9)
// ─────────────────────────────────────────────────────────────────────
async function main() {
  var pptx = new pptxgen();

  // 6-4: Custom 16x9 layout
  pptx.defineLayout({ name: "CUSTOM", width: W, height: H });
  pptx.layout = "CUSTOM";

  // Inject shapes reference (6-3)
  SHP = pptx.shapes;

  // 6-5: Create slides sequentially
  for (var i = 0; i < [createSlide01, createSlide02, createSlide03, createSlide04].length; i++) {
    await [createSlide01, createSlide02, createSlide03, createSlide04][i](pptx);
  }

  await pptx.writeFile({ fileName: OUT_PATH });
  console.log("PPT generated:", OUT_PATH);

  // 6-10: Verify file size
  var stat = fs.statSync(OUT_PATH);
  if (stat.size === 0) throw new Error("Generated file is 0 bytes.");
  console.log("File size: " + (stat.size / 1024).toFixed(1) + " KB");
}

main().catch(function(e) {
  console.error("PPT build FAILED:", e.message || e);
  process.exit(1);
});
