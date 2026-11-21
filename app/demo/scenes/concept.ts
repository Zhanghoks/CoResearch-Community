import type { ConceptProjection, ResearchWorld, SceneScript, WorldState } from "../domain";
import type { DemoTimeline } from "../events";
import {
  INTEREST_PROMPT,
  OPEN_QUESTION_ID,
  coverageById,
  counterexamples,
  directionById,
  limitations,
  openQuestions,
  videoIdentityWorld,
} from "../fixtures/video-identity";
import { demoScenes } from "../timeline";
import type { ConceptFacts, ConceptRelation, CoverageView } from "../../graph-svg/types";

export const conceptScenes = demoScenes;

/**
 * Visual graph ids stay on the #35 engine. This map is identity alignment only;
 * labels and claims must come from the fixture, not from a second fact table.
 */
export const conceptGraphAliases: Readonly<Record<string, string>> = {
  "d-video": "video",
  "d-consistency": "consistency",
  "d-controllable": "controllable",
  "d-narrative": "narrative",
  "d-identity": "subject",
  "d-scene": "scene",
  "d-motion": "motion",
  "d-crossshot": "multi-shot",
  P01: "paper-early",
  P02: "paper-compare",
  P05: "paper-recent",
  P03: "paper-frontier",
  P06: "cross-domain",
  [OPEN_QUESTION_ID]: "gap",
};

export function fixtureIdToGraphId(id: string): string {
  return conceptGraphAliases[id] ?? id;
}

export function graphIdToFixtureId(id: string): string {
  const entry = Object.entries(conceptGraphAliases).find(([, graphId]) => graphId === id);
  return entry?.[0] ?? id;
}

export const CONCEPT_MOVE_MS = 500;
export const CONCEPT_ACT_HOLDS_MS = [4000, 5500, 7000, 7000, 6000, 8000, 9000, 12000] as const;

/** Kernel times at which each act's fixture facts are settled. */
export const CONCEPT_KERNEL_T = [5200, 16800, 20800, 22000, 22000, 28000, 32400, 34500] as const;

const question = openQuestions[0]!;
const covInitial = coverageById.get("cov-short-visible")!;
const ce01 = counterexamples.find((item) => item.id === "CE01")!;
const ce02 = counterexamples.find((item) => item.id === "CE02")!;

export type ConceptActTiming = {
  readonly index: number;
  readonly startMs: number;
  readonly checkpointMs: number;
  readonly endMs: number;
  readonly holdMs: number;
  readonly moveMs: number;
};

function buildTimings(): readonly ConceptActTiming[] {
  const acts: ConceptActTiming[] = [];
  let cursor = 0;
  for (let index = 0; index < CONCEPT_ACT_HOLDS_MS.length; index += 1) {
    const holdMs = CONCEPT_ACT_HOLDS_MS[index]!;
    const moveMs = index === 0 ? 0 : CONCEPT_MOVE_MS;
    const startMs = cursor;
    const checkpointMs = startMs + moveMs;
    const endMs = checkpointMs + holdMs;
    acts.push({ index, startMs, checkpointMs, endMs, holdMs, moveMs });
    cursor = endMs;
  }
  return acts;
}

export const conceptActTimings = buildTimings();
export const CONCEPT_DURATION_MS = conceptActTimings[conceptActTimings.length - 1]!.endMs;

function rel(from: string, to: string, label: string, kind: ConceptRelation["kind"]): ConceptRelation {
  return { from, to, label, kind };
}

function coverageInitial(): CoverageView {
  return {
    recordId: covInitial.id,
    statement: covInitial.statement,
    previousStatement: null,
    revisedStatement: null,
    revises: false,
    counterexampleIds: [],
  };
}

function coverageRevised(): CoverageView {
  return {
    recordId: covInitial.id,
    statement: ce01.revisedStatement,
    previousStatement: covInitial.statement,
    revisedStatement: `${ce01.revisedStatement} ${ce02.revisedStatement}`,
    revises: true,
    counterexampleIds: [ce01.id, ce02.id],
  };
}

const STATUS_LABEL = "示例问题 / 值得继续调查 / 新颖性和有效性未验证";

function facts(
  index: number,
  patch: Partial<ConceptFacts> & Pick<ConceptFacts, "focusIds" | "directionIds" | "foregroundIds">,
): ConceptFacts {
  return {
    kernelT: CONCEPT_KERNEL_T[index]!,
    interestPrompt: INTEREST_PROMPT,
    dimmedDirectionIds: [],
    paperIds: [],
    evidenceIds: [],
    limitationIds: [],
    relations: [],
    coverage: null,
    openQuestionId: null,
    nextAction: null,
    statusLabel: null,
    ...patch,
  };
}

/** Domain facts for a settled act. Camera interpolation must not invent a second fact table. */
export function factsForAct(index: number): ConceptFacts {
  const act = Math.max(0, Math.min(7, index));
  switch (act) {
    case 0:
      return facts(0, {
        focusIds: ["d-video", "d-consistency", "d-controllable", "d-narrative"],
        directionIds: ["d-video", "d-consistency", "d-controllable", "d-narrative"],
        foregroundIds: ["d-video", "d-consistency", "d-controllable", "d-narrative", "interest"],
      });
    case 1:
      return facts(1, {
        focusIds: ["d-consistency", "d-identity", "d-crossshot"],
        directionIds: ["d-video", "d-consistency", "d-identity", "d-crossshot"],
        dimmedDirectionIds: ["d-controllable", "d-narrative", "d-scene", "d-motion"],
        relations: [
          rel("d-video", "d-consistency", "选择 / 细分", "choice"),
          rel("d-consistency", "d-identity", "选择 / 细分", "choice"),
          rel("d-identity", "d-crossshot", "选择 / 细分", "choice"),
        ],
        foregroundIds: ["d-video", "d-consistency", "d-identity", "d-crossshot", "path"],
      });
    case 2:
      return facts(2, {
        focusIds: ["d-crossshot", "P01", "P02", "E01"],
        directionIds: ["d-crossshot"],
        paperIds: ["P01", "P02"],
        evidenceIds: ["E01"],
        relations: [
          rel("P01", "d-crossshot", "阅读条件", "read"),
          rel("P02", "d-crossshot", "阅读条件", "read"),
        ],
        foregroundIds: ["d-crossshot", "P01", "P02", "E01"],
      });
    case 3:
      return facts(3, {
        focusIds: ["d-crossshot", "P01", "P02", "L01", "L02"],
        directionIds: ["d-crossshot"],
        paperIds: ["P01", "P02"],
        evidenceIds: ["E01"],
        limitationIds: ["L01", "L02"],
        relations: [
          rel("P01", "d-crossshot", "条件限制", "limit"),
          rel("P02", "d-crossshot", "条件限制", "limit"),
        ],
        coverage: coverageInitial(),
        foregroundIds: ["d-crossshot", "P01", "P02", "L01", "L02", "coverage"],
      });
    case 4:
      return facts(4, {
        focusIds: ["cov-short-visible", "d-crossshot"],
        directionIds: ["d-crossshot"],
        paperIds: ["P01", "P02"],
        evidenceIds: ["E01"],
        limitationIds: ["L01", "L02"],
        coverage: coverageInitial(),
        relations: [rel("d-crossshot", "P05", "补查近邻工作", "compare")],
        foregroundIds: ["d-crossshot", "cov-short-visible", "P01", "P02", "followup"],
      });
    case 5:
      return facts(5, {
        focusIds: ["cov-short-visible", "P05", "P03", "CE01", "CE02"],
        directionIds: ["d-crossshot"],
        paperIds: ["P01", "P02", "P05", "P03"],
        evidenceIds: ["E01", "E02"],
        limitationIds: ["L01", "L02"],
        coverage: coverageRevised(),
        relations: [
          rel("P05", "cov-short-visible", "反例", "revise"),
          rel("P03", "cov-short-visible", "反例", "revise"),
        ],
        foregroundIds: ["cov-short-visible", "P05", "P03", "CE01", "CE02"],
      });
    case 6:
      return facts(6, {
        focusIds: [OPEN_QUESTION_ID, "E03", "P06"],
        directionIds: ["d-crossshot"],
        paperIds: ["P01", "P02", "P06"],
        evidenceIds: ["E03"],
        limitationIds: ["L01", "L02"],
        coverage: coverageRevised(),
        openQuestionId: OPEN_QUESTION_ID,
        nextAction: question.nextAction,
        statusLabel: STATUS_LABEL,
        relations: [
          rel("P01", OPEN_QUESTION_ID, "有条件支持", "read"),
          rel("P02", OPEN_QUESTION_ID, "有条件支持", "read"),
          rel("P06", OPEN_QUESTION_ID, "候选迁移，待验证", "candidate"),
        ],
        foregroundIds: [OPEN_QUESTION_ID, "P01", "P02", "P06"],
      });
    default:
      return facts(7, {
        focusIds: [OPEN_QUESTION_ID, "next-step"],
        directionIds: ["d-crossshot"],
        paperIds: ["P04", "P06"],
        evidenceIds: ["E03"],
        limitationIds: ["L01", "L02"],
        coverage: coverageRevised(),
        openQuestionId: OPEN_QUESTION_ID,
        nextAction: question.nextAction,
        statusLabel: STATUS_LABEL,
        relations: [
          rel("P06", OPEN_QUESTION_ID, "候选迁移，待验证", "candidate"),
          rel(OPEN_QUESTION_ID, "next-step", "研究者选择下一步", "compare"),
        ],
        foregroundIds: [OPEN_QUESTION_ID, "P04", "P06", "next-step"],
      });
  }
}

export function conceptActIndexAt(t: number): number {
  const ms = Number.isFinite(t) ? Math.max(0, Math.min(CONCEPT_DURATION_MS, t)) : 0;
  let current = 0;
  for (const act of conceptActTimings) {
    if (ms >= act.startMs) current = act.index;
  }
  return current;
}

export function conceptPhaseCheckpointMs(index: number): number {
  const act = conceptActTimings[Math.max(0, Math.min(conceptActTimings.length - 1, index))];
  return act?.checkpointMs ?? 0;
}

/** The revision is a sequence, not a simultaneous pile of new cards. */
export function conceptRevisionBeat(t: number): "before" | "p05" | "p03" | "after" | "all" {
  const act = conceptActTimings[5]!;
  if (t < act.checkpointMs || t >= act.endMs) return "all";
  const local = t - act.checkpointMs;
  if (local < 950) return "before";
  if (local < 2300) return "p05";
  if (local < 3750) return "p03";
  return "after";
}

/** Continuous 0..7 progress: move windows interpolate, holds stay on the integer act. */
export function conceptProgressAt(t: number): number {
  const ms = Number.isFinite(t) ? Math.max(0, Math.min(CONCEPT_DURATION_MS, t)) : 0;
  const index = conceptActIndexAt(ms);
  const act = conceptActTimings[index]!;
  if (act.moveMs > 0 && ms < act.checkpointMs) {
    const local = (ms - act.startMs) / act.moveMs;
    return index - 1 + Math.max(0, Math.min(1, local));
  }
  return index;
}

export const conceptRuntimeScenes: readonly SceneScript[] = conceptActTimings.map((act, index) => {
  const chapterId = ["interest", "choose", "read", "compare", "coverage", "revise", "question", "next-step"][index]!;
  return {
    sceneId: chapterId,
    action: chapterId,
    targetId: factsForAct(index).focusIds[0] ?? "d-video",
    startMs: act.startMs,
    checkpointMs: act.checkpointMs,
    focusIds: factsForAct(index).focusIds,
    caption: {
      tag: `ACT ${index + 1}`,
      title: chapterId,
      body: `${directionById.get("d-video")?.name ?? ""} · ${limitations[0]?.statement ?? ""}`,
    },
    readingHold: index >= 2,
  };
});

export const conceptRuntimeTimeline: DemoTimeline = {
  events: [],
  durationMs: CONCEPT_DURATION_MS,
};

export function projectConcept(world: ResearchWorld, state: WorldState): ConceptProjection {
  const visibleDirections = world.groups
    .filter((group) => state.visibleGroupIds.includes(group.id))
    .flatMap((group) => group.directionIds);
  const paperIds = Object.values(state.paperReading)
    .filter((record) => record.discovered)
    .map((record) => record.paperId);
  return {
    kind: "concept",
    directionIds: unique(["d-video", ...visibleDirections]),
    paperIds,
    evidenceIds: [...state.evidenceIds],
    openQuestionId: state.openQuestionId,
    coverageRecordIds: [...state.coverageRecordIds],
    counterexampleIds: state.coverageRevisions.map((item) => item.counterexampleId),
  };
}

export { videoIdentityWorld };

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}
