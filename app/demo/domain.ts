/**
 * Demo-only domain types for the shared synthetic research fixture.
 * This schema does not replace or extend the production CoResearch database.
 * Core UI view models must be produced through adapters, never by treating
 * these fields as the product API.
 */

export const DEMO_SCENARIO_ID = "video-identity";
export const DEMO_FIXTURE_VERSION = "1.0.0";
export const DEMO_COMMUNITY_BASELINE = "7b9040fb48212450678f996fe8c9c370fadc83d8";
export const DEMO_CORE_BASELINE = "a52c71845fecb7409e7f3df427650a6be85cebec";

/** Inclusive event boundary: an event at time t is part of stateAt(t). */
export const EVENT_BOUNDARY = "closed-right" as const;

export type TaskKind = "explore" | "deep_dive" | "deep_research";
export type DirectionKind = "topic" | "direction";
export type PaperAvailability = "full-text" | "metadata-only" | "unavailable";
export type EvidenceEpistemic = "reported" | "inferred" | "unknown";
export type OpenQuestionStatus = "candidate" | "selected-for-investigation";
export type PauseReason = "user" | "hidden" | "offscreen" | "content-focus" | "content-hover" | "ended";
export type PauseSource =
  | "content-pointer"
  | "content-focus"
  | "content-hover"
  | "player-control"
  | "script"
  | "visibility"
  | "offscreen";

export interface CapabilityProfile {
  /** Open in the current product task menu at the recorded Core SHA. */
  readonly openTasks: readonly ["explore"];
  /** Present in the menu but locked; this demo must not treat them as default executable actions. */
  readonly lockedTasks: readonly ["deep_dive", "deep_research"];
  /** Idea State has display code but is gated; it is not in this demo unless a future profile says so. */
  readonly ideaStateInDemo: false;
  /** Capabilities inspected only in source, not verified in a running Core or production deploy. */
  readonly unverified: readonly string[];
}

export interface SourceCommits {
  readonly community: string;
  readonly core: string;
}

export interface Manifest {
  readonly scenarioId: string;
  readonly fixtureVersion: string;
  readonly sourceCommit: SourceCommits;
  readonly capabilityProfile: CapabilityProfile;
  readonly synthetic: true;
}

export interface DirectionParentRef {
  readonly groupId: string;
  readonly directionId: string;
  readonly groupRevisionId: string;
  readonly directionRevisionId: string;
}

export interface Direction {
  readonly id: string;
  readonly name: string;
  readonly kind: DirectionKind;
  readonly intro: string;
  readonly paperIds: readonly string[];
  readonly revisionId: string;
}

export interface DirectionGroup {
  readonly id: string;
  readonly revisionId: string;
  readonly parent: DirectionParentRef | null;
  readonly directionIds: readonly string[];
}

export interface PaperExcerpt {
  readonly id: string;
  readonly heading: string;
  readonly text: string;
  readonly conditions: readonly string[];
}

export interface Paper {
  readonly id: string;
  readonly cardVersion: string;
  readonly title: string;
  readonly authors: readonly ["CoResearch Demo"];
  readonly source: "demo-fixture";
  readonly synthetic: true;
  readonly demoTag: "演示文献";
  readonly abstract: string;
  readonly method: string;
  readonly conditionSection: string;
  readonly excerpts: readonly PaperExcerpt[];
  readonly availability: PaperAvailability;
}

export interface Evidence {
  readonly id: string;
  readonly claim: string;
  readonly paperIds: readonly string[];
  readonly excerptIds: readonly string[];
  readonly conditions: readonly string[];
  readonly coverageRound: string;
  readonly epistemic: EvidenceEpistemic;
  readonly synthetic: true;
}

export interface Limitation {
  readonly id: string;
  readonly statement: string;
}

export interface CoverageRecord {
  readonly id: string;
  readonly statement: string;
  readonly round: string;
}

export interface Counterexample {
  readonly id: string;
  readonly paperId: string;
  readonly revisesRecordId: string;
  readonly previousStatement: string;
  readonly revisedStatement: string;
  readonly reason: string;
}

export interface OpenQuestion {
  readonly id: string;
  readonly question: string;
  readonly scope: string;
  readonly recentWork: string;
  readonly evidenceIds: readonly string[];
  readonly counterexampleIds: readonly string[];
  readonly limitationIds: readonly string[];
  readonly uncertainty: string;
  readonly whyInvestigate: string;
  readonly nextAction: string;
  readonly status: OpenQuestionStatus;
  /**
   * Intentionally omitted. The fixture must never auto-set a novelty pass
   * on a real Direction.gap or on this teaching question.
   */
  readonly noveltyPass?: undefined;
}

export interface ResearchWorld {
  readonly manifest: Manifest;
  readonly directions: readonly Direction[];
  readonly groups: readonly DirectionGroup[];
  readonly papers: readonly Paper[];
  readonly evidence: readonly Evidence[];
  readonly limitations: readonly Limitation[];
  readonly coverageRecords: readonly CoverageRecord[];
  readonly counterexamples: readonly Counterexample[];
  readonly openQuestions: readonly OpenQuestion[];
  readonly interestPrompt: string;
}

export interface PaperReadingRecord {
  readonly paperId: string;
  readonly discovered: boolean;
  readonly abstractBrowsed: boolean;
  readonly fullTextRead: boolean;
  readonly availability: PaperAvailability;
  readonly openCount: number;
}

export interface CoverageRevision {
  readonly recordId: string;
  readonly previousRecordId: string;
  readonly reason: string;
  readonly counterexampleId: string;
  readonly at: number;
}

export interface PreparedTask {
  readonly task: "explore";
  readonly prompt: string;
  readonly parentDirectionId?: string;
}

export interface SentTask {
  readonly id: string;
  readonly task: "explore";
  readonly prompt: string;
  readonly parentDirectionId?: string;
  readonly sentAt: number;
  readonly completedAt: number | null;
}

export interface DerivedReadCounts {
  readonly discovered: number;
  readonly abstractBrowsed: number;
  readonly fullTextRead: number;
}

export interface WorldState {
  readonly t: number;
  readonly preparedTask: PreparedTask | null;
  readonly sentTasks: readonly SentTask[];
  readonly activeTaskProgress: string | null;
  readonly visibleGroupIds: readonly string[];
  readonly selectedDirectionId: string | null;
  readonly paperReading: Readonly<Record<string, PaperReadingRecord>>;
  readonly evidenceIds: readonly string[];
  readonly coverageRecordIds: readonly string[];
  readonly coverageRevisions: readonly CoverageRevision[];
  readonly openQuestionId: string | null;
  readonly openQuestionStatus: OpenQuestionStatus | null;
  readonly addedContextDirectionIds: readonly string[];
  readonly counts: DerivedReadCounts;
}

export interface SceneScript {
  readonly sceneId: string;
  readonly action: string;
  readonly targetId: string;
  readonly startMs: number;
  readonly checkpointMs: number;
  readonly focusIds: readonly string[];
  readonly caption: { readonly tag: string; readonly title: string; readonly body: string };
  readonly readingHold: boolean;
}

export interface ProductProjection {
  readonly kind: "product";
  readonly directionIds: readonly string[];
  readonly groupIds: readonly string[];
  readonly paperIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly openQuestionId: string | null;
  readonly counts: DerivedReadCounts;
  readonly selectedDirectionId: string | null;
}

export interface ConceptProjection {
  readonly kind: "concept";
  readonly directionIds: readonly string[];
  readonly paperIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly openQuestionId: string | null;
  readonly coverageRecordIds: readonly string[];
  readonly counterexampleIds: readonly string[];
}

export interface GuideProjection {
  readonly kind: "guide";
  readonly directionIds: readonly string[];
  readonly paperIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly openQuestionId: string | null;
  readonly preparedTask: PreparedTask | null;
  readonly counts: DerivedReadCounts;
}
