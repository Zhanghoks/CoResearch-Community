import type { SceneScript } from "../domain";
import type { DemoEvent, DemoTimeline } from "../events";
import { demoEvents, demoScenes } from "../timeline";

/** Product-page runtime (~72s) with reading holds. Does not replace the 36s kernel timeline. */
export const PRODUCT_RUNTIME_DURATION_MS = 72000;

function scale(ms: number): number {
  return Math.round((ms / 36000) * 69000);
}

export const productRuntimeEvents: readonly DemoEvent[] = [
  ...demoEvents.map((event) => ({ ...event, t: scale(event.t) })),
  {
    id: "ev-add-crossshot-context",
    t: 70000,
    type: "add_context",
    directionId: "d-crossshot",
  },
];

export const productRuntimeTimeline: DemoTimeline = {
  events: productRuntimeEvents,
  durationMs: PRODUCT_RUNTIME_DURATION_MS,
};

export const productRuntimeScenes: readonly SceneScript[] = [
  {
    ...demoScenes[0],
    startMs: 0,
    checkpointMs: scale(4200),
    caption: {
      tag: "INTENT",
      title: "发起 · 准备并发送 Explore",
      body: "研究者写下预置兴趣，系统先准备 Explore 任务；点击 Send 之后才会执行。等待已按演示节奏压缩。",
    },
  },
  { ...demoScenes[1], startMs: scale(4200), checkpointMs: scale(7600) },
  { ...demoScenes[2], startMs: scale(7800), checkpointMs: scale(12600) },
  { ...demoScenes[3], startMs: scale(12800), checkpointMs: scale(16600) },
  {
    sceneId: "graph-detail",
    action: "open_research_graph",
    targetId: "d-crossshot",
    startMs: scale(16800),
    checkpointMs: scale(18400),
    focusIds: ["d-crossshot", "graph", "question"],
    caption: {
      tag: "GRAPH",
      title: "图谱与方向详情联动",
      body: "打开研究图谱并选中「跨镜头身份保持」。介绍、父组与论文都对应该方向，而不是另一套数据。",
    },
    readingHold: true,
  },
  {
    ...demoScenes[4],
    sceneId: "evidence",
    startMs: scale(18400),
    checkpointMs: scale(31200),
    focusIds: ["P02", "P01", "P05", "P03", "E01", "CE01"],
    caption: {
      tag: "EVIDENCE",
      title: "阅读论文依据并修订覆盖",
      body: "打开演示文献 P02 等查看条件与片段，再纳入 P05、P03 的修订。阅读状态与计数一致，仅摘要文献不会被标成已深读。",
    },
    readingHold: true,
  },
  { ...demoScenes[6], startMs: scale(31200), checkpointMs: scale(34500) },
  {
    sceneId: "next-step",
    action: "add_context_and_hold",
    targetId: "d-crossshot",
    startMs: 69000,
    checkpointMs: 72000,
    focusIds: ["composer", "draft", "d-crossshot"],
    caption: {
      tag: "NEXT",
      title: "引用方向并写下追问",
      body: "将「跨镜头身份保持」加入上下文作为引用，草稿保留。Add as context 不会启动新的运行，结尾停住，可重播。",
    },
    readingHold: true,
  },
];

export function productSceneIndexAt(t: number): number {
  const time = Number.isFinite(t) ? Math.max(0, t) : 0;
  for (let i = productRuntimeScenes.length - 1; i >= 0; i -= 1) {
    if (productRuntimeScenes[i].checkpointMs === time) return i;
  }
  let index = 0;
  for (let i = 0; i < productRuntimeScenes.length; i += 1) {
    if (time >= productRuntimeScenes[i].startMs) index = i;
  }
  return index;
}

export function productPhaseCheckpointMs(index: number): number {
  const scene = productRuntimeScenes[Math.max(0, Math.min(productRuntimeScenes.length - 1, index))];
  return scene.checkpointMs;
}
