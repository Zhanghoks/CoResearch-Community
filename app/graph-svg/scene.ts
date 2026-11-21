import { routeArrivals, world } from "./mock-world";
import { cameraTransform, sampleStory } from "./story";
import type { Pose } from "./types";

/** Width of each item's reveal window inside its layer's 0→1 sweep. */
const STAGGER_WINDOW = .38;
/** The chosen route stays fully drawn from its settled chapter onward. */
const pathSettled = (progress: number) => progress >= 1;
const exploreArrivals = routeArrivals(world.routes.explore);

/** Normalize a 0–1 reveal value so settled states write exactly "1"/"0" (float-safe). */
function reveal(local: number): string {
  return local >= 1 ? "1" : local <= 0 ? "0" : local.toFixed(3);
}

/** Cache elements once; do not query the DOM or reconcile React on every animation frame. */
export function createSceneRenderer(root: HTMLElement) {
  const camera = root.querySelector<SVGGElement>("[data-rw-camera]");
  const marker = root.querySelector<SVGGElement>("[data-rw-marker]");
  if (!camera || !marker) throw new Error("Research World SVG is missing its camera or marker");
  const layers = [...root.querySelectorAll<SVGGElement>("[data-rw-layer]")];
  const draws = [...root.querySelectorAll<SVGPathElement>("[data-rw-draw]")];
  const stops = [...root.querySelectorAll<SVGGElement>("[data-rw-stop]")];
  const staggers = [...root.querySelectorAll<SVGGraphicsElement>("[data-rw-stagger]")].map((element) => {
    const [layer, index, count] = (element.dataset.rwStagger ?? "").split(":");
    return { element, layer: layer as keyof Pose, index: Number(index) || 0, count: Number(count) || 1 };
  });
  const dimmed = [...root.querySelectorAll<SVGGraphicsElement>("[data-rw-dim]")];
  const progressBar = root.querySelector<HTMLElement>("[data-rw-progress]");
  const popLayers = new Set(["evidence", "revision", "question", "nextStep"]);
  return (progress: number, count: number) => {
    const { pose, active } = sampleStory(progress);
    camera.setAttribute("transform", cameraTransform(pose));
    marker.setAttribute("transform", `translate(${pose.markerX} ${pose.markerY})`);
    root.setAttribute("data-rw-act", String(active));
    for (const element of layers) {
      const key = element.dataset.rwLayer as keyof Pose;
      const value = Math.max(0, Math.min(1, Number(pose[key] ?? 0)));
      element.style.opacity = String(value);
      element.style.visibility = value < .001 ? "hidden" : "visible";
      if (popLayers.has(key)) element.style.transform = `scale(${(0.92 + 0.08 * value).toFixed(3)})`;
    }
    for (const item of staggers) {
      const value = Math.max(0, Math.min(1, Number(pose[item.layer] ?? 0)));
      const step = item.count > 1 ? (1 - STAGGER_WINDOW) / (item.count - 1) : 0;
      const local = Math.max(0, Math.min(1, (value - item.index * step) / STAGGER_WINDOW));
      item.element.style.opacity = reveal(local);
    }
    for (const element of dimmed) {
      const appearAt = Number(element.dataset.rwDim ?? 1);
      element.style.opacity = active >= appearAt ? "0.35" : active === appearAt - 1 ? "0.7" : "0";
    }
    for (const element of draws) {
      const key = element.dataset.rwDraw as keyof Pose;
      element.style.strokeDasharray = "1";
      const draw = key === "path" && pathSettled(progress) ? 1 : Number(pose[key] ?? 0);
      element.style.strokeDashoffset = String(1 - Math.min(1, Math.max(0, draw)));
    }
    const drawPath = pathSettled(progress) ? 1 : Math.max(0, Math.min(1, pose.path));
    for (const element of stops) {
      const index = Number(element.dataset.rwStop);
      const arrival = exploreArrivals[index] ?? 1;
      const local = index === 0 ? 1 : Math.max(0, Math.min(1, (drawPath - (arrival - .12)) / .12));
      element.style.opacity = reveal(local);
    }
    if (progressBar) progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress / Math.max(1, count - 1)))})`;
    return active;
  };
}
