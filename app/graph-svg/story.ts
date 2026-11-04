import { nodeAt } from "./mock-world";
import type { Pose, StoryChapter } from "./types";

const initial: Pose = {
  cx: 720, cy: 425, zoom: 1, base: 1, ring: 0, papers: 0, lineage: 0,
  core: 0, frontier: 0, margin: 0, boundary: 0, idea: 0, intent: 0,
  explore: 0, gap: 0, transfer: 0, candidate: 0,
  markerX: nodeAt("video").x, markerY: nodeAt("video").y,
};
const entries: Array<Omit<StoryChapter, "pose"> & { pose: Partial<Pose> }> = [
  { id: "graph", tag: "A CONNECTED WORLD", title: "先看到一张图", body: "一个节点，一份研究；一条连线，一种联系。它们一起形成一张庞大而持续生长的知识网络。", takeaway: "先有相互关联的研究，再从中看见领域。", pose: {} },
  { id: "world", tag: "RESEARCH WORLD", title: "这就是研究世界", body: "自然科学、工程、社会科学与人文并非孤岛。问题、方法与证据跨越领域，构成我们探索的共同基础。", takeaway: "Research World 包含文献空间与想法空间。", pose: { ring: 1 } },
  { id: "literature", tag: "LITERATURE SPACE", title: "每项工作，都有来处", body: "把镜头靠近：一份工作提出问题，另一份改进方法，后续工作再比较与验证。文献空间记录这些可追溯的联系。", takeaway: "连线可表示引用、改进或比较，不代表所有研究都是单线继承。", pose: { base: .24, papers: 1, lineage: 1, cx: 740, cy: 460, zoom: 1.5 } },
  { id: "core", tag: "CORE", title: "成熟知识，构成核心", body: "在同一个局部方向里，较成熟的方法与较充分的证据构成研究基础。核心并不意味着这里已经没有新问题。", takeaway: "色块描述局部证据状态，不是把整个学科划为成熟或不成熟。", pose: { cx: 430, cy: 435, zoom: 1.5, base: .6, lineage: .2, papers: .45, core: 1 } },
  { id: "frontier", tag: "ACTIVE FRONTIER", title: "沿着工作，来到前沿", body: "已有问题继续催生新方法与新比较。这里的知识仍在快速演进，结论和适用条件需要持续核查。", takeaway: "从研究历史走向最新进展，而不是仅按节点位置判断前沿。", pose: { cx: 810, cy: 420, zoom: 1.35, core: .32, frontier: 1 } },
  { id: "margin", tag: "MARGIN & BOUNDARY", title: "边界附近，还有未知", body: "一些限制尚未被充分解决。虚线表示这个方向当前可确认的证据边界；它会随新的工作发生变化。", takeaway: "没检索到，不等于没人研究。边界判断也需要证据。", pose: { cx: 1090, cy: 430, zoom: 1.5, core: .22, frontier: .35, margin: 1, boundary: 1 } },
  { id: "idea", tag: "IDEA SPACE", title: "你的想法，也在图谱里", body: "金色标记表示当前聚焦的位置，蓝色虚线表示下一步探索倾向。你的已知、未知与研究构想，会随着文献反馈变化。", takeaway: "Idea State 是研究状态；图上的点只是它的位置投影。", pose: { cx: 400, cy: 405, zoom: 1.35, core: 0, frontier: 0, margin: 0, boundary: 0, papers: 0, lineage: 0, base: .7, idea: 1, intent: 1 } },
  { id: "explore-domain", tag: "EXPLORE · 选择方向", title: "先找真正感兴趣的分支", body: "演示：从「视频生成」出发，选择「生成一致性」，再聚焦「主体身份」。未选择的研究仍在原处，不会被删除。", takeaway: "Explore 只定位兴趣，不提前生成方法、基线或研究 Gap。", pose: { cx: 420, cy: 380, zoom: 1.9, base: .16, explore: .5, intent: 0, markerX: nodeAt("subject").x, markerY: nodeAt("subject").y } },
  { id: "explore-focus", tag: "EXPLORE · 继续细分", title: "逐步聚焦到一个具体点", body: "继续选择「跨镜头」，最终关注「动作变化时的身份保持」。用户明确认领这个方向后，才进入更深入的研究。", takeaway: "定位一个值得深入的问题，就是 Explore 的终点。", pose: { cx: 690, cy: 350, zoom: 2, explore: 1, markerX: nodeAt("motion").x, markerY: nodeAt("motion").y } },
  { id: "dive", tag: "DEEP DIVE", title: "理解这个点的前后脉络", body: "沿相关论文向前追溯、向后比较：问题如何提出，方法怎样演进，实验支持了什么，又留下了哪些限制？", takeaway: "展开已有工作的上下文，逐步触及局部研究边界。", pose: { cx: 770, cy: 455, zoom: 1.55, explore: .18, lineage: 1, papers: 1, boundary: 1, margin: .24, markerX: nodeAt("paper-frontier").x, markerY: nodeAt("paper-frontier").y } },
  { id: "gap", tag: "DEEP RESEARCH · GAP FINDER", title: "把限制变成可核查的问题", body: "Gap Finder 比较最接近的已有方法，寻找具体不足，同时检查可能推翻判断的反例。图中只展示一个待核实的缺口。", takeaway: "候选 Gap 不是已证实的研究空白。", pose: { cx: 1075, cy: 385, zoom: 1.9, gap: 1, markerX: nodeAt("gap").x, markerY: nodeAt("gap").y } },
  { id: "transfer", tag: "DEEP RESEARCH · INNOVATOR", title: "去别处，寻找可迁移的机制", body: "Innovator 从其他研究群落寻找类似挑战与解决机制。将来源方法与目标问题连接起来，再检查迁移前提和失败风险。", takeaway: "跨领域的连线代表候选迁移，不是已经验证的有效方法。", pose: { cx: 820, cy: 490, zoom: 1.4, transfer: 1, lineage: .4, papers: .45 } },
  { id: "candidate", tag: "IDEA ITERATION", title: "在前人基础上，迈出下一步", body: "经综合与审查，形成边界之外的候选方法。旧轨迹仍被保留；只有经过近邻工作核查与实验，才能判断是否真正推进了边界。", takeaway: "提出方案不等于取得突破。下一轮研究仍由用户决定。", pose: { cx: 1140, cy: 370, zoom: 1.7, candidate: 1, base: .45, markerX: nodeAt("candidate").x, markerY: nodeAt("candidate").y } },
];
let previous = initial;
export const chapters: readonly StoryChapter[] = entries.map((entry) => {
  previous = { ...previous, ...entry.pose };
  return { ...entry, pose: previous };
});

/** Pure evaluation: the same progress always yields the same scene, in either direction. */
export function sampleStory(progress: number): { pose: Pose; active: number } {
  const p = Number.isFinite(progress) ? Math.min(chapters.length - 1, Math.max(0, progress)) : 0;
  const from = Math.floor(p), to = Math.min(from + 1, chapters.length - 1);
  const t = p - from, eased = t * t * (3 - 2 * t);
  const pose = { ...chapters[from].pose };
  for (const key of Object.keys(pose) as Array<keyof Pose>) {
    pose[key] += (chapters[to].pose[key] - pose[key]) * eased;
  }
  // Follow the actual, explicitly defined Explore route rather than cutting across it.
  const path = from === 6 ? ["video", "consistency", "subject"] : from === 7 ? ["subject", "multi-shot", "motion"] : null;
  if (path) {
    const segment = Math.min(1, Math.floor(eased * 2));
    const local = Math.min(1, eased * 2 - segment);
    const a = nodeAt(path[segment]), b = nodeAt(path[segment + 1]);
    pose.markerX = a.x + (b.x - a.x) * local;
    pose.markerY = a.y + (b.y - a.y) * local;
  }
  return { pose, active: Math.round(p) };
}

export function cameraTransform(pose: Pose): string {
  return `translate(${720 - pose.cx * pose.zoom} ${425 - pose.cy * pose.zoom}) scale(${pose.zoom})`;
}
