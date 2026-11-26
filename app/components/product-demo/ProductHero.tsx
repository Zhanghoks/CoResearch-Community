"use client";

import Image from "next/image";
import { githubUrl } from "../../content";
import { useEffect, useRef, useState } from "react";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const PLAYBACK_LABEL = {
  idle: "播放演示",
  playing: "暂停演示",
  paused: "继续演示",
  done: "重播演示",
} as const;
type State = keyof typeof PLAYBACK_LABEL;

export function ProductHero() {
  const iframe = useRef<HTMLIFrameElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>("idle");

  function send(command: string) {
    iframe.current?.contentWindow?.postMessage({ type: "co-demo-control", command }, "*");
  }

  useEffect(() => {
    function receive(event: MessageEvent) {
      // Match the sandboxed frame identity; its origin is intentionally opaque.
      if (event.source !== iframe.current?.contentWindow || event.data?.type !== "co-product-motion") return;
      const { state } = event.data;
      if (typeof state !== "string" || !Object.hasOwn(PLAYBACK_LABEL, state)) return;
      setReady(true);
      setState(state as State);
    }
    window.addEventListener("message", receive);
    send("ping");
    return () => window.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (!ready || !shell.current || started.current) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.25 || started.current || motion.matches) return;
      started.current = true;
      send("start");
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(shell.current);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <section id="product-demo" aria-labelledby="product-title" className="scroll-mt-28 mx-auto max-w-[1600px] px-3 pb-6 pt-3 sm:px-7 sm:pt-6 lg:px-10">
      <div className="relative isolate overflow-hidden rounded-[22px] bg-[#e9eadc] px-3 py-6 sm:rounded-[26px] sm:px-7 sm:py-9 lg:px-14 lg:py-12">
        <Image priority src={`${base}/hero-wanderer.jpg?v=576`} alt="" fill sizes="100vw" className="-z-10 object-cover object-[center_26%]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-[#f8f6e8]/65 to-transparent sm:h-72" />
        <header data-product-intro className="mx-auto mb-6 max-w-2xl px-2 text-center text-[#282b22] sm:mb-8">
          <h1 id="product-title" className="text-[clamp(2.45rem,5vw,4.8rem)] font-semibold leading-none tracking-[-0.065em] [overflow-wrap:anywhere]">CoResearch</h1>
          <p className="mt-3 text-sm font-medium leading-snug text-balance sm:text-base">
            和 Agent 一起，把一个问题展开成研究方向。
          </p>
          <a
            href={githubUrl}
            className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-[#282b22]/20 bg-white/80 px-3.5 text-sm font-medium text-[#282b22] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#282b22]"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            GitHub
          </a>
        </header>
        <div ref={shell} data-macos-window className="mx-auto max-w-[1190px] overflow-hidden rounded-[12px] border border-[#262833]/15 bg-white shadow-[0_16px_54px_-14px_#1c221fb3] sm:rounded-[14px]">
          <div data-macos-titlebar className="relative flex h-9 items-center justify-between border-b border-[#dadbe1] bg-[#f1f1f4] px-3.5">
            <div aria-hidden="true" className="flex items-center gap-[6px]">
              <span className="size-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/8" />
              <span className="size-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/8" />
              <span className="size-2.5 rounded-full bg-[#28c840] ring-1 ring-black/8" />
            </div>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-16 text-center text-xs font-medium text-[#4c4d55]">CoResearch</span>
            <button type="button" disabled={!ready} aria-label={PLAYBACK_LABEL[state]} title={PLAYBACK_LABEL[state]} onClick={() => {
              started.current = true;
              send(state === "playing" ? "pause" : state === "done" ? "restart" : "start");
            }} className="grid size-7 shrink-0 place-items-center rounded-md text-[#555660] hover:bg-black/6 focus-visible:outline-2 disabled:opacity-40">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {state === "playing" ? <path d="M7 5v10m6-10v10" /> :
                  state === "done" ? <path d="M5 7a5.7 5.7 0 1 1-.3 5.7M5 4v3.5h3.5" /> :
                    <path d="m7 4 8 6-8 6z" />}
              </svg>
            </button>
          </div>
          <iframe
            ref={iframe}
            onLoad={() => send("ping")}
            src={`${base}/demos/coresearch-explore.html?mode=showcase`}
            title="CoResearch 工作台模拟运行，使用示例数据"
            sandbox="allow-scripts"
            tabIndex={-1}
            inert
            className="pointer-events-none block h-[440px] w-full border-0 sm:h-[425px] lg:h-auto lg:aspect-[3420/1999]"
          />
        </div>
      </div>
    </section>
  );
}
