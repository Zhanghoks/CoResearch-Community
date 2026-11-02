import { cameraTransform, sampleStory, chapters } from "./story";
import type { Pose } from "./types";
const clamp = (v: number) => Math.max(0, Math.min(1, v));
/** Cache DOM handles; progress is a pure, reversible scene input. */
export function createSceneRenderer(root: HTMLElement) {
  const camera = root.querySelector<SVGGElement>("[data-rw-camera]"), marker = root.querySelector<SVGGElement>("[data-rw-marker]");
  if (!camera || !marker) throw new Error("Research World SVG is missing its camera or marker");
  const layers = [...root.querySelectorAll<SVGGElement>("[data-rw-layer]")];
  const draws = [...root.querySelectorAll<SVGPathElement>("[data-rw-draw]")];
  const stops = [...root.querySelectorAll<SVGGElement>("[data-rw-stop]")];
  const born = [...root.querySelectorAll<SVGGElement>("[data-rw-born]")];
  const growth = [...root.querySelectorAll<SVGPathElement>("[data-rw-grow]")];
  const ideaLabel = root.querySelector<SVGTextElement>("[data-rw-idea-label]");
  const terrain = root.querySelector<SVGGElement>("[data-rw-terrain]");
  const overview = root.querySelector<SVGGElement>("[data-rw-overview]");
  const progressBar = root.querySelector<HTMLElement>("[data-rw-progress]");
  return (progress: number, count: number) => {
    const { pose, active } = sampleStory(progress);
    camera.setAttribute("transform", cameraTransform(pose));
    marker.setAttribute("transform", `translate(${pose.markerX} ${pose.markerY})`);
    for (const el of layers) { const v = clamp(pose[el.dataset.rwLayer as keyof Pose]); el.style.opacity = String(v); el.style.visibility = v < .001 ? "hidden" : "visible"; }
    for (const el of born) { const v = clamp((pose.growth - Number(el.dataset.rwBorn)) / .07); el.style.opacity = String(v); el.style.visibility = v < .001 ? "hidden" : "visible"; }
    for (const el of growth) { const v = clamp((pose.growth - Number(el.dataset.rwGrow) + .04) / .1); el.style.strokeDasharray = "1"; el.style.strokeDashoffset = String(1 - v); el.style.visibility = v < .001 ? "hidden" : "visible"; }
    for (const el of draws) {
      const key = el.dataset.rwDraw as keyof Pose;
      const settled = key === "lineage" ? chapters.findIndex(c => c.id === "slice") : key === "explore" ? chapters.findIndex(c => c.id === "explore-focus") : Infinity;
      el.style.strokeDasharray = "1";
      el.style.strokeDashoffset = String(1 - (progress >= settled ? 1 : clamp(pose[key])));
    }
    for (const el of stops) el.style.opacity = pose.explore * 4 + .01 >= Number(el.dataset.rwStop) ? "1" : "0";
    if (ideaLabel) ideaLabel.style.opacity = String(1 - pose.gap);
    if (terrain) terrain.style.opacity = String(1 - pose.slice * .85);
    if (overview) overview.style.opacity = String(1 - pose.slice);
    if (progressBar) progressBar.style.transform = `scaleX(${clamp(progress / (count - 1))})`;
    return active;
  };
}
