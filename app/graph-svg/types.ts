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
  /** Ordered appearance in the growing network. */
  born: number;
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
  growth: number; domains: number; slice: number; ring: number; papers: number; lineage: number;
  core: number; frontier: number; margin: number; boundary: number;
  idea: number; intent: number; explore: number; gap: number;
  transfer: number; candidate: number; markerX: number; markerY: number;
};
export type StoryChapter = {
  id: string; tag: string; title: string; body: string; takeaway: string;
  pose: Pose;
};
