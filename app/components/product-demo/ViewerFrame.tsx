"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CONFIRMED_CAPABILITY_PROFILE,
  DEMO_VIEWER_PARENT_SOURCE,
  DEMO_VIEWER_PROTOCOL,
  parseViewerMessage,
  validateOrigin,
  viewerAssetPath,
  type AnchorBox,
  type UserIntent,
  type ViewerSnapshot,
} from "../../demo/viewer/protocol";
import type { DemoFixture } from "../../demo/viewer/fixture-types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const HANDSHAKE_TIMEOUT_MS = 10000;

function focusAnchorId(focusId: string): string {
  if (focusId.startsWith("G")) return `group-${focusId}`;
  if (focusId.startsWith("P")) return `paper-card-${focusId}`;
  if (focusId === "oq-identity-budget") return "question";
  return focusId;
}

export type ViewerHandshake = "booting" | "ready" | "error";

export function ViewerFrame({
  fixture,
  snapshot,
  onIntent,
  onReady,
  onStatus,
  presentation = false,
}: {
  fixture: DemoFixture;
  snapshot: ViewerSnapshot;
  onIntent: (intent: UserIntent, generation: number) => void;
  onReady?: (anchors: readonly AnchorBox[], generation: number) => void;
  onStatus?: (status: ViewerHandshake, error?: string) => void;
  presentation?: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [anchors, setAnchors] = useState<readonly AnchorBox[]>([]);
  const [src] = useState(() => viewerAssetPath(basePath));
  const [status, setStatus] = useState<ViewerHandshake>("booting");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const snapshotRef = useRef(snapshot);
  const fixtureRef = useRef(fixture);
  const readyGenerationRef = useRef<number | null>(null);
  // Callback identity belongs to the parent render, not the iframe lifetime.
  const callbacksRef = useRef({ onIntent, onReady, onStatus });
  useLayoutEffect(() => {
    snapshotRef.current = snapshot;
    fixtureRef.current = fixture;
    callbacksRef.current = { onIntent, onReady, onStatus };
  }, [snapshot, fixture, onIntent, onReady, onStatus]);
  const expectedOrigin = typeof window === "undefined" ? "" : window.location.origin;

  const updateStatus = useCallback(
    (next: ViewerHandshake, message?: string) => {
      setStatus(next);
      setError(message ?? null);
      callbacksRef.current.onStatus?.(next, message);
    },
    [],
  );

  const post = useCallback(
    (message: Record<string, unknown>, frame = frameRef.current?.contentWindow) => {
      if (!frame) return;
      frame.postMessage({ protocol: DEMO_VIEWER_PROTOCOL, source: DEMO_VIEWER_PARENT_SOURCE, ...message }, expectedOrigin);
    },
    [expectedOrigin],
  );

  const postInit = useCallback(() => {
    post({
      type: "init",
      fixture: fixtureRef.current,
      snapshot: snapshotRef.current,
      capabilityProfile: CONFIRMED_CAPABILITY_PROFILE,
    });
  }, [post]);

  useEffect(() => {
    let cancelled = false;
    fetch(src, { method: "GET" })
      .then((response) => {
        if (!response.ok && !cancelled) {
          updateStatus("error", `演示 viewer 无法加载（HTTP ${response.status}）：${src}`);
        }
      })
      .catch(() => {
        if (!cancelled) updateStatus("error", `演示 viewer 无法获取：${src}`);
      });
    return () => {
      cancelled = true;
    };
  }, [src, updateStatus, reloadKey]);

  useEffect(() => {
    // Capture the actual window: retry replaces the ref before old effects clean up.
    const frame = frameRef.current?.contentWindow;
    readyGenerationRef.current = null;
    // This resets the external iframe connection on mount/retry/StrictMode replay,
    // not on ordinary renders. Its acknowledgement will unlock the parent clock.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnchors([]);
    updateStatus("booting");
    const onMessage = (event: MessageEvent) => {
      if (!validateOrigin(event.origin, expectedOrigin)) return;
      if (!frame || event.source !== frame || frame !== frameRef.current?.contentWindow) return;
      const message = parseViewerMessage(event.data);
      if (!message) return;
      if (message.type === "listenerReady") {
        postInit();
        return;
      }
      if (message.type === "frameReady") {
        // An earlier frame must not acknowledge a newer seek or reconnect.
        if (message.generation !== snapshotRef.current.generation) {
          // Props can change while the initial/retry frame is being painted.
          // Refresh that handshake without disturbing an already-running viewer.
          if (readyGenerationRef.current === null) postInit();
          return;
        }
        setAnchors(message.anchors);
        readyGenerationRef.current = message.generation;
        updateStatus("ready");
        callbacksRef.current.onReady?.(message.anchors, message.generation);
        return;
      }
      if (message.type === "userIntent") {
        callbacksRef.current.onIntent(message.intent, message.generation);
        return;
      }
      if (message.type === "error") {
        updateStatus("error", message.message);
      }
    };
    window.addEventListener("message", onMessage);
    // The iframe can finish loading before hydration attaches React's onLoad.
    // Its synchronous boot listener queues init, or listenerReady requests it again.
    postInit();
    return () => {
      window.removeEventListener("message", onMessage);
      post({ type: "dispose" }, frame);
    };
  }, [expectedOrigin, post, postInit, updateStatus, reloadKey]);

  useEffect(() => {
    if (status !== "booting") return;
    const timer = window.setTimeout(() => {
      if (readyGenerationRef.current === snapshotRef.current.generation) return;
      updateStatus(
        "error",
        "演示 viewer 在 10 秒内没有完成 init / snapshot 确认。父时钟已暂停。这不是界面复刻壳，请检查控制台或重试连接。",
      );
    }, HANDSHAKE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [status, updateStatus, reloadKey]);

  useEffect(() => {
    if (status !== "ready") return;
    post({ type: "applySnapshot", snapshot });
  }, [snapshot, post, status]);

  // Frame the *actual* pinned Core document; avoid re-creating its panels.
  // The desktop exhibit needs a bounded frame and the mobile exhibit follows
  // new groups in the document, while full interactive guides remain untouched.
  const mobilePresentation = snapshot.layout === "mobile";
  const followGroup = presentation && (!mobilePresentation || snapshot.mobilePane === "directions")
    ? snapshot.visibleGroupIds.at(-1) : null;
  useEffect(() => {
    if (!presentation || status !== "ready") return;
    const doc = frameRef.current?.contentDocument;
    const frameWindow = doc?.defaultView;
    if (!doc?.body || !frameWindow) return;
    doc.documentElement.setAttribute("data-community-presentation", mobilePresentation ? "mobile" : "desktop");
    const styleId = "community-core-presentation-window";
    if (!doc.getElementById(styleId)) {
      const style = doc.createElement("style");
      style.id = styleId;
      style.textContent = `
        html[data-community-presentation=desktop] [data-demo-anchor=shell] {
          height:100dvh!important; min-height:0!important;
          grid-template-rows:minmax(0,1fr)!important; overflow:hidden;
        }
        html[data-community-presentation=desktop] [data-demo-anchor=shell] > * {
          min-height:0; max-height:100%;
        }
        html[data-community-presentation=desktop] [data-demo-anchor=directions] {
          min-height:0; overflow-y:auto; overscroll-behavior:contain;
        }
      `;
      doc.head.append(style);
    }
    const find = () => Array.from(doc.querySelectorAll<HTMLElement>("[data-demo-anchor]"))
      .find((element) => element.dataset.demoAnchor === `group-${followGroup}`);
    const directions = doc.querySelector<HTMLElement>("[data-demo-anchor=directions]");
    let frameRequest = 0;
    let observer: MutationObserver | undefined;
    const position = () => {
      if (!followGroup || followGroup === "G1") {
        if (mobilePresentation) frameWindow.scrollTo({ top: 0, behavior: "instant" });
        else directions?.scrollTo({ top: 0, behavior: "instant" });
        observer?.disconnect();
        return;
      }
      const group = find();
      if (!group) return;
      const bounds = group.getBoundingClientRect();
      if (mobilePresentation) {
        frameWindow.scrollTo({ top: Math.max(0, bounds.top + frameWindow.scrollY - 12), behavior: "instant" });
      } else if (directions) {
        directions.scrollTo({ top: Math.max(0, bounds.top - directions.getBoundingClientRect().top + directions.scrollTop - 12), behavior: "instant" });
      }
      observer?.disconnect();
    };
    frameRequest = requestAnimationFrame(position);
    if (followGroup) {
      observer = new MutationObserver(() => {
        cancelAnimationFrame(frameRequest);
        frameRequest = requestAnimationFrame(position);
      });
      observer.observe(doc.body, { childList: true, subtree: true });
    }
    return () => {
      cancelAnimationFrame(frameRequest);
      observer?.disconnect();
    };
  }, [followGroup, mobilePresentation, presentation, snapshot.mobilePane, status]);

  const focus = new Set(snapshot.focusIds.map(focusAnchorId));
  const operation = presentation
    ? anchors.find((anchor) => anchor.id === snapshot.focusIds[0] && (anchor.id === "draft" || anchor.id === "send"))
    : undefined;

  return (
    <div className="relative overflow-hidden rounded-[22px] ring-1 ring-black/40" data-pd-stage="" data-demo-presentation={presentation || undefined}>
      <p className="m-0 bg-black/70 px-3 py-1.5 text-[11px] text-white" data-demo-viewer-label="">
        产品 UI · 示例数据 / 预录结果
      </p>
      <div className="relative" data-demo-frame-surface="">
      <iframe
        key={reloadKey}
        ref={frameRef}
        title="CoResearch 产品演示"
        tabIndex={presentation ? -1 : undefined}
        src={src}
        className="block h-[min(78vh,820px)] w-full border-0 bg-[#171718]"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => {
          readyGenerationRef.current = null;
          setAnchors([]);
          updateStatus("booting");
          postInit();
        }}
      />
      {status !== "ready" ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#171718]/90 px-6 text-center text-sm text-white" role={status === "error" ? "alert" : "status"} data-viewer-loading={status}>
          {presentation && <div className="home-loading-poster" aria-hidden="true" style={{ backgroundImage: `url(${basePath}/product/core-explore-preview.webp)` }} />}
          {status === "booting" ? <p className="relative">正在加载 CoResearch 演示…</p> : <p className="relative">{presentation ? "演示暂时无法加载，可以重试或往下看功能介绍。" : error}</p>}
          {status === "error" ? (
            <button
              type="button"
              className="relative rounded-full bg-[#a9ff63] px-4 py-2 text-sm font-medium text-[#171718]"
              onClick={() => {
                readyGenerationRef.current = null;
                updateStatus("booting");
                setReloadKey((value) => value + 1);
              }}
            >
              重试连接
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 z-10" style={{ pointerEvents: "none" }} aria-hidden="true" data-demo-anchor-layer="">
        {operation && <span key={operation.id} data-demo-operation-cue={operation.id} className="home-operation-cue" style={{ left: operation.x + Math.min(operation.width - 5, 26), top: operation.y + Math.min(operation.height - 5, 22) }} />}
        {anchors
          .filter((box) => focus.has(box.id) || focus.has(box.id.replace(/^paper-card-/, "").replace(/^group-/, "")))
          .map((box) => (
            <span
              key={box.id}
              data-demo-focus-anchor={box.id}
              className="absolute rounded-lg ring-2 ring-[#a9ff63] ring-offset-2 ring-offset-transparent"
              style={{ pointerEvents: "none", left: box.x, top: box.y, width: box.width, height: box.height }}
            />
          ))}
      </div>
      </div>
    </div>
  );
}
