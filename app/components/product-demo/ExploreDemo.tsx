"use client";

import { useEffect, useRef, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const demoPath = `${basePath}/demos/coresearch-explore.html`;
type Playback = "idle" | "playing" | "paused";

export function ExploreDemo() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [playback, setPlayback] = useState<Playback>("idle");

  useEffect(() => {
    function sync(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.data?.type !== "co-demo-status") return;
      if (["idle", "playing", "paused"].includes(event.data.state)) {
        setReady(true);
        setPlayback(event.data.state);
      }
    }
    window.addEventListener("message", sync);
    frame.current?.contentWindow?.postMessage({ type: "co-demo-control", command: "ping" }, "*");
    return () => window.removeEventListener("message", sync);
  }, []);

  function control(command: "start" | "pause" | "restart" | "ping") {
    frame.current?.contentWindow?.postMessage({ type: "co-demo-control", command }, "*");
  }

  return (
    <section id="product-demo" aria-labelledby="explore-demo-title" className="mx-auto max-w-[1480px] scroll-mt-16 px-4 pb-20 pt-12 md:px-8 md:pt-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-[#5c685b]">PRODUCT DEMO · EXPLORE</p>
          <h2 id="explore-demo-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">从研究对话进入方向探索</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#545952]">在 Agent 中提出问题，打开知识盘，选中方向并继续细分。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button id="demo-play" type="button" disabled={!ready} onClick={() => control(playback === "playing" ? "pause" : "start")} className="rounded-full bg-[#222223] px-4 py-2 text-sm font-medium text-white hover:bg-[#3b3b3c] disabled:opacity-50">
            {playback === "playing" ? "暂停演示" : playback === "paused" ? "继续演示" : "播放演示"}
          </button>
          {playback !== "idle" && <button type="button" onClick={() => control("restart")} className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium">重新播放</button>}
          <a href={demoPath} target="_blank" rel="noopener noreferrer" className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium hover:bg-[#eef1eb]">单独打开 ↗</a>
        </div>
      </div>
      <div className="overflow-hidden rounded-[16px] border border-black/10 bg-[#19191a] shadow-[0_16px_44px_rgba(25,30,29,0.13)]">
        <iframe ref={frame} onLoad={() => control("ping")} title="CoResearch 三栏研究工作台交互演示" src={demoPath} loading="lazy" sandbox="allow-scripts" className="block h-[550px] w-full border-0 sm:h-[600px] lg:h-auto lg:aspect-[3420/1999]" />
      </div>
      <p className="mt-3 text-xs leading-5 text-[#646962]">演示复刻 CoResearch 研究工作台。使用示例数据，不连接真实 Agent。</p>
    </section>
  );
}
