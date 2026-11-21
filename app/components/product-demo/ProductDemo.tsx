"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDemoPlayer, stateAt, videoIdentityWorld } from "../../demo";
import {
  productPhaseCheckpointMs,
  productRuntimeScenes,
  productRuntimeTimeline,
  productSceneIndexAt,
  PRODUCT_RUNTIME_DURATION_MS,
} from "../../demo/scenes/product-runtime";
import { serializeFixture } from "../../demo/viewer/fixture";
import { applyUserIntent } from "../../demo/viewer/intents";
import { CONFIRMED_CAPABILITY_PROFILE, type UserIntent, type ViewerSnapshot } from "../../demo/viewer/protocol";
import {
  mergeClockSnapshot,
  PRODUCT_INTEREST_PROMPT,
  snapshotFromWorld,
  type SnapshotMergeOptions,
} from "../../demo/viewer/snapshot";
import { useViewPreferences } from "../view-preferences";
import { ViewerFrame, type ViewerHandshake } from "./ViewerFrame";

type Controls = {
  go: (index: number) => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  seekMs?: (ms: number) => void;
};

function layoutOf(): ViewerSnapshot["layout"] {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function clockSnapshot(
  t: number,
  layout: ViewerSnapshot["layout"],
  previous: ViewerSnapshot | null,
  generation: number,
  merge: SnapshotMergeOptions = { reason: "clock", mode: "autoplay" },
): ViewerSnapshot {
  const state = stateAt(videoIdentityWorld, productRuntimeTimeline, t);
  const scene = productRuntimeScenes[productSceneIndexAt(t)];
  const incoming = snapshotFromWorld(videoIdentityWorld, state, productRuntimeTimeline, {
    generation,
    layout,
    mobilePane: previous?.mobilePane ?? "composer",
    draft: previous?.draftDirty ? previous.draft : PRODUCT_INTEREST_PROMPT,
    draftDirty: Boolean(previous?.draftDirty),
    focusIds: scene?.focusIds ?? [],
  });
  return mergeClockSnapshot(previous, incoming, merge);
}

/** 可见时自动播放的产品运行演示；真实 Core viewer 由父时钟驱动。 */
export function ProductDemo() {
  const rootRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<Controls | null>(null);
  const activeRef = useRef(0);
  const overlayRef = useRef<ViewerSnapshot | null>(null);
  const generationRef = useRef(1);
  const mergeReasonRef = useRef<SnapshotMergeOptions["reason"]>("clock");
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const [layout, setLayout] = useState<ViewerSnapshot["layout"]>("desktop");
  const layoutRef = useRef<ViewerSnapshot["layout"]>("desktop");
  const [snapshot, setSnapshot] = useState<ViewerSnapshot>(() => clockSnapshot(0, "desktop", null, 1));
  const [reduce, short] = useViewPreferences();
  const manual = reduce || short;
  const lastRuntime = productRuntimeScenes.length - 1;

  const fixture = useMemo(() => serializeFixture(videoIdentityWorld), []);

  const publishSnapshot = useCallback((next: ViewerSnapshot) => {
    overlayRef.current = next;
    setSnapshot(next);
  }, []);

  useEffect(() => {
    const apply = () => {
      const next = layoutOf();
      layoutRef.current = next;
      setLayout(next);
    };
    apply();
    const query = window.matchMedia("(max-width: 767px)");
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const current = overlayRef.current;
    if (!current || current.layout === layout) return;
    publishSnapshot({ ...current, layout, generation: current.generation + 1 });
  }, [layout, publishSnapshot]);

  const onIntent = useCallback(
    (intent: UserIntent) => {
      const current = overlayRef.current ?? snapshot;
      const result = applyUserIntent(current, intent, productRuntimeTimeline);
      if (result.ignored === "duplicate-send" || result.ignored === "locked-task" || result.ignored === "not-prepared" || result.ignored === "unsupported-target") {
        return;
      }
      if (result.seekMs !== undefined) {
        controlsRef.current?.seekMs?.(result.seekMs);
        return;
      }
      publishSnapshot(result.snapshot);
    },
    [publishSnapshot, snapshot],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !viewerReady) return;

    const syncPhase = (t: number, isPlaying: boolean, isEnded: boolean) => {
      generationRef.current += 1;
      const reason = mergeReasonRef.current ?? "clock";
      publishSnapshot(clockSnapshot(t, layoutRef.current, overlayRef.current, generationRef.current, { reason, mode: "autoplay" }));
      mergeReasonRef.current = "clock";
      const phase = productSceneIndexAt(t);
      if (phase !== activeRef.current) {
        activeRef.current = phase;
        setActive(phase);
      }
      setPlaying(isPlaying);
      setEnded(isEnded);
    };

    const player = createDemoPlayer({
      world: videoIdentityWorld,
      timeline: productRuntimeTimeline,
      scenes: productRuntimeScenes,
      onTime: (t, _state, meta) => {
        syncPhase(t, meta.playing, meta.pauseReasons.includes("ended") || t >= PRODUCT_RUNTIME_DURATION_MS);
      },
    });

    const stage = root.querySelector<HTMLElement>("[data-pd-stage]");
    const controls = root.querySelector<HTMLElement>("[data-pd-controls]");
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      player.notifyContentHover(true);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      player.notifyContentHover(false);
    };
    const onStageFocus = () => player.notifyContentFocus(true);
    const onStageBlur = () => player.notifyContentFocus(false);
    stage?.addEventListener("pointerenter", onEnter);
    stage?.addEventListener("pointerleave", onLeave);
    stage?.addEventListener("focusin", onStageFocus);
    stage?.addEventListener("focusout", onStageBlur);
    const onControl = () => player.notifyControlOrScript("player-control");
    controls?.addEventListener("focusin", onControl);

    let userPaused = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        player.notifyOnscreen();
        if (!userPaused && !document.hidden && !manual) player.resume();
      } else player.notifyOffscreen();
    }, { threshold: 0.2 });
    observer.observe(root);

    const onVisibility = () => {
      if (document.hidden) player.notifyHidden();
      else player.notifyVisible();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const seekMs = (ms: number, reason: SnapshotMergeOptions["reason"] = "seek") => {
      userPaused = true;
      mergeReasonRef.current = reason;
      player.notifyControlOrScript("player-control");
      player.pause("user");
      player.seek(ms);
    };

    controlsRef.current = {
      go: (index) => {
        const target = Math.max(0, Math.min(lastRuntime, index));
        seekMs(productPhaseCheckpointMs(target));
        activeRef.current = target;
        setActive(target);
        setPlaying(false);
      },
      resume: () => {
        userPaused = false;
        player.notifyControlOrScript("player-control");
        player.resume();
      },
      pause: () => {
        userPaused = true;
        player.notifyControlOrScript("player-control");
        player.pause("user");
      },
      restart: () => {
        userPaused = false;
        mergeReasonRef.current = "reset";
        player.notifyControlOrScript("player-control");
        player.restart();
      },
      seekMs,
    };

    if (manual) {
      const initial = reduce ? lastRuntime : 0;
      // seek emits onTime synchronously; that subscription owns phase state.
      player.seek(productPhaseCheckpointMs(initial));
    } else {
      player.seek(0);
    }

    return () => {
      player.dispose();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stage?.removeEventListener("pointerenter", onEnter);
      stage?.removeEventListener("pointerleave", onLeave);
      stage?.removeEventListener("focusin", onStageFocus);
      stage?.removeEventListener("focusout", onStageBlur);
      controls?.removeEventListener("focusin", onControl);
      controlsRef.current = null;
    };
  }, [manual, reduce, lastRuntime, viewerReady, publishSnapshot]);

  const goTo = (index: number) => controlsRef.current?.go(index);
  const restart = () => controlsRef.current?.restart();
  const chapters = productRuntimeScenes;
  const caption = chapters[Math.min(active, chapters.length - 1)]?.caption;
  const last = chapters.length - 1;

  return (
    <section ref={rootRef} id="product-demo" className="mx-auto max-w-6xl px-5 py-16" aria-label="产品运行演示">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 text-sm font-medium">
          <span className="rounded-full bg-[#a9ff63] px-2 py-0.5 text-xs font-semibold">Run Demo</span>
          离线回放 · 内容为合成教学数据
        </p>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">看 CoResearch 跑一次研究</h2>
        <p className="mt-5 text-lg leading-8 text-[#3f413c]">
          画面使用实际 Core 界面。这段回放只演示 Explore，输入和结果来自固定教学数据，不会调用模型。
        </p>
      </div>
      <div
        className="mt-10"
        onKeyDown={(event) => {
          if (event.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(active + (event.key === "ArrowRight" ? 1 : -1));
          }
          if (event.key === " " || event.key === "Spacebar") {
            event.preventDefault();
            if (playing) controlsRef.current?.pause();
            else if (ended) restart();
            else controlsRef.current?.resume();
          }
        }}
      >
        <ViewerFrame
          fixture={fixture}
          snapshot={snapshot}
          onIntent={onIntent}
          onStatus={(status: ViewerHandshake) => setViewerReady(status === "ready")}
        />
        {caption ? (
          <div className="pd-caption mt-6 grid max-w-2xl gap-1.5" key={`${active}-${caption.tag}`}>
            <p className="text-xs font-semibold tracking-[0.1em] text-[#6d7a3a]">{caption.tag} · {active + 1} / {chapters.length}</p>
            <h3 className="text-2xl font-semibold tracking-tight">{caption.title}</h3>
            <p className="text-sm leading-7 text-[#3f413c]">{caption.body}</p>
          </div>
        ) : null}
        <nav data-pd-controls="" className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="演示阶段控制">
          <div className="flex items-center gap-3">
            {!manual && (
              <button
                type="button"
                onClick={() => (playing ? controlsRef.current?.pause() : ended ? restart() : controlsRef.current?.resume())}
                className="rounded-full border border-black/10 px-4 py-2 text-sm text-[#3f413c] transition hover:border-black/25"
              >
                {playing ? "暂停 ⏸" : ended ? "重新观看 ▶" : "继续播放 ▶"}
              </button>
            )}
            <span className="text-xs text-[#8a8c84]">{reduce ? "已启用减少动态效果 · 显示完整 checkpoint" : manual ? "手动模式" : "自动播放至最后一幕停住 · 悬停内容区暂停"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              className="rounded-full border border-black/10 px-4 py-2 text-sm text-[#3f413c] transition hover:border-black/25 disabled:opacity-40"
            >
              ← 上一阶段
            </button>
            <label>
              <span className="sr-only">跳转阶段</span>
              <select
                value={Math.min(active, last)}
                onChange={(event) => goTo(Number(event.target.value))}
                className="max-w-[240px] cursor-pointer rounded-full border border-black/10 bg-transparent px-3 py-2 text-sm text-[#3f413c]"
              >
                {chapters.map((phase, index) => (
                  <option key={index} value={index}>
                    {index + 1} / {chapters.length} · {phase.caption.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => (active === last ? restart() : goTo(active + 1))}
              className="rounded-full bg-[#262626] px-4 py-2 text-sm text-white transition hover:bg-black"
            >
              {active === last ? "重新观看 ↺" : "下一阶段 →"}
            </button>
          </div>
        </nav>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-[#6b6d66]">
          文献、证据与问题均为标识为「演示文献」的合成教学数据，不是真实研究成果。其它任务不在本回放范围内。跳章落到可阅读 checkpoint，继续播放不会回到阶段起点；最后一幕停住，需要显式重新观看。
        </p>
        <p className="sr-only">{CONFIRMED_CAPABILITY_PROFILE.openTasks.join(" ")}</p>
      </div>
    </section>
  );
}
