import type { FixtureVariantId } from "../fixtures/variants";
import type { UserIntent, ViewerSnapshot } from "../viewer/protocol";

export type GuideMode = "watch" | "practice";

export type GuidePredicateId =
  | "draft-is-preset-or-acknowledged"
  | "explore-prepared"
  | "explore-task-chip"
  | "first-explore-complete"
  | "direction-selected-consistency"
  | "refine-prepared-consistency"
  | "refine-g2-complete"
  | "paper-p02-open"
  | "paper-p02-level-visible"
  | "paper-p02-returned"
  | "graph-fold-preserves-groups"
  | "graph-selected-crossshot"
  | "graph-preview-direction"
  | "graph-returned"
  | "context-added-crossshot"
  | "followup-sent"
  | "recovery-ready";

export interface GuideStep {
  readonly stepId: string;
  readonly startCheckpointMs: number;
  readonly recoveryCheckpointMs: number;
  readonly expectedIntent?: UserIntent;
  readonly targetAnchor: string;
  readonly title: string;
  readonly instruction: string;
  readonly why: string;
  readonly expectedFeedback: string;
  readonly success: GuidePredicateId;
  readonly variant?: FixtureVariantId;
}

export interface GuideDefinition {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly task: string;
  readonly versionNote: string;
  readonly presetLabel: string;
  readonly steps: readonly GuideStep[];
  readonly staticSteps: readonly string[];
  readonly nextGuideId?: string;
}

export interface GuideSession {
  readonly guideId: string;
  readonly stepId: string;
  readonly mode: GuideMode;
  readonly snapshot: ViewerSnapshot;
  readonly exampleAcknowledged: boolean;
  readonly followupSent: boolean;
  readonly message: string | null;
  readonly ignored: string | null;
  readonly completedStepIds: readonly string[];
  readonly instanceId: string;
  readonly stepActions: readonly UserIntent["type"][];
  readonly foldBaseline: string;
  readonly resource: Extract<UserIntent, { type: "resource_result" }> | null;
  readonly recoveryObserved: boolean;
  readonly recovered: boolean;
}

export type GuideEval = {
  readonly complete: boolean;
  readonly detail: string;
};
