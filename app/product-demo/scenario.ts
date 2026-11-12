/**
 * Product demo scenario — a pure, deterministic script of a CoResearch run,
 * staged inside a replica of the real product UI (three-column dark shell).
 *
 * Everything the stage renders is declared here as literals: phases, panel states and
 * mock copy. `sampleScenario(progress)` is a pure function (the same progress always
 * yields the same state, in either direction) and `progressAt(elapsed)` maps loop
 * seconds onto phase units through the declared durations. Integer progress is the
 * phase's settled state; the fraction drives only intra-phase streams (typed text,
 * timers, counters). The render path never uses Math.random or Date.now.
 */

export type Role = "user" | "lead" | "gap" | "innovator" | "reviewer";
export type CheckState = "pending" | "pass" | "hold";
export type StreamId = "composer" | "intro" | "question" | "work" | "evidence";
export type DetailField = "title" | "intro" | "question" | "work" | "evidence" | "todo" | "mech";

export interface ScenarioCaption { tag: string; title: string; body: string; }

/** Streamed copy is written element-by-element; the applicator owns the writes. */
export type StreamText = Partial<Record<StreamId, string>>;
export type DetailState = Record<DetailField, boolean>;

export interface ScenarioState {
  phase: number;
  phaseProgress: number;
  caption: ScenarioCaption;
  /** 可见消息数（按 conversation 顺序累积）。 */
  messages: number;
  /** 进行中的流式文本（确定性前缀；settled 后离开映射，元素保留全文）。 */
  streams: StreamText;
  /** 「已处理」计时器秒数；0 = 处理行未出现。 */
  timer: number;
  /** 输入框上下文百分比。 */
  context: number;
  /** 图谱上当前可见的节点与连线 id（累积，只增不减）。 */
  tree: readonly string[];
  /** 「当前」徽标所在节点 id；空串 = 尚未选中方向。 */
  current: string;
  /** 金色焦点标记所在节点 id（正在工作的区域）。 */
  focus: string;
  /** 方向详情卡各字段可见性。 */
  detail: DetailState;
  /** 文献卡是否已到达。 */
  paper: boolean;
  /** 侧栏新会话条目是否已出现。 */
  session: boolean;
  /** 侧栏画布计数。 */
  canvasCount: number;
  /** 审查清单状态。 */
  checklist: CheckState[];
  /** 候选方法是否已生成。 */
  candidate: boolean;
}

interface ScenarioPhase {
  id: string;
  duration: number;
  caption: ScenarioCaption;
  /** settled（整数 progress）状态；streams 是该阶段结束时的流式值快照。 */
  state: Omit<ScenarioState, "phase" | "phaseProgress" | "caption">;
}

const pendingChecks: CheckState[] = ["pending", "pending", "pending"];

/**
 * 研究图谱：从模糊兴趣到候选方法的树状生长。坐标为窄画布（viewBox 420×420，
 * 对应产品右侧「对话研究图谱」面板）内的确定值。
 * kind 决定样式：root 兴趣 / option 候选（未选中的淡化） / chosen 选中的分支 /
 * focus 聚焦方向 / leaf 证据叶 / gap 待核实缺口 / mech 跨域机制 / candidate 候选方法。
 */
export interface TreeNodeSpec { id: string; x: number; y: number; label: string; kind: "root" | "option" | "chosen" | "focus" | "leaf" | "gap" | "mech" | "candidate"; }
export const treeNodes: readonly TreeNodeSpec[] = [
  { id: "d-video", x: 50, y: 190, label: "视频生成", kind: "root" },
  { id: "d-consistency", x: 160, y: 66, label: "生成一致性", kind: "option" },
  { id: "d-identity", x: 160, y: 190, label: "主体身份", kind: "chosen" },
  { id: "d-narrative", x: 160, y: 314, label: "跨镜头叙事", kind: "option" },
  { id: "d-crossshot", x: 278, y: 190, label: "跨镜头身份保持", kind: "focus" },
  { id: "n-problem", x: 278, y: 74, label: "问题 · 主体漂移", kind: "leaf" },
  { id: "n-method", x: 278, y: 132, label: "方法 · 身份嵌入", kind: "leaf" },
  { id: "n-limitation", x: 278, y: 248, label: "局限 · 长序列未验证", kind: "leaf" },
  { id: "n-gap", x: 278, y: 306, label: "缺口 · 待核实", kind: "gap" },
  { id: "m-control", x: 110, y: 376, label: "其他领域 · 控制系统", kind: "mech" },
  { id: "m-estimation", x: 244, y: 376, label: "状态估计机制", kind: "mech" },
  { id: "n-candidate", x: 378, y: 376, label: "候选方法", kind: "candidate" },
];
export const treeEdges: ReadonlyArray<{ id: string; from: string; to: string }> = [
  { id: "e-video-consistency", from: "d-video", to: "d-consistency" },
  { id: "e-video-identity", from: "d-video", to: "d-identity" },
  { id: "e-video-narrative", from: "d-video", to: "d-narrative" },
  { id: "e-identity-crossshot", from: "d-identity", to: "d-crossshot" },
  { id: "e-crossshot-problem", from: "d-crossshot", to: "n-problem" },
  { id: "e-crossshot-method", from: "d-crossshot", to: "n-method" },
  { id: "e-crossshot-limitation", from: "d-crossshot", to: "n-limitation" },
  { id: "e-limitation-gap", from: "n-limitation", to: "n-gap" },
  { id: "e-m-control-estimation", from: "m-control", to: "m-estimation" },
  { id: "e-m-estimation-gap", from: "m-estimation", to: "n-gap" },
  { id: "e-gap-candidate", from: "n-gap", to: "n-candidate" },
];
/** 节点 id → 坐标（应用器定位焦点标记与「当前」徽标、shell 渲染 SVG 共用）。 */
export const treeNodeById = new Map(treeNodes.map((node) => [node.id, node]));

const treeBase = ["d-video"];
const treeExplore = [...treeBase, "d-consistency", "d-identity", "d-narrative", "e-video-consistency", "e-video-identity", "e-video-narrative"];
const treeDive = [...treeExplore, "d-crossshot", "n-problem", "n-method", "n-limitation", "e-identity-crossshot", "e-crossshot-problem", "e-crossshot-method", "e-crossshot-limitation"];
const treeGap = [...treeDive, "n-gap", "boundary", "e-limitation-gap"];
const treeMech = [...treeGap, "m-control", "m-estimation", "e-m-control-estimation", "e-m-estimation-gap"];
const treeCandidate = [...treeMech, "n-candidate", "e-gap-candidate"];

/** 流式全文案（composer 输入与详情卡字段）；流式值都是它们的确定性前缀。 */
export const questionText = "我对视频生成感兴趣，但不确定具体该做什么。";
export const detailCopy: Record<DetailField, string> = {
  title: "跨镜头身份保持",
  intro: "在视频生成中保持主体身份跨镜头一致：梳理现有方法如何约束身份，以及它们停在哪里。",
  question: "身份约束在长序列中如何失效？失效是累积的还是突变的？",
  work: "身份嵌入 + 交叉注意力约束的扩散方案（见下方文献）。",
  evidence: "三篇代表工作覆盖短序列一致性；长序列验证普遍缺失。",
  todo: "长时序下的身份漂移如何累积，证据不足——最接近的工作只验证了 ≤4 秒片段。",
  mech: "控制系统的状态估计：用观测渐进修正状态。",
};

/** 每个流式目标的全文案（composer 除外——它的 settled 值是清空后的空串）。 */
export const streamFullCopy: Record<StreamId, string> = {
  composer: questionText,
  intro: detailCopy.intro,
  question: detailCopy.question,
  work: detailCopy.work,
  evidence: detailCopy.evidence,
};

/** 流式窗口：声明每个流式目标在哪个阶段、以哪个进度区间打字。 */
const streamWindows: Record<StreamId, { phase: number; from: number; to: number }> = {
  composer: { phase: 0, from: 0.08, to: 0.72 },
  intro: { phase: 1, from: 0.25, to: 0.8 },
  question: { phase: 2, from: 0.1, to: 0.55 },
  work: { phase: 2, from: 0.35, to: 0.9 },
  evidence: { phase: 3, from: 0.15, to: 0.7 },
};
export const streamIds: readonly StreamId[] = Object.keys(streamWindows) as StreamId[];
export const detailFields: readonly DetailField[] = ["title", "intro", "question", "work", "evidence", "todo", "mech"];

/** 上下文百分比按阶段推进：每阶段声明 [起点, 终点]。 */
const contextRanges: ReadonlyArray<readonly [number, number]> = [
  [6, 6], [6, 8], [8, 14], [14, 17], [17, 19], [19, 20], [20, 23],
];

/** 阶段内事件点（按 id 声明，不散落魔法索引）。 */
const phaseIds = { intent: 0, explore: 1, deepDive: 2, gap: 3, innovator: 4, reviewer: 5, revision: 6 } as const;
/** 发起阶段内的确定性时间线：打字 → 发送（清空输入框、消息与会话条目出现）。 */
const sendAt = 0.75;
/** Deep Dive 阶段的处理计时器走满的秒数。 */
const timerSeconds = 30;
/** Reviewer 阶段清单逐项给出的时间点。 */
const reviewAt = [0.15, 0.45, 0.75] as const;

const noDetail: DetailState = { title: false, intro: false, question: false, work: false, evidence: false, todo: false, mech: false };
const detail = (...on: DetailField[]): DetailState =>
  Object.fromEntries(detailFields.map((field) => [field, on.includes(field)])) as DetailState;

const entries: ScenarioPhase[] = [
  {
    id: "intent", duration: 5,
    caption: { tag: "INTENT", title: "发起 · 一句模糊的兴趣", body: "研究者在输入框里逐字写下兴趣；发送之后，会话出现在项目树里，Research Lead 建议先定位方向。" },
    state: {
      messages: 2,
      streams: { composer: "" },
      timer: 0, context: contextRanges[0][1],
      tree: treeBase, current: "", focus: "d-video",
      detail: noDetail, paper: false, session: true, canvasCount: 0,
      checklist: pendingChecks, candidate: false,
    },
  },
  {
    id: "explore", duration: 5,
    caption: { tag: "EXPLORE", title: "定位方向", body: "候选细分方向在右侧图谱里展开；选定后「当前」标记落在你的位置，未选的方向仍留在原处。" },
    state: {
      messages: 4,
      streams: { intro: detailCopy.intro },
      timer: 0, context: contextRanges[1][1],
      tree: treeExplore, current: "d-identity", focus: "d-identity",
      detail: detail("title", "intro"), paper: false, session: true, canvasCount: 0,
      checklist: pendingChecks, candidate: false,
    },
  },
  {
    id: "deep-dive", duration: 6,
    caption: { tag: "DEEP DIVE", title: "重建脉络", body: "文献被逐篇深读：开放式问题、代表性工作与文献卡在方向详情里逐项成形。" },
    state: {
      messages: 5,
      streams: { question: detailCopy.question, work: detailCopy.work },
      timer: timerSeconds, context: contextRanges[2][1],
      tree: treeDive, current: "d-crossshot", focus: "d-crossshot",
      detail: detail("title", "intro", "question", "work"), paper: true, session: true, canvasCount: 3,
      checklist: pendingChecks, candidate: false,
    },
  },
  {
    id: "gap", duration: 4.5,
    caption: { tag: "GAP FINDER", title: "候选缺口", body: "与最接近的工作对比后给出待核实的缺口；「尚待确认」不会被写成结论。" },
    state: {
      messages: 6,
      streams: { evidence: detailCopy.evidence },
      timer: timerSeconds, context: contextRanges[3][1],
      tree: treeGap, current: "d-crossshot", focus: "n-gap",
      detail: detail("title", "intro", "question", "work", "evidence", "todo"), paper: true, session: true, canvasCount: 3,
      checklist: pendingChecks, candidate: false,
    },
  },
  {
    id: "innovator", duration: 4.5,
    caption: { tag: "INNOVATOR", title: "跨领域迁移", body: "从相邻领域带回机制候选，迁移前提逐项核对；连线代表候选，不是结论。" },
    state: {
      messages: 7,
      streams: {},
      timer: timerSeconds, context: contextRanges[4][1],
      tree: treeMech, current: "d-crossshot", focus: "m-estimation",
      detail: detail("title", "intro", "question", "work", "evidence", "todo", "mech"), paper: true, session: true, canvasCount: 4,
      checklist: pendingChecks, candidate: false,
    },
  },
  {
    id: "reviewer", duration: 4.5,
    caption: { tag: "REVIEWER", title: "审查候选", body: "新颖性、可行性与迁移前提逐项审查；待议项不会被悄悄放行。" },
    state: {
      messages: 8,
      streams: {},
      timer: timerSeconds, context: contextRanges[5][1],
      tree: treeMech, current: "d-crossshot", focus: "n-gap",
      detail: detail("title", "intro", "question", "work", "evidence", "todo", "mech"), paper: true, session: true, canvasCount: 4,
      checklist: ["pass", "pass", "hold"], candidate: false,
    },
  },
  {
    id: "revision", duration: 6,
    caption: { tag: "REVISION", title: "演化与确认", body: "候选方法生成，图谱长出边界之外的一步；是否推进，由研究者确认。" },
    state: {
      messages: 10,
      streams: {},
      timer: timerSeconds, context: contextRanges[6][1],
      tree: treeCandidate, current: "d-crossshot", focus: "n-candidate",
      detail: detail("title", "intro", "question", "work", "evidence", "todo", "mech"), paper: true, session: true, canvasCount: 4,
      checklist: ["pass", "pass", "hold"], candidate: true,
    },
  },
];

export const phases: readonly ScenarioPhase[] = entries;
export const scenarioDuration = entries.reduce((total, phase) => total + phase.duration, 0);
/** Loop 扣除：第 index 阶段开始时已流逝的秒数。 */
export function phaseStart(index: number): number {
  return entries.slice(0, Math.max(0, index)).reduce((total, phase) => total + phase.duration, 0);
}

/** 把流式窗口内的进度归一化到 [0,1]；窗口之前为 0，之后为 1。 */
function streamFraction(frac: number, window: { from: number; to: number }): number {
  return Math.min(1, Math.max(0, (frac - window.from) / (window.to - window.from)));
}

/** 确定性前缀：不四舍五入到超出文案长度的位置。 */
function prefixOf(text: string, fraction: number): string {
  return text.slice(0, Math.round(text.length * Math.min(1, Math.max(0, fraction))));
}

/**
 * Integer progress is the phase's settled state; the fraction is intra-phase progress
 * only (streams, timer, context, checklist progression, the intent-phase send).
 * Both directions of sampling give the same state.
 */
export function sampleScenario(progress: number): ScenarioState {
  const p = Number.isFinite(progress) ? Math.min(entries.length - 1, Math.max(0, progress)) : 0;
  const index = Math.floor(p);
  const frac = p - index;
  const phase = entries[index];
  const base = phase.state;
  if (frac === 0) return { phase: index, phaseProgress: 0, caption: phase.caption, ...base, streams: { ...base.streams }, detail: { ...base.detail }, checklist: [...base.checklist] };

  // 阶段内：流式文本按窗口取前缀；计时器与上下文按声明区间推进。
  const streams: StreamText = {};
  for (const id of streamIds) {
    const window = streamWindows[id];
    if (window.phase !== index) continue;
    streams[id] = prefixOf(streamFullCopy[id], streamFraction(frac, window));
  }
  // 发起阶段：打字 → sendAt 发送（输入框清空、消息与会话条目出现）。
  let messages = base.messages;
  let session = base.session;
  if (index === phaseIds.intent) {
    const sent = frac >= sendAt;
    if (sent) streams.composer = "";
    messages = sent ? base.messages : 0;
    session = sent;
  }
  const [from, to] = contextRanges[index];
  const timer = index === phaseIds.deepDive ? Math.round(timerSeconds * frac) : base.timer;
  // Reviewer 阶段：清单逐项给出，不整卡铺开。
  const checklist = index === phaseIds.reviewer
    ? base.checklist.map((state, i) => (frac >= reviewAt[i] ? state : "pending"))
    : base.checklist;
  return {
    phase: index,
    phaseProgress: frac,
    caption: phase.caption,
    ...base,
    messages,
    streams,
    timer,
    context: Math.round(from + (to - from) * frac),
    checklist,
    session,
  };
}

/** Loop seconds → phase units, through each phase's declared duration. Holds on the final phase. */
export function progressAt(elapsed: number): number {
  if (!Number.isFinite(elapsed) || elapsed <= 0) return 0;
  let start = 0;
  for (let i = 0; i < entries.length; i++) {
    const end = start + entries[i].duration;
    if (elapsed < end) return i + (elapsed - start) / entries[i].duration;
    start = end;
  }
  return entries.length - 1;
}

/** Mock copy for the React shell — declared once, rendered statically. */
export const authorNames: Record<Role, string> = {
  user: "研究者",
  lead: "Research Lead",
  gap: "Gap Finder",
  innovator: "Innovator",
  reviewer: "Reviewer",
};

export const conversation: ReadonlyArray<{ role: Role; text: string }> = [
  { role: "user", text: questionText },
  { role: "lead", text: "好。先用 Explore 在「视频生成」内定位一个细分方向，再决定是否深入。" },
  { role: "lead", text: "候选方向已列在右侧图谱：生成一致性 / 主体身份 / 跨镜头叙事。哪一个更接近你的关注点？" },
  { role: "user", text: "主体身份，尤其是跨镜头时的身份保持。" },
  { role: "lead", text: "已定位「跨镜头身份保持」。开始深读文献，重建问题 → 方法 → 局限的脉络。" },
  { role: "gap", text: "对比最接近的工作：长序列下的身份漂移证据不足。候选缺口已给出，待核实。" },
  { role: "innovator", text: "从控制系统的状态估计带回候选机制：用观测渐进修正状态。迁移前提待验证。" },
  { role: "reviewer", text: "审查完成：新颖性通过、可行性通过、迁移前提待议（见审查清单）。" },
  { role: "lead", text: "候选方法已生成（见图谱）。是否推进研究边界，由你确认并实验。" },
  { role: "user", text: "好，先按验证计划推进。" },
];

export const paperRef = { title: "Identity-Preserving Video Diffusion", meta: "Chen et al. · CVPR · 2025", tag: "代表" };

export const mechPremises: ReadonlyArray<{ label: string; state: "pass" | "hold" }> = [
  { label: "状态可观测", state: "pass" },
  { label: "误差有界", state: "pass" },
  { label: "观测噪声假设", state: "hold" },
];

export const checklistLabels: readonly string[] = [
  "新颖性：未被邻近工作覆盖",
  "可行性：可在现有条件下验证",
  "迁移前提：机制适用条件成立",
];

/** 侧栏与顶栏的静态装饰文案（观感一致即可；mock 文案集中声明，改文案不动组件）。 */
export const sidebarCopy = {
  nav: ["首页", "搜索", "论文雷达", "浏览"],
  newSession: "+ 新建会话",
  projectsLabel: "项目",
  project: "视频生成研究",
  projectMeta: "会话 8",
  session: "跨镜头身份保持",
  olderSession: "生成一致性初探",
  canvas: "画布",
  user: "zmj",
};
export const topbarCopy = {
  breadcrumb: "CoResearch / 视频生成研究",
  likesLabel: "赞",
  likes: 21,
  modelShort: "DeepSeek V4.1 Flash",
};
export const shellCopy = {
  modelChip: "DeepSeek V4.1 Flash（炼）",
  autoChip: "Auto ▾",
  tasksChip: "+ 任务 ▾",
  contextPrefix: "上下文",
  processingPrefix: "已处理 for",
  processingMeta: "· 深读 6 篇 · 对比邻近工作",
  graphTitle: "对话研究图谱",
  graphChips: ["通用", "折叠"],
  reviewTitle: "REVIEWER · 审查",
  mentionChip: "@ 细化方向",
  mentionBody: "本轮的出发点：跨镜头时的主体身份保持",
};
/** 方向提及卡在会话流中的位置（位于第 N 条消息之前）。 */
export const mentionBefore = 3;
/** 处理行插在会话流的位置（第 N 条消息之后）。 */
export const processingAfter = 5;
/** 审查卡插在会话流的位置（第 N 条消息之后）。 */
export const reviewAfter = 8;
