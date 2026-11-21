import type { ResearchWorld, WorldState } from "../domain";
import type { DemoTimeline } from "../events";
import {
  defaultGraphPresentation,
  type GraphPresentation,
  type PreviewState,
  type ViewerSnapshot,
} from "./protocol";

export const PRODUCT_INTEREST_PROMPT = "我对视频生成感兴趣，想找一个可研究的问题";

export interface SnapshotOptions {
  generation: number;
  layout: ViewerSnapshot["layout"];
  mobilePane?: ViewerSnapshot["mobilePane"];
  draft: string;
  draftDirty?: boolean;
  graph?: GraphPresentation;
  preview?: PreviewState;
  focusIds?: readonly string[];
}

function readingMap(state: WorldState): ViewerSnapshot["paperReading"] {
  const out: Record<string, ViewerSnapshot["paperReading"][string]> = {};
  for (const [id, record] of Object.entries(state.paperReading)) {
    out[id] = {
      discovered: record.discovered,
      abstractBrowsed: record.abstractBrowsed,
      fullTextRead: record.fullTextRead,
      availability: record.availability,
    };
  }
  return out;
}

export function previewFromTimeline(timeline: DemoTimeline, t: number): PreviewState {
  let preview: PreviewState = { kind: "none", id: null };
  for (const event of timeline.events) {
    if (event.t > t) break;
    if (event.type === "open_paper") preview = { kind: "paper", id: event.paperId };
  }
  return preview;
}

export function graphFromState(world: ResearchWorld, state: WorldState): GraphPresentation {
  const base = defaultGraphPresentation();
  const directionId = state.selectedDirectionId;
  if (!directionId) return base;
  const direction = world.directions.find((item) => item.id === directionId);
  const group = world.groups.find((item) => item.directionIds.includes(directionId));
  if (!direction || !group) return base;
  return {
    ...base,
    rootOpen: false,
    selected: {
      groupId: group.id,
      groupRevisionId: group.revisionId,
      artifactId: direction.id,
      revisionId: direction.revisionId,
      name: direction.name,
    },
  };
}

/** Build a viewer snapshot from the shared kernel state plus presentation options. */
export function snapshotFromWorld(
  world: ResearchWorld,
  state: WorldState,
  timeline: DemoTimeline,
  options: SnapshotOptions,
): ViewerSnapshot {
  const prepared = Boolean(state.preparedTask);
  return {
    t: state.t,
    generation: options.generation,
    layout: options.layout,
    mobilePane: options.mobilePane ?? "composer",
    draft: options.draft,
    draftDirty: Boolean(options.draftDirty),
    task: state.preparedTask
      ? { action: "explore", ...(state.preparedTask.parentDirectionId ? { targetDirectionId: state.preparedTask.parentDirectionId } : {}) }
      : null,
    contextDirectionIds: state.addedContextDirectionIds,
    visibleGroupIds: state.visibleGroupIds,
    selectedDirectionId: state.selectedDirectionId,
    paperReading: readingMap(state),
    counts: state.counts,
    evidenceIds: state.evidenceIds,
    openQuestionId: state.openQuestionId,
    openQuestionStatus: state.openQuestionStatus,
    progressLabel: state.activeTaskProgress,
    graph: options.graph ?? graphFromState(world, state),
    preview: options.preview ?? previewFromTimeline(timeline, state.t),
    focusIds: options.focusIds ?? [],
    sentTaskIds: state.sentTasks.map((task) => task.id),
    prepared,
  };
}

export type SnapshotMergeReason = "clock" | "seek" | "reset";
export type SnapshotMergeMode = "autoplay" | "guided";

export interface SnapshotMergeOptions {
  /** clock = autoplay/player tick; seek = explicit jump; reset = restore a checkpoint. */
  reason?: SnapshotMergeReason;
  /** guided practice keeps selection/preview across clock ticks; autoplay lets the script advance them. */
  mode?: SnapshotMergeMode;
}

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

/**
 * Merge a newly computed world snapshot with the parent overlay.
 * Dirty drafts are never overwritten. Manual context chips and the mobile pane
 * survive clock ticks (including same-time pause/resume). Selection/preview
 * are kept on same-time ticks and in guided mode, and replaced on explicit
 * seek/reset or when autoplay advances time.
 */
export function mergeClockSnapshot(
  previous: ViewerSnapshot | null,
  incoming: ViewerSnapshot,
  options: SnapshotMergeOptions = {},
): ViewerSnapshot {
  if (!previous) return incoming;
  const reason = options.reason ?? "clock";
  const mode = options.mode ?? "autoplay";
  const draft = previous.draftDirty ? { draft: previous.draft, draftDirty: true as const } : {};

  if (reason === "reset") {
    return { ...incoming, ...draft };
  }

  if (reason === "seek") {
    return {
      ...incoming,
      ...draft,
      contextDirectionIds: uniqueIds([...incoming.contextDirectionIds, ...previous.contextDirectionIds]),
      mobilePane: previous.mobilePane,
    };
  }

  const sameTime = previous.t === incoming.t;
  const keepManualSelection = mode === "guided" || sameTime;
  return {
    ...incoming,
    ...draft,
    contextDirectionIds: uniqueIds([...incoming.contextDirectionIds, ...previous.contextDirectionIds]),
    mobilePane: previous.mobilePane,
    selectedDirectionId: keepManualSelection ? previous.selectedDirectionId : incoming.selectedDirectionId,
    preview: keepManualSelection ? previous.preview : incoming.preview,
    graph: {
      ...(keepManualSelection ? previous.graph : incoming.graph),
      folds: previous.graph.folds,
      zoom: previous.graph.zoom,
      pan: previous.graph.pan,
      stowed: previous.graph.stowed,
      rootOpen: previous.graph.rootOpen,
      viewportScroll: previous.graph.viewportScroll,
      selected: keepManualSelection ? previous.graph.selected : incoming.graph.selected,
    },
  };
}
