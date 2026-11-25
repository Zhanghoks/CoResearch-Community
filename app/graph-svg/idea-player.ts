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

export function makePlayer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const cache = new Map<number, Promise<HTMLImageElement>>();
  let stamp = 0;
  let frame = -1;
  function load(i: number) {
    const group = Math.floor(i / 6);
    const prior = cache.get(group);
    cache.delete(group);
    const pending = prior ?? new Promise<HTMLImageElement>((resolve,reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => { cache.delete(group); reject(new Error("图谱帧未能加载")); };
      image.src = `${asset}/${String(group).padStart(2,"0")}.webp`;
    });
    cache.set(group,pending);
    if (cache.size > 7) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
    return pending;
  }
  return {
    get frame() { return frame; },
    cancel() { stamp++; },
    async draw(i: number) {
      const key = stamp;
      const atlas = await load(i);
      if (!ctx || key !== stamp) return false;
      const slot = i % 6;
      ctx.clearRect(0,0,1280,576);
      ctx.drawImage(atlas,(slot%3)*1280,Math.floor(slot/3)*576,1280,576,0,0,1280,576);
      canvas.dataset.frame = String(i);
      frame = i;
      return true;
    },
    warm(i: number) {
      for (const offset of [-6,0,6,12]) if (i+offset >= 0 && i+offset < 218) void load(i+offset).catch(() => {});
    },
  };
}
