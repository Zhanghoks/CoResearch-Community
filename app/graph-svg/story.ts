import {
  INTEREST_PROMPT,
  OPEN_QUESTION_ID,
  coverageById,
  counterexamples,
  directionById,
  evidence as fixtureEvidence,
  limitations,
  openQuestions,
  paperById,
} from "../demo/fixtures/video-identity";
import {
  CONCEPT_DURATION_MS,
  CONCEPT_KERNEL_T,
  conceptActTimings,
  conceptProgressAt,
  factsForAct,
} from "../demo/scenes/concept";
import { nodeAt } from "./mock-world";
import type { ConceptFrame, Pose, StoryChapter } from "./types";
import { LABEL_MIN_PX, QUESTION_MIN_PX } from "./types";

export const REVISION_STORY_ANCHOR = "research-world-revise";
export { LABEL_MIN_PX, QUESTION_MIN_PX, CONCEPT_DURATION_MS };

const question = openQuestions[0]!;
const e01 = fixtureEvidence.find((item) => item.id === "E01")!;
const e02 = fixtureEvidence.find((item) => item.id === "E02")!;
const e03 = fixtureEvidence.find((item) => item.id === "E03")!;
const cov = coverageById.get("cov-short-visible")!;
const ce01 = counterexamples.find((item) => item.id === "CE01")!;
const ce02 = counterexamples.find((item) => item.id === "CE02")!;

const initial: Pose = {
  cx: 360, cy: 400, zoom: 1.7, markerX: nodeAt("video").x, markerY: nodeAt("video").y,
  base: 0.55, path: 0, evidence: 0, coverage: 0, unverified: 0, revision: 0, question: 0, nextStep: 0,
};

const entries: Array<Omit<StoryChapter, "pose"> & { pose: Partial<Pose> }> = [
  {
    id: "interest",
    tag: "ACT 1 · 从兴趣出发",
    title: "先写下想研究的兴趣",
    body: `输入固定教学提示「${INTEREST_PROMPT}」。中心是主题「${directionById.get("d-video")!.name}」，旁边是三个可比较的候选方向：${directionById.get("d-consistency")!.name}、${directionById.get("d-controllable")!.name}、${directionById.get("d-narrative")!.name}。这是合成教学数据，不是一次真实模型请求。`,
    takeaway: "尚未选择方向，也还没有候选方法。先建立局部图，不从七章术语讲起。",
    action: "输入预设兴趣，展开三个可比较方向。",
    change: "出现可选择的方向，没有执行结果，也没有方法主张。",
    next: "主动选择一条方向并继续细分。",
    holdMs: conceptActTimings[0]!.holdMs,
    moveMs: conceptActTimings[0]!.moveMs,
    kernelT: CONCEPT_KERNEL_T[0],
    focusIds: factsForAct(0).focusIds,
    pose: {},
  },
  {
    id: "choose",
    tag: "ACT 2 · 选择并细分",
    title: "沿着明确的选择往下走",
    body: `选择「${directionById.get("d-consistency")!.name}」，再细分到「${directionById.get("d-identity")!.name}」和「${directionById.get("d-crossshot")!.name}」。金色焦点只沿已选择的边移动；未选分支（${directionById.get("d-controllable")!.name}、${directionById.get("d-narrative")!.name} 等）弱化保留，不被删除。边上标明「选择 / 细分」。`,
    takeaway: "兴趣变成有范围的方向，现在还不能判断新颖性。开放任务仅为 Explore，这里是概念演示而不是产品页里的真实 UI 运行。",
    action: "选择生成一致性，并继续细分到主体身份与跨镜头身份保持。",
    change: "调查范围被路径收窄；未选分支仍在图上。",
    next: "阅读该方向的代表工作与适用条件。",
    holdMs: conceptActTimings[1]!.holdMs,
    moveMs: conceptActTimings[1]!.moveMs,
    kernelT: CONCEPT_KERNEL_T[1],
    focusIds: factsForAct(1).focusIds,
    pose: { cx: 500, cy: 360, zoom: 1.85, path: 1, markerX: nodeAt("multi-shot").x, markerY: nodeAt("multi-shot").y },
  },
  {
    id: "read",
    tag: "ACT 3 · 读取代表工作",
    title: "先看条件，再谈支持",
    body: `打开 ${paperById.get("P01")!.title} 与 ${paperById.get("P02")!.title}，定位条件段落。形成证据 ${e01.id}：${e01.claim} 这是标识为「演示文献」的合成材料。`,
    takeaway: "已有有条件支持；复杂条件此时仍未知。",
    action: "打开 P01、P02，阅读条件段落。",
    change: `得到 ${e01.id} 的有条件支持，并留下尚未覆盖的条件。`,
    next: "把遮挡、切镜、时长和更新预算放到同一张条件表里比较。",
    holdMs: conceptActTimings[2]!.holdMs,
    moveMs: conceptActTimings[2]!.moveMs,
    kernelT: CONCEPT_KERNEL_T[2],
    focusIds: factsForAct(2).focusIds,
    pose: { cx: 600, cy: 430, zoom: 1.8, evidence: 1, path: 1, markerX: nodeAt("paper-compare").x, markerY: nodeAt("paper-compare").y },
  },
  {
    id: "compare",
    tag: "ACT 4 · 比较条件",
    title: "条件和预算不能直接外推",
    body: `比较遮挡、切镜、时长与更新预算。用条件表代替一堆亮点。${limitations[0]!.id}：${limitations[0]!.statement} ${limitations[1]!.id}：${limitations[1]!.statement} 实线只表示本轮已掌握的证据适用范围，不是学界地图。`,
    takeaway: "适用条件不同、更新预算不同，结论不能直接外推。比较依据来自标识为「演示文献」的合成材料。",
    action: "并排比较已读材料的条件与预算。",
    change: "边界沿着已覆盖的条件画出；未知条件保持在虚线一侧。",
    next: "把当前覆盖写成一条可修订的记录，并决定是否补查。",
    holdMs: conceptActTimings[3]!.holdMs,
    moveMs: conceptActTimings[3]!.moveMs,
    kernelT: CONCEPT_KERNEL_T[3],
    focusIds: factsForAct(3).focusIds,
    pose: { cx: 680, cy: 430, zoom: 1.7, evidence: 1, coverage: 1, path: 0.85, markerX: nodeAt("multi-shot").x, markerY: nodeAt("multi-shot").y },
  },
  {
    id: "coverage",
    tag: "ACT 5 · 记录覆盖并补查",
    title: "先写下当前覆盖，再去补查",
    body: `记录「${cov.statement}」长视频与复杂条件需要补查。这是本轮证据覆盖状态，不是“学界无人研究”的断言。图上标出「补查近邻工作」，不出现绿色成功勾。`,
    takeaway: "当前材料不足，所以要补查；覆盖记录可以被后来的证据修订。",
    action: "写下当前覆盖记录，并发起补查近邻工作。",
    change: "认识范围被明确标注为有限；补查路径仍是待验证的虚线。",
    next: "把新读到的材料带回来，和原覆盖记录并列对照。",
    holdMs: conceptActTimings[4]!.holdMs,
    moveMs: conceptActTimings[4]!.moveMs,
    kernelT: CONCEPT_KERNEL_T[4],
    focusIds: factsForAct(4).focusIds,
    pose: { cx: 760, cy: 410, zoom: 1.65, coverage: 1, unverified: 1, evidence: 0.7, path: 0.7, markerX: nodeAt("multi-shot").x, markerY: nodeAt("multi-shot").y },
  },
  {
    id: "revise",
    tag: "ACT 6 · 新材料修订判断",
    title: "新证据修改了原来的覆盖判断",
    body: `补查加入 ${paperById.get("P05")!.title} 与 ${paperById.get("P03")!.title}。同一条覆盖记录 ${cov.id} 出现新的修订：原先「${cov.statement}」${ce01.reason} ${ce02.reason} 形成 ${e02.id}：${e02.claim}`,
    takeaway: "判断被修订，而不是只多了一个点。后退可以回到修订前的覆盖记录。剩余未知收窄到固定预算下的联合条件比较。",
    action: "把 P05、P03 读入同一条覆盖记录并重新比较。",
    change: "原判断与新覆盖并列可见；反例关系同时用标签和文字编码。",
    next: "在修订后的范围里，写出完整的开放式问题。",
    holdMs: conceptActTimings[5]!.holdMs,
    moveMs: conceptActTimings[5]!.moveMs,
    kernelT: CONCEPT_KERNEL_T[5],
    focusIds: factsForAct(5).focusIds,
    pose: { cx: 860, cy: 420, zoom: 1.6, coverage: 1, revision: 1, evidence: 1, path: 0.6, unverified: 0.4, markerX: nodeAt("paper-recent").x, markerY: nodeAt("paper-recent").y },
  },
  {
    id: "question",
    tag: "ACT 7 · 形成完整问题",
    title: "把未对齐的比较写成可检验的问题",
    body: question.question,
    takeaway: `${e03.claim} ${question.uncertainty} 连接 ${paperById.get("P06")!.title} 的边是「候选迁移，待验证」，不会把虚线探索自动画成已验证成果。`,
    action: "核对相同预算，并参考 P06 的不确定性机制。",
    change: "画面只强调一张完整问题卡和少数证据锚点。",
    next: "由研究者选择下一步，而不是动画自动宣布突破。",
    holdMs: conceptActTimings[6]!.holdMs,
    moveMs: conceptActTimings[6]!.moveMs,
    kernelT: CONCEPT_KERNEL_T[6],
    focusIds: factsForAct(6).focusIds,
    pose: { cx: 960, cy: 400, zoom: 1.7, question: 1, revision: 0.4, coverage: 0.35, evidence: 0.45, unverified: 0.7, path: 0.45, markerX: nodeAt(OPEN_QUESTION_ID).x, markerY: nodeAt(OPEN_QUESTION_ID).y },
  },
  {
    id: "next-step",
    tag: "ACT 8 · 决定下一步",
    title: "问题进入待调查清单",
    body: `研究者可以选择继续核查或设计比较：在相同计算预算下，比较固定间隔更新与按不确定性触发的更新，并按遮挡/切镜分组记录漂移与恢复失败。${question.nextAction} 实验尚未进行，效果也尚未证实。`,
    takeaway: "提出下一步不等于取得突破。轨迹被保留；新颖性和有效性仍未验证。这是概念演示，不是产品已上线能力的证明。",
    action: "选择继续核查或设计同预算比较，并保留已走路径。",
    change: "问题被放进待调查清单；未验证路径保持虚线。",
    next: "故事在此停住，只有明确的重新观看才会重播。",
    holdMs: conceptActTimings[7]!.holdMs,
    moveMs: conceptActTimings[7]!.moveMs,
    kernelT: CONCEPT_KERNEL_T[7],
    focusIds: factsForAct(7).focusIds,
    pose: { cx: 1040, cy: 380, zoom: 1.55, question: 1, nextStep: 1, unverified: 0.8, coverage: 0.3, path: 0.5, revision: 0.25, markerX: nodeAt("candidate").x, markerY: nodeAt("candidate").y },
  },
];

let previous = initial;
export const chapters: readonly StoryChapter[] = entries.map((entry) => {
  previous = { ...previous, ...entry.pose };
  return { ...entry, pose: previous };
});

const choosePath = ["video", "consistency", "subject", "multi-shot"] as const;

/** Pure evaluation: the same progress always yields the same scene, in either direction. */
export function sampleStory(progress: number): { pose: Pose; active: number } {
  const p = Number.isFinite(progress) ? Math.min(chapters.length - 1, Math.max(0, progress)) : 0;
  const from = Math.floor(p);
  const to = Math.min(from + 1, chapters.length - 1);
  const t = p - from;
  const eased = t * t * (3 - 2 * t);
  const pose = { ...chapters[from]!.pose };
  for (const key of Object.keys(pose) as Array<keyof Pose>) {
    pose[key] += (chapters[to]!.pose[key] - pose[key]) * eased;
  }
  if (from === 0 && t > 0) {
    const path = choosePath;
    const span = Math.min(1, eased);
    const segmentCount = path.length - 1;
    const scaled = span * segmentCount;
    const segment = Math.min(segmentCount - 1, Math.floor(scaled));
    const local = Math.min(1, scaled - segment);
    const a = nodeAt(path[segment]!);
    const b = nodeAt(path[segment + 1]!);
    pose.markerX = a.x + (b.x - a.x) * local;
    pose.markerY = a.y + (b.y - a.y) * local;
  }
  return { pose, active: Math.round(p) };
}

export function sampleConcept(progress: number): ConceptFrame {
  const { pose, active } = sampleStory(progress);
  return { pose, active, facts: factsForAct(active), t: conceptTimeFromProgress(progress) };
}

export function sampleConceptAtTime(t: number): ConceptFrame {
  return sampleConcept(conceptProgressAt(t));
}

export function conceptTimeFromProgress(progress: number): number {
  const p = Number.isFinite(progress) ? Math.min(chapters.length - 1, Math.max(0, progress)) : 0;
  const index = Math.floor(p);
  const act = conceptActTimings[index]!;
  const frac = p - index;
  if (frac <= 0) return act.checkpointMs;
  if (index >= conceptActTimings.length - 1) return CONCEPT_DURATION_MS;
  const next = conceptActTimings[index + 1]!;
  return act.checkpointMs + frac * (next.checkpointMs - act.checkpointMs);
}

export function cameraTransform(pose: Pose): string {
  return `translate(${720 - pose.cx * pose.zoom} ${425 - pose.cy * pose.zoom}) scale(${pose.zoom})`;
}

export function paperCardLabel(paperId: string): string {
  const paper = paperById.get(paperId);
  if (!paper) return paperId;
  return `${paperId} · ${paper.title.replace(/^演示文献 [A-Z] · /, "")}`;
}
