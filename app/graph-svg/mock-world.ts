import type { CommunityMeta, GraphWorld, ResearchEdge, ResearchNode } from "./types";
import { directionById, paperById, OPEN_QUESTION_ID } from "../demo/fixtures/video-identity";
import { conceptGraphAliases } from "../demo/scenes/concept";


/**
 * Coordinates are ART-DIRECTED, seeded and deterministic.
 * There is deliberately no live force simulation, so reverse scroll is reversible.
 * Domain membership overlaps: "computer vision" and "multimodal" are not exclusive.
 */
const foreground: ResearchNode[] = [
  { id: "video", x: 250, y: 395, radius: 9, kind: "topic", label: directionById.get("d-video")!.name, domains: ["视觉", "生成模型"], tier: 1, alpha: 1, fixtureId: "d-video" },
  { id: "consistency", x: 416, y: 400, radius: 8, kind: "problem", label: directionById.get("d-consistency")!.name, domains: ["视觉", "视频生成"], tier: 1, alpha: 1, fixtureId: "d-consistency" },
  { id: "controllable", x: 430, y: 510, radius: 6, kind: "problem", label: directionById.get("d-controllable")!.name, domains: ["视频生成"], tier: 1, alpha: 1, fixtureId: "d-controllable" },
  { id: "narrative", x: 430, y: 290, radius: 6, kind: "problem", label: directionById.get("d-narrative")!.name, domains: ["视频生成"], tier: 1, alpha: 1, fixtureId: "d-narrative" },
  { id: "subject", x: 535, y: 363, radius: 7, kind: "problem", label: directionById.get("d-identity")!.name, domains: ["视觉", "多模态"], tier: 1, alpha: 1, fixtureId: "d-identity" },
  { id: "scene", x: 560, y: 455, radius: 6, kind: "problem", label: directionById.get("d-scene")!.name, domains: ["视频生成"], tier: 1, alpha: 1, fixtureId: "d-scene" },
  { id: "multi-shot", x: 676, y: 330, radius: 7, kind: "problem", label: directionById.get("d-crossshot")!.name, domains: ["视频生成", "多模态"], tier: 1, alpha: 1, fixtureId: "d-crossshot" },
  { id: "motion", x: 620, y: 250, radius: 6, kind: "problem", label: directionById.get("d-motion")!.name, domains: ["视频生成", "视觉"], tier: 1, alpha: 1, fixtureId: "d-motion" },
  { id: "paper-early", x: 484, y: 500, radius: 6, kind: "paper", label: paperById.get("P01")!.title, domains: ["视觉"], tier: 1, alpha: 1, fixtureId: "P01" },
  { id: "paper-compare", x: 662, y: 474, radius: 6, kind: "paper", label: paperById.get("P02")!.title, domains: ["视觉", "视频生成"], tier: 1, alpha: 1, fixtureId: "P02" },
  { id: "paper-recent", x: 854, y: 464, radius: 6, kind: "paper", label: paperById.get("P05")!.title, domains: ["视觉", "视频生成"], tier: 1, alpha: 1, fixtureId: "P05" },
  { id: "paper-frontier", x: 960, y: 398, radius: 6, kind: "paper", label: paperById.get("P03")!.title, domains: ["视频生成"], tier: 1, alpha: 1, fixtureId: "P03" },
  { id: "gap", x: 980, y: 360, radius: 8, kind: "problem", label: "开放式问题", domains: ["视频生成"], tier: 1, alpha: 1, fixtureId: OPEN_QUESTION_ID },
  { id: "candidate", x: 1120, y: 340, radius: 7, kind: "candidate", label: "下一步比较", domains: ["视频生成"], tier: 1, alpha: 1, fixtureId: "next-step" },
  { id: "cross-domain", x: 860, y: 560, radius: 8, kind: "method", label: paperById.get("P06")!.title, domains: ["控制理论", "其他领域"], tier: 1, alpha: 1, fixtureId: "P06" },
];

// Hue anchors stay inside one cool ink family so the world reads as a single system;
// gold (idea), amber (gap/candidate), violet (boundary) and teal-green (transfer) are
// reserved semantic accents and deliberately absent from this palette.
const macroCommunities = [
  { key: "central", color: "#5c7c9e", cx: 710, cy: 425, rx: 235, ry: 170, n: 28, domains: ["跨领域", "研究方法"] },
  { key: "math", color: "#4e8ba4", cx: 430, cy: 210, rx: 145, ry: 100, n: 8, domains: ["数学", "系统"] },
  { key: "life", color: "#6a9478", cx: 255, cy: 550, rx: 156, ry: 145, n: 9, domains: ["生命科学", "计算"] },
  { key: "agent", color: "#7b8fae", cx: 700, cy: 195, rx: 154, ry: 105, n: 9, domains: ["社会科学", "计算"] },
  { key: "multi", color: "#6787a5", cx: 667, cy: 613, rx: 190, ry: 140, n: 10, domains: ["人文", "视觉", "语言"] },
  { key: "systems", color: "#527f96", cx: 990, cy: 543, rx: 162, ry: 150, n: 10, domains: ["材料", "工程"] },
  { key: "frontier", color: "#4f95a8", cx: 1055, cy: 215, rx: 140, ry: 100, n: 8, domains: ["计算", "生成模型"] },
];

export const communityMeta: CommunityMeta[] = macroCommunities.map(({ key, color, cx, cy, rx, ry }) => ({ key, color, cx, cy, rx, ry }));

/** Ink color for a background node's community; unknown keys fall back to the base slate. */
export function communityColor(key: string | undefined): string {
  return communityMeta.find((c) => c.key === key)?.color ?? "#5c7c9e";
}

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let v = Math.imul(state ^ (state >>> 15), 1 | state);
    v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v;
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seeded(20261101);
const nodes: ResearchNode[] = [...foreground];
const edges: ResearchEdge[] = [];
const edgeSet = new Set<string>();

// Math.cos/sin may differ in the last ulp between V8 (Node SSR) and JavaScriptCore (WebKit),
// which React reports as a hydration attribute mismatch. Quantize to 0.01px so both
// engines render byte-identical coordinates.
const q = (v: number) => Math.round(v * 100) / 100;

function link(source: string, target: string, relation: ResearchEdge["relation"] = "related") {
  if (source === target) return;
  const id = [source, target].sort().join("|");
  if (edgeSet.has(id)) return;
  edgeSet.add(id);
  edges.push({ source, target, relation, verified: false });
}

for (const group of macroCommunities) {
  const community: ResearchNode[] = [];
  for (let index = 0; index < group.n; index += 1) {
    const theta = random() * Math.PI * 2;
    const r = Math.sqrt(random());
    const x = q(group.cx + Math.cos(theta) * r * group.rx);
    const y = q(group.cy + Math.sin(theta) * r * group.ry);
    // Depth hierarchy: cores read larger and stronger, the rim dissolves into haze.
    const distance = Math.sqrt((x - group.cx) ** 2 + (y - group.cy) ** 2) / Math.max(group.rx, group.ry);
    const tier: 1 | 2 | 3 = distance < .42 ? 1 : distance < .74 ? 2 : 3;
    const radius = q(tier === 1 ? 3.2 + random() * 1.5 : tier === 2 ? 2.3 + random() * 1.0 : 1.7 + random() * .6);
    const alpha = q(tier === 1 ? .42 : tier === 2 ? .26 : .14);
    const entry: ResearchNode = {
      id: `${group.key}-${index}`,
      x,
      y,
      radius,
      alpha,
      tier,
      community: group.key,
      kind: random() > 0.86 ? "paper" : "topic",
      domains: [...group.domains],
    };
    community.push(entry);
    nodes.push(entry);
  }
  // Local edges create recognisable subnetworks, while few cross-edges keep the world unified.
  for (const [index, node] of community.entries()) {
    const nearest = community
      .filter((other) => other.id !== node.id)
      .map((other) => ({
        other,
        // Math.hypot is implementation-defined; sqrt(dx²+dy²) is IEEE-rounded and engine-stable.
        distance: Math.sqrt((other.x - node.x) ** 2 + (other.y - node.y) ** 2),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, group.key === "central" ? 4 : (index % 4 === 0 ? 3 : 2));
    for (const item of nearest) link(node.id, item.other.id);
  }
}

// Explicit inter-community bridges: NOT academic citation claims.
const bridges: Array<[string, string]> = [
  ["central-3", "agent-7"], ["central-8", "multi-4"],
  ["central-16", "math-5"], ["central-22", "life-5"],
  ["central-27", "frontier-5"], ["central-21", "systems-8"],
  ["central-12", "multi-7"], ["central-18", "agent-6"],
  ["math-0", "agent-4"], ["math-6", "multi-7"],
  ["life-5", "multi-0"], ["multi-9", "systems-3"],
  ["agent-5", "frontier-6"], ["frontier-2", "systems-1"],
  ["agent-2", "multi-3"], ["systems-6", "math-2"],
  ["life-7", "math-4"], ["agent-8", "systems-7"],
  ["video", "life-4"], ["video", "multi-8"],
  ["consistency", "agent-3"], ["motion", "frontier-3"],
  ["cross-domain", "multi-2"], ["paper-frontier", "systems-8"],
];
bridges.forEach(([a, b]) => link(a, b));

const explore = ["video", "consistency", "subject", "multi-shot"];
const lineage = ["paper-early", "paper-compare", "paper-recent", "paper-frontier"];
for (let i = 1; i < explore.length; i++) link(explore[i - 1], explore[i], "studies");
for (let i = 1; i < lineage.length; i++) link(lineage[i - 1], lineage[i], "develops");
link("video", "controllable", "related");
link("video", "narrative", "related");
link("consistency", "subject", "studies");
link("subject", "scene", "related");
link("subject", "motion", "related");
link("paper-early", "multi-shot", "studies");
link("paper-compare", "multi-shot", "studies");
link("paper-recent", "gap", "compares");
link("paper-frontier", "gap", "compares");
link("gap", "candidate", "inspires");
link("cross-domain", "gap", "inspires");

export const world: GraphWorld = {
  viewBox: [0, 0, 1440, 850],
  nodes,
  edges,
  routes: {
    explore,
    lineage,
    innovationFrom: "cross-domain",
    innovationTo: "gap",
  },
  demoOnly: true,
};

export const nodesById = new Map(world.nodes.map((node) => [node.id, node]));

/** Fixture entity ids resolve onto the preserved #35 visual nodes. */
export const fixtureGraphIds = conceptGraphAliases;

export function nodeAt(id: string): ResearchNode {
  const resolved = conceptGraphAliases[id] ?? id;
  const node = nodesById.get(resolved);
  if (!node) throw new Error(`Missing Research World mock node: ${id}`);
  return node;
}

export function sharedForegroundIds() {
  return Object.fromEntries(
    Object.keys(conceptGraphAliases).map((fixtureId) => [fixtureId, nodeAt(fixtureId).id]),
  );
}

/** Background nodes are context only; they are not a quality metric and do not enter research facts. */
export function isForegroundNode(node: ResearchNode): boolean {
  return Boolean(node.fixtureId);
}

export function routePoints(ids: string[]) {
  return ids.map(nodeAt);
}

export function routeD(ids: string[]) {
  return routePoints(ids).map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ");
}

/**
 * Cumulative arc-length fraction of each point along a polyline route, so reveals
 * can sync to where the drawn line actually is (segments are rarely equal).
 */
export function routeArrivals(ids: string[]): number[] {
  const points = routePoints(ids);
  const legs = points.slice(1).map((n, i) => Math.sqrt((n.x - points[i].x) ** 2 + (n.y - points[i].y) ** 2));
  const total = legs.reduce((sum, leg) => sum + leg, 0) || 1;
  const arrivals: number[] = [];
  let walked = 0;
  for (const leg of legs) {
    arrivals.push(walked / total);
    walked += leg;
  }
  arrivals.push(1);
  return arrivals;
}
