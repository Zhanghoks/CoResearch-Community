"use client";

import { useEffect, useRef, useState } from "react";
import { phaseStart, phases, progressAt, sampleScenario, scenarioDuration } from "../../product-demo/scenario";
import { createDemoRenderer } from "../../product-demo/stage";
import { useViewPreferences } from "../view-preferences";
import { DemoWindow } from "./DemoPanels";
import "./product-demo.css";

type Controls = { go: (index: number) => void; pause: () => void; resume: () => void };

/** 可见时自动循环播放的产品使用演示；悬停暂停、手动步进，reduced-motion 呈现终态。 */
export function ProductDemo() {
  const rootRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<Controls | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduce, short] = useViewPreferences();
  const manual = reduce || short;
  const last = phases.length - 1;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const render = createDemoRenderer(root);
    const apply = (progress: number) => {
      const state = sampleScenario(progress);
      render(state);
      if (state.phase !== activeRef.current) {
        activeRef.current = state.phase;
        setActive(state.phase);
      }
    };

    // 手动模式（减少动态 / 矮屏）：无时钟，直接渲染目标阶段；reduce 呈现终态。
    if (manual) {
      const initial = reduce ? last : activeRef.current;
      render(sampleScenario(initial));
      // 状态同步放到帧回调里，避免 effect 内同步 setState 引发级联渲染。
      const kick = requestAnimationFrame(() => { if (initial !== activeRef.current) { activeRef.current = initial; setActive(initial); } });
      controlsRef.current = {
        go: (index) => {
          const target = Math.max(0, Math.min(last, index));
          activeRef.current = target;
          setActive(target);
          apply(target);
        },
        resume: () => {},
        pause: () => {},
      };
      return () => { cancelAnimationFrame(kick); controlsRef.current = null; };
    }

    // 自动模式：rAF 累积帧间隔（钳制上限），不可见/悬停/手动暂停即停帧。
    let elapsed = 0, frame = 0, lastTick = 0;
    let visible = false, hovered = false, userPaused = false;
    const canRun = () => visible && !document.hidden && !hovered && !userPaused;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTick = 0; };
    const start = () => { if (!frame && canRun()) frame = requestAnimationFrame(tick); };
    function tick(now: number) {
      frame = 0;
      const dt = lastTick ? Math.min((now - lastTick) / 1000, .05) : 0;
      lastTick = now;
      elapsed += dt;
      apply(progressAt(elapsed % scenarioDuration));
      frame = requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: .2 });
    observer.observe(root);
    const onVisibility = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener("visibilitychange", onVisibility);
    // 悬停暂停只对鼠标生效：触屏的 pointerenter 往往没有配对的 leave，会永久停帧。
    const stage = root.querySelector<HTMLElement>("[data-pd-stage]");
    const onEnter = (event: PointerEvent) => { if (event.pointerType !== "mouse") return; hovered = true; stop(); };
    const onLeave = (event: PointerEvent) => { if (event.pointerType !== "mouse") return; hovered = false; start(); };
    stage?.addEventListener("pointerenter", onEnter);
    stage?.addEventListener("pointerleave", onLeave);
    controlsRef.current = {
      go: (index) => {
        userPaused = true;
        stop();
        setPlaying(false);
        const target = Math.max(0, Math.min(last, index));
        elapsed = phaseStart(target) + .01;
        activeRef.current = target;
        setActive(target);
        apply(target);
      },
      resume: () => { userPaused = false; setPlaying(true); start(); },
      pause: () => { userPaused = true; stop(); setPlaying(false); },
    };
    apply(0);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stage?.removeEventListener("pointerenter", onEnter);
      stage?.removeEventListener("pointerleave", onLeave);
      controlsRef.current = null;
    };
  }, [manual, reduce, last]);

  const goTo = (index: number) => controlsRef.current?.go(index);
  // 「重新观看」回到第一阶段并恢复自动播放（spec：显式重新播放恢复）。
  const restart = () => { controlsRef.current?.go(0); controlsRef.current?.resume(); };
  const caption = phases[active].caption;

  return (
    <section ref={rootRef} id="product-demo" className="mx-auto max-w-6xl px-5 py-20" aria-label="产品使用演示">
      <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">一次研究是怎么完成的</h2>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
        从一句模糊的兴趣，到可验证的候选方法：多 Agent 协作在同一个研究会话里接力推进。
      </p>
      <div
        className="mt-10"
        onKeyDown={(event) => {
          if (event.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(active + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
      >
        <DemoWindow />
        <div className="pd-caption mt-6 grid max-w-2xl gap-1.5" key={phases[active].id}>
          <p className="text-xs font-semibold tracking-[0.1em] text-[#6d7a3a]">{caption.tag} · {active + 1} / {phases.length}</p>
          <h3 className="text-2xl font-semibold tracking-tight">{caption.title}</h3>
          <p className="text-sm leading-7 text-[#3f413c]">{caption.body}</p>
        </div>
        <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="演示阶段控制">
          <div className="flex items-center gap-3">
            {!manual && (
              <button
                type="button"
                onClick={() => (playing ? controlsRef.current?.pause() : controlsRef.current?.resume())}
                className="rounded-full border border-black/10 px-4 py-2 text-sm text-[#3f413c] transition hover:border-black/25"
              >
                {playing ? "暂停 ⏸" : "继续播放 ▶"}
              </button>
            )}
            <span className="text-xs text-[#8a8c84]">{reduce ? "已启用减少动态效果 · 显示最终状态" : manual ? "手动模式" : "自动循环播放 · 悬停暂停"}</span>
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
                value={active}
                onChange={(event) => goTo(Number(event.target.value))}
                className="max-w-[240px] cursor-pointer rounded-full border border-black/10 bg-transparent px-3 py-2 text-sm text-[#3f413c]"
              >
                {phases.map((phase, index) => <option key={phase.id} value={index}>{index + 1} / {phases.length} · {phase.caption.title}</option>)}
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
        <p className="mt-6 text-center text-xs leading-6 text-[#8a8c84]">
          产品理念演示 · 界面与内容为 mock，不代表已上线功能；候选结论均须核验。
          <br />
          设计文档：<a className="underline decoration-black/20 underline-offset-4 hover:text-[#262626]" href="https://github.com/Zhanghoks/CoResearch-Community/blob/main/docs/actions/01-explore.md">Explore</a> · <a className="underline decoration-black/20 underline-offset-4 hover:text-[#262626]" href="https://github.com/Zhanghoks/CoResearch-Community/blob/main/docs/actions/02-deep-dive-deep-research.md">Deep Dive / Deep Research</a>
        </p>
        <p className="sr-only" aria-live="polite">{caption.title}</p>
      </div>
    </section>
  );
}
