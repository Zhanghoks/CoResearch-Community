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
  /** Shared fixture id when this node is a projection, not a decorative background mark. */
  fixtureId?: string;
};

/** Palette metadata for one macro community, consumed by the renderer's wash layer. */
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

/** Screen-space typography floors for HTML overlay labels and the open-question card. */
export const LABEL_MIN_PX = 14;
export const QUESTION_MIN_PX = 16;

/** Camera plus 8-act layer opacities. Research facts live on ConceptFrame.facts, not in the pose. */
export type Pose = {
  cx: number;
  cy: number;
  zoom: number;
  markerX: number;
  markerY: number;
  base: number;
  path: number;
  evidence: number;
  coverage: number;
  unverified: number;
  revision: number;
  question: number;
  nextStep: number;
};

export type RelationKind = "choice" | "read" | "compare" | "revise" | "candidate" | "limit";

export type ConceptRelation = {
  readonly from: string;
  readonly to: string;
  readonly label: string;
  readonly kind: RelationKind;
};

export type CoverageView = {
  readonly recordId: string;
  readonly statement: string;
  readonly previousStatement: string | null;
  readonly revisedStatement: string | null;
  readonly revises: boolean;
  readonly counterexampleIds: readonly string[];
};

export type ConceptFacts = {
  readonly kernelT: number;
  readonly interestPrompt: string;
  readonly focusIds: readonly string[];
  readonly directionIds: readonly string[];
  readonly dimmedDirectionIds: readonly string[];
  readonly paperIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly limitationIds: readonly string[];
  readonly relations: readonly ConceptRelation[];
  readonly coverage: CoverageView | null;
  readonly openQuestionId: string | null;
  readonly nextAction: string | null;
  readonly statusLabel: string | null;
  readonly foregroundIds: readonly string[];
};

export type StoryChapter = {
  id: string;
  tag: string;
  title: string;
  body: string;
  takeaway: string;
  action: string;
  change: string;
  next: string;
  holdMs: number;
  moveMs: number;
  kernelT: number;
  focusIds: readonly string[];
  pose: Pose;
};

export type ConceptFrame = {
  readonly pose: Pose;
  readonly active: number;
  readonly facts: ConceptFacts;
  readonly t: number;
};
