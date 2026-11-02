import { nodeAt } from "./mock-world";
import type { Pose, StoryChapter } from "./types";
const initial: Pose = {
  cx: 720, cy: 425, zoom: 1, base: 1, growth: 0, domains: 0, slice: 0, ring: 0, papers: 0, lineage: 0,
  core: 0, frontier: 0, margin: 0, boundary: 0, idea: 0, intent: 0, explore: 0, gap: 0, transfer: 0, candidate: 0,
  markerX: nodeAt("video").x, markerY: nodeAt("video").y,
};
const entries: Array<Omit<StoryChapter, "pose"> & { pose: Partial<Pose> }> = [
  { id: "blank", tag: "01 / 从前人的工作开始", title: "研究，从来不是凭空开始", body: "先留下一张空白的地图。接下来，看一项工作如何成为另一项工作的起点。", takeaway: "一个节点代表一项工作，一条连接代表研究之间的联系。", pose: {} },
  { id: "seed", tag: "01 / 一项已有研究", title: "先有一项工作", body: "它提出问题、尝试方法，也留下可以继续追问的地方。", takeaway: "每个新的想法，都有可以回溯的来处。", pose: { growth: .13, zoom: 1.65 } },
  { id: "growth", tag: "01 / 研究不断延伸", title: "后来者，接着向前走", body: "改进、比较、验证，再分出新的方向。相互连接的工作，逐渐展开成一张知识图谱。", takeaway: "这是关系示意，不是真实论文的引用结论。", pose: { growth: 1, zoom: 1 } },
  { id: "core", tag: "02 / 由内向外的层次", title: "最里面，是已有的基础", body: "较成熟的方法与较充分的证据形成核心。它托住后续探索，却不意味着没有新问题。", takeaway: "环层描述局部研究的成熟程度，不是论文的新旧或价值排名。", pose: { ring: 1, core: 1, base: .7 } },
  { id: "frontier", tag: "02 / 由内向外的层次", title: "往外，是活跃的研究前沿", body: "新的方法不断出现，结论还在比较和检验之中。", takeaway: "核心、前沿和边缘属于同一张连续的地图。", pose: { frontier: 1 } },
  { id: "margin", tag: "02 / 由内向外的层次", title: "再往外，仍有待解的问题", body: "接近证据边界，工作更稀疏，结论更不确定。边界之外，不等于无人研究。", takeaway: "虚线是当前证据的边界，不是已经证实的空白。", pose: { margin: 1, boundary: 0 } },
  { id: "domains", tag: "03 / 不同领域，同一世界", title: "不同 domain，展开不同方向", body: "视觉、生命、语言、数学……沿不同方向展开，各自都有核心与前沿，也会彼此连接。", takeaway: "方向区分领域，距离描述成熟程度；领域之间并非互斥。", pose: { domains: 1, base: .55 } },
  { id: "slice", tag: "04 / 进入一个局部切片", title: "走进「视觉与生成」这一片", body: "沿着高亮方向靠近。世界没有换掉，只是镜头进入其中一块切片。", takeaway: "从左侧的核心出发，向右走向前沿与未知。", pose: { slice: 1, domains: 0, cx: 1050, cy: 438, zoom: 1.95, base: .12, lineage: 1, papers: 1, boundary: 1 } },
  { id: "lineage", tag: "04 / 沿一条研究线路", title: "从基础工作，走到最新证据", body: "A 提供基础，B 改进方法，C 比较证据，D 暴露适用条件。先理解已有工作，再讨论下一步。", takeaway: "高亮的是一条示意脉络，不是所有研究的单线继承。", pose: { cx: 1060, cy: 455, zoom: 1.85 } },
  { id: "idea", tag: "05 / 你的 IDEA", title: "你的想法，落在这条路上", body: "金色标记是当前研究位置。它不是凭空漂浮，而是从已有知识中选择一个起点。", takeaway: "Idea State 是研究状态；地图只展示它的位置。", pose: { idea: 1, intent: 1, lineage: .3, papers: .65 } },
  { id: "explore-domain", tag: "05 / EXPLORE", title: "先选方向，再聚焦问题", body: "从视频生成，进入生成一致性，再找到主体身份。没有选择的方向仍留在地图中。", takeaway: "Explore 定位兴趣，不提前宣称发现研究 Gap。", pose: { intent: 0, explore: .5, markerX: nodeAt("subject").x, markerY: nodeAt("subject").y } },
  { id: "explore-focus", tag: "05 / EXPLORE", title: "找到值得深入的具体点", body: "继续聚焦跨镜头，以及动作变化时的身份保持。由你确认，是否沿这个方向深入。", takeaway: "兴趣逐步收敛，不是一步跳到一个答案。", pose: { explore: 1, markerX: nodeAt("motion").x, markerY: nodeAt("motion").y } },
  { id: "dive", tag: "06 / DEEP DIVE", title: "把问题放回文献脉络", body: "回看基础，比较邻近方法，检查实验与限制。理解这条线路为什么走到了这里。", takeaway: "先建立证据，再判断哪里值得推进。", pose: { explore: .15, lineage: 1, papers: 1, markerX: nodeAt("paper-frontier").x, markerY: nodeAt("paper-frontier").y } },
  { id: "gap", tag: "06 / GAP FINDER", title: "让限制，成为可核查的问题", body: "比较最接近的工作，标出候选缺口，同时寻找可能推翻判断的反例。", takeaway: "候选 Gap 仍待验证，不等于已经发现研究空白。", pose: { gap: 1, markerX: nodeAt("gap").x, markerY: nodeAt("gap").y } },
  { id: "transfer", tag: "06 / INNOVATOR", title: "从另一领域，借来一种机制", body: "保留目标问题，连接其他领域的机制。先检查迁移前提，再提出方案。", takeaway: "这条跨域连接是迁移候选，并非有效性证明。", pose: { transfer: 1, cx: 1060, cy: 480, zoom: 1.65, lineage: .5 } },
  { id: "candidate", tag: "07 / 继续向前", title: "在前人的基础上，迈出下一步", body: "一个候选方法延伸出来。原来的工作和探索轨迹仍在，下一步是审查与实验。", takeaway: "提出方案不等于突破；是否推进边界，仍需证据。", pose: { candidate: 1, cx: 1090, cy: 465, zoom: 1.65, markerX: nodeAt("candidate").x, markerY: nodeAt("candidate").y } },
];
let previous = initial;
export const chapters: readonly StoryChapter[] = entries.map(entry => { previous = { ...previous, ...entry.pose }; return { ...entry, pose: previous }; });
export function sampleStory(progress: number): { pose: Pose; active: number } {
  const p = Number.isFinite(progress) ? Math.min(chapters.length - 1, Math.max(0, progress)) : 0;
  const from = Math.floor(p), to = Math.min(from + 1, chapters.length - 1);
  const t = p - from, eased = t * t * (3 - 2 * t);
  const pose = { ...chapters[from].pose };
  for (const key of Object.keys(pose) as Array<keyof Pose>) pose[key] += (chapters[to].pose[key] - pose[key]) * eased;
  const path = chapters[from].id === "idea" ? ["video", "consistency", "subject"] : chapters[from].id === "explore-domain" ? ["subject", "multi-shot", "motion"] : null;
  if (path) { const segment = Math.min(1, Math.floor(eased * 2)), local = Math.min(1, eased * 2 - segment), a = nodeAt(path[segment]), b = nodeAt(path[segment + 1]); pose.markerX = a.x + (b.x - a.x) * local; pose.markerY = a.y + (b.y - a.y) * local; }
  return { pose, active: Math.round(p) };
}
export function cameraTransform(pose: Pose): string { return `translate(${720 - pose.cx * pose.zoom} ${425 - pose.cy * pose.zoom}) scale(${pose.zoom})`; }
