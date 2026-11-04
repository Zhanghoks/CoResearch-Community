import { treeNodes } from "./scenario";
import type { AgentId, ScenarioState } from "./scenario";

/**
 * Product demo stage renderer — cache elements once, write only what changed.
 * React renders the static mock panels; this applicator owns every animation-frame
 * mutation (phase attribute, agent states, panel visibility, tree growth, focus
 * marker, checklist states) so no React reconciliation ever runs inside the loop.
 */
export function createDemoRenderer(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-pd-stage]");
  if (!stage) throw new Error("Product demo is missing its stage");
  const agents = [...root.querySelectorAll<HTMLElement>("[data-pd-agent]")].map((card) => ({
    id: card.dataset.pdAgent as AgentId,
    card,
    action: card.querySelector<HTMLElement>("[data-pd-agent-action]"),
  }));
  const messages = [...root.querySelectorAll<HTMLElement>("[data-pd-msg]")];
  const evidence = [...root.querySelectorAll<HTMLElement>("[data-pd-evidence]")];
  const cards = [...root.querySelectorAll<HTMLElement>("[data-pd-card]")];
  const checks = [...root.querySelectorAll<HTMLElement>("[data-pd-check]")];
  const tree = [...root.querySelectorAll<HTMLElement>("[data-pd-tree]")];
  const focusMarker = root.querySelector<SVGGElement>("[data-pd-focus]");
  const focusById = new Map(treeNodes.map((node) => [node.id, node]));
  const ideaKnown = root.querySelector<HTMLElement>("[data-pd-idea-known]");
  const ideaUnknown = root.querySelector<HTMLElement>("[data-pd-idea-unknown]");
  const ideaIntent = root.querySelector<HTMLElement>("[data-pd-idea-intent]");
  let lastKey = "";
  return (state: ScenarioState) => {
    // Everything written here is discrete and paintKey-guarded; entrance staggers
    // run on CSS delays keyed off each element's own index, not per-frame values.
    const key = JSON.stringify([state.phase, state.agents, state.idea, state.messages, state.evidence, state.gap, state.mechanism, state.checklist, state.candidate, state.tree, state.focus]);
    if (key === lastKey) return;
    lastKey = key;
    stage.dataset.phase = String(state.phase);
    for (const { id, card, action } of agents) {
      const agent = state.agents[id];
      if (!agent) continue;
      card.dataset.activity = agent.activity;
      if (action) action.textContent = agent.action;
    }
    messages.forEach((message, index) => message.classList.toggle("pd-on", index < state.messages));
    evidence.forEach((card, index) => card.classList.toggle("pd-on", index < state.evidence));
    for (const card of cards) {
      const name = card.dataset.pdCard as "gap" | "mechanism" | "candidate";
      card.classList.toggle("pd-on", Boolean(state[name]));
    }
    for (const element of tree) {
      element.classList.toggle("pd-on", state.tree.includes(element.dataset.pdTree ?? ""));
    }
    const focus = focusById.get(state.focus);
    if (focusMarker && focus) focusMarker.setAttribute("transform", `translate(${focus.x} ${focus.y})`);
    checks.forEach((check, index) => { check.dataset.state = state.checklist[index] ?? "pending"; });
    if (ideaKnown) ideaKnown.textContent = String(state.idea.known);
    if (ideaUnknown) ideaUnknown.textContent = String(state.idea.unknown);
    if (ideaIntent) ideaIntent.textContent = state.idea.intent;
  };
}
