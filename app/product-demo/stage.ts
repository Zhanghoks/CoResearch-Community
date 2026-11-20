import { streamFullCopy, treeNodeById } from "./scenario";
import type { DetailField, ScenarioState, StreamId } from "./scenario";

/**
 * Product demo stage renderer — cache elements once, write only what changed.
 * React renders the static mock shell (the dark product-UI replica); this applicator
 * owns every animation-frame mutation (phase attribute, message visibility, streamed
 * text, timers, tree growth, current/focus markers, checklist states) so no React
 * reconciliation ever runs inside the loop.
 *
 * Streamed elements are state-determined, never write-history-determined: a stream id
 * absent from the state resolves to its settled value (empty composer, full field
 * copy), so seeking to any progress lands on the right content.
 */
export function createDemoRenderer(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-pd-stage]");
  if (!stage) throw new Error("Product demo is missing its stage");
  const streams = new Map<StreamId, HTMLElement>();
  for (const el of root.querySelectorAll<HTMLElement>("[data-pd-stream]")) {
    streams.set(el.dataset.pdStream as StreamId, el);
  }
  const messages = [...root.querySelectorAll<HTMLElement>("[data-pd-msg]")];
  const details = [...root.querySelectorAll<HTMLElement>("[data-pd-detail]")].map((el) => ({
    field: el.dataset.pdDetail as DetailField,
    el,
  }));
  const checks = [...root.querySelectorAll<HTMLElement>("[data-pd-check]")];
  const tree = [...root.querySelectorAll<HTMLElement>("[data-pd-tree]")];
  const focusMarker = root.querySelector<SVGGElement>("[data-pd-focus]");
  const currentBadge = root.querySelector<SVGGElement>("[data-pd-current]");
  const paper = root.querySelector<HTMLElement>("[data-pd-paper]");
  const session = root.querySelector<HTMLElement>("[data-pd-session]");
  const candidate = root.querySelector<HTMLElement>("[data-pd-candidate]");
  const processing = root.querySelector<HTMLElement>("[data-pd-processing]");
  const review = root.querySelector<HTMLElement>("[data-pd-review]");
  const mention = root.querySelector<HTMLElement>("[data-pd-mention]");
  const canvasCount = root.querySelector<HTMLElement>("[data-pd-canvas-count]");
  const timerEl = root.querySelector<HTMLElement>("[data-pd-timer]");
  const contextEl = root.querySelector<HTMLElement>("[data-pd-context]");
  const processingMeta = root.querySelector<HTMLElement>("[data-pd-processing-meta]");
  const nodeById = treeNodeById;

  /** Streamed elements are state-determined: absent id → settled value (empty composer, full field copy). */
  const streamSettled = (id: StreamId) => (id === "composer" ? "" : streamFullCopy[id]);

  let lastKey = "";
  return (state: ScenarioState) => {
    // Everything written here is discrete and paintKey-guarded; entrance staggers
    // run on CSS delays keyed off each element's own index, not per-frame values.
    const key = JSON.stringify([state.phase, state.messages, state.streams, state.timer, state.context, state.tree, state.current, state.focus, state.detail, state.paper, state.session, state.canvasCount, state.checklist, state.candidate, state.processingMeta]);
    if (key === lastKey) return;
    lastKey = key;
    stage.dataset.phase = String(state.phase);
    for (const [id, el] of streams) {
      const value = state.streams[id] ?? streamSettled(id);
      if (el.textContent !== value) el.textContent = value;
    }
    messages.forEach((message, index) => message.classList.toggle("pd-on", index < state.messages));
    for (const { field, el } of details) el.classList.toggle("pd-on", Boolean(state.detail[field]));
    paper?.classList.toggle("pd-on", state.paper);
    session?.classList.toggle("pd-on", state.session);
    candidate?.classList.toggle("pd-on", state.candidate);
    processing?.classList.toggle("pd-on", state.session || state.timer > 0);
    review?.classList.toggle("pd-on", state.checklist.some((check) => check !== "pending"));
    mention?.classList.toggle("pd-on", state.messages > 3);
    if (timerEl) timerEl.textContent = String(state.timer);
    if (contextEl) contextEl.textContent = String(state.context);
    if (processingMeta && processingMeta.textContent !== state.processingMeta) processingMeta.textContent = state.processingMeta;
    if (canvasCount) canvasCount.textContent = String(state.canvasCount);
    for (const element of tree) {
      element.classList.toggle("pd-on", state.tree.includes(element.dataset.pdTree ?? ""));
    }
    const current = state.current ? nodeById.get(state.current) : undefined;
    if (currentBadge) {
      currentBadge.classList.toggle("pd-on", Boolean(current));
      if (current) currentBadge.setAttribute("transform", `translate(${current.x} ${current.y})`);
    }
    const focus = nodeById.get(state.focus);
    if (focusMarker && focus) focusMarker.setAttribute("transform", `translate(${focus.x} ${focus.y})`);
    checks.forEach((check, index) => { check.dataset.state = state.checklist[index] ?? "pending"; });
  };
}
