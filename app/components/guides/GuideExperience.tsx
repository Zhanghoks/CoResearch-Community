"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  GUIDE_PRESET_PROMPT,
  applyExpectedStep,
  applyGuideIntent,
  evaluatePredicate,
  goToStep,
  guideById,
  isOffPresetDraft,
  isStepComplete,
  missingResourceIds,
  resetStep,
  recoverInterruptedStep,
  startGuide,
  useExampleContinue as acknowledgeExample,
  worldForVariant,
  type GuideMode,
  type GuideSession,
} from "../../demo/guides";
import { serializeFixture } from "../../demo/viewer/fixture";
import type { AnchorBox, UserIntent } from "../../demo/viewer/protocol";
import { ViewerFrame, type ViewerHandshake } from "../product-demo/ViewerFrame";
import "./guides.css";

const EXAMPLE_HINT = "此练习仅加载视频生成示例，使用示例继续或退出练习";

export function GuideExperience({ guideId }: { guideId: string }) {
  const guide = guideById.get(guideId);
  const instanceId = `guide-${guideId}`;
  const [session, setSession] = useState<GuideSession | null>(() =>
    guide ? startGuide(guide, { mode: "practice", instanceId }) : null,
  );
  const [status, setStatus] = useState<ViewerHandshake>("booting");
  const [, setAnchors] = useState<readonly AnchorBox[]>([]);
  const sessionRef = useRef<GuideSession | null>(session);
  useLayoutEffect(() => { sessionRef.current = session; }, [session]);
  const [layoutReady, setLayoutReady] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      const current = sessionRef.current;
      if (current) {
        const layout = query.matches ? "mobile" : "desktop";
        if (current.snapshot.layout !== layout) {
          const next: GuideSession = { ...current, snapshot: { ...current.snapshot, layout, generation: current.snapshot.generation + 1 } };
          sessionRef.current = next;
          setSession(next);
        }
      }
      setLayoutReady(true);
    };
    sync(); query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!guide) return;
    const restore = () => {
      const current = sessionRef.current;
      const stepId = new URLSearchParams(window.location.search).get("step");
      if (!current || !stepId || stepId === current.stepId || !guide.steps.some((item) => item.stepId === stepId)) return;
      const fresh = startGuide(guide, { stepId, mode: current.mode, layout: current.snapshot.layout, instanceId: current.instanceId });
      const next = current.snapshot.draftDirty ? { ...fresh, snapshot: { ...fresh.snapshot, draft: current.snapshot.draft, draftDirty: true } } : fresh;
      sessionRef.current = next; setSession(next);
    };
    restore(); window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [guide]);

  const sessionStepId = session?.stepId;
  useEffect(() => {
    const current = sessionRef.current;
    if (!current) return;
    const url = new URL(window.location.href);
    url.searchParams.set("step", current.stepId);
    window.history.replaceState(window.history.state, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
  }, [sessionStepId]);

  const step = guide && session ? guide.steps.find((item) => item.stepId === session.stepId) ?? guide.steps[0]! : null;
  const fixture = useMemo(() => ({ ...serializeFixture(worldForVariant(step?.variant)), missingResourceIds: missingResourceIds(step?.variant) }), [step?.variant]);
  const missing = step ? missingResourceIds(step.variant) : [];

  const publish = useCallback((next: GuideSession) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  const onIntent = useCallback((intent: UserIntent, generation: number) => {
    const current = sessionRef.current;
    if (!current || ((intent.type === "resource_result" || intent.type === "graph_presentation") && generation !== current.snapshot.generation)) return;
    publish(applyGuideIntent(current, intent));
  }, [publish]);

  if (!guide) {
    return (
      <main className="guide-page">
        <p>未找到该教程。</p>
        <Link href="/docs/">返回使用指南</Link>
      </main>
    );
  }
  if (!session || !step) {
    return (
      <main className="guide-page">
        <p>未找到该教程步骤。</p>
        <Link href="/docs/">返回使用指南</Link>
      </main>
    );
  }

  const verdict = evaluatePredicate(session, step.success);
  const complete = isStepComplete(session);
  const stepIndex = guide.steps.findIndex((item) => item.stepId === session.stepId);
  const viewerFailed = status === "error";
  const showExample = isOffPresetDraft(session.snapshot) && !session.exampleAcknowledged;

  const setMode = (mode: GuideMode) => {
    publish({ ...session, mode });
  };

  const playWatchStep = () => {
    publish(applyExpectedStep(session));
  };

  const navigate = (stepId: string) => {
    const url = new URL(window.location.href); url.searchParams.set("step", stepId);
    window.history.pushState(window.history.state, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
    publish(goToStep(session, stepId));
  };
  const goNext = () => {
    const next = guide.steps[stepIndex + 1];
    if (next) navigate(next.stepId);
  };

  const goPrev = () => {
    const prev = guide.steps[stepIndex - 1];
    if (prev) navigate(prev.stepId);
  };

  return (
    <main className="guide-page" id="main">
      <p className="guide-kicker">使用指南 · 示例环境，数据为演示</p>
      <h1>{guide.title}</h1>
      <p className="guide-task"><strong>你要完成什么：</strong>{guide.task}</p>
      <p className="guide-version">{guide.versionNote}</p>
      <p className="guide-preset">{guide.presetLabel}</p>

      <div className="guide-modes" role="group" aria-label="教程模式">
        <button type="button" aria-pressed={session.mode === "watch"} onClick={() => setMode("watch")}>观看演示</button>
        <button type="button" aria-pressed={session.mode === "practice"} onClick={() => setMode("practice")}>我来操作</button>
      </div>
      <p className="guide-mode-note">两种模式使用同一套真实 UI 与同一个 intent 协议，不会换成另一套画皮。</p>

      <section className="guide-step" aria-labelledby="guide-step-title">
        <p className="guide-step-index">当前步骤 {stepIndex + 1} / {guide.steps.length}</p>
        <h2 id="guide-step-title">{step.title}</h2>
        <p><strong>做什么：</strong>{step.instruction}</p>
        <p><strong>为什么：</strong>{step.why}</p>
        <p><strong>预期反馈：</strong>{step.expectedFeedback}</p>
        <p><strong>完成判据：</strong>{verdict.detail}</p>
        {session.message ? <p className="guide-message" role="status">{session.message}</p> : null}
        {showExample ? (
          <div className="guide-example" role="status">
            <p>{EXAMPLE_HINT}</p>
            <button type="button" onClick={() => publish(acknowledgeExample(session))}>使用示例继续</button>
            <p className="guide-preset-ref">预置示例：{GUIDE_PRESET_PROMPT}</p>
          </div>
        ) : null}
        {session.ignored === "unsupported-target" ? (
          <p className="guide-message" role="status">未预录的并列方向已被明确拒绝，没有套用其它方向的预录结果。</p>
        ) : null}
        {complete ? <p className="guide-complete" role="status">这一步已根据实际演示状态完成。</p> : null}
        {missing.length > 0 ? <p className="guide-missing">本变体标记缺失资源：{missing.join("、")}。</p> : null}
      </section>

      <div className="guide-stage" data-guide-stage="">
        {!layoutReady ? <p role="status">正在准备适合当前屏幕的教程…</p> : viewerFailed ? (
          <div className="guide-static-only" role="alert">
            互动 viewer 当前不可用，请使用下面的文字步骤学习。此状态不能算作已完成互动操作。
          </div>
        ) : (
          <div className="guide-frame-wrap">
            <ViewerFrame
              key={`${guideId}:${step.variant ?? "default"}`}
              fixture={fixture}
              snapshot={session.snapshot}
              onIntent={onIntent}
              onReady={(next) => setAnchors(next)}
              onStatus={(next) => setStatus(next)}
            />
          </div>
        )}
      </div>

      <div className="guide-controls" data-guide-controls="">
        {guideId === "troubleshooting" && step.stepId === "interruption" ? <button type="button" onClick={() => publish(recoverInterruptedStep(session))}>恢复中断 checkpoint（保留草稿与引用）</button> : null}
        <button type="button" onClick={() => { setStatus("booting"); publish(resetStep(session)); }}>重置这一步 / 重试连接</button>
        <button type="button" onClick={() => {
          const restarted = startGuide(guide, { mode: session.mode, layout: session.snapshot.layout, instanceId });
          publish({ ...restarted, snapshot: { ...restarted.snapshot, generation: session.snapshot.generation + 1, draft: session.snapshot.draftDirty ? session.snapshot.draft : restarted.snapshot.draft, draftDirty: session.snapshot.draftDirty, contextDirectionIds: session.snapshot.contextDirectionIds } });
        }}>重新开始教程（保留草稿与引用）</button>
        <button type="button" onClick={goPrev} disabled={stepIndex === 0}>返回上一状态</button>
        {session.mode === "watch" ? (
          <button type="button" onClick={playWatchStep}>重看 / 播放本步</button>
        ) : null}
        <button type="button" onClick={goNext} disabled={!complete || stepIndex >= guide.steps.length - 1}>下一步</button>
      </div>

      <section className="guide-static" aria-labelledby="guide-static-title">
        <h2 id="guide-static-title">不播放也能学会</h2>
        <ol>
          {guide.staticSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <p>键盘：Tab 离开演示区不会被锁住；步骤按钮在演示框之外。教学高亮不会拦截点击。</p>
      </section>

      <p className="guide-next">
        {guide.nextGuideId && complete && stepIndex === guide.steps.length - 1 ? (
          <Link href={guideById.get(guide.nextGuideId)?.path ?? "/docs/"}>继续：{guideById.get(guide.nextGuideId)?.title}</Link>
        ) : null}
        {" "}
        <Link href="/product/">继续使用产品说明页上的运行演示</Link>
        {" · "}
        <Link href="/docs/">全部指南</Link>
        {guideId === "troubleshooting" ? (
          <>
            {" · "}
            <Link href="/">概念故事中的覆盖修订（仍待确认）</Link>
          </>
        ) : null}
      </p>
    </main>
  );
}
