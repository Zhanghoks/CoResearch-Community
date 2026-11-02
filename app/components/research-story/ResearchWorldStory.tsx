"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { chapters } from "../../graph-svg/story";
import { createSceneRenderer } from "../../graph-svg/scene";
import { ResearchWorldSvg } from "./ResearchWorldSvg";
import { StoryNarration } from "./StoryNarration";
import "./research-story.css";

function subscribePreferences(onChange: () => void) {
  const queries = [window.matchMedia("(prefers-reduced-motion: reduce)"), window.matchMedia("(max-height: 560px)")];
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}
function preferences() {
  return `${window.matchMedia("(prefers-reduced-motion: reduce)").matches}:${window.matchMedia("(max-height: 560px)").matches}`;
}
const serverPreferences = () => "false:false";

type Controls = { go: (index: number) => void; cancel: () => void };

export function ResearchWorldStory() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<Controls | null>(null);
  const savedIndex = useRef(0);
  // Capture before pin teardown; rebuilding the timeline must not overwrite this.
  const pendingResume = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"scroll" | "slides">("scroll");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const preference = useSyncExternalStore(subscribePreferences, preferences, serverPreferences);
  const [reduce, short] = preference.split(":").map((value) => value === "true");
  const manual = mode === "slides" || reduce || short;

  useEffect(() => {
    const root = rootRef.current, stage = stageRef.current;
    if (!root || !stage) return;
    let disposed = false;
    let disposeAnimation = () => {};
    let refreshFrame = 0;
    const render = createSceneRenderer(root);
    const resumeIndex = pendingResume.current ?? savedIndex.current;
    const restoreViewport = pendingResume.current !== null;
    let initializing = true;
    const cursor = { step: resumeIndex };
    const update = () => {
      if (disposed) return;
      const index = render(cursor.step, chapters.length);
      if (initializing) return;
      if (index !== savedIndex.current) {
        savedIndex.current = index;
        setActive(index);
      }
    };
    update();

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
          const timeline = gsap.timeline({ paused: true, onUpdate: update });
          timeline.addLabel(chapters[0].id, 0);
          for (let i = 1; i < chapters.length; i++) {
            timeline.fromTo(cursor, { step: i - 1 }, {
              step: i, duration: .68, ease: "none", immediateRender: false,
            }, i - .68);
            // Labels are settled states, NOT the beginning of the transition.
            timeline.addLabel(chapters[i].id, i);
          }
          timeline.to({}, { duration: .32 });
          timeline.time(resumeIndex, false);
          if (!manual) {
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
              if (reduce) timeline.time(timeline.labels[chapters[index].id], false);
              else navigation = timeline.tweenTo(chapters[index].id, { duration: .65, ease: "power1.inOut" });
            } else if (scroll) {
              // Scroll is the single source of truth; do not tween the timeline independently.
              const position = scroll.labelToScroll(chapters[index].id);
              const viewport = { y: window.scrollY };
              navigation = gsap.to(viewport, {
                y: position, duration: .75, ease: "power2.inOut",
                onUpdate: () => window.scrollTo({ top: viewport.y, behavior: "instant" }),
              });
            }
          };
          controlsRef.current = { go, cancel };
          // ScrollTrigger creation may render its initial position. Restore only after
          // pin spacing is established, and keep the stage anchored when pinning is removed.
          if (restoreViewport) {
            const y = scroll
              ? scroll.labelToScroll(chapters[resumeIndex].id)
              : root.getBoundingClientRect().top + window.scrollY - top;
            window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
            scroll?.update();
            scroll?.getTween()?.progress(1);
          }
          if (manual || restoreViewport) timeline.time(resumeIndex, false);
          initializing = false;
          update();
          pendingResume.current = null;
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
        if (!disposed) { initializing = false; update(); setError(true); setReady(false); }
      }
    })();
    return () => {
      disposed = true;
      // Media-preference changes also rebuild the pin. Keep the visible chapter.
      const bounds = stage.getBoundingClientRect();
      if (pendingResume.current === null && bounds.top < window.innerHeight && bounds.bottom > 0) {
        pendingResume.current = savedIndex.current;
      }
      cancelAnimationFrame(refreshFrame);
      disposeAnimation();
    };
  }, [manual, reduce]);

  function go(index: number) { controlsRef.current?.go(index); }
  function switchMode() {
    controlsRef.current?.cancel();
    pendingResume.current = savedIndex.current;
    setReady(false);
    setMode((current) => current === "scroll" ? "slides" : "scroll");
  }
  function skip() {
    controlsRef.current?.cancel();
    endRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    endRef.current?.focus({ preventScroll: true });
  }

  return (
    <section ref={rootRef} id="research-world" className={`rw-story${manual ? " rw-manual" : ""}${short ? " rw-short" : ""}`} aria-label="Research World 图谱讲解">
      <div ref={stageRef} className="rw-stage" data-rw-active={active} data-rw-mode={manual ? "slides" : "scroll"} onKeyDown={(event) => {
        if (event.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault(); go(active + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}>
        <header className="rw-heading">
          <div><p className="rw-kicker">CORESEARCH / AN EXPLORABLE WORLD</p><h2>研究世界 <span>Research World</span></h2></div>
          <button type="button" onClick={skip} className="rw-skip">跳过动画 ↓</button>
        </header>
        <div className="rw-content">
          <div className="rw-canvas"><ResearchWorldSvg /></div>
          <StoryNarration active={active} />
        </div>
        <div className="rw-progress-track" aria-hidden="true"><span data-rw-progress="" /></div>
        <nav className="rw-controls" aria-label="研究故事章节">
          <div className="rw-mode">
            {reduce ? <span>已启用减少动态效果</span> : short ? <span>小高度屏幕 · 点击翻页</span> : <button type="button" onClick={switchMode} disabled={!ready} aria-pressed={mode === "slides"}>{manual ? "切换滚动讲解" : "切换点击演示"}</button>}
          </div>
          <label className="rw-chapter-picker"><span className="rw-sr-only">跳转章节</span><select value={active} onChange={(event) => go(Number(event.target.value))} disabled={!ready}>{chapters.map((chapter, i) => <option key={chapter.id} value={i}>{i + 1} / {chapters.length} · {chapter.title}</option>)}</select></label>
          <div className="rw-buttons"><button type="button" onClick={() => go(active - 1)} disabled={!ready || active === 0} aria-label="上一场景">← 上一步</button><button type="button" className="rw-next" onClick={() => active === chapters.length - 1 ? go(0) : go(active + 1)} disabled={!ready}>{active === chapters.length - 1 ? "重新观看 ↺" : "下一步 →"}</button></div>
        </nav>
        <p className="rw-demo-note">演示图谱 · 非真实文献结论{!manual && " · 向下滚动继续，可向上回看"}</p>
        {error && <p role="status" className="rw-error">动画暂未加载，请阅读下方完整讲解。</p>}
        <p className="rw-sr-only" aria-live={manual ? "polite" : "off"}>{chapters[active].title}</p>
      </div>
      <div ref={endRef} id="research-story-end" tabIndex={-1} className="rw-transcript">
        <details><summary>阅读完整文字讲解</summary><div>{chapters.map((chapter) => <article key={chapter.id}><p className="rw-eyebrow">{chapter.tag}</p><h3>{chapter.title}</h3><p>{chapter.body}</p><p>{chapter.takeaway}</p></article>)}</div></details>
        <p>这是一段产品理念演示，不会发起真实研究任务。候选缺口、方法及边界变化均须进一步核验。</p>
      </div>
    </section>
  );
}
