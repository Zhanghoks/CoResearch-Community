/**
 * Product usage demo scenario — a pure, deterministic script of the CoResearch flow.
 *
 * Everything the stage renders is declared here as literals: phases, panel states and
 * mock copy. `sampleScenario(progress)` is a pure function (the same progress always
 * yields the same state, in either direction) and `progressAt(elapsed)` maps loop
 * seconds onto phase units through the declared durations. The render path never uses
 * Math.random or Date.now, so the demo is reproducible and reversible.
 */

export type AgentId = "lead" | "gap" | "innovator" | "reviewer";
export type AgentActivity = "idle" | "working" | "done";
export type CheckState = "pending" | "pass" | "hold";
export type Role = "user" | "lead";

export interface ScenarioCaption { tag: string; title: string; body: string; }
export interface AgentState { activity: AgentActivity; action: string; }
export interface IdeaState { known: number; unknown: number; intent: string; }

export interface ScenarioState {
  phase: number;
  phaseProgress: number;
  caption: ScenarioCaption;
  agents: Record<AgentId, AgentState>;
  idea: IdeaState;
  messages: number;
  evidence: number;
  gap: boolean;
  mechanism: boolean;
  checklist: CheckState[];
  candidate: boolean;
  /** 方向深化树上当前可见的节点与连线 id（累积，只增不减）。 */
  tree: readonly string[];
  /** 当前聚焦的树节点 id，驱动金色焦点标记的位置。 */
  focus: string;
}

interface ScenarioPhase {
  id: string;
  duration: number;
  caption: ScenarioCaption;
  state: Omit<ScenarioState, "phase" | "phaseProgress" | "caption">;
}

const idle: AgentState = { activity: "idle", action: "待命" };
const pendingChecks: CheckState[] = ["pending", "pending", "pending"];

/**
 * 方向深化树：从模糊兴趣到候选方法的树状生长，坐标为 canvas 内的确定值。
 * kind 决定样式：root 兴趣 / option 候选（未选中的淡化） / chosen 选中的分支 /
 * focus 聚焦点 / leaf 证据叶 / gap 待核实缺口 / mech 跨域机制 / candidate 候选方法。
 */
export interface TreeNodeSpec { id: string; x: number; y: number; label: string; kind: "root" | "option" | "chosen" | "focus" | "leaf" | "gap" | "mech" | "candidate"; }
export const treeNodes: readonly TreeNodeSpec[] = [
  { id: "d-video", x: 60, y: 210, label: "视频生成", kind: "root" },
  { id: "d-consistency", x: 185, y: 95, label: "生成一致性", kind: "option" },
  { id: "d-identity", x: 185, y: 210, label: "主体身份", kind: "chosen" },
  { id: "d-narrative", x: 185, y: 325, label: "跨镜头叙事", kind: "option" },
  { id: "d-crossshot", x: 320, y: 210, label: "跨镜头身份保持", kind: "focus" },
  { id: "n-problem", x: 460, y: 95, label: "问题 · 主体漂移", kind: "leaf" },
  { id: "n-method", x: 460, y: 210, label: "方法 · 身份嵌入", kind: "leaf" },
  { id: "n-limitation", x: 460, y: 325, label: "局限 · 长序列未验证", kind: "leaf" },
  { id: "n-gap", x: 600, y: 325, label: "候选缺口 · 待核实", kind: "gap" },
  { id: "m-control", x: 320, y: 395, label: "其他领域 · 控制系统", kind: "mech" },
  { id: "m-estimation", x: 460, y: 395, label: "状态估计机制", kind: "mech" },
  { id: "n-candidate", x: 720, y: 160, label: "候选方法", kind: "candidate" },
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

const treeBase = ["d-video"];
const treeExplore = [...treeBase, "d-consistency", "d-identity", "d-narrative", "e-video-consistency", "e-video-identity", "e-video-narrative"];
const treeDive = [...treeExplore, "d-crossshot", "n-problem", "n-method", "n-limitation", "e-identity-crossshot", "e-crossshot-problem", "e-crossshot-method", "e-crossshot-limitation"];
const treeGap = [...treeDive, "n-gap", "boundary", "e-limitation-gap"];
const treeMech = [...treeGap, "m-control", "m-estimation", "e-m-control-estimation", "e-m-estimation-gap"];
const treeCandidate = [...treeMech, "n-candidate", "e-gap-candidate"];

const entries: ScenarioPhase[] = [
  {
    id: "intent", duration: 4.5,
    caption: { tag: "INTENT", title: "发起 · 一个模糊的兴趣", body: "研究者用一句话描述兴趣；Research Lead 建议先定位方向，不急着读文献。" },
    state: {
      agents: { lead: { activity: "working", action: "梳理候选方向" }, gap: idle, innovator: idle, reviewer: idle },
      idea: { known: 0, unknown: 1, intent: "视频生成（模糊兴趣）" },
      messages: 2, evidence: 0, gap: false, mechanism: false, checklist: pendingChecks, candidate: false,
      tree: treeBase, focus: "d-video",
    },
  },
  {
    id: "explore", duration: 5,
    caption: { tag: "EXPLORE", title: "定位方向", body: "从候选细分方向中做出选择；Intent 随之更新，未选择的研究仍在原处。" },
    state: {
      agents: { lead: { activity: "working", action: "比较候选方向" }, gap: idle, innovator: idle, reviewer: idle },
      idea: { known: 1, unknown: 1, intent: "跨镜头的主体身份保持" },
      messages: 4, evidence: 0, gap: false, mechanism: false, checklist: pendingChecks, candidate: false,
      tree: treeExplore, focus: "d-identity",
    },
  },
  {
    id: "deep-dive", duration: 5,
    caption: { tag: "DEEP DIVE", title: "重建脉络", body: "文献卡片带着问题、方法与局限出现；证据可追溯，而不是一份结论。" },
    state: {
      agents: { lead: { activity: "working", action: "协调文献深读" }, gap: idle, innovator: idle, reviewer: idle },
      idea: { known: 2, unknown: 1, intent: "跨镜头的主体身份保持" },
      messages: 5, evidence: 3, gap: false, mechanism: false, checklist: pendingChecks, candidate: false,
      tree: treeDive, focus: "d-crossshot",
    },
  },
  {
    id: "gap", duration: 4.5,
    caption: { tag: "GAP FINDER", title: "候选缺口", body: "与最接近的工作对比后提出待核实缺口，同时检查可能推翻判断的反例。" },
    state: {
      agents: { lead: { activity: "done", action: "脉络已交付" }, gap: { activity: "working", action: "对比邻近工作 · 查反例" }, innovator: idle, reviewer: idle },
      idea: { known: 3, unknown: 1, intent: "跨镜头的主体身份保持" },
      messages: 5, evidence: 3, gap: true, mechanism: false, checklist: pendingChecks, candidate: false,
      tree: treeGap, focus: "n-gap",
    },
  },
  {
    id: "innovator", duration: 4.5,
    caption: { tag: "INNOVATOR", title: "跨领域迁移", body: "从相邻领域带回机制候选，并核对迁移前提；连线代表候选，不是结论。" },
    state: {
      agents: { lead: { activity: "done", action: "脉络已交付" }, gap: { activity: "done", action: "候选缺口已交付" }, innovator: { activity: "working", action: "检索相邻领域机制" }, reviewer: idle },
      idea: { known: 3, unknown: 1, intent: "跨镜头的主体身份保持" },
      messages: 5, evidence: 3, gap: true, mechanism: true, checklist: pendingChecks, candidate: false,
      tree: treeMech, focus: "m-estimation",
    },
  },
  {
    id: "reviewer", duration: 4.5,
    caption: { tag: "REVIEWER", title: "审查候选", body: "新颖性、可行性与迁移前提逐项核查；待议项不会被悄悄放行。" },
    state: {
      agents: { lead: { activity: "done", action: "脉络已交付" }, gap: { activity: "done", action: "候选缺口已交付" }, innovator: { activity: "done", action: "机制候选已交付" }, reviewer: { activity: "working", action: "核查新颖性与可行性" } },
      idea: { known: 4, unknown: 1, intent: "跨镜头的主体身份保持" },
      messages: 5, evidence: 3, gap: true, mechanism: true, checklist: ["pass", "pass", "hold"], candidate: false,
      tree: treeMech, focus: "n-gap",
    },
  },
  {
    id: "revision", duration: 5.5,
    caption: { tag: "REVISION", title: "演化与确认", body: "Idea State 随证据更新，候选方法生成；下一步由研究者决定。" },
    state: {
      agents: { lead: { activity: "working", action: "等待研究者决定" }, gap: { activity: "done", action: "候选缺口已交付" }, innovator: { activity: "done", action: "机制候选已交付" }, reviewer: { activity: "done", action: "审查完成 · 一项待议" } },
      idea: { known: 5, unknown: 0, intent: "验证候选方法（待确认）" },
      messages: 6, evidence: 3, gap: true, mechanism: true, checklist: ["pass", "pass", "hold"], candidate: true,
      tree: treeCandidate, focus: "n-candidate",
    },
  },
];

export const phases: readonly ScenarioPhase[] = entries;
export const scenarioDuration = entries.reduce((total, phase) => total + phase.duration, 0);
/** Loop 扣除：第 index 阶段开始时已流逝的秒数。 */
export function phaseStart(index: number): number {
  return entries.slice(0, Math.max(0, index)).reduce((total, phase) => total + phase.duration, 0);
}

/** Integer progress is the phase's settled state; the fraction is intra-phase progress only. */
export function sampleScenario(progress: number): ScenarioState {
  const p = Number.isFinite(progress) ? Math.min(entries.length - 1, Math.max(0, progress)) : 0;
  const index = Math.floor(p);
  const phase = entries[index];
  return { phase: index, phaseProgress: p - index, caption: phase.caption, ...phase.state };
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

/** Mock copy for the React panels — declared once, rendered statically. */
export const agentProfiles: Record<AgentId, { name: string; role: string }> = {
  lead: { name: "Research Lead", role: "选择问题 · 协调任务" },
  gap: { name: "Gap Finder", role: "对比邻近工作 · 找候选缺口" },
  innovator: { name: "Innovator", role: "相邻领域 · 可迁移机制" },
  reviewer: { name: "Reviewer", role: "新颖性 · 可行性审查" },
};

export const conversation: ReadonlyArray<{ role: Role; text: string }> = [
  { role: "user", text: "我对视频生成感兴趣，但不确定具体该做什么。" },
  { role: "lead", text: "好。先用 Explore 在「视频生成」内定位一个细分方向，再决定是否深入。" },
  { role: "lead", text: "候选方向：生成一致性 / 主体身份 / 跨镜头叙事。哪一个更接近你的关注点？" },
  { role: "user", text: "主体身份，尤其是跨镜头时的身份保持。" },
  { role: "lead", text: "已定位「跨镜头身份保持」。开始深读相关文献，重建问题 → 方法 → 局限的脉络。" },
  { role: "lead", text: "候选方法已生成，见右侧 Idea State。是否推进边界，由你确认并实验。" },
];

export const evidenceCards: ReadonlyArray<{ title: string; problem: string; method: string; limitation: string }> = [
  { title: "Identity-Preserving Video Diffusion", problem: "跨镜头主体漂移", method: "身份嵌入 + 交叉注意力约束", limitation: "长序列一致性未验证" },
  { title: "Multi-Shot Character Consistency", problem: "叙事连贯下的身份保持", method: "参考帧检索 + 时间正则", limitation: "依赖高质量参考帧" },
  { title: "Consistent Story Generation", problem: "故事级一致性", method: "层次化生成 + 全局记忆", limitation: "计算开销高" },
];

export const checklistLabels: readonly string[] = [
  "新颖性：未被邻近工作覆盖",
  "可行性：可在现有条件下验证",
  "迁移前提：机制适用条件成立",
];
