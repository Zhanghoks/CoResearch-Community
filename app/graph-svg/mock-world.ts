import type { GraphWorld, ResearchEdge, ResearchNode } from "./types";

/** A stable, art-directed teaching map. Radius = local maturity; angle = domain.
 * Neither coordinate is a ranking or a claim about real research. */
export const ellipse = { cx: 720, cy: 425, rx: 600, ry: 325 };
export const domains = [
  { id: "vision", label: "视觉与生成", angle: 0, color: "#477c9c" },
  { id: "life", label: "生命科学", angle: 60, color: "#648f79" },
  { id: "society", label: "社会科学", angle: 120, color: "#a67864" },
  { id: "physics", label: "物理与材料", angle: 180, color: "#7689a5" },
  { id: "math", label: "数学与系统", angle: 240, color: "#9376a6" },
  { id: "language", label: "语言与认知", angle: 300, color: "#b39a60" },
];
export function point(radius: number, angle: number) {
  const a = angle * Math.PI / 180;
  return { x: ellipse.cx + ellipse.rx * radius * Math.cos(a), y: ellipse.cy + ellipse.ry * radius * Math.sin(a) };
}
export function sectorPath(inner: number, outer: number, start: number, end: number) {
  const a = point(outer, start), b = point(outer, end), c = point(inner, end), d = point(inner, start);
  return `M ${a.x} ${a.y} A ${ellipse.rx * outer} ${ellipse.ry * outer} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${ellipse.rx * inner} ${ellipse.ry * inner} 0 0 0 ${d.x} ${d.y} Z`;
}
const nodes: ResearchNode[] = [{ id: "foundation", x: 720, y: 425, radius: 14, kind: "paper", label: "前人的工作", domains: ["共同基础"], born: .05 }];
const edges: ResearchEdge[] = [];
// Sparse branching is deliberately legible. Children always have an existing parent.
for (let ring = 1; ring <= 5; ring++) {
  const count = ring * 12;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360 + (ring % 2 ? 4 : -3);
    const radius = ring * .18 + Math.sin(i * 2.31) * .022;
    const domain = domains[Math.floor(((angle + 30 + 360) % 360) / 60)];
    const p = point(radius, angle);
    const id = `r${ring}-${i}`;
    nodes.push({ id, ...p, radius: ring < 3 ? 5.5 : 4.5, kind: i % 5 === 0 ? "paper" : "topic", domains: [domain.label], born: .12 + ring * .14 + i / count * .1 });
    const parent = ring === 1 ? "foundation" : `r${ring - 1}-${Math.round(i / count * ((ring - 1) * 12)) % ((ring - 1) * 12)}`;
    edges.push({ source: parent, target: id, relation: "develops", verified: false });
    if (i > 0 && i % 3 === 0) edges.push({ source: `r${ring}-${i - 1}`, target: id, relation: "compares", verified: false });
  }
}
const foreground: ResearchNode[] = [
  { id: "video", x: 770, y: 412, radius: 10, kind: "topic", label: "视频生成", domains: ["视觉与生成"], born: .25 },
  { id: "consistency", x: 890, y: 380, radius: 9, kind: "problem", label: "生成一致性", domains: ["视觉与生成"], born: .38 },
  { id: "subject", x: 1000, y: 400, radius: 9, kind: "problem", label: "主体身份", domains: ["视觉与生成"], born: .5 },
  { id: "multi-shot", x: 1110, y: 367, radius: 9, kind: "problem", label: "跨镜头", domains: ["视觉与生成"], born: .65 },
  { id: "motion", x: 1205, y: 389, radius: 9, kind: "problem", label: "动作中的身份", domains: ["视觉与生成"], born: .8 },
  { id: "paper-early", x: 775, y: 435, radius: 9, kind: "paper", label: "基础工作 A", domains: ["视觉与生成"], born: .28 },
  { id: "paper-compare", x: 914, y: 466, radius: 9, kind: "paper", label: "方法改进 B", domains: ["视觉与生成"], born: .43 },
  { id: "paper-recent", x: 1054, y: 468, radius: 9, kind: "paper", label: "证据比较 C", domains: ["视觉与生成"], born: .6 },
  { id: "paper-frontier", x: 1178, y: 483, radius: 9, kind: "paper", label: "邻近工作 D", domains: ["视觉与生成"], born: .78 },
  { id: "gap", x: 1280, y: 440, radius: 10, kind: "problem", label: "待核实的限制", domains: ["视觉与生成"], born: 2 },
  { id: "candidate", x: 1400, y: 402, radius: 10, kind: "candidate", label: "候选方法", domains: ["视觉与生成"], born: 2 },
  { id: "cross-domain", x: 1040, y: 660, radius: 10, kind: "method", label: "其他领域的机制", domains: ["生命科学"], born: .8 },
];
nodes.push(...foreground);
const explore = ["video", "consistency", "subject", "multi-shot", "motion"];
const lineage = ["paper-early", "paper-compare", "paper-recent", "paper-frontier"];
for (const route of [explore, lineage]) {
  edges.push({ source: "foundation", target: route[0], relation: "develops", verified: false });
  for (let i = 1; i < route.length; i++) edges.push({ source: route[i - 1], target: route[i], relation: "develops", verified: false });
}
edges.push({ source: "paper-frontier", target: "gap", relation: "studies", verified: false }, { source: "gap", target: "candidate", relation: "inspires", verified: false });
export const world: GraphWorld = { viewBox: [0, 0, 1440, 850], nodes, edges, routes: { explore, lineage, innovationFrom: "cross-domain", innovationTo: "gap" }, demoOnly: true };
export const nodesById = new Map(nodes.map(n => [n.id, n]));
export function nodeAt(id: string): ResearchNode { const node = nodesById.get(id); if (!node) throw new Error(`Missing Research World mock node: ${id}`); return node; }
export function routePoints(ids: string[]) { return ids.map(nodeAt); }
export function routeD(ids: string[]) { return routePoints(ids).map((n, i) => `${i ? "L" : "M"} ${n.x} ${n.y}`).join(" "); }
