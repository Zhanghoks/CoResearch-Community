import chaptersData from "./idea-story.json";
import masks from "./idea-label-frames.json";

type Label = [number, number, number, number, string, string, "blue" | "amber"];
type Chapter = [number, string, string, string, Label[]];
export const chapters = chaptersData as Chapter[];
export const last = chapters.length - 1;
export const asset = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/research-world/frames`;
export const ending = (step: number) => step === 0 ? 0 : (chapters[step+1]?.[0] ?? 218) - 1;
export function displayAt(frame: number) {
  let step = last;
  while (chapters[step][0] > frame) step--;
  return {step, mask: masks[frame]};
}
