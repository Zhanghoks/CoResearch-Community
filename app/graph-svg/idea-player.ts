import ideaChaptersData from "./idea-story.json";
import masks from "./idea-label-frames.json";
import growthData from "./world-growth.json";

type Label = [number, number, number, number, string, string, "blue" | "amber"];
type Chapter = [number, string, string, string, Label[]];

const ideaChapters = ideaChaptersData as Chapter[];
const growthCopy = [
  ["Foundations", "研究从前人的工作出发。", "每个节点代表一份研究。新工作沿着已有的问题、方法和证据继续向前。"],
  ["Accumulation", "同一个问题，积累出更多研究。", "后来的工作复用、检验或改进已有成果，逐渐形成各自的研究脉络。"],
  ["Divergence", "新的问题，让研究向外分叉。", "不同的假设和方法从共同基础出发，逐渐形成新的研究方向。"],
  ["Connection", "分出去的方向，也会重新连接。", "一个方向积累的方法或证据，可能帮助另一个方向解决自己的问题。"],
  ["Research World", "分叉与连接，逐渐织成研究世界。", "接下来把视角转向一个研究者：从这张图里的一小片已知出发，找到值得追问的问题。"],
];

export const growthCount = growthCopy.length;
export const growthFrames = growthData.counts;
export const ideaOffset = 1 + growthFrames.length;
export const chapters: Chapter[] = [
  ideaChapters[0],
  ...growthCopy.map(([name, title, body], index): Chapter => [1 + growthData.starts[index], name, title, body, []]),
  ...ideaChapters.slice(1).map(([start, name, title, body, items], index): Chapter =>
    [ideaOffset + (index === 0 ? 0 : start), name, title, body, items]),
];
export const last = chapters.length - 1;
export const asset = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/research-world/frames`;
export const ending = (step: number) => (chapters[step + 1]?.[0] ?? ideaOffset + masks.length) - 1;

export function displayAt(frame: number) {
  let step = last;
  while (chapters[step][0] > frame) step--;
  const ideaFrame = Math.max(0, frame - ideaOffset);
  return {
    step,
    mask: frame >= ideaOffset ? masks[ideaFrame] : 0,
    ideaFrame,
    visibleNodes: step > 0 && step <= growthCount ? growthFrames[frame - 1] : undefined,
  };
}
