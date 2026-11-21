"use client";

import { useEffect, useRef, useState } from "react";
import { createDemoPlayer } from "../../demo/player";
import {
  CONCEPT_DURATION_MS,
  conceptPhaseCheckpointMs,
  conceptProgressAt,
  conceptRevisionBeat,
  conceptRuntimeScenes,
  conceptRuntimeTimeline,
} from "../../demo/scenes/concept";
import { videoIdentityWorld } from "../../demo/fixtures/video-identity";
import { createSceneRenderer } from "../../graph-svg/scene";
import { chapters, sampleConcept, REVISION_STORY_ANCHOR } from "../../graph-svg/story";
import { useViewPreferences } from "../view-preferences";
import { ConceptOverlay } from "./ConceptOverlay";
import { ResearchWorldSvg } from "./ResearchWorldSvg";
import { StoryNarration } from "./StoryNarration";
import "./research-story.css";

type Mode = "autoplay" | "scroll" | "slides";
type Controls = {
  go: (index: number) => void;
  cancel: () => void;
  pause?: () => void;
  resume?: () => void;
  restart?: () => void;
};

function useNarrow() {
  const [narrow, setNarrow] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return narrow;
}

export function ResearchWorldStory() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<Controls | null>(null);
  const savedIndex = useRef(0);
  const [active, setActive] = useState(0);
  const [initialOrChosenMode, setMode] = useState<Mode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [reduce, short] = useViewPreferences();
  const narrow = useNarrow();
  const facts = sampleConcept(active).facts;

  // Remember the first resolved preference, rather than mirroring it in an
  // effect or recomputing the default on resize. React retries this component
  // before committing, so mobile starts manually until explicitly played.
  if (initialOrChosenMode === null && narrow !== null) {
    setMode(reduce || short || narrow ? "slides" : "autoplay");
  }
  const mode = initialOrChosenMode ?? "slides";
  const modeReady = initialOrChosenMode !== null;

  const manual = mode === "slides" || reduce || short;

  useEffect(() => {
    if (!modeReady) return;
    const root = rootRef.current, stage = stageRef.current;
    if (!root || !stage) return;
    let disposed = false;
    stage.dataset.revisionBeat = "all";
    let disposeAnimation = () => {};
    let refreshFrame = 0;
    const render = createSceneRenderer(root);
    const cursor = { step: savedIndex.current };
    const updateFromProgress = (progress: number) => {
      const index = render(progress, chapters.length);
      cursor.step = progress;
      if (index !== savedIndex.current) {
        savedIndex.current = index;
        setActive(index);
      }
    };
    updateFromProgress(cursor.step);

    if (mode === "autoplay" && !manual) {
      let revealCheckpoint = false;
      const player = createDemoPlayer({
        world: videoIdentityWorld,
        timeline: conceptRuntimeTimeline,
        scenes: conceptRuntimeScenes,
        onTime: (t, _state, meta) => {
          if (disposed) return;
          // A successful renderer/player emission is the readiness signal.
          setReady(true);
          setError(false);
          updateFromProgress(conceptProgressAt(t));
          const stepBeat = conceptRevisionBeat(t);
          if (stepBeat === "all") revealCheckpoint = false;
          const beat = revealCheckpoint ? "all" : stepBeat;
          if (stage.dataset.revisionBeat !== beat) stage.dataset.revisionBeat = beat;
          setPlaying(meta.playing);
          setEnded(meta.pauseReasons.includes("ended") || t >= CONCEPT_DURATION_MS);
        },
      });
      const inEvidence = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest(".rw-overlay"));
      const onFocus = (event: FocusEvent) => {
        if (inEvidence(event.target)) player.notifyContentFocus(true);
      };
      const onBlur = (event: FocusEvent) => {
        if (inEvidence(event.target) && !inEvidence(event.relatedTarget)) player.notifyContentFocus(false);
      };
      stage.addEventListener("focusin", onFocus);
      stage.addEventListener("focusout", onBlur);
      let userPaused = false;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          player.notifyOnscreen();
          if (!userPaused && !document.hidden) player.resume();
        } else player.notifyOffscreen();
      }, { threshold: 0.2 });
      observer.observe(root);
      const onVisibility = () => {
        if (document.hidden) player.notifyHidden();
        else player.notifyVisible();
      };
      document.addEventListener("visibilitychange", onVisibility);
      controlsRef.current = {
        go: (index) => {
          const target = Math.max(0, Math.min(chapters.length - 1, index));
          userPaused = true;
          player.notifyControlOrScript("player-control");
          player.pause("user");
          revealCheckpoint = target === 5;
          player.seek(conceptPhaseCheckpointMs(target));
          savedIndex.current = target;
          setActive(target);
          setPlaying(false);
        },
        cancel: () => {},
        pause: () => {
          userPaused = true;
          player.notifyControlOrScript("player-control");
          player.pause("user");
        },
        resume: () => {
          userPaused = false;
          player.notifyControlOrScript("player-control");
          player.resume();
        },
        restart: () => {
          userPaused = false;
          player.notifyControlOrScript("player-control");
          revealCheckpoint = false;
          player.restart();
        },
      };
      const resumeIndex = savedIndex.current;
      if (resumeIndex > 0) player.seek(conceptPhaseCheckpointMs(resumeIndex));
      else player.seek(0);
      return () => {
        disposed = true;
        player.dispose();
        observer.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        stage.removeEventListener("focusin", onFocus);
        stage.removeEventListener("focusout", onBlur);
        controlsRef.current = null;
      };
    }

    void (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        let navigation: ReturnType<typeof gsap.to> | null = null;
        let scroll: ReturnType<typeof ScrollTrigger.create> | null = null;
        let observer: ResizeObserver | null = null;
        let top = 0;
        const header = document.querySelector<HTMLElement>("body > header");
        const measureHeader = () => {
          const next = Math.ceil(header?.getBoundingClientRect().height ?? 0);
          if (next !== top) {
            top = next;
            root.style.setProperty("--rw-top", `${top}px`);
            cancelAnimationFrame(refreshFrame);
            refreshFrame = requestAnimationFrame(() => { if (!disposed) scroll?.refresh(); });
          }
        };
        measureHeader();
        const cancel = () => { navigation?.kill(); navigation = null; };
        const ctx = gsap.context(() => {
          const timeline = gsap.timeline({ paused: true, onUpdate: () => updateFromProgress(cursor.step) });
          timeline.addLabel(chapters[0]!.id, 0);
          for (let i = 1; i < chapters.length; i++) {
            timeline.fromTo(cursor, { step: i - 1 }, {
              step: i, duration: .5, ease: "none", immediateRender: false,
            }, i - .5);
            timeline.addLabel(chapters[i]!.id, i);
          }
          timeline.to({}, { duration: 0.01 });
          timeline.time(savedIndex.current, false);
          if (mode === "scroll" && !manual) {
            scroll = ScrollTrigger.create({
              id: "coresearch-svg-story", trigger: root, pin: stage,
              start: () => `top top+=${top}`,
              end: () => `+=${Math.max(360, (window.innerHeight - top) * .72) * (chapters.length - 1)}`,
              animation: timeline, scrub: .35, anticipatePin: 1,
              invalidateOnRefresh: true,
            });
          }
          const go = (raw: number) => {
            const index = Math.max(0, Math.min(chapters.length - 1, raw));
            cancel();
            if (manual) {
              if (reduce) {
                timeline.time(timeline.labels[chapters[index]!.id], false);
                updateFromProgress(index);
              } else {
                navigation = timeline.tweenTo(chapters[index]!.id, { duration: .5, ease: "power1.inOut" });
              }
            } else if (scroll) {
              const position = scroll.labelToScroll(chapters[index]!.id);
              const viewport = { y: window.scrollY };
              navigation = gsap.to(viewport, {
                y: position, duration: .6, ease: "power2.inOut",
                onUpdate: () => window.scrollTo({ top: viewport.y, behavior: "instant" }),
              });
            }
          };
          controlsRef.current = { go, cancel };
          if (scroll && savedIndex.current > 0 && root.getBoundingClientRect().top < window.innerHeight && root.getBoundingClientRect().bottom > 0) {
            window.scrollTo({ top: scroll.labelToScroll(chapters[savedIndex.current]!.id), behavior: "instant" });
          }
        }, root);
        const interruptKey = (event: KeyboardEvent) => {
          if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) cancel();
        };
        window.addEventListener("wheel", cancel, { passive: true });
        window.addEventListener("touchstart", cancel, { passive: true });
        window.addEventListener("keydown", interruptKey);
        if (header && typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(measureHeader);
          observer.observe(header);
        }
        void document.fonts?.ready.then(() => { if (!disposed) scroll?.refresh(); });
        disposeAnimation = () => {
          cancel(); observer?.disconnect(); ctx.revert(); controlsRef.current = null;
          window.removeEventListener("wheel", cancel);
          window.removeEventListener("touchstart", cancel);
          window.removeEventListener("keydown", interruptKey);
        };
        setReady(true);
        setError(false);
      } catch {
        if (!disposed) { setError(true); setReady(false); }
      }
    })();
    return () => { disposed = true; cancelAnimationFrame(refreshFrame); disposeAnimation(); };
  }, [manual, reduce, short, mode, modeReady]);

  useEffect(() => {
    if (!ready) return;
    const seekRevision = () => {
      if (window.location?.hash !== `#${REVISION_STORY_ANCHOR}`) return;
      const index = chapters.findIndex(({ id }) => id === "revise");
      if (index >= 0) controlsRef.current?.go(index);
    };
    seekRevision();
    const repeatEntry = (event: MouseEvent) => {
      const target = event.target;
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (target instanceof Element && target.closest(`a[href="#${REVISION_STORY_ANCHOR}"]`)) seekRevision();
    };
    window.addEventListener("hashchange", seekRevision);
    window.addEventListener("click", repeatEntry);
    return () => {
      window.removeEventListener("hashchange", seekRevision);
      window.removeEventListener("click", repeatEntry);
    };
  }, [ready]);

  function go(index: number) {
    controlsRef.current?.go(index);
    if (narrow && rootRef.current && rootRef.current.getBoundingClientRect().top < -100) {
      rootRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }
  function skip() {
    controlsRef.current?.cancel();
    endRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    endRef.current?.focus({ preventScroll: true });
  }

  return (
    <section ref={rootRef} id="research-world" className={`rw-story${manual ? " rw-manual" : ""}${short ? " rw-short" : ""}${narrow ? " rw-narrow" : ""}`} aria-label="研究世界概念演示" data-concept-act={active + 1}>
      <span id={REVISION_STORY_ANCHOR} className="rw-story-anchor" aria-hidden="true" />
      <div
        ref={stageRef}
        className="rw-stage"
        onKeyDown={(event) => {
          if (event.target instanceof HTMLElement && event.target.closest("button, input, select, textarea, a, summary, [contenteditable=true]")) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            go(active + (event.key === "ArrowRight" ? 1 : -1));
          }
          if (mode === "autoplay" && (event.key === " " || event.key === "Spacebar")) {
            event.preventDefault();
            if (playing) controlsRef.current?.pause?.();
            else if (ended) controlsRef.current?.restart?.();
            else controlsRef.current?.resume?.();
          }
        }}
      >
        <header className="rw-heading">
          <div>
            <p className="rw-kicker">02 / RESEARCH WORLD</p>
            <h2>研究问题是怎么形成的？ <span>研究世界</span></h2>
          </div>
          <button type="button" onClick={skip} className="rw-skip">跳过动画 ↓</button>
        </header>
        <div className="rw-content">
          <StoryNarration active={active} />
          <div className="rw-canvas"><ResearchWorldSvg /><div className="rw-map-caption" aria-hidden="true"><i />研究路径 / {String(active + 1).padStart(2, "0")}</div>
          {active === 5 ? <p className="rw-map-hint">两块是分别覆盖，不等于组合场景已经验证。</p> :
            active >= 6 ? <p className="rw-map-hint">虚线是下一步调查，不是已证实的结论。</p> : null}
          </div>
          <ConceptOverlay key={chapters[active]?.id} facts={facts} chapter={chapters[active]!} active={active} />
        </div>
        <div className="rw-journey" aria-hidden="true"><span data-current={active < 3}>01 找方向</span><span data-current={active === 3 || active === 4}>02 查证据</span><span data-current={active === 5}>03 反例改判</span><span data-current={active > 5}>04 定问题</span></div>
        <div className="rw-progress-row">
          <div className="rw-progress-track" aria-hidden="true"><span data-rw-progress="" /></div>
          <nav className="rw-ticks" aria-label="幕次进度点">
            {chapters.map((chapter, i) => (
              <button key={chapter.id} type="button" onClick={() => go(i)} aria-label={`第 ${i + 1} 幕 · ${chapter.title}`} aria-current={i === active ? "step" : undefined}
                className={`rw-tick${i < active ? " is-passed" : ""}${i === active ? " is-active" : ""}`} />
            ))}
          </nav>
        </div>
        <nav className="rw-controls" aria-label="研究故事幕次">
          <div className="rw-mode">
            {reduce ? <span>减少动态 · 手动翻页</span> : short ? <span>手动模式 · 点击翻页</span> : narrow ? (
              <button type="button" aria-pressed={mode === "autoplay"}
                onClick={() => setMode(mode === "autoplay" ? "slides" : "autoplay")}>
                {mode === "autoplay" ? "切回手动" : "自动讲解"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode(mode === "scroll" ? "autoplay" : "scroll")}
                aria-pressed={mode === "scroll"}
              >
                {mode === "scroll" ? "切换自动播放" : "切换滚动讲解"}
              </button>
            )}
          </div>
          <label className="rw-chapter-picker">
            <span className="rw-sr-only">跳转幕次</span>
            <select value={active} onChange={(event) => go(Number(event.target.value))} disabled={!ready}>
              {chapters.map((chapter, i) => <option key={chapter.id} value={i}>{i + 1} / {chapters.length} · {chapter.title}</option>)}
            </select>
          </label>
          <div className="rw-buttons">
            {mode === "autoplay" && !manual && (
              <button
                type="button"
                onClick={() => (playing ? controlsRef.current?.pause?.() : ended ? controlsRef.current?.restart?.() : controlsRef.current?.resume?.())}
              >
                {playing ? "暂停 ⏸" : ended ? "重新观看 ▶" : "继续播放 ▶"}
              </button>
            )}
            <button type="button" onClick={() => go(active - 1)} disabled={!ready || active === 0} aria-label="上一幕">← 上一步</button>
            <button type="button" className="rw-next" onClick={() => {
              if (active !== chapters.length - 1) go(active + 1);
              else if (controlsRef.current?.restart) controlsRef.current.restart();
              else go(0);
            }} disabled={!ready}>
              {active === chapters.length - 1 ? "重新观看 ↺" : "下一步 →"}
            </button>
          </div>
        </nav>
        <p className="rw-demo-note">概念演示 · 合成教学数据 · 不是产品页里的真实 UI 运行 · 开放任务仅为 Explore{mode === "scroll" && !manual ? " · 向下滚动继续，可向上回看" : " · 最后一幕停住，需显式重新观看"}</p>
        {error && <p role="status" className="rw-error">动画暂未加载，请阅读下方完整讲解与问题卡。</p>}
        <p className="rw-sr-only" aria-live={manual ? "polite" : "off"}>{chapters[active]?.title}</p>
      </div>
      <div ref={endRef} id="research-story-end" tabIndex={-1} className="rw-transcript">
        <details>
          <summary>阅读完整文字讲解</summary>
          <div>
            {chapters.map((chapter) => (
              <article key={chapter.id}>
                <p className="rw-eyebrow">{chapter.tag}</p>
                <h3>{chapter.title}</h3>
                <p>动作：{chapter.action}</p>
                <p>{chapter.body}</p>
                <p>变化：{chapter.change}</p>
                <p>{chapter.takeaway}</p>
                <p>下一步：{chapter.next}</p>
              </article>
            ))}
          </div>
        </details>
        <p>这是一段产品理念演示，使用共享合成 fixture，不会发起真实研究任务。候选问题、方法及边界变化均须进一步核验。Explore 是当前开放任务；此处不把锁定能力或 Gap Finder 当作最终结果。</p>
      </div>
    </section>
  );
}
