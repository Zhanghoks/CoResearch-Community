import type {
  DerivedReadCounts,
  PaperReadingRecord,
  ResearchWorld,
  SentTask,
  WorldState,
} from "./domain";
import type { DemoEvent, DemoTimeline } from "./events";
import { eventsAtOrBefore, sortEvents } from "./events";

export class FixtureIntegrityError extends Error {
  readonly code = "fixture_integrity";
  constructor(message: string) {
    super(message);
    this.name = "FixtureIntegrityError";
  }
}

function uniqueIds(label: string, ids: readonly string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new FixtureIntegrityError(`Duplicate ${label} id: ${id}`);
    seen.add(id);
  }
}

function requireId(label: string, table: ReadonlyMap<string, unknown>, id: string): void {
  if (!table.has(id)) throw new FixtureIntegrityError(`Missing ${label}: ${id}`);
}

/** Structural checks: no duplicate or orphan ids, G1 has no parent, G2/G3 pin both revisions. */
export function validateWorld(world: ResearchWorld): void {
  uniqueIds("direction", world.directions.map((item) => item.id));
  uniqueIds("direction revision", world.directions.map((item) => item.revisionId));
  uniqueIds("group", world.groups.map((item) => item.id));
  uniqueIds("group revision", world.groups.map((item) => item.revisionId));
  uniqueIds("paper", world.papers.map((item) => item.id));
  uniqueIds("evidence", world.evidence.map((item) => item.id));
  uniqueIds("limitation", world.limitations.map((item) => item.id));
  uniqueIds("coverage", world.coverageRecords.map((item) => item.id));
  uniqueIds("counterexample", world.counterexamples.map((item) => item.id));
  uniqueIds("open question", world.openQuestions.map((item) => item.id));

  const directions = new Map(world.directions.map((item) => [item.id, item]));
  const groups = new Map(world.groups.map((item) => [item.id, item]));
  const papers = new Map(world.papers.map((item) => [item.id, item]));
  const excerpts = new Map(world.papers.flatMap((paper) => paper.excerpts.map((excerpt) => [excerpt.id, paper.id] as const)));
  const evidence = new Map(world.evidence.map((item) => [item.id, item]));
  const limitations = new Map(world.limitations.map((item) => [item.id, item]));
  const coverage = new Map(world.coverageRecords.map((item) => [item.id, item]));
  const counterexamples = new Map(world.counterexamples.map((item) => [item.id, item]));

  for (const paper of world.papers) {
    if (!paper.synthetic || paper.demoTag !== "演示文献" || !paper.title.includes("演示文献")) {
      throw new FixtureIntegrityError(`Paper ${paper.id} must be clearly marked as synthetic demo literature`);
    }
    if (paper.authors.length !== 1 || paper.authors[0] !== "CoResearch Demo") {
      throw new FixtureIntegrityError(`Paper ${paper.id} must use the CoResearch Demo author only`);
    }
    uniqueIds(`excerpt in ${paper.id}`, paper.excerpts.map((excerpt) => excerpt.id));
    if (paper.availability !== "full-text" && paper.excerpts.length > 0) {
      throw new FixtureIntegrityError(`Paper ${paper.id} is ${paper.availability} but still has excerpts`);
    }
  }

  for (const direction of world.directions) {
    for (const paperId of direction.paperIds) requireId("paper on direction", papers, paperId);
  }

  for (const group of world.groups) {
    for (const directionId of group.directionIds) requireId("direction in group", directions, directionId);
    if (group.id === "G1") {
      if (group.parent !== null) throw new FixtureIntegrityError("G1 must not have a parent");
    } else if (!group.parent) {
      throw new FixtureIntegrityError(`${group.id} must declare a parent group and direction with both revisions`);
    } else {
      const parentGroup = groups.get(group.parent.groupId);
      const parentDirection = directions.get(group.parent.directionId);
      if (!parentGroup) throw new FixtureIntegrityError(`${group.id} parent group ${group.parent.groupId} is missing`);
      if (!parentDirection) throw new FixtureIntegrityError(`${group.id} parent direction ${group.parent.directionId} is missing`);
      if (group.parent.groupRevisionId !== parentGroup.revisionId) {
        throw new FixtureIntegrityError(`${group.id} parent group revision must equal ${parentGroup.id}.revisionId`);
      }
      if (group.parent.directionRevisionId !== parentDirection.revisionId) {
        throw new FixtureIntegrityError(`${group.id} parent direction revision must equal ${parentDirection.id}.revisionId`);
      }
      if (!parentGroup.directionIds.includes(group.parent.directionId)) {
        throw new FixtureIntegrityError(`${group.id} parent direction is not in parent group ${parentGroup.id}`);
      }
    }
  }

  for (const item of world.evidence) {
    if (!item.synthetic) throw new FixtureIntegrityError(`Evidence ${item.id} must be synthetic`);
    for (const paperId of item.paperIds) requireId("paper on evidence", papers, paperId);
    for (const excerptId of item.excerptIds) {
      const paperId = excerpts.get(excerptId);
      if (!paperId) throw new FixtureIntegrityError(`Orphan excerpt ${excerptId} on evidence ${item.id}`);
      if (!item.paperIds.includes(paperId)) {
        throw new FixtureIntegrityError(`Excerpt ${excerptId} on ${item.id} is not in the evidence paper list`);
      }
    }
  }

  for (const item of world.counterexamples) {
    requireId("paper on counterexample", papers, item.paperId);
    requireId("coverage on counterexample", coverage, item.revisesRecordId);
  }

  for (const question of world.openQuestions) {
    if (question.noveltyPass !== undefined) {
      throw new FixtureIntegrityError(`Open question ${question.id} must not set noveltyPass`);
    }
    for (const id of question.evidenceIds) requireId("evidence on question", evidence, id);
    for (const id of question.counterexampleIds) requireId("counterexample on question", counterexamples, id);
    for (const id of question.limitationIds) requireId("limitation on question", limitations, id);
  }
}

export function validateTimeline(world: ResearchWorld, timeline: DemoTimeline): void {
  validateWorld(world);
  uniqueIds("event", timeline.events.map((event) => event.id));
  const groups = new Set(world.groups.map((item) => item.id));
  const directions = new Set(world.directions.map((item) => item.id));
  const papers = new Map(world.papers.map((item) => [item.id, item]));
  const evidence = new Set(world.evidence.map((item) => item.id));
  const coverage = new Set(world.coverageRecords.map((item) => item.id));
  const counterexamples = new Set(world.counterexamples.map((item) => item.id));
  const questions = new Set(world.openQuestions.map((item) => item.id));
  const taskIds = new Set<string>();

  for (const event of timeline.events) {
    if (!Number.isFinite(event.t) || event.t < 0) {
      throw new FixtureIntegrityError(`Event ${event.id} has an invalid timestamp`);
    }
    if (event.t > timeline.durationMs) {
      throw new FixtureIntegrityError(`Event ${event.id} is after durationMs`);
    }
    switch (event.type) {
      case "prepare_task":
        if (event.parentDirectionId && !directions.has(event.parentDirectionId)) {
          throw new FixtureIntegrityError(`Event ${event.id} references missing direction ${event.parentDirectionId}`);
        }
        break;
      case "send_task":
        taskIds.add(event.taskId);
        break;
      case "task_progress":
      case "task_complete":
        if (!taskIds.has(event.taskId)) throw new FixtureIntegrityError(`Event ${event.id} references unknown task ${event.taskId}`);
        break;
      case "direction_group_arrived":
        if (!groups.has(event.groupId)) throw new FixtureIntegrityError(`Event ${event.id} references missing group ${event.groupId}`);
        if (!taskIds.has(event.taskId)) throw new FixtureIntegrityError(`Event ${event.id} references unknown task ${event.taskId}`);
        break;
      case "select_direction":
      case "add_context":
        if (!directions.has(event.directionId)) throw new FixtureIntegrityError(`Event ${event.id} references missing direction ${event.directionId}`);
        break;
      case "discover_paper":
      case "browse_abstract":
      case "read_full_text":
      case "open_paper":
        if (!papers.has(event.paperId)) throw new FixtureIntegrityError(`Event ${event.id} references missing paper ${event.paperId}`);
        break;
      case "form_evidence":
        if (!evidence.has(event.evidenceId)) throw new FixtureIntegrityError(`Event ${event.id} references missing evidence ${event.evidenceId}`);
        break;
      case "set_coverage":
        if (!coverage.has(event.recordId)) throw new FixtureIntegrityError(`Event ${event.id} references missing coverage ${event.recordId}`);
        break;
      case "revise_coverage":
        if (!coverage.has(event.recordId)) throw new FixtureIntegrityError(`Event ${event.id} references missing coverage ${event.recordId}`);
        if (!coverage.has(event.previousRecordId)) throw new FixtureIntegrityError(`Event ${event.id} references missing previous coverage`);
        if (!counterexamples.has(event.counterexampleId)) throw new FixtureIntegrityError(`Event ${event.id} references missing counterexample`);
        break;
      case "form_open_question":
      case "select_question":
        if (!questions.has(event.questionId)) throw new FixtureIntegrityError(`Event ${event.id} references missing question ${event.questionId}`);
        break;
      default: {
        const neverEvent: never = event;
        throw new FixtureIntegrityError(`Unhandled event ${(neverEvent as DemoEvent).type}`);
      }
    }
  }
}

function emptyReading(paperId: string, availability: PaperReadingRecord["availability"]): PaperReadingRecord {
  return { paperId, discovered: false, abstractBrowsed: false, fullTextRead: false, availability, openCount: 0 };
}

function deriveCounts(records: Readonly<Record<string, PaperReadingRecord>>): DerivedReadCounts {
  const values = Object.values(records);
  return {
    discovered: values.filter((item) => item.discovered).length,
    abstractBrowsed: values.filter((item) => item.abstractBrowsed).length,
    fullTextRead: values.filter((item) => item.fullTextRead).length,
  };
}

function touchPaper(
  reading: Record<string, PaperReadingRecord>,
  paperId: string,
  availability: PaperReadingRecord["availability"],
): PaperReadingRecord {
  reading[paperId] ??= emptyReading(paperId, availability);
  return reading[paperId];
}

export function initialState(world: ResearchWorld, t = 0): WorldState {
  const paperReading: Record<string, PaperReadingRecord> = {};
  for (const paper of world.papers) {
    paperReading[paper.id] = emptyReading(paper.id, paper.availability);
  }
  return {
    t,
    preparedTask: null,
    sentTasks: [],
    activeTaskProgress: null,
    visibleGroupIds: [],
    selectedDirectionId: null,
    paperReading,
    evidenceIds: [],
    coverageRecordIds: [],
    coverageRevisions: [],
    openQuestionId: null,
    openQuestionStatus: null,
    addedContextDirectionIds: [],
    counts: deriveCounts(paperReading),
  };
}

function applyEvent(world: ResearchWorld, state: WorldState, event: DemoEvent): WorldState {
  const papers = new Map(world.papers.map((item) => [item.id, item]));
  const paperReading: Record<string, PaperReadingRecord> = { ...state.paperReading };
  let preparedTask = state.preparedTask;
  let sentTasks: SentTask[] = [...state.sentTasks];
  let activeTaskProgress = state.activeTaskProgress;
  let visibleGroupIds = state.visibleGroupIds;
  let selectedDirectionId = state.selectedDirectionId;
  let evidenceIds = state.evidenceIds;
  let coverageRecordIds = state.coverageRecordIds;
  let coverageRevisions = state.coverageRevisions;
  let openQuestionId = state.openQuestionId;
  let openQuestionStatus = state.openQuestionStatus;
  let addedContextDirectionIds = state.addedContextDirectionIds;

  switch (event.type) {
    case "prepare_task":
      preparedTask = { task: "explore", prompt: event.prompt, parentDirectionId: event.parentDirectionId };
      break;
    case "send_task": {
      if (!preparedTask) break;
      const existing = sentTasks.some((task) => task.id === event.taskId);
      if (existing) break;
      sentTasks = [
        ...sentTasks,
        {
          id: event.taskId,
          task: "explore",
          prompt: preparedTask.prompt,
          parentDirectionId: preparedTask.parentDirectionId,
          sentAt: event.t,
          completedAt: null,
        },
      ];
      preparedTask = null;
      activeTaskProgress = "已发送，等待方向组（演示节奏 / 等待已压缩）";
      break;
    }
    case "task_progress":
      activeTaskProgress = `${event.label}（演示节奏 / 等待已压缩）`;
      break;
    case "task_complete":
      sentTasks = sentTasks.map((task) => (task.id === event.taskId ? { ...task, completedAt: event.t } : task));
      activeTaskProgress = null;
      break;
    case "direction_group_arrived":
      if (!visibleGroupIds.includes(event.groupId)) visibleGroupIds = [...visibleGroupIds, event.groupId];
      break;
    case "select_direction":
      selectedDirectionId = event.directionId;
      break;
    case "discover_paper": {
      const paper = papers.get(event.paperId);
      if (!paper) break;
      const record = { ...touchPaper(paperReading, event.paperId, paper.availability), discovered: true };
      paperReading[event.paperId] = record;
      break;
    }
    case "browse_abstract": {
      const paper = papers.get(event.paperId);
      if (!paper) break;
      const record = {
        ...touchPaper(paperReading, event.paperId, paper.availability),
        discovered: true,
        abstractBrowsed: Boolean(paper.abstract.trim()),
      };
      paperReading[event.paperId] = record;
      break;
    }
    case "read_full_text": {
      const paper = papers.get(event.paperId);
      if (!paper) break;
      const canRead = paper.availability === "full-text";
      const record = {
        ...touchPaper(paperReading, event.paperId, paper.availability),
        discovered: true,
        abstractBrowsed: Boolean(paper.abstract.trim()),
        fullTextRead: canRead,
      };
      paperReading[event.paperId] = record;
      break;
    }
    case "open_paper": {
      const paper = papers.get(event.paperId);
      if (!paper) break;
      const current = touchPaper(paperReading, event.paperId, paper.availability);
      const canReadFull = paper.availability === "full-text" && event.level === "full-text";
      paperReading[event.paperId] = {
        ...current,
        discovered: true,
        abstractBrowsed: Boolean(paper.abstract.trim()) && (current.abstractBrowsed || event.level === "abstract" || event.level === "full-text"),
        fullTextRead: current.fullTextRead || canReadFull,
        openCount: current.openCount + 1,
      };
      break;
    }
    case "form_evidence": {
      const evidence = world.evidence.find((item) => item.id === event.evidenceId);
      if (!evidence) break;
      const sources = evidence.paperIds.map((id) => papers.get(id));
      // Camera/timeline progress cannot substitute for reading available sources.
      // Every cited paper needs readable full text and an actual excerpt anchor.
      const supported = sources.length > 0 && sources.every((paper) => paper
        && paper.availability === "full-text"
        && paperReading[paper.id]?.fullTextRead
        && paper.excerpts.some((excerpt) => evidence.excerptIds.includes(excerpt.id)));
      if (!supported || !evidence.excerptIds.every((id) => sources.some((paper) => paper?.excerpts.some((excerpt) => excerpt.id === id)))) break;
      if (!evidenceIds.includes(event.evidenceId)) evidenceIds = [...evidenceIds, event.evidenceId];
      break;
    }
    case "set_coverage": {
      const record = world.coverageRecords.find((item) => item.id === event.recordId);
      const basis = record ? world.evidence.filter((item) => item.coverageRound === record.round) : [];
      if (basis.length === 0 || !basis.every((item) => evidenceIds.includes(item.id))) break;
      if (!coverageRecordIds.includes(event.recordId)) coverageRecordIds = [...coverageRecordIds, event.recordId];
      break;
    }
    case "revise_coverage": {
      const counterexample = world.counterexamples.find((item) => item.id === event.counterexampleId);
      const paper = counterexample ? papers.get(counterexample.paperId) : undefined;
      if (!counterexample || counterexample.revisesRecordId !== event.previousRecordId
        || !coverageRecordIds.includes(event.previousRecordId)
        || !paper || paper.availability !== "full-text" || !paperReading[paper.id]?.fullTextRead || paper.excerpts.length === 0) break;
      if (!coverageRecordIds.includes(event.recordId)) coverageRecordIds = [...coverageRecordIds, event.recordId];
      coverageRevisions = [
        ...coverageRevisions,
        {
          recordId: event.recordId,
          previousRecordId: event.previousRecordId,
          reason: event.reason,
          counterexampleId: event.counterexampleId,
          at: event.t,
        },
      ];
      break;
    }
    case "form_open_question": {
      const question = world.openQuestions.find((item) => item.id === event.questionId);
      if (!question || !question.evidenceIds.every((id) => evidenceIds.includes(id))
        || !question.counterexampleIds.every((id) => coverageRevisions.some((revision) => revision.counterexampleId === id))) break;
      openQuestionId = event.questionId;
      openQuestionStatus = "candidate";
      break;
    }
    case "select_question":
      if (openQuestionId !== event.questionId) break;
      openQuestionStatus = event.status;
      break;
    case "add_context":
      if (!addedContextDirectionIds.includes(event.directionId)) {
        addedContextDirectionIds = [...addedContextDirectionIds, event.directionId];
      }
      break;
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }

  return {
    t: event.t,
    preparedTask,
    sentTasks,
    activeTaskProgress,
    visibleGroupIds,
    selectedDirectionId,
    paperReading,
    evidenceIds,
    coverageRecordIds,
    coverageRevisions,
    openQuestionId,
    openQuestionStatus,
    addedContextDirectionIds,
    counts: deriveCounts(paperReading),
  };
}

/**
 * Pure absolute-ms evaluation. Events with timestamp <= t are applied in order.
 * Seeking, reversing, and replaying all fold the same prefix; they never append.
 */
export function stateAt(world: ResearchWorld, timeline: DemoTimeline, t: number): WorldState {
  const time = Number.isFinite(t) ? Math.max(0, t) : 0;
  const events = eventsAtOrBefore(sortEvents(timeline.events), time);
  let state = initialState(world, 0);
  for (const event of events) state = applyEvent(world, state, event);
  return { ...state, t: time };
}

export function statesEqual(a: WorldState, b: WorldState): boolean {
  const left = { ...a, t: 0 };
  const right = { ...b, t: 0 };
  return JSON.stringify(left) === JSON.stringify(right);
}
