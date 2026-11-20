"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  INTEREST_PROMPT,
  createDemoPlayer,
  demoScenes,
  demoTimeline,
  directionById,
  groupById,
  stateAt,
  videoIdentityWorld,
} from "../../demo";

function statusOf(t: number) {
  const state = stateAt(videoIdentityWorld, demoTimeline, t);
  if (state.visibleGroupIds.includes("G1")) return "g1";
  if (state.sentTasks.some((task) => task.id === "task-g1")) return "sent";
  if (state.preparedTask) return "prepared";
  return "draft";
}

/**
 * Minimal #37 verification slice: prepare Explore → send → G1, then replay.
 * Uses the shared fixture and player, not a second story, and not the real product UI.
 */
export function ExploreProof() {
  const preset = INTEREST_PROMPT;
  const [draft, setDraft] = useState(preset);
  const [usePreset, setUsePreset] = useState(true);
  const [time, setTime] = useState(0);
  const [message, setMessage] = useState("先使用预置主题。自由输入会被保留，但不会被当成一次真实研究回答。");
  const playerRef = useRef<ReturnType<typeof createDemoPlayer> | null>(null);
  const timerRef = useRef<number | null>(null);
  const generationRef = useRef(0);
  const preparedRef = useRef<{ draft: string; usePreset: boolean } | null>(null);
  const cancelPending = useCallback(() => {
    generationRef.current++;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  useEffect(() => {
    const player = createDemoPlayer({
      world: videoIdentityWorld,
      timeline: demoTimeline,
      scenes: demoScenes,
      onTime: (t) => {
        setTime(t);
      },
    });
    playerRef.current = player;
    player.seek(0);
    return () => {
      cancelPending();
      preparedRef.current = null;
      playerRef.current = null;
      player.dispose();
    };
  }, [cancelPending]);

  const state = stateAt(videoIdentityWorld, demoTimeline, time);
  const g1 = state.visibleGroupIds.includes("G1") ? groupById.get("G1") : null;
  const matchesPreset = draft.trim() === preset;

  const prepare = () => {
    if (!usePreset && !matchesPreset) {
      setMessage("本切片只回放预置主题的固定结果。可保留你的草稿，或点击「使用示例继续」。");
      return;
    }
    cancelPending();
    preparedRef.current = { draft, usePreset };
    playerRef.current?.seek(3600);
    setMessage("Explore 任务已准备。核对 Task 后发送，才会开始。等待已按演示节奏压缩。");
  };

  const send = () => {
    const player = playerRef.current;
    const prepared = preparedRef.current;
    if (!player || !prepared || prepared.draft !== draft || prepared.usePreset !== usePreset || (!matchesPreset && !usePreset) || statusOf(player.getTime()) !== "prepared") {
      setMessage("请先核对当前草稿或明确选择固定示例，再准备 Explore 任务并发送。");
      return;
    }
    cancelPending();
    const generation = generationRef.current;
    player.seek(4200);
    setMessage("已发送固定示例。正在等待 G1（演示节奏 / 等待已压缩）。");
    timerRef.current = window.setTimeout(() => {
      if (generation !== generationRef.current || playerRef.current !== player) return;
      timerRef.current = null;
      player.seek(7600);
      setMessage("G1 已到。这是根方向组，没有父方向。可重新观看这一回合。");
    }, 40);
  };

  const replay = () => {
    cancelPending();
    preparedRef.current = null;
    playerRef.current?.restartScene("intent");
    setMessage("已回到起点。准备任务并再次发送，会得到同一组 G1，不会重复创建实体。");
  };

  return (
    <section id="explore-proof" className="mx-auto max-w-6xl px-5 pb-20" aria-label="Explore 最小回放验证">
      <p className="inline-flex items-center gap-2 text-sm font-medium">
        <span className="rounded-full bg-[#a9ff63] px-2 py-0.5 text-xs font-semibold">#37 验证切片</span>
        离线 · 合成数据 · 无真实研究请求
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight">第一次 Explore：准备、发送、收到 G1</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#3f413c]">
        这一段用来验证共享 fixture 与确定性回放：输入预置兴趣，准备 Explore 任务，发送后出现 G1。固定结果不会被包装成对任意输入的研究回答。
      </p>

      <div className="mt-8 grid gap-6 rounded-[24px] bg-white p-6 ring-1 ring-black/8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <label className="block text-sm font-medium text-[#3f413c]" htmlFor="explore-draft">
            兴趣（草稿会保留）
          </label>
          <textarea
            id="explore-draft"
            value={draft}
            onChange={(event) => {
              cancelPending();
              preparedRef.current = null;
              playerRef.current?.seek(0);
              setDraft(event.target.value);
              setUsePreset(event.target.value.trim() === preset);
            }}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm leading-6 text-[#262626]"
          />
          {!matchesPreset && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <p className="text-[#6b6d66]">{usePreset ? `草稿保留；将回放固定示例「${preset}」，不会发送当前草稿。` : "当前草稿与预置主题不同，不会触发固定回放。"}</p>
              <button
                type="button"
                className="rounded-full bg-[#262626] px-3 py-1.5 text-white"
                onClick={() => {
                  cancelPending();
                  preparedRef.current = null;
                  playerRef.current?.seek(0);
                  setUsePreset(true);
                  setMessage("已明确选择固定示例；你的草稿仍保留且不会发送。请重新准备任务。");
                }}
              >
                使用示例继续
              </button>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="rounded-full border border-black/10 px-4 py-2 text-sm" onClick={prepare}>
              准备 Explore 任务
            </button>
            <button type="button" className="rounded-full bg-[#262626] px-4 py-2 text-sm text-white" onClick={send}>
              发送
            </button>
            <button type="button" className="rounded-full border border-black/10 px-4 py-2 text-sm" onClick={replay}>
              重新观看
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#3f413c]" data-explore-proof-message="">
            {message}
          </p>
        </div>
        <div className="rounded-2xl bg-[#f6f4ec] p-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#6d7a3a]">TASK</p>
          <p className="mt-2 text-sm" data-explore-proof-task="">
            {state.preparedTask
              ? `Explore · ${state.preparedTask.prompt}`
              : state.sentTasks[0]
                ? `已发送 · ${state.sentTasks[0].prompt}`
                : "尚未准备任务"}
          </p>
          {state.activeTaskProgress && (
            <p className="mt-2 text-xs text-[#6b6d66]">{state.activeTaskProgress}</p>
          )}
          <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-[#6d7a3a]">G1</p>
          <ul className="mt-2 grid gap-2" data-explore-proof-g1="">
            {g1
              ? g1.directionIds.map((id) => (
                  <li key={id} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-black/8">
                    <span className="font-medium">{directionById.get(id)?.name}</span>
                    <span className="ml-2 text-xs text-[#8a8c84]">{id}</span>
                  </li>
                ))
              : <li className="text-sm text-[#8a8c84]">发送后才会出现方向组。</li>}
          </ul>
          {g1 && (
            <p className="mt-3 text-xs text-[#6b6d66]">parent: 无 · group revision {g1.revisionId}</p>
          )}
        </div>
      </div>
    </section>
  );
}
