import type { SceneScript } from "./domain";
import type { DemoEvent, DemoTimeline } from "./events";
import { counterexampleById } from "./fixtures/video-identity";
import { INTEREST_PROMPT } from "./fixtures/video-identity";

const CE01 = counterexampleById.get("CE01")!;
const CE02 = counterexampleById.get("CE02")!;

/**
 * Compressed teaching timeline in absolute milliseconds.
 * Three Explore rounds each keep prepare → send → result causality.
 * Playback may be shorter than a real run; labels mark the wait as compressed.
 */
export const DEMO_DURATION_MS = 36000;

export const demoEvents: readonly DemoEvent[] = [
  { id: "ev-prepare-g1", t: 3600, type: "prepare_task", task: "explore", prompt: INTEREST_PROMPT },
  { id: "ev-send-g1", t: 4200, type: "send_task", taskId: "task-g1" },
  { id: "ev-progress-g1", t: 4500, type: "task_progress", taskId: "task-g1", label: "正在整理候选方向" },
  { id: "ev-g1-arrived", t: 5200, type: "direction_group_arrived", groupId: "G1", taskId: "task-g1" },
  { id: "ev-g1-complete", t: 5200, type: "task_complete", taskId: "task-g1" },
  { id: "ev-select-consistency", t: 7800, type: "select_direction", directionId: "d-consistency" },
  {
    id: "ev-prepare-g2",
    t: 8400,
    type: "prepare_task",
    task: "explore",
    prompt: "在生成一致性下继续细分",
    parentDirectionId: "d-consistency",
  },
  { id: "ev-send-g2", t: 9000, type: "send_task", taskId: "task-g2" },
  { id: "ev-progress-g2", t: 9300, type: "task_progress", taskId: "task-g2", label: "正在继续细分方向" },
  { id: "ev-g2-arrived", t: 10000, type: "direction_group_arrived", groupId: "G2", taskId: "task-g2" },
  { id: "ev-g2-complete", t: 10000, type: "task_complete", taskId: "task-g2" },
  { id: "ev-select-identity", t: 12800, type: "select_direction", directionId: "d-identity" },
  {
    id: "ev-prepare-g3",
    t: 13400,
    type: "prepare_task",
    task: "explore",
    prompt: "在主体身份下继续细分",
    parentDirectionId: "d-identity",
  },
  { id: "ev-send-g3", t: 14000, type: "send_task", taskId: "task-g3" },
  { id: "ev-progress-g3", t: 14300, type: "task_progress", taskId: "task-g3", label: "正在展开更细的方向" },
  { id: "ev-g3-arrived", t: 15000, type: "direction_group_arrived", groupId: "G3", taskId: "task-g3" },
  { id: "ev-g3-complete", t: 15000, type: "task_complete", taskId: "task-g3" },
  { id: "ev-select-crossshot", t: 16800, type: "select_direction", directionId: "d-crossshot" },

  { id: "ev-discover-p01", t: 17600, type: "discover_paper", paperId: "P01" },
  { id: "ev-abstract-p01", t: 17800, type: "browse_abstract", paperId: "P01" },
  { id: "ev-read-p01", t: 18400, type: "read_full_text", paperId: "P01" },
  { id: "ev-open-p01", t: 18400, type: "open_paper", paperId: "P01", level: "full-text" },
  { id: "ev-discover-p02", t: 19200, type: "discover_paper", paperId: "P02" },
  { id: "ev-abstract-p02", t: 19400, type: "browse_abstract", paperId: "P02" },
  { id: "ev-read-p02", t: 20000, type: "read_full_text", paperId: "P02" },
  { id: "ev-open-p02", t: 20000, type: "open_paper", paperId: "P02", level: "full-text" },
  { id: "ev-form-e01", t: 20800, type: "form_evidence", evidenceId: "E01" },
  { id: "ev-cov-short", t: 21400, type: "set_coverage", recordId: "cov-short-visible" },
  { id: "ev-reopen-p01", t: 22000, type: "open_paper", paperId: "P01", level: "full-text" },

  { id: "ev-discover-p05", t: 23600, type: "discover_paper", paperId: "P05" },
  { id: "ev-abstract-p05", t: 23800, type: "browse_abstract", paperId: "P05" },
  { id: "ev-read-p05", t: 24600, type: "read_full_text", paperId: "P05" },
  { id: "ev-open-p05", t: 24600, type: "open_paper", paperId: "P05", level: "full-text" },
  {
    id: "ev-ce01",
    t: 25200,
    type: "revise_coverage",
    recordId: "cov-long-included",
    previousRecordId: "cov-short-visible",
    reason: CE01.reason,
    counterexampleId: "CE01",
  },
  { id: "ev-discover-p03", t: 25800, type: "discover_paper", paperId: "P03" },
  { id: "ev-abstract-p03", t: 26000, type: "browse_abstract", paperId: "P03" },
  { id: "ev-read-p03", t: 26800, type: "read_full_text", paperId: "P03" },
  { id: "ev-open-p03", t: 26800, type: "open_paper", paperId: "P03", level: "full-text" },
  {
    id: "ev-ce02",
    t: 27400,
    type: "revise_coverage",
    recordId: "cov-complex-included",
    previousRecordId: "cov-short-visible",
    reason: CE02.reason,
    counterexampleId: "CE02",
  },
  { id: "ev-form-e02", t: 28000, type: "form_evidence", evidenceId: "E02" },
  { id: "ev-discover-p04", t: 28600, type: "discover_paper", paperId: "P04" },
  { id: "ev-abstract-p04", t: 28800, type: "browse_abstract", paperId: "P04" },
  { id: "ev-read-p04", t: 29400, type: "read_full_text", paperId: "P04" },
  { id: "ev-open-p04", t: 29400, type: "open_paper", paperId: "P04", level: "full-text" },
  { id: "ev-discover-p06", t: 29800, type: "discover_paper", paperId: "P06" },
  { id: "ev-abstract-p06", t: 30000, type: "browse_abstract", paperId: "P06" },
  { id: "ev-read-p06", t: 30600, type: "read_full_text", paperId: "P06" },
  { id: "ev-open-p06", t: 30600, type: "open_paper", paperId: "P06", level: "full-text" },

  { id: "ev-form-e03", t: 31800, type: "form_evidence", evidenceId: "E03" },
  { id: "ev-form-oq", t: 32400, type: "form_open_question", questionId: "oq-identity-budget" },
  { id: "ev-select-oq", t: 34500, type: "select_question", questionId: "oq-identity-budget", status: "selected-for-investigation" },
];

export const demoTimeline: DemoTimeline = {
  events: demoEvents,
  durationMs: DEMO_DURATION_MS,
};

export const demoScenes: readonly SceneScript[] = [
  {
    sceneId: "intent",
    action: "type_and_prepare_explore",
    targetId: "d-video",
    startMs: 0,
    checkpointMs: 4200,
    focusIds: ["d-video"],
    caption: {
      tag: "INTENT",
      title: "发起 · 准备并发送 Explore",
      body: "研究者写下预置兴趣，系统先准备 Explore 任务；点击 Send 之后才会执行。等待已按演示节奏压缩。",
    },
    readingHold: false,
  },
  {
    sceneId: "g1",
    action: "receive_direction_group",
    targetId: "G1",
    startMs: 4200,
    checkpointMs: 7600,
    focusIds: ["G1", "d-consistency", "d-controllable", "d-narrative"],
    caption: {
      tag: "EXPLORE · G1",
      title: "收到第一组候选方向",
      body: "G1 给出生成一致性、可控生成与叙事结构。这是主题起始的根方向组，不带父方向。",
    },
    readingHold: true,
  },
  {
    sceneId: "g2",
    action: "refine_direction",
    targetId: "G2",
    startMs: 7800,
    checkpointMs: 12600,
    focusIds: ["G2", "d-identity", "d-scene", "d-motion"],
    caption: {
      tag: "EXPLORE · G2",
      title: "在生成一致性下继续细分",
      body: "选择生成一致性并再次发送后，G2 给出主体身份、场景一致性与运动一致性，并固定引用 G1 与该方向的双 revision。",
    },
    readingHold: true,
  },
  {
    sceneId: "g3",
    action: "refine_direction",
    targetId: "G3",
    startMs: 12800,
    checkpointMs: 16600,
    focusIds: ["G3", "d-crossshot", "d-multi-person", "d-style"],
    caption: {
      tag: "EXPLORE · G3",
      title: "在主体身份下继续细分",
      body: "G3 给出跨镜头身份保持等子方向，并固定引用 G2 与主体身份的双 revision。未选分支仍保留。",
    },
    readingHold: true,
  },
  {
    sceneId: "evidence",
    action: "read_conditional_evidence",
    targetId: "E01",
    startMs: 16800,
    checkpointMs: 22400,
    focusIds: ["d-crossshot", "P01", "P02", "E01", "cov-short-visible"],
    caption: {
      tag: "EVIDENCE",
      title: "阅读有条件的基础证据",
      body: "打开演示文献 P01、P02 后形成 E01：身份约束在短片段、主体持续可见的条件下有支持，不能外推其他条件。",
    },
    readingHold: true,
  },
  {
    sceneId: "revision",
    action: "revise_coverage",
    targetId: "CE01",
    startMs: 22400,
    checkpointMs: 31200,
    focusIds: ["P05", "P03", "CE01", "CE02", "E02", "P04", "P06"],
    caption: {
      tag: "REVISION",
      title: "补查之后修订覆盖",
      body: "P05 与 P03 进入材料后，原先“仅掌握短片段 / 尚未纳入复杂场景”的覆盖记录被修正。旧判断与修订原因一并保留。",
    },
    readingHold: true,
  },
  {
    sceneId: "open-question",
    action: "form_open_question",
    targetId: "oq-identity-budget",
    startMs: 31200,
    checkpointMs: 34500,
    focusIds: ["oq-identity-budget", "E03", "L01", "L02"],
    caption: {
      tag: "OPEN QUESTION",
      title: "形成可调查的完整问题",
      body: "问题收窄为固定预算下，遮挡→硬切→重新出现时两种更新策略的比较。完整正文会停住供阅读，不会自动清空重播。",
    },
    readingHold: true,
  },
];

export function sceneById(id: string): SceneScript {
  const scene = demoScenes.find((item) => item.sceneId === id);
  if (!scene) throw new Error(`Unknown demo scene: ${id}`);
  return scene;
}

export function sceneIndexAt(t: number): number {
  const time = Number.isFinite(t) ? Math.max(0, t) : 0;
  // A timestamp that is exactly a scene checkpoint belongs to that scene, even
  // when the next scene starts at the same millisecond. seekToScene relies on this.
  for (let i = demoScenes.length - 1; i >= 0; i -= 1) {
    if (demoScenes[i].checkpointMs === time) return i;
  }
  let index = 0;
  for (let i = 0; i < demoScenes.length; i += 1) {
    if (time >= demoScenes[i].startMs) index = i;
  }
  return index;
}
