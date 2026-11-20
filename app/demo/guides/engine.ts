import { stateAt } from "../evaluate";
import { fixtureVariants, type FixtureVariantId } from "../fixtures/variants";
import { videoIdentityWorld } from "../fixtures/video-identity";
import { demoScenes, demoTimeline } from "../timeline";
import type { ResearchWorld } from "../domain";
import type { DemoTimeline } from "../events";
import { applyUserIntent } from "../viewer/intents";
import type { UserIntent, ViewerSnapshot } from "../viewer/protocol";
import {
  mergeClockSnapshot,
  snapshotFromWorld,
  type SnapshotMergeOptions,
} from "../viewer/snapshot";
import { GUIDE_PRESET_PROMPT, guideById } from "./catalog";
import type { GuideDefinition, GuideEval, GuideMode, GuidePredicateId, GuideSession, GuideStep } from "./types";

export const GUIDE_TIMELINE: DemoTimeline = demoTimeline;

const OFF_PRESET_MESSAGE = "此练习仅加载视频生成示例，使用示例继续或退出练习";

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

export function worldForVariant(variant?: FixtureVariantId): ResearchWorld {
  if (!variant || variant === "default") return videoIdentityWorld;
  return fixtureVariants[variant].world;
}

export function missingResourceIds(variant?: FixtureVariantId): readonly string[] {
  if (!variant) return [];
  return fixtureVariants[variant].missingResourceIds;
}

export function snapshotAtCheckpoint(
  t: number,
  previous: ViewerSnapshot | null,
  generation: number,
  options: {
    layout?: ViewerSnapshot["layout"];
    mobilePane?: ViewerSnapshot["mobilePane"];
    draft?: string;
    draftDirty?: boolean;
    variant?: FixtureVariantId;
    merge?: SnapshotMergeOptions;
  } = {},
): ViewerSnapshot {
  const world = worldForVariant(options.variant);
  const state = stateAt(world, GUIDE_TIMELINE, t);
  const inheritPresentation = (options.merge?.reason ?? "reset") === "clock" || (options.merge?.reason ?? "reset") === "seek";
  const incoming = snapshotFromWorld(world, state, GUIDE_TIMELINE, {
    generation,
    layout: options.layout ?? previous?.layout ?? "desktop",
    mobilePane: options.mobilePane ?? previous?.mobilePane ?? "composer",
    draft: options.draft ?? previous?.draft ?? "",
    draftDirty: options.draftDirty ?? Boolean(previous?.draftDirty),
    graph: inheritPresentation ? previous?.graph : undefined,
    preview: inheritPresentation ? previous?.preview : undefined,
  });
  return mergeClockSnapshot(previous, incoming, options.merge ?? { reason: "reset", mode: "guided" });
}

function stepById(guide: GuideDefinition, stepId: string): GuideStep {
  return guide.steps.find((step) => step.stepId === stepId) ?? guide.steps[0]!;
}

function checkpointAfterSend(seekMs: number): number {
  const next = demoScenes.find((item) => item.checkpointMs > seekMs);
  return next?.checkpointMs ?? seekMs;
}

export function evaluatePredicate(session: GuideSession, predicate: GuidePredicateId): GuideEval {
  const snapshot = session.snapshot;
  const guide = guideById.get(session.guideId);
  const step = guide ? stepById(guide, session.stepId) : undefined;
  const reading = snapshot.paperReading["P02"];
  switch (predicate) {
    case "draft-is-preset-or-acknowledged":
      return {
        complete: snapshot.draft === GUIDE_PRESET_PROMPT || session.exampleAcknowledged,
        detail: "输入预置兴趣，或明确选择「使用示例继续」并保留自己的草稿。",
      };
    case "explore-prepared":
    case "explore-task-chip":
      return {
        complete: snapshot.prepared === true && snapshot.task?.action === "explore" && !snapshot.visibleGroupIds.includes("G1"),
        detail: "选择 Explore 并确认 Task chip；此时只准备任务，Send 后才执行。",
      };
    case "first-explore-complete":
      return {
        complete: snapshot.visibleGroupIds.includes("G1") && snapshot.sentTaskIds.includes("task-g1"),
        detail: "明确点击 Send，等待这次 Explore 的 G1 方向组出现。",
      };
    case "direction-selected-consistency":
      return {
        complete: snapshot.selectedDirectionId === "d-consistency",
        detail: "选中「生成一致性」方向，使详情对应当前选择。",
      };
    case "refine-prepared-consistency":
      return {
        complete:
          snapshot.prepared === true &&
          snapshot.task?.action === "explore" &&
          snapshot.task.targetDirectionId === "d-consistency" &&
          !snapshot.visibleGroupIds.includes("G2"),
        detail: "在「生成一致性」上准备 Explore，并确认 Task chip 的目标为该方向。",
      };
    case "refine-g2-complete": {
      const world = worldForVariant(step?.variant);
      const g2 = world.groups.find((group) => group.id === "G2");
      const parentOk = g2?.parent?.directionId === "d-consistency";
      return {
        complete: snapshot.visibleGroupIds.includes("G1") && snapshot.visibleGroupIds.includes("G2") && parentOk,
        detail: "发送已准备的定向 Explore，等待 G2 挂在「生成一致性」下，并保留 G1。",
      };
    }
    case "paper-p02-open":
      return {
        complete: snapshot.preview.kind === "paper" && snapshot.preview.id === "P02" && session.resource?.paperId === "P02" && session.resource.status === "ready",
        detail: "打开 P02，等待同一论文的固定版本详情成功显示。",
      };
    case "paper-p02-level-visible":
      return {
        complete:
          snapshot.preview.kind === "paper" &&
          snapshot.preview.id === "P02" &&
          session.resource?.paperId === "P02" && session.resource.status === "ready" && session.resource.readingLevel === "full_text" &&
          reading?.availability === "full-text" &&
          reading.fullTextRead === true,
        detail: "在 P02 详情中确认全文阅读状态，并查看对应条件片段。",
      };
    case "paper-p02-returned":
      return {
        complete:
          session.stepActions.includes("close_preview") && snapshot.preview.kind !== "paper" &&
          snapshot.selectedDirectionId === "d-crossshot" &&
          typeof snapshot.draft === "string",
        detail: "点击 Back 返回「跨镜头身份保持」方向，并保留原方向选择与草稿。",
      };
    case "graph-fold-preserves-groups":
      return {
        complete:
          snapshot.visibleGroupIds.includes("G1") &&
          snapshot.visibleGroupIds.includes("G2") &&
          snapshot.visibleGroupIds.includes("G3") &&
          session.stepActions.includes("graph_presentation") &&
          JSON.stringify({ rootOpen: snapshot.graph.rootOpen, folds: snapshot.graph.folds }) !== session.foldBaseline,
        detail: "实际展开或折叠图谱，确认 G1、G2、G3 三组仍然保留。",
      };
    case "graph-selected-crossshot":
      return {
        complete: snapshot.selectedDirectionId === "d-crossshot",
        detail: "在图谱中选中「跨镜头身份保持」节点。",
      };
    case "graph-preview-direction":
      return {
        complete: snapshot.selectedDirectionId === "d-crossshot" && snapshot.preview.kind !== "paper",
        detail: "查看「跨镜头身份保持」的方向详情，核对它与所选节点对应。",
      };
    case "graph-returned":
      return {
        complete:
          session.stepActions.includes("close_preview") && snapshot.preview.kind === "none" &&
          snapshot.visibleGroupIds.includes("G1") &&
          snapshot.visibleGroupIds.includes("G2") &&
          snapshot.visibleGroupIds.includes("G3"),
        detail: "点击 Back 离开详情，确认 G1、G2、G3 方向组仍在图中。",
      };
    case "context-added-crossshot":
      return {
        complete: snapshot.contextDirectionIds.includes("d-crossshot") && !session.followupSent,
        detail: "对「跨镜头身份保持」点击 Add as context，确认 Context chip；添加引用本身不执行任务。",
      };
    case "followup-sent":
      return {
        complete: snapshot.contextDirectionIds.includes("d-crossshot") && session.followupSent,
        detail: "保留方向 Context chip，输入具体追问并点击 Send，等待明确标注的预录教学回复。",
      };
    case "recovery-ready":
      return { complete: session.recoveryObserved && session.recovered, detail: step?.stepId === "interruption" ? "先编辑草稿或引用，再点击「恢复中断 checkpoint」；恢复后保留草稿与引用。" : "打开 P03 并观察本变体的实际例外，再点击 Back 或取消读取返回有效方向；「重置这一步」会清空本步操作记录供重新练习。" };
    default:
      return { complete: false, detail: "未知判据" };
  }
}

export function isOffPresetDraft(snapshot: ViewerSnapshot): boolean {
  return snapshot.draftDirty === true && snapshot.draft !== GUIDE_PRESET_PROMPT && snapshot.draft.trim() !== "";
}

function paneForStep(step: GuideStep): ViewerSnapshot["mobilePane"] {
  if (step.targetAnchor === "graph") return "graph";
  if (step.targetAnchor === "directions") return "directions";
  if (step.targetAnchor === "preview" || step.targetAnchor === "question" || step.targetAnchor.startsWith("paper-")) return "preview";
  return "composer";
}

export function startGuide(
  guide: GuideDefinition,
  options: { mode?: GuideMode; stepId?: string; layout?: ViewerSnapshot["layout"]; instanceId?: string } = {},
): GuideSession {
  const step = stepById(guide, options.stepId ?? guide.steps[0]!.stepId);
  const snapshot = snapshotAtCheckpoint(step.startCheckpointMs, null, 1, {
    layout: options.layout,
    mobilePane: paneForStep(step),
    draft: guide.id === "get-started" ? "" : GUIDE_PRESET_PROMPT,
    draftDirty: false,
    variant: step.variant,
    merge: { reason: "reset", mode: "guided" },
  });
  const initialSnapshot = guide.id === "get-started" ? snapshot : {
    ...snapshot,
    preview: guide.id === "read-evidence" && step.stepId !== "open-p02" ? { kind: "paper" as const, id: "P02" } : { kind: "direction" as const, id: snapshot.selectedDirectionId },
    contextDirectionIds: guide.id === "continue-research" && step.stepId === "send-followup" ? ["d-crossshot"] : snapshot.contextDirectionIds,
  };
  return {
    guideId: guide.id,
    stepId: step.stepId,
    mode: options.mode ?? "practice",
    snapshot: initialSnapshot,
    stepActions: [],
    foldBaseline: JSON.stringify({ rootOpen: snapshot.graph.rootOpen, folds: snapshot.graph.folds }),
    resource: null,
    recoveryObserved: false,
    recovered: false,
    exampleAcknowledged: false,
    followupSent: false,
    message: null,
    ignored: null,
    completedStepIds: [],
    instanceId: options.instanceId ?? "guide-default",
  };
}

export function goToStep(session: GuideSession, stepId: string): GuideSession {
  const guide = guideById.get(session.guideId);
  if (!guide) return session;
  const step = stepById(guide, stepId);
  const previousStep = stepById(guide, session.stepId);
  const sameFixture = previousStep.variant === step.variant;
  const restored = sameFixture ? session.snapshot : snapshotAtCheckpoint(step.startCheckpointMs, null, session.snapshot.generation + 1, {
    layout: session.snapshot.layout, draft: session.snapshot.draft, draftDirty: session.snapshot.draftDirty, variant: step.variant,
  });
  const transitioned = sameFixture ? restored : { ...restored, contextDirectionIds: session.snapshot.contextDirectionIds, preview: { kind: "direction" as const, id: restored.selectedDirectionId } };
  const snapshot = transitioned.layout === "mobile" ? { ...transitioned, mobilePane: paneForStep(step), generation: transitioned.generation + 1 } : transitioned;

  return {
    ...session,
    stepId: step.stepId,
    snapshot,
    stepActions: [],
    foldBaseline: JSON.stringify({ rootOpen: snapshot.graph.rootOpen, folds: snapshot.graph.folds }),
    resource: sameFixture ? session.resource : null,
    recoveryObserved: false,
    recovered: false,
    followupSent: false,
    message: null,
    ignored: null,
  };
}

export function resetStep(session: GuideSession): GuideSession {
  const guide = guideById.get(session.guideId);
  if (!guide) return session;
  const step = stepById(guide, session.stepId);
  const snapshot = snapshotAtCheckpoint(step.recoveryCheckpointMs, null, session.snapshot.generation + 1, {
    layout: session.snapshot.layout,
    mobilePane: paneForStep(step),
    draft: session.snapshot.draftDirty ? session.snapshot.draft : guide.id === "get-started" ? "" : GUIDE_PRESET_PROMPT,
    draftDirty: session.snapshot.draftDirty,
    variant: step.variant,
    merge: { reason: "reset", mode: "guided" },
  });
  return {
    ...session,
    snapshot: { ...snapshot, contextDirectionIds: session.snapshot.contextDirectionIds, preview: { kind: "direction", id: snapshot.selectedDirectionId } },
    stepActions: [],
    foldBaseline: JSON.stringify({ rootOpen: snapshot.graph.rootOpen, folds: snapshot.graph.folds }),
    resource: null,
    recoveryObserved: false,
    recovered: false,
    exampleAcknowledged: false,
    completedStepIds: session.completedStepIds.filter((id) => id !== session.stepId),
    followupSent: false,
    message: session.snapshot.draftDirty && isOffPresetDraft(session.snapshot) ? OFF_PRESET_MESSAGE : null,
    ignored: null,
  };
}

/** Recovery is an explicit operation; a fresh-practice reset is never success. */
export function recoverInterruptedStep(session: GuideSession): GuideSession {
  if (session.guideId !== "troubleshooting" || session.stepId !== "interruption") return session;
  if (!session.recoveryObserved) return { ...session, message: "请先编辑草稿或添加引用，再恢复中断 checkpoint。" };
  return {
    ...resetStep(session),
    recoveryObserved: true,
    recovered: true,
    exampleAcknowledged: session.exampleAcknowledged,
    completedStepIds: unique([...session.completedStepIds, session.stepId]),
    message: "已恢复中断 checkpoint；草稿与引用保留。重置这一步可清空本步操作记录并重新练习。",
  };
}

export function useExampleContinue(session: GuideSession): GuideSession {
  return {
    ...session,
    exampleAcknowledged: true,
    message: "将使用预置视频生成示例继续。你的草稿仍保留在输入框中。",
    ignored: null,
    snapshot: {
      ...session.snapshot,
      generation: session.snapshot.generation + 1,
      draftDirty: true,
    },
  };
}

export function applyGuideIntent(session: GuideSession, intent: UserIntent): GuideSession {
  const guide = guideById.get(session.guideId);
  if (!guide) return session;
  const step = stepById(guide, session.stepId);

  if ((intent.type === "send_task" || intent.type === "send_message") && isOffPresetDraft(session.snapshot) && !session.exampleAcknowledged) {
    return {
      ...session,
      message: OFF_PRESET_MESSAGE,
      ignored: "need-example",
      snapshot: { ...session.snapshot, generation: session.snapshot.generation + 1 },
    };
  }

  if (intent.type === "resource_result") {
    if (session.snapshot.preview.kind !== "paper" || session.snapshot.preview.id !== intent.paperId) return session;
    const observed = session.guideId === "troubleshooting" && intent.paperId === "P03" && (
      (step.variant === "metadata-only" && intent.status === "ready" && intent.readingLevel === "metadata") ||
      (step.variant === "full-text-unavailable" && intent.status === "unavailable") ||
      (step.variant === "missing-version" && intent.status === "missing")
    );
    return { ...session, resource: intent, recoveryObserved: session.recoveryObserved || observed };
  }

  const result = applyUserIntent(session.snapshot, intent, GUIDE_TIMELINE);
  if (result.ignored === "locked-task" || result.ignored === "not-prepared" || result.ignored === "duplicate-send") {
    return { ...session, ignored: result.ignored, message: result.ignored, snapshot: result.snapshot };
  }
  if (result.ignored === "unsupported-target") {
    return {
      ...session,
      ignored: "unsupported-target",
      message: "此演示只预录了「生成一致性 → 主体身份」这条续探路径。其它并列方向可以查看，但不能当作已经执行的细分结果。",
      snapshot: result.snapshot,
    };
  }

  let snapshot = result.snapshot;
  let followupSent = session.followupSent;
  if (result.seekMs !== undefined && intent.type === "send_task") {
    snapshot = snapshotAtCheckpoint(checkpointAfterSend(result.seekMs), snapshot, snapshot.generation + 1, {
      variant: step.variant,
      layout: snapshot.layout,
      mobilePane: snapshot.mobilePane,
      draft: snapshot.draft,
      draftDirty: snapshot.draftDirty,
      merge: { reason: "seek", mode: "guided" },
    });
  } else if (result.seekMs !== undefined) {
    snapshot = snapshotAtCheckpoint(result.seekMs, snapshot, snapshot.generation + 1, {
      variant: step.variant,
      layout: snapshot.layout,
      mobilePane: snapshot.mobilePane,
      draft: snapshot.draft,
      draftDirty: snapshot.draftDirty,
      merge: { reason: "seek", mode: "guided" },
    });
  }
  if (intent.type === "send_message" && snapshot.reply && !result.ignored) followupSent = true;

  const next: GuideSession = {
    ...session,
    snapshot,
    followupSent,
    resource: ["open_paper", "close_preview", "cancel_preview"].includes(intent.type) ? null : session.resource,
    stepActions: result.ignored ? session.stepActions : unique([...session.stepActions, intent.type]) as GuideSession["stepActions"],
    recoveryObserved: session.recoveryObserved || (session.guideId === "troubleshooting" && step.stepId === "interruption" && (intent.type === "edit_draft" || intent.type === "add_context")),
    recovered: session.recovered || (session.recoveryObserved && (intent.type === "close_preview" || intent.type === "cancel_preview")),
    ignored: result.ignored ?? null,
    message: result.ignored ? session.message : null,
  };
  const verdict = evaluatePredicate(next, step.success);
  if (!verdict.complete) return next;
  return { ...next, completedStepIds: unique([...next.completedStepIds, step.stepId]) };
}

export function applyExpectedStep(session: GuideSession): GuideSession {
  const guide = guideById.get(session.guideId);
  if (!guide) return session;
  const step = stepById(guide, session.stepId);
  if (step.success === "draft-is-preset-or-acknowledged") return applyGuideIntent(session, { type: "edit_draft", text: GUIDE_PRESET_PROMPT });
  if (step.success === "recovery-ready" && session.recoveryObserved) return step.stepId === "interruption" ? recoverInterruptedStep(session) : applyGuideIntent(session, { type: "close_preview" });
  if (step.success === "recovery-ready" && step.stepId === "interruption") return applyGuideIntent(session, { type: "edit_draft", text: "中断前保留的阅读笔记" });
  if (!step.expectedIntent) {
    const verdict = evaluatePredicate(session, step.success);
    return verdict.complete ? { ...session, completedStepIds: unique([...session.completedStepIds, step.stepId]), message: verdict.detail } : session;
  }
  return applyGuideIntent(session, step.expectedIntent);
}

export function isStepComplete(session: GuideSession): boolean {
  const guide = guideById.get(session.guideId);
  if (!guide) return false;
  return evaluatePredicate(session, stepById(guide, session.stepId).success).complete;
}
