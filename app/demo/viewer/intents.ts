import type { DemoTimeline } from "../events";
import {
  CONFIRMED_CAPABILITY_PROFILE,
  type UserIntent,
  type ViewerSnapshot,
} from "./protocol";

export interface IntentResult {
  snapshot: ViewerSnapshot;
  /** When set, the parent player should seek to this time (shared autoplay/manual path). */
  seekMs?: number;
  ignored?: string;
}

function nextEvent(timeline: DemoTimeline, t: number, type: string, match?: (event: DemoTimeline["events"][number]) => boolean) {
  return timeline.events.find((event) => event.t >= t && event.type === type && (!match || match(event)));
}

/**
 * Pair each recorded send_task with the prepare_task that immediately precedes it.
 * Send must not pick the next send on a different target (e.g. preparing
 * d-controllable at G1 must not execute the recorded d-consistency send).
 */
export function recordedSendForPreparedTarget(
  timeline: DemoTimeline,
  targetDirectionId?: string,
): Extract<DemoTimeline["events"][number], { type: "send_task" }> | undefined {
  let pendingParent: string | undefined;
  for (const event of timeline.events) {
    if (event.type === "prepare_task") {
      pendingParent = event.parentDirectionId;
      continue;
    }
    if (event.type !== "send_task") continue;
    const matches = targetDirectionId ? pendingParent === targetDirectionId : !pendingParent;
    if (matches) return event;
  }
  return undefined;
}

/**
 * Apply a viewer-reported user intent on the parent. Prepare is not Send.
 * Add as context is reference-only. Locked tasks stay locked. Duplicate Send
 * does not create a second mock result.
 */
export function applyUserIntent(
  snapshot: ViewerSnapshot,
  intent: UserIntent,
  timeline: DemoTimeline,
): IntentResult {
  const generation = snapshot.generation + 1;

  if (intent.type === "edit_draft") {
    return { snapshot: { ...snapshot, generation, draft: intent.text, draftDirty: true } };
  }

  if (intent.type === "prepare_task") {
    if (intent.action !== "explore") {
      return { snapshot, ignored: "locked-task" };
    }
    const event = nextEvent(timeline, snapshot.t, "prepare_task", (item) => {
      if (item.type !== "prepare_task") return false;
      if (!intent.directionId) return !item.parentDirectionId;
      return item.parentDirectionId === intent.directionId;
    });
    return {
      snapshot: {
        ...snapshot,
        generation,
        prepared: true,
        ...(snapshot.layout === "mobile" ? { mobilePane: "composer" as const } : {}),
        task: { action: "explore", ...(intent.directionId ? { targetDirectionId: intent.directionId } : {}) },
      },
      ...(event ? { seekMs: event.t } : {}),
    };
  }

  if (intent.type === "send_task") {
    if (!snapshot.prepared && !snapshot.task) {
      return { snapshot, ignored: "not-prepared" };
    }
    const event = recordedSendForPreparedTarget(timeline, snapshot.task?.targetDirectionId);
    if (!event) {
      return {
        snapshot: { ...snapshot, generation },
        ignored: "unsupported-target",
      };
    }
    if (snapshot.sentTaskIds.includes(event.taskId)) {
      return { snapshot, ignored: "duplicate-send" };
    }
    return { snapshot: { ...snapshot, generation }, seekMs: event.t };
  }

  if (intent.type === "send_message") {
    if (snapshot.task || snapshot.prepared) return { snapshot, ignored: "task-prepared" };
    if (!snapshot.contextDirectionIds.length || !snapshot.draft.trim()) return { snapshot, ignored: "need-context-or-draft" };
    if (snapshot.reply) return { snapshot, ignored: "duplicate-message" };
    return { snapshot: { ...snapshot, generation, reply: { id: "demo-referenced-reply", text: "预录教学回复：已收到带方向引用的追问。下一步是核对同预算下的相关工作与失败条件；此处不进行真实检索，也未启动 Explore。" } } };
  }

  if (intent.type === "cancel_preview") return { snapshot: { ...snapshot, generation, preview: { kind: "none", id: null } } };
  if (intent.type === "resource_result") return { snapshot };

  if (intent.type === "add_context") {
    if (snapshot.contextDirectionIds.includes(intent.directionId)) return { snapshot };
    return {
      snapshot: {
        ...snapshot,
        generation,
        contextDirectionIds: [...snapshot.contextDirectionIds, intent.directionId],
      },
    };
  }

  if (intent.type === "remove_context") {
    return {
      snapshot: {
        ...snapshot,
        generation,
        contextDirectionIds: snapshot.contextDirectionIds.filter((id) => id !== intent.directionId),
      },
    };
  }

  if (intent.type === "select_direction") {
    const event = nextEvent(timeline, 0, "select_direction", (item) => item.type === "select_direction" && item.directionId === intent.directionId);
    return {
      snapshot: { ...snapshot, generation, selectedDirectionId: intent.directionId, preview: { kind: "direction", id: intent.directionId } },
      ...(event ? { seekMs: event.t } : {}),
    };
  }

  if (intent.type === "open_paper") {
    return { snapshot: { ...snapshot, generation, preview: { kind: "paper", id: intent.paperId }, ...(snapshot.layout === "mobile" ? { mobilePane: "preview" as const } : {}) } };
  }

  if (intent.type === "close_preview") {
    return { snapshot: { ...snapshot, generation, preview: { kind: "none", id: null } } };
  }

  if (intent.type === "pick_task") {
    const open = CONFIRMED_CAPABILITY_PROFILE.openTasks.includes(intent.action);
    if (!open) return { snapshot, ignored: "locked-task" };
    return { snapshot: { ...snapshot, generation, prepared: true, task: { action: "explore" } } };
  }

  if (intent.type === "clear_task") {
    return { snapshot: { ...snapshot, generation, prepared: false, task: null } };
  }

  if (intent.type === "graph_presentation") {
    const selected = intent.presentation.selected;
    const changed = selected?.artifactId !== snapshot.graph.selected?.artifactId;
    return { snapshot: {
      ...snapshot, generation, graph: intent.presentation,
      ...(changed ? { selectedDirectionId: selected?.artifactId ?? null, preview: selected ? { kind: "direction" as const, id: selected.artifactId } : { kind: "none" as const, id: null } } : {}),
    } };
  }

  if (intent.type === "mobile_pane") {
    return { snapshot: { ...snapshot, generation, mobilePane: intent.pane } };
  }

  if (intent.type === "fork_direction") {
    return { snapshot, ignored: "fork-not-in-demo" };
  }

  return { snapshot, ignored: "unhandled" };
}
