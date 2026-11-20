/**
 * Versioned parent↔viewer display protocol for the offline product demo.
 * The parent owns the only clock. The iframe renders snapshots and reports
 * user intents and layout anchors. It must not run an independent timeline.
 */

export const DEMO_VIEWER_PROTOCOL = "coresearch-demo/v1" as const;
export const DEMO_VIEWER_PARENT_SOURCE = "coresearch-community-parent" as const;
export const DEMO_VIEWER_SOURCE = "coresearch-demo-viewer" as const;
export const DEMO_VIEWER_VERSION = "a52c718-1.0.0" as const;
export const DEMO_CORE_SHA = "a52c71845fecb7409e7f3df427650a6be85cebec" as const;

export type DemoViewerProtocol = typeof DEMO_VIEWER_PROTOCOL;

export interface CapabilityProfileView {
  readonly openTasks: readonly string[];
  readonly lockedTasks: readonly string[];
  readonly ideaStateInDemo: false;
}

/** Confirmed from plugins/web-ui/src/task-actions.ts at DEMO_CORE_SHA: AVAILABLE_MENU_ACTIONS is only Explore. */
export const CONFIRMED_CAPABILITY_PROFILE: CapabilityProfileView = {
  openTasks: ["explore"],
  lockedTasks: ["deep-dive", "deep-research", "literature-survey", "distill-idea", "paper-explanation"],
  ideaStateInDemo: false,
};

export interface GraphPresentation {
  readonly selected: {
    readonly groupId: string;
    readonly groupRevisionId: string;
    readonly artifactId: string;
    readonly revisionId: string;
    readonly name: string;
  } | null;
  readonly rootOpen: boolean;
  readonly folds: Readonly<Record<string, boolean>>;
  readonly zoom: number;
  readonly pan: { readonly x: number; readonly y: number };
  readonly viewportScroll: number;
  readonly stowed: boolean;
}

export interface PreviewState {
  readonly kind: "none" | "paper" | "direction";
  readonly id: string | null;
  readonly anchor?: string;
}

export interface ViewerSnapshot {
  readonly t: number;
  readonly generation: number;
  readonly layout: "desktop" | "mobile";
  readonly mobilePane: "composer" | "directions" | "graph" | "preview";
  readonly draft: string;
  readonly draftDirty: boolean;
  readonly task: { readonly action: "explore"; readonly targetDirectionId?: string } | null;
  readonly contextDirectionIds: readonly string[];
  readonly visibleGroupIds: readonly string[];
  readonly selectedDirectionId: string | null;
  readonly paperReading: Readonly<
    Record<
      string,
      {
        readonly discovered: boolean;
        readonly abstractBrowsed: boolean;
        readonly fullTextRead: boolean;
        readonly availability: "full-text" | "metadata-only" | "unavailable";
      }
    >
  >;
  readonly counts: {
    readonly discovered: number;
    readonly abstractBrowsed: number;
    readonly fullTextRead: number;
  };
  readonly evidenceIds: readonly string[];
  readonly openQuestionId: string | null;
  readonly openQuestionStatus: "candidate" | "selected-for-investigation" | null;
  readonly progressLabel: string | null;
  readonly graph: GraphPresentation;
  readonly preview: PreviewState;
  readonly focusIds: readonly string[];
  readonly sentTaskIds: readonly string[];
  readonly prepared: boolean;
  readonly reply?: { readonly id: string; readonly text: string };
}

export interface AnchorBox {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type UserIntent =
  | { readonly type: "prepare_task"; readonly action: "explore"; readonly directionId?: string }
  | { readonly type: "send_task" }
  | { readonly type: "send_message" }
  | { readonly type: "cancel_preview" }
  | { readonly type: "resource_result"; readonly paperId: string; readonly status: "ready" | "missing" | "unavailable" | "cancelled"; readonly readingLevel?: "metadata" | "abstract" | "full_text" }
  | { readonly type: "add_context"; readonly directionId: string }
  | { readonly type: "remove_context"; readonly directionId: string }
  | { readonly type: "select_direction"; readonly directionId: string }
  | { readonly type: "open_paper"; readonly paperId: string }
  | { readonly type: "close_preview" }
  | { readonly type: "edit_draft"; readonly text: string }
  | { readonly type: "pick_task"; readonly action: string }
  | { readonly type: "clear_task" }
  | { readonly type: "graph_presentation"; readonly presentation: GraphPresentation }
  | { readonly type: "mobile_pane"; readonly pane: ViewerSnapshot["mobilePane"] }
  | { readonly type: "fork_direction"; readonly directionId: string };

export type ParentToViewer =
  | {
      readonly protocol: DemoViewerProtocol;
      readonly source: typeof DEMO_VIEWER_PARENT_SOURCE;
      readonly type: "init";
      readonly fixture: unknown;
      readonly snapshot: ViewerSnapshot;
      readonly capabilityProfile: CapabilityProfileView;
    }
  | {
      readonly protocol: DemoViewerProtocol;
      readonly source: typeof DEMO_VIEWER_PARENT_SOURCE;
      readonly type: "applySnapshot";
      readonly snapshot: ViewerSnapshot;
    }
  | {
      readonly protocol: DemoViewerProtocol;
      readonly source: typeof DEMO_VIEWER_PARENT_SOURCE;
      readonly type: "dispose";
    };

export type ViewerToParent =
  | {
      readonly protocol: DemoViewerProtocol;
      readonly source: typeof DEMO_VIEWER_SOURCE;
      readonly type: "listenerReady";
    }
  | {
      readonly protocol: DemoViewerProtocol;
      readonly source: typeof DEMO_VIEWER_SOURCE;
      readonly type: "frameReady";
      readonly generation: number;
      readonly anchors: readonly AnchorBox[];
    }
  | {
      readonly protocol: DemoViewerProtocol;
      readonly source: typeof DEMO_VIEWER_SOURCE;
      readonly type: "userIntent";
      readonly generation: number;
      readonly intent: UserIntent;
    }
  | {
      readonly protocol: DemoViewerProtocol;
      readonly source: typeof DEMO_VIEWER_SOURCE;
      readonly type: "error";
      readonly message: string;
    };

export type DemoProtocolMessage = ParentToViewer | ViewerToParent;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateOrigin(actual: string, expected: string): boolean {
  return actual === expected && actual !== "" && actual !== "null";
}

export function isGraphPresentation(value: unknown): value is GraphPresentation {
  if (!isRecord(value)) return false;
  if (typeof value.rootOpen !== "boolean" || typeof value.zoom !== "number" || typeof value.stowed !== "boolean") return false;
  if (typeof value.viewportScroll !== "number" || !isRecord(value.folds) || !isRecord(value.pan)) return false;
  if (typeof value.pan.x !== "number" || typeof value.pan.y !== "number") return false;
  if (value.selected === null) return true;
  const selected = value.selected;
  if (!isRecord(selected)) return false;
  return ["groupId", "groupRevisionId", "artifactId", "revisionId", "name"].every((key) => typeof selected[key] === "string");
}

export function isViewerSnapshot(value: unknown): value is ViewerSnapshot {
  return isRecord(value) && typeof value.t === "number" && typeof value.generation === "number" && typeof value.draft === "string";
}

export function isUserIntent(value: unknown): value is UserIntent {
  if (!isRecord(value) || typeof value.type !== "string") return false;
  switch (value.type) {
    case "prepare_task":
      return value.action === "explore" && (value.directionId === undefined || typeof value.directionId === "string");
    case "resource_result":
      return typeof value.paperId === "string" && ["ready", "missing", "unavailable", "cancelled"].includes(String(value.status))
        && (value.readingLevel === undefined || ["metadata", "abstract", "full_text"].includes(String(value.readingLevel)));
    case "send_message":
    case "cancel_preview":
    case "send_task":
    case "close_preview":
    case "clear_task":
      return true;
    case "add_context":
    case "remove_context":
    case "select_direction":
    case "fork_direction":
      return typeof value.directionId === "string";
    case "open_paper":
      return typeof value.paperId === "string";
    case "edit_draft":
      return typeof value.text === "string";
    case "pick_task":
      return typeof value.action === "string";
    case "graph_presentation":
      return isGraphPresentation(value.presentation);
    case "mobile_pane":
      return value.pane === "composer" || value.pane === "directions" || value.pane === "graph" || value.pane === "preview";
    default:
      return false;
  }
}

function isAnchorBox(value: unknown): value is AnchorBox {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number"
  );
}

export function parseParentMessage(data: unknown): ParentToViewer | null {
  if (!isRecord(data)) return null;
  if (data.protocol !== DEMO_VIEWER_PROTOCOL) return null;
  if (data.source !== DEMO_VIEWER_PARENT_SOURCE) return null;
  if (data.type === "dispose") return { protocol: DEMO_VIEWER_PROTOCOL, source: DEMO_VIEWER_PARENT_SOURCE, type: "dispose" };
  if (data.type === "init") {
    if (!isViewerSnapshot(data.snapshot) || data.fixture === undefined || !isRecord(data.capabilityProfile)) return null;
    return data as unknown as ParentToViewer;
  }
  if (data.type === "applySnapshot") {
    if (!isViewerSnapshot(data.snapshot)) return null;
    return data as unknown as ParentToViewer;
  }
  return null;
}

export function parseViewerMessage(data: unknown): ViewerToParent | null {
  if (!isRecord(data)) return null;
  if (data.protocol !== DEMO_VIEWER_PROTOCOL) return null;
  if (data.source !== DEMO_VIEWER_SOURCE) return null;
  if (data.type === "listenerReady") {
    return { protocol: DEMO_VIEWER_PROTOCOL, source: DEMO_VIEWER_SOURCE, type: "listenerReady" };
  }
  if (data.type === "frameReady") {
    if (typeof data.generation !== "number" || !Array.isArray(data.anchors) || !data.anchors.every(isAnchorBox)) return null;
    return data as unknown as ViewerToParent;
  }
  if (data.type === "userIntent") {
    if (typeof data.generation !== "number" || !isUserIntent(data.intent)) return null;
    return data as unknown as ViewerToParent;
  }
  if (data.type === "error") {
    if (typeof data.message !== "string") return null;
    return data as unknown as ViewerToParent;
  }
  return null;
}

export function viewerAssetPath(basePath = ""): string {
  const root = basePath.replace(/\/$/, "");
  return `${root}/demos/coresearch/${DEMO_VIEWER_VERSION}/index.html`;
}

export const defaultGraphPresentation = (): GraphPresentation => ({
  selected: null,
  rootOpen: true,
  folds: {},
  zoom: 1,
  pan: { x: 0, y: 0 },
  viewportScroll: 0,
  stowed: false,
});
