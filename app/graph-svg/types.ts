/** Research World demo-only semantic graph. Stable world-space coordinates. */
export type NodeKind = "paper" | "topic" | "method" | "problem" | "candidate";

export type ResearchNode = {
  id: string;
  x: number;
  y: number;
  radius: number;
  kind: NodeKind;
  label?: string;
  domains: string[];
  /** Visual depth tier: 1 = community core, 3 = hazy rim. Foreground story nodes sit at tier 1. */
  tier?: 1 | 2 | 3;
  /** Baked drawing opacity so depth survives camera zooms without CSS blur. */
  alpha?: number;
  /** Community hue anchor; story nodes stay ink-colored and carry no community. */
  community?: string;
};

/** Palette metadata for one macro community, consumed by the renderer's glow layer. */
export type CommunityMeta = {
  key: string;
  color: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type ResearchEdge = {
  source: string;
  target: string;
  relation: "related" | "studies" | "develops" | "compares" | "inspires";
  /** Mock edges are visual teaching aids, not verified citation or lineage claims. */
  verified: false;
};

export type GraphWorld = {
  viewBox: readonly [number, number, number, number];
  nodes: ResearchNode[];
  edges: ResearchEdge[];
  /** Explicit semantic paths: never infer academic lineage from screen position. */
  routes: {
    explore: string[];
    lineage: string[];
    innovationFrom: string;
    innovationTo: string;
  };
  demoOnly: true;
};

export type Pose = {
  cx: number; cy: number; zoom: number; base: number;
  ring: number; papers: number; lineage: number;
  core: number; frontier: number; margin: number; boundary: number;
  idea: number; intent: number; explore: number; gap: number;
  transfer: number; candidate: number; markerX: number; markerY: number;
};
export type StoryChapter = {
  id: string; tag: string; title: string; body: string; takeaway: string;
  pose: Pose;
};
