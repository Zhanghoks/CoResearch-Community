import { INTEREST_PROMPT, videoIdentityWorld } from "../fixtures/video-identity";
import { stateAt } from "../evaluate";
import { demoEvents } from "../timeline";
import type { DemoTimeline } from "../events";
import { snapshotFromWorld } from "../viewer/snapshot";
import type { ViewerSnapshot } from "../viewer/protocol";

export const homeTimeline: DemoTimeline = {
  events: demoEvents.filter(({ t }) => t <= 20800),
  durationMs: 25500,
};

export const homeScenes = [
  { id: "ask", start: 0, result: 3700, title: "输入兴趣，准备 Explore", detail: "说清你感兴趣的领域。准备任务不等于已发送。", focus: ["composer"] },
  { id: "directions", start: 4200, result: 6400, title: "发送，看到候选方向", detail: "先比较候选方向，再选最值得追的一条。", focus: ["G1"] },
  { id: "refine", start: 7800, result: 15700, title: "沿一个方向继续细分", detail: "从生成一致性缩小到跨镜头的身份保持。原方向仍然保留。", focus: ["G2", "G3", "graph"] },
  { id: "evidence", start: 16800, result: 21600, title: "打开论文，核对适用条件", detail: "区分切镜前后持续可见与遮挡后重现，别把已有结论用错地方。", focus: ["preview", "P02"] },
] as const;

export type HomeScene = typeof homeScenes[number]["id"];

export function homeSceneAt(t: number) {
  return [...homeScenes].reverse().find((scene) => t >= scene.start) ?? homeScenes[0];
}

const letters = Array.from(INTEREST_PROMPT);

export function homeFrameSignal(t: number, layout: ViewerSnapshot["layout"]) {
  const scene = homeSceneAt(t);
  const sent = t >= 4200;
  const draft = sent ? "" : letters.slice(0, Math.floor(Math.max(0, t - 430) / 85)).join("");
  const key = [layout, scene.id, draft, homeTimeline.events.filter((event) => event.t <= t).length].join("\u241f");
  return { key, scene, draft };
}

export function homeCueAt(t: number) {
  if (t >= 20000) return "P02 全文可用 · 打开切镜条件";
  if (t >= 18400) return "打开代表论文 · 查看阅读状态";
  if (t >= 16800) return "选中「跨镜头身份保持」";
  if (t >= 15000) return "第三轮方向已出现 · 保留父级";
  if (t >= 14000) return "发送第三轮 Explore";
  if (t >= 13400) return "准备细分「主体身份」";
  if (t >= 12800) return "选中「主体身份」";
  if (t >= 10000) return "第二轮方向已出现";
  if (t >= 9000) return "发送第二轮 Explore";
  if (t >= 8400) return "准备细分「生成一致性」";
  if (t >= 7800) return "选中「生成一致性」";
  if (t >= 5200) return "返回第一组候选方向";
  if (t >= 4200) return "发送第一轮 Explore";
  if (t >= 3600) return "已准备 Explore · 尚未发送";
  return "输入示例研究兴趣";
}

export function homeFrame(t: number, layout: ViewerSnapshot["layout"], generation: number) {
  const { key, scene, draft } = homeFrameSignal(t, layout);
  const state = stateAt(videoIdentityWorld, homeTimeline, t);
  return {
    key,
    scene,
    snapshot: snapshotFromWorld(videoIdentityWorld, state, homeTimeline, {
      generation,
      layout,
      draft,
      focusIds: scene.focus,
      mobilePane: t >= 18400 ? "preview" : t >= 5200 ? "directions" : "composer",
    }),
  };
}
