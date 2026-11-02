export type Region = "core" | "frontier" | "boundary";
export type Space = "literature" | "idea";
export type Frame = "desktop" | "phone";
export type Tier = "hair" | "local" | "bridge" | "key" | "idea";

export type GraphNode = {
  id: string;
  space: Space;
  region: Region;
  importance: 1 | 2 | 3 | 4 | 5;
  label?: string;
  /** Desktop, then phone. */
  d: readonly [number, number];
  p: readonly [number, number];
};

export type GraphEdge = {
  source: string;
  target: string;
  tier: Tier;
  dashed?: boolean;
};

export const regionOrder: Region[] = ["core", "frontier", "boundary"];

export const regionLabel: Record<Region, string> = {
  core: "核心",
  frontier: "前沿",
  boundary: "边界",
};

/** Hand-placed clusters. Literature is one space; the gold path is idea space. */
export const graphNodes: GraphNode[] = [
  { id: "prior", label: "身份先验", space: "literature", region: "core", importance: 5, d: [330, 410], p: [188, 168] },
  { id: "lock", label: "特征锁定", space: "literature", region: "core", importance: 4, d: [500, 290], p: [300, 112] },
  { id: "align", label: "早期对齐", space: "literature", region: "core", importance: 3, d: [190, 260], p: [86, 96] },
  { id: "proto", label: "评测协议", space: "literature", region: "core", importance: 3, d: [188, 530], p: [72, 220] },
  { id: "c1", space: "literature", region: "core", importance: 2, d: [270, 300], p: [150, 78] },
  { id: "c2", space: "literature", region: "core", importance: 1, d: [430, 175], p: [248, 58] },
  { id: "c3", space: "literature", region: "core", importance: 2, d: [545, 400], p: [318, 188] },
  { id: "c4", space: "literature", region: "core", importance: 2, d: [370, 590], p: [198, 248] },
  { id: "c5", space: "literature", region: "core", importance: 1, d: [250, 490], p: [118, 188] },
  { id: "c6", space: "literature", region: "core", importance: 1, d: [120, 390], p: [32, 158] },
  { id: "c7", space: "literature", region: "core", importance: 1, d: [350, 155], p: [198, 52] },
  { id: "c8", space: "literature", region: "core", importance: 1, d: [575, 230], p: [348, 132] },
  { id: "c9", space: "literature", region: "core", importance: 1, d: [470, 490], p: [268, 232] },
  { id: "c10", space: "literature", region: "core", importance: 1, d: [145, 185], p: [42, 78] },
  { id: "c11", space: "literature", region: "core", importance: 2, d: [78, 290], p: [24, 220] },
  { id: "c12", space: "literature", region: "core", importance: 1, d: [100, 540], p: [128, 258] },

  { id: "eval", label: "跨镜评测", space: "literature", region: "frontier", importance: 5, d: [735, 370], p: [196, 430] },
  { id: "drift", label: "动作漂移", space: "literature", region: "frontier", importance: 4, d: [900, 505], p: [308, 508] },
  { id: "time", label: "时序约束", space: "literature", region: "frontier", importance: 3, d: [590, 540], p: [82, 500] },
  { id: "compare", label: "方法比较", space: "literature", region: "frontier", importance: 3, d: [820, 215], p: [304, 352] },
  { id: "f1", space: "literature", region: "frontier", importance: 2, d: [640, 275], p: [118, 358] },
  { id: "f2", space: "literature", region: "frontier", importance: 2, d: [860, 325], p: [338, 418] },
  { id: "f3", space: "literature", region: "frontier", importance: 2, d: [555, 390], p: [68, 392] },
  { id: "f4", space: "literature", region: "frontier", importance: 2, d: [770, 575], p: [198, 538] },
  { id: "f5", space: "literature", region: "frontier", importance: 1, d: [990, 285], p: [356, 328] },
  { id: "f6", space: "literature", region: "frontier", importance: 1, d: [690, 655], p: [36, 458] },
  { id: "f7", space: "literature", region: "frontier", importance: 1, d: [505, 250], p: [150, 312] },
  { id: "f8", space: "literature", region: "frontier", importance: 1, d: [930, 175], p: [250, 302] },
  { id: "f9", space: "literature", region: "frontier", importance: 1, d: [1045, 235], p: [362, 488] },
  { id: "f10", space: "literature", region: "frontier", importance: 1, d: [650, 155], p: [36, 340] },
  { id: "f11", space: "literature", region: "frontier", importance: 1, d: [870, 630], p: [292, 562] },
  { id: "f12", space: "literature", region: "frontier", importance: 1, d: [490, 575], p: [96, 568] },

  { id: "bound", label: "证据边界", space: "literature", region: "boundary", importance: 4, d: [1100, 395], p: [198, 708] },
  { id: "limit", label: "未解限制", space: "literature", region: "boundary", importance: 3, d: [1210, 260], p: [312, 642] },
  { id: "near", label: "邻近工作", space: "literature", region: "boundary", importance: 3, d: [1175, 545], p: [92, 778] },
  { id: "b1", space: "literature", region: "boundary", importance: 2, d: [1005, 300], p: [78, 658] },
  { id: "b2", space: "literature", region: "boundary", importance: 1, d: [1165, 155], p: [338, 712] },
  { id: "b3", space: "literature", region: "boundary", importance: 2, d: [1245, 400], p: [198, 812] },
  { id: "b4", space: "literature", region: "boundary", importance: 1, d: [1035, 530], p: [36, 738] },
  { id: "b5", space: "literature", region: "boundary", importance: 1, d: [1240, 590], p: [348, 792] },
  { id: "b6", space: "literature", region: "boundary", importance: 1, d: [980, 470], p: [138, 648] },
  { id: "b7", space: "literature", region: "boundary", importance: 1, d: [1195, 470], p: [272, 812] },

  { id: "video", label: "视频生成", space: "idea", region: "core", importance: 4, d: [245, 640], p: [112, 308] },
  { id: "consist", label: "生成一致性", space: "idea", region: "core", importance: 4, d: [455, 500], p: [162, 318] },
  { id: "subject", label: "主体身份", space: "idea", region: "frontier", importance: 5, d: [625, 455], p: [258, 392] },
  { id: "shot", label: "跨镜头", space: "idea", region: "frontier", importance: 4, d: [800, 455], p: [142, 548] },
  { id: "motion", label: "动作身份", space: "idea", region: "boundary", importance: 4, d: [960, 360], p: [268, 618] },
];

const keyPairs: Array<[string, string]> = [
  ["align", "prior"],
  ["proto", "prior"],
  ["prior", "lock"],
  ["lock", "eval"],
  ["time", "eval"],
  ["compare", "eval"],
  ["eval", "drift"],
  ["drift", "bound"],
  ["limit", "bound"],
  ["near", "bound"],
];

const bridgePairs: Array<[string, string]> = [
  ["prior", "time"],
  ["eval", "bound"],
  ["drift", "near"],
  ["compare", "limit"],
];

const ideaPairs: Array<[string, string]> = [
  ["video", "consist"],
  ["consist", "subject"],
  ["subject", "shot"],
  ["shot", "motion"],
];

const projectionPairs: Array<[string, string]> = [
  ["video", "proto"],
  ["consist", "prior"],
  ["subject", "eval"],
  ["shot", "compare"],
  ["motion", "drift"],
];

const rank: Record<Tier, number> = { hair: 1, local: 2, bridge: 3, key: 4, idea: 5 };

function point(node: GraphNode, frame: Frame) {
  const [x, y] = frame === "phone" ? node.p : node.d;
  if (frame === "phone") return { x, y };
  const cy = 400;
  return { x, y: cy + (y - cy) * 1.22 };
}

export function radius(importance: number, frame: Frame) {
  const desktop = [0, 7, 10, 15, 21, 30];
  const phone = [0, 4.5, 6.5, 10, 14, 19];
  return (frame === "phone" ? phone : desktop)[importance] ?? 6;
}

export function edgesFor(frame: Frame): GraphEdge[] {
  const byId = new Map(graphNodes.map((node) => [node.id, node]));
  const map = new Map<string, GraphEdge>();
  const put = (source: string, target: string, tier: Tier, dashed = false) => {
    if (source === target) return;
    const id = [source, target].sort().join("|");
    const prev = map.get(id);
    if (prev && rank[prev.tier] > rank[tier]) return;
    map.set(id, { source, target, tier, dashed });
  };

  for (const region of regionOrder) {
    const group = graphNodes.filter((node) => node.space === "literature" && node.region === region);
    for (const node of group) {
      const origin = point(node, frame);
      const nearest = group
        .filter((other) => other.id !== node.id)
        .map((other) => {
          const there = point(other, frame);
          return { other, dist: Math.hypot(there.x - origin.x, there.y - origin.y) };
        })
        .sort((a, b) => a.dist - b.dist)
        .slice(0, node.importance >= 4 ? 2 : 1);
      for (const item of nearest) {
        const tier: Tier = node.importance <= 2 && item.other.importance <= 2 ? "hair" : "local";
        put(node.id, item.other.id, tier);
      }
    }
  }

  for (const [source, target] of bridgePairs) put(source, target, "bridge");
  for (const [source, target] of keyPairs) put(source, target, "key");
  for (const [source, target] of ideaPairs) put(source, target, "idea");
  for (const [source, target] of projectionPairs) put(source, target, "idea", true);
  for (const edge of map.values()) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) {
      throw new Error(`Missing endpoint for ${edge.source}->${edge.target}`);
    }
  }
  return [...map.values()];
}

export function curve(
  a: { x: number; y: number },
  b: { x: number; y: number },
  bend: number,
) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const mag = len * bend;
  return {
    d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${(mx + (-dy / len) * mag).toFixed(1)} ${(my + (dx / len) * mag).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
    x1: a.x,
    y1: a.y,
    x2: b.x,
    y2: b.y,
  };
}

export function bendFor(edge: GraphEdge) {
  let hash = 0;
  const key = `${edge.source}|${edge.target}`;
  for (const char of key) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  const sign = hash % 2 === 0 ? 1 : -1;
  if (edge.tier === "key") return sign * 0.05;
  if (edge.tier === "idea") return edge.dashed ? sign * 0.08 : 0.12;
  if (edge.tier === "bridge") return sign * 0.09;
  return sign * (0.14 + (hash % 12) / 80);
}

export function pos(node: GraphNode, frame: Frame) {
  return point(node, frame);
}

export const halos: Record<Frame, Record<Region, { cx: number; cy: number; rx: number; ry: number }>> = {
  desktop: {
    core: { cx: 330, cy: 400, rx: 300, ry: 360 },
    frontier: { cx: 760, cy: 400, rx: 290, ry: 360 },
    boundary: { cx: 1105, cy: 405, rx: 230, ry: 330 },
  },
  phone: {
    core: { cx: 190, cy: 155, rx: 180, ry: 125 },
    frontier: { cx: 195, cy: 440, rx: 180, ry: 145 },
    boundary: { cx: 195, cy: 720, rx: 175, ry: 125 },
  },
};

export const fieldLabels: Record<Frame, Array<{ text: string; x: number; y: number; kind: Region | "idea" }>> = {
  desktop: [
    { text: "核心", x: 210, y: 46, kind: "core" },
    { text: "前沿", x: 760, y: 46, kind: "frontier" },
    { text: "边界", x: 980, y: 118, kind: "boundary" },
    { text: "想法空间", x: 118, y: 768, kind: "idea" },
  ],
  phone: [
    { text: "核心", x: 16, y: 28, kind: "core" },
    { text: "前沿", x: 16, y: 274, kind: "frontier" },
    { text: "边界", x: 16, y: 600, kind: "boundary" },
    { text: "想法空间", x: 300, y: 292, kind: "idea" },
  ],
};
