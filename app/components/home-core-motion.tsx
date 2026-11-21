"use client";

import { useEffect, useRef, useState } from "react";
import { homeCueAt, homeFrame, homeFrameSignal, homeSceneAt, homeScenes, homeTimeline, type HomeScene } from "../demo/scenes/home-runtime";
import { videoIdentityWorld } from "../demo/fixtures/video-identity";
import { serializeFixture } from "../demo/viewer/fixture";
import type { ViewerSnapshot } from "../demo/viewer/protocol";
import { ViewerFrame } from "./product-demo/ViewerFrame";
import { useViewPreferences } from "./view-preferences";

const fixture = serializeFixture(videoIdentityWorld);
const ALREADY_REDUCED = homeScenes[1].result;
const ignoreIntent = () => {};

export function HomeCoreMotion({ chapter, auto = true }: { chapter?: HomeScene; auto?: boolean }) {
  const sceneIndex = homeScenes.findIndex((scene) => scene.id === chapter);
  const start = sceneIndex < 0 ? 0 : Math.max(0, homeScenes[sceneIndex].start - 450);
  const end = sceneIndex < 0 ? homeTimeline.durationMs : (homeScenes[sceneIndex + 1]?.start ?? homeTimeline.durationMs) - 16;
  const target = sceneIndex < 0 ? ALREADY_REDUCED : homeScenes[sceneIndex].result;
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const generation = useRef(1);
  const time = useRef(start);
  const frameKey = useRef("");
  const userSeek = useRef(false);
  const [reduce] = useViewPreferences();
  const [layout, setLayout] = useState<ViewerSnapshot["layout"]>("desktop");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [enabled, setEnabled] = useState(auto);
  const [finished, setFinished] = useState(false);
  const [frame, setFrame] = useState(() => homeFrame(start, "desktop", 1));
  const scene = frame.scene;
  const cue = homeCueAt(frame.snapshot.t);
  const playing = ready && enabled && !reduce && !finished;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setLayout(query.matches ? "mobile" : "desktop");
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .22), { threshold: .22 });
    const onVisibility = () => setForeground(!document.hidden);
    observer.observe(element);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    let id = 0;
    let prev = 0;
    const publish = (t: number) => {
      const signal = homeFrameSignal(t, layout);
      if (signal.key !== frameKey.current) {
        frameKey.current = signal.key;
        setFrame(homeFrame(t, layout, ++generation.current));
      }
      progress.current?.style.setProperty("--played", String(Math.max(0, (t - start) / (end - start))));
    };
    const loop = (now: number) => {
      time.current = Math.min(end, time.current + (prev ? Math.min(now - prev, 120) : 0));
      prev = now;
      publish(time.current);
      if (time.current >= end) setFinished(true);
      else id = requestAnimationFrame(loop);
    };
    // React renders the checkpoint directly in reduced motion; no clock runs.
    id = requestAnimationFrame(() => {
      publish(reduce && !userSeek.current ? target : time.current);
      if (playing && visible && foreground) id = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, [end, foreground, layout, playing, reduce, start, target, visible]);

  function seek(t: number, play: boolean) {
    userSeek.current = true;
    time.current = t;
    const next = homeFrame(t, layout, ++generation.current);
    frameKey.current = next.key;
    setFrame(next);
    setFinished(false);
    setEnabled(play);
    progress.current?.style.setProperty("--played", String(Math.max(0, (t - start) / (end - start))));
  }

  return (
    <div ref={root} className="home-core" data-home-core={chapter ?? "hero"} data-home-scene={scene.id} data-home-playing={playing && visible && foreground ? "true" : "false"}>
      <div className="home-core-chrome">
        <div className="home-core-lights" aria-hidden="true"><i /><i /><i /></div>
        <span>CoResearch <span className="home-core-window-label">/ 研究工作台</span></span>
        <span className="home-core-status"><i aria-hidden="true" />实际 Core 界面 <span>· 离线回放</span></span>
      </div>
      <div className="home-core-cue" data-home-cue="">
        <span>当前动作</span><strong key={cue}>{cue}</strong>
      </div>
      <ViewerFrame fixture={fixture} snapshot={frame.snapshot} onIntent={ignoreIntent}
        onStatus={(status) => setReady(status === "ready")} presentation />
      <div className="home-core-progress" aria-hidden="true"><span ref={progress} /></div>
      {!chapter && <div className="home-core-steps" aria-label="跳到回放片段">
        {homeScenes.map((step, i) => <button type="button" key={step.id} aria-current={step.id === scene.id ? "step" : undefined}
          aria-label={`第 ${i + 1} 幕 · ${step.title}`} onClick={() => seek(step.result, false)}>
          {["起点", "找方向", "再细分", "看证据"][i]}
        </button>)}
      </div>}
      <div className="home-core-caption">
        <div>
          <span className="home-core-index">{chapter ? "功能片段" : String(homeScenes.indexOf(scene) + 1).padStart(2, "0")} / {chapter ? "Explore" : "04"}</span>
          <strong>{scene.title}</strong>
          <p>{scene.detail}</p>
        </div>
        <div className="home-core-controls" aria-label="首页回放控制">
          {!reduce && <button type="button" onClick={() => finished ? seek(start, true) : setEnabled((value) => !value)} disabled={!ready}>{finished ? "重新播放" : enabled ? "暂停" : "继续播放"}</button>}
          {!chapter && <button type="button" onClick={() => {
            const current = homeScenes.indexOf(homeSceneAt(time.current));
            seek(homeScenes[(current + 1) % homeScenes.length].result, false);
          }}>下一幕</button>}
        </div>
      </div>
    </div>
  );
}
