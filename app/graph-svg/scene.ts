import { cameraTransform, sampleStory } from "./story";
import type { Pose } from "./types";

/** Cache elements once; do not query the DOM or reconcile React on every animation frame. */
export function createSceneRenderer(root: HTMLElement) {
  const camera = root.querySelector<SVGGElement>("[data-rw-camera]");
  const marker = root.querySelector<SVGGElement>("[data-rw-marker]");
  if (!camera || !marker) throw new Error("Research World SVG is missing its camera or marker");
  const layers = [...root.querySelectorAll<SVGGElement>("[data-rw-layer]")];
  const draws = [...root.querySelectorAll<SVGPathElement>("[data-rw-draw]")];
  const stops = [...root.querySelectorAll<SVGGElement>("[data-rw-stop]")];
  const progressBar = root.querySelector<HTMLElement>("[data-rw-progress]");
  // Focus layers settle with a pop; the base graph falls out of focus while the camera zooms in.
  const popLayers = new Set(["papers", "gap", "candidate", "idea"]);
  return (progress: number, count: number) => {
    const { pose, active } = sampleStory(progress);
    camera.setAttribute("transform", cameraTransform(pose));
    marker.setAttribute("transform", `translate(${pose.markerX} ${pose.markerY})`);
    const focus = Math.max(0, Math.min(1, (pose.zoom - 1.08) / .87));
    for (const element of layers) {
      const key = element.dataset.rwLayer as keyof Pose;
      const value = Math.max(0, Math.min(1, pose[key]));
      element.style.opacity = String(value);
      element.style.visibility = value < .001 ? "hidden" : "visible";
      if (popLayers.has(key)) element.style.transform = `scale(${(0.86 + 0.14 * value).toFixed(3)})`;
      if (key === "base") {
        element.style.filter = focus > .01
          ? `blur(${(focus * 2.4).toFixed(2)}px) saturate(${(1 - focus * .45).toFixed(2)})`
          : "";
      }
    }
    for (const element of draws) {
      const key = element.dataset.rwDraw as keyof Pose;
      element.style.strokeDasharray = "1";
      const draw = key === "explore" && progress >= 8 ? 1 : key === "lineage" && progress >= 2 ? 1 : pose[key];
      element.style.strokeDashoffset = String(1 - Math.min(1, Math.max(0, draw)));
    }
    for (const element of stops) {
      const index = Number(element.dataset.rwStop);
      element.style.opacity = (progress >= 8 ? 1 : pose.explore) * 4 + .01 >= index ? "1" : "0";
    }
    if (progressBar) progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress / (count - 1)))})`;
    return active;
  };
}
