/**
 * Product-demo shell projection of the shared synthetic fixture.
 *
 * Data state comes from app/demo (absolute-ms stateAt). This module only maps
 * that world onto the existing three-column replica: typography, tree layout,
 * and streamed composer text. It does not keep a second copy of papers,
 * direction hierarchy, or evidence claims.
 */
import {
  DEMO_DURATION_MS,
  INTEREST_PROMPT,
  OPEN_QUESTION_ID,
  counterexampleById,
  coverageById,
  demoScenes,
  demoTimeline,
  evidenceById,
  openQuestionById,
  paperById,
  sceneIndexAt,
  stateAt,
  videoIdentityWorld,
} from "../demo";
import type { WorldState } from "../demo";

export type Role = "user" | "lead" | "gap" | "innovator" | "reviewer";
export type CheckState = "pending" | "pass" | "hold";
export type StreamId = "composer" | "intro" | "question" | "work" | "evidence";
export type DetailField = "title" | "intro" | "question" | "work" | "evidence" | "todo" | "mech";

export interface ScenarioCaption { tag: string; title: string; body: string; }

export type StreamText = Partial<Record<StreamId, string>>;
export type DetailState = Record<DetailField, boolean>;

export interface ScenarioState {
  phase: number;
  phaseProgress: number;
  caption: ScenarioCaption;
  messages: number;
  streams: StreamText;
  timer: number;
  context: number;
  tree: readonly string[];
  current: string;
  focus: string;
  detail: DetailState;
  paper: boolean;
  session: boolean;
  canvasCount: number;
  checklist: CheckState[];
  candidate: boolean;
  processingMeta: string;
}

export interface TreeNodeSpec { id: string; x: number; y: number; label: string; kind: "root" | "option" | "chosen" | "focus" | "leaf" | "gap" | "mech" | "candidate"; }

const oq = openQuestionById.get(OPEN_QUESTION_ID)!;
const e01 = evidenceById.get("E01")!;
const e02 = evidenceById.get("E02")!;
const e03 = evidenceById.get("E03")!;
const p01 = paperById.get("P01")!;
const p06 = paperById.get("P06")!;
const covShort = coverageById.get("cov-short-visible")!;
const ce01 = counterexampleById.get("CE01")!;

export const questionText = INTEREST_PROMPT;
export const detailCopy: Record<DetailField, string> = {
  title: "跨镜头身份保持",
  intro: "在主体身份下继续看跨镜头身份保持：整理已阅读演示文献的适用条件，而不是把它们写成普遍结论。",
  question: oq.question,
  work: "演示文献 P01 / P02 提供短片段与持续可见条件下的示意依据；P06 来自跟踪任务，只作为待验证的候选机制。",
  evidence: `${e01.claim} ${e02.claim}`,
  todo: `${e03.claim} ${covShort.statement}`,
  mech: `${p06.title}：${p06.excerpts[0]?.text ?? ""}`,
};

export const streamFullCopy: Record<StreamId, string> = {
  composer: questionText,
  intro: detailCopy.intro,
  question: detailCopy.question,
  work: detailCopy.work,
  evidence: detailCopy.evidence,
};
export const streamIds: readonly StreamId[] = ["composer", "intro", "question", "work", "evidence"];
export const detailFields: readonly DetailField[] = ["title", "intro", "question", "work", "evidence", "todo", "mech"];

export const treeNodes: readonly TreeNodeSpec[] = [
  { id: "d-video", x: 42, y: 210, label: "视频生成", kind: "root" },
  { id: "d-consistency", x: 148, y: 84, label: "生成一致性", kind: "chosen" },
  { id: "d-controllable", x: 148, y: 210, label: "可控生成", kind: "option" },
  { id: "d-narrative", x: 148, y: 330, label: "叙事结构", kind: "option" },
  { id: "d-identity", x: 254, y: 84, label: "主体身份", kind: "chosen" },
  { id: "d-scene", x: 254, y: 20, label: "场景一致性", kind: "option" },
  { id: "d-motion", x: 254, y: 148, label: "运动一致性", kind: "option" },
  { id: "d-crossshot", x: 352, y: 84, label: "跨镜头身份保持", kind: "focus" },
  { id: "d-multi-person", x: 352, y: 20, label: "多人身份区分", kind: "option" },
  { id: "d-style", x: 352, y: 148, label: "风格变化下身份保持", kind: "option" },
  { id: "n-evidence", x: 352, y: 220, label: "E01 有条件支持", kind: "leaf" },
  { id: "n-revision", x: 352, y: 268, label: "覆盖已修订", kind: "leaf" },
  { id: "n-gap", x: 352, y: 316, label: "待比较的问题", kind: "gap" },
  { id: "n-candidate", x: 352, y: 368, label: "下一步比较", kind: "candidate" },
];
export const treeEdges: ReadonlyArray<{ id: string; from: string; to: string }> = [
  { id: "e-video-consistency", from: "d-video", to: "d-consistency" },
  { id: "e-video-controllable", from: "d-video", to: "d-controllable" },
  { id: "e-video-narrative", from: "d-video", to: "d-narrative" },
  { id: "e-consistency-identity", from: "d-consistency", to: "d-identity" },
  { id: "e-consistency-scene", from: "d-consistency", to: "d-scene" },
  { id: "e-consistency-motion", from: "d-consistency", to: "d-motion" },
  { id: "e-identity-crossshot", from: "d-identity", to: "d-crossshot" },
  { id: "e-identity-multi", from: "d-identity", to: "d-multi-person" },
  { id: "e-identity-style", from: "d-identity", to: "d-style" },
  { id: "e-crossshot-evidence", from: "d-crossshot", to: "n-evidence" },
  { id: "e-evidence-revision", from: "n-evidence", to: "n-revision" },
  { id: "e-revision-gap", from: "n-revision", to: "n-gap" },
  { id: "e-gap-candidate", from: "n-gap", to: "n-candidate" },
];
export const treeNodeById = new Map(treeNodes.map((node) => [node.id, node]));

const treeBase = ["d-video"] as const;
const treeG1 = [...treeBase, "d-consistency", "d-controllable", "d-narrative", "e-video-consistency", "e-video-controllable", "e-video-narrative"];
const treeG2 = [...treeG1, "d-identity", "d-scene", "d-motion", "e-consistency-identity", "e-consistency-scene", "e-consistency-motion"];
const treeG3 = [...treeG2, "d-crossshot", "d-multi-person", "d-style", "e-identity-crossshot", "e-identity-multi", "e-identity-style"];
const treeEvidence = [...treeG3, "n-evidence", "e-crossshot-evidence"];
const treeRevision = [...treeEvidence, "n-revision", "e-evidence-revision"];
const treeQuestion = [...treeRevision, "n-gap", "e-revision-gap"];
const treeNext = [...treeQuestion, "n-candidate", "e-gap-candidate"];

export interface ScenarioPhase {
  id: string;
  duration: number;
  caption: ScenarioCaption;
}

export const phases: readonly ScenarioPhase[] = demoScenes.map((scene, index) => {
  const next = demoScenes[index + 1];
  const end = next ? next.startMs : DEMO_DURATION_MS;
  return {
    id: scene.sceneId,
    duration: (end - scene.startMs) / 1000,
    caption: scene.caption,
  };
});

export const scenarioDuration = DEMO_DURATION_MS / 1000;

export function phaseStart(index: number): number {
  const scene = demoScenes[Math.max(0, Math.min(demoScenes.length - 1, index))];
  return scene.startMs / 1000;
}

/** Readable checkpoint of a scene, in seconds. Seek-to-scene uses this, not phaseStart. */
export function phaseCheckpoint(index: number): number {
  const scene = demoScenes[Math.max(0, Math.min(demoScenes.length - 1, index))];
  return scene.checkpointMs / 1000;
}

export function phaseRestart(index: number): number {
  return phaseStart(index);
}

function prefixOf(text: string, fraction: number): string {
  return text.slice(0, Math.round(text.length * Math.min(1, Math.max(0, fraction))));
}

function processingMetaOf(state: WorldState): string {
  return `· 发现 ${state.counts.discovered} 篇 · 浏览摘要 ${state.counts.abstractBrowsed} 篇 · 读取全文 ${state.counts.fullTextRead} 篇 · 演示节奏 / 等待已压缩`;
}

function treeFor(state: WorldState): string[] {
  if (state.openQuestionStatus === "selected-for-investigation") return [...treeNext];
  if (state.openQuestionId) return [...treeQuestion];
  if (state.coverageRevisions.length > 0 || state.evidenceIds.includes("E02")) return [...treeRevision];
  if (state.evidenceIds.includes("E01") || state.counts.fullTextRead > 0) return [...treeEvidence];
  if (state.visibleGroupIds.includes("G3")) return [...treeG3];
  if (state.visibleGroupIds.includes("G2")) return [...treeG2];
  if (state.visibleGroupIds.includes("G1")) return [...treeG1];
  return [...treeBase];
}

function focusFor(state: WorldState): string {
  if (state.openQuestionStatus === "selected-for-investigation") return "n-candidate";
  if (state.openQuestionId) return "n-gap";
  if (state.coverageRevisions.length > 0) return "n-revision";
  if (state.evidenceIds.includes("E01")) return "n-evidence";
  if (state.selectedDirectionId && treeNodeById.has(state.selectedDirectionId)) return state.selectedDirectionId;
  if (state.visibleGroupIds.includes("G3")) return "d-identity";
  if (state.visibleGroupIds.includes("G2")) return "d-consistency";
  if (state.visibleGroupIds.includes("G1")) return "d-video";
  return "d-video";
}

function currentFor(state: WorldState): string {
  if (state.selectedDirectionId && treeNodeById.has(state.selectedDirectionId)) return state.selectedDirectionId;
  return "";
}

function detailFor(state: WorldState): DetailState {
  const selected = state.selectedDirectionId === "d-crossshot" || Boolean(state.openQuestionId);
  return {
    title: selected || state.selectedDirectionId === "d-identity" || state.visibleGroupIds.includes("G3"),
    intro: selected || state.selectedDirectionId === "d-identity" || state.visibleGroupIds.includes("G3"),
    question: Boolean(state.openQuestionId),
    work: state.counts.discovered >= 2,
    evidence: state.evidenceIds.includes("E01"),
    todo: state.coverageRecordIds.includes("cov-short-visible") || state.evidenceIds.includes("E03"),
    mech: Boolean(state.paperReading.P06?.abstractBrowsed || state.paperReading.P06?.fullTextRead),
  };
}

function streamsFor(state: WorldState, t: number): StreamText {
  const streams: StreamText = {};
  const intentStart = 400;
  const intentReady = 3600;
  if (t < 4200) {
    if (t < intentReady) {
      const fraction = (t - intentStart) / (intentReady - intentStart);
      streams.composer = prefixOf(questionText, fraction);
    } else {
      streams.composer = "";
    }
  }
  const detail = detailFor(state);
  if (detail.intro) streams.intro = detailCopy.intro;
  if (detail.question) streams.question = detailCopy.question;
  if (detail.work) streams.work = detailCopy.work;
  if (detail.evidence) streams.evidence = detailCopy.evidence;
  return streams;
}

function messagesFor(state: WorldState): number {
  let count = 0;
  if (state.sentTasks.some((task) => task.id === "task-g1")) count = 2;
  if (state.visibleGroupIds.includes("G1")) count = 3;
  if (state.sentTasks.some((task) => task.id === "task-g2") || state.selectedDirectionId === "d-consistency") count = 5;
  if (state.visibleGroupIds.includes("G2")) count = 6;
  if (state.visibleGroupIds.includes("G3")) count = 8;
  if (state.evidenceIds.includes("E01")) count = 9;
  if (state.coverageRevisions.length > 0) count = 10;
  if (state.openQuestionId) count = 11;
  if (state.openQuestionStatus === "selected-for-investigation") count = 12;
  return count;
}

function checklistFor(state: WorldState): CheckState[] {
  return [
    state.coverageRevisions.some((item) => item.counterexampleId === "CE01") ? "pass" : "pending",
    state.coverageRevisions.some((item) => item.counterexampleId === "CE02") ? "pass" : "pending",
    state.evidenceIds.includes("E03") || state.openQuestionId ? "hold" : "pending",
  ];
}

function timerFor(state: WorldState, t: number): number {
  const inflight = state.sentTasks.find((task) => task.completedAt === null);
  if (!inflight) {
    if (state.sentTasks.length === 0) return 0;
    return Math.max(0, Math.round((t - state.sentTasks[state.sentTasks.length - 1]!.sentAt) / 1000));
  }
  return Math.max(1, Math.round((t - inflight.sentAt) / 1000));
}

export function projectShell(state: WorldState): ScenarioState {
  const t = state.t;
  const phase = sceneIndexAt(t);
  const scene = demoScenes[phase];
  const span = Math.max(1, scene.checkpointMs - scene.startMs);
  const phaseProgress = Math.min(1, Math.max(0, (t - scene.startMs) / span));
  const world = state;
  const paperVisible = world.counts.discovered > 0;
  return {
    phase,
    phaseProgress,
    caption: scene.caption,
    messages: messagesFor(world),
    streams: streamsFor(world, t),
    timer: timerFor(world, t),
    context: Math.min(24, 6 + world.counts.discovered * 2 + world.visibleGroupIds.length),
    tree: treeFor(world),
    current: currentFor(world),
    focus: focusFor(world),
    detail: detailFor(world),
    paper: paperVisible,
    session: world.sentTasks.length > 0,
    canvasCount: world.counts.discovered,
    checklist: checklistFor(world),
    candidate: world.openQuestionStatus === "selected-for-investigation",
    processingMeta: processingMetaOf(world),
  };
}

/** Absolute-time sampling used by the clock. t is seconds; internally evaluated in ms. */
export function sampleAtElapsed(elapsedSeconds: number): ScenarioState {
  const ms = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds * 1000) : 0;
  return projectShell(stateAt(videoIdentityWorld, demoTimeline, ms));
}

/**
 * Integer N is the readable checkpoint of scene N.
 * This is not a phase-start interpolator: N + ε does not rewind to the start of N.
 * Use sampleAtElapsed for continuous playback and mid-scene frames.
 */
export function sampleScenario(phaseIndex: number): ScenarioState {
  const index = Number.isFinite(phaseIndex) ? Math.max(0, Math.min(demoScenes.length - 1, Math.round(phaseIndex))) : 0;
  return sampleAtElapsed(phaseCheckpoint(index));
}

export const authorNames: Record<Role, string> = {
  user: "研究者",
  lead: "Explore",
  gap: "材料覆盖",
  innovator: "补查修订",
  reviewer: "问题成形",
};

export const conversation: ReadonlyArray<{ role: Role; text: string }> = [
  { role: "user", text: questionText },
  { role: "lead", text: "已准备 Explore 任务。当前开放的是 Explore；Deep Dive、Deep Research 仍锁定，不会在本演示里执行。发送后才会开始。" },
  { role: "lead", text: "G1 已到：生成一致性 / 可控生成 / 叙事结构。这是主题起始的根方向组，没有父方向。" },
  { role: "user", text: "选择生成一致性，继续细分。" },
  { role: "lead", text: "已准备在「生成一致性」上继续 Explore，并引用 G1 与该方向的双 revision。请发送。" },
  { role: "lead", text: "G2 已到：主体身份 / 场景一致性 / 运动一致性。" },
  { role: "user", text: "主体身份，尤其是跨镜头时的身份保持。" },
  { role: "lead", text: "G3 已到：跨镜头身份保持 / 多人身份区分 / 风格变化下身份保持。未选分支仍保留。" },
  { role: "lead", text: `已阅读演示文献 P01、P02。${e01.claim} ${covShort.statement}` },
  { role: "innovator", text: `${ce01.reason} 随后 P03 也修正了「当前材料尚未纳入复杂场景」的覆盖记录。旧判断被保留。` },
  { role: "reviewer", text: oq.question },
  { role: "user", text: "将问题标为待调查。下一步在相同预算下比较两种更新策略，并核对这些演示材料中的失败案例。" },
];

export const paperRef = {
  title: p01.title,
  meta: "CoResearch Demo · 合成教学数据 · 非真实论文",
  tag: p01.demoTag,
};

export const mechPremises: ReadonlyArray<{ label: string; state: "pass" | "hold" }> = [
  { label: "来源是跟踪任务", state: "pass" },
  { label: "有外部观测这一设定", state: "pass" },
  { label: "生成任务是否适用", state: "hold" },
];

export const checklistLabels: readonly string[] = [
  "P05 修正了“仅掌握短片段证据”的覆盖记录",
  "P03 修正了“尚未纳入复杂场景”的覆盖记录",
  "固定预算下的策略比较仍待进行（本轮缺口，非全球缺口）",
];

export const sidebarCopy = {
  nav: ["首页", "搜索", "论文雷达", "浏览"],
  newSession: "+ 新建会话",
  projectsLabel: "项目",
  project: "视频生成研究",
  projectMeta: "演示会话",
  session: "跨镜头身份保持",
  olderSession: "生成一致性初探",
  canvas: "画布",
  user: "演示",
};
export const topbarCopy = {
  breadcrumb: "CoResearch / 视频生成研究",
  likesLabel: "赞",
  likes: 0,
  modelShort: "离线演示",
};
export const shellCopy = {
  modelChip: "离线演示 · 无真实模型请求",
  autoChip: "Auto ▾",
  tasksChip: "任务 · Explore",
  contextPrefix: "上下文",
  processingPrefix: "演示计时",
  processingMeta: "· 演示节奏 / 等待已压缩",
  graphTitle: "对话研究图谱",
  graphChips: ["通用", "折叠"],
  reviewTitle: "覆盖修订 · 教学记录",
  mentionChip: "@ 细化方向",
  mentionBody: "本轮的出发点：跨镜头时的主体身份保持（合成教学数据）",
};
export const mentionBefore = 3;
export const processingAfter = 7;
export const reviewAfter = 10;
