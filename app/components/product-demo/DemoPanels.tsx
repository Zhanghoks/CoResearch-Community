import type { CSSProperties } from "react";
import {
  authorNames, checklistLabels, conversation, detailCopy, mechPremises, paperRef,
  phases, processingAfter, reviewAfter, mentionBefore, sampleScenario, shellCopy,
  sidebarCopy, streamFullCopy, topbarCopy, treeEdges, treeNodeById, treeNodes,
} from "../../product-demo/scenario";
import type { DetailField, StreamId } from "../../product-demo/scenario";
import "./product-demo.css";

/** 树节点的胶囊宽度按文案长度估算，保证文字不换行。 */
const nodeWidth = (label: string) => label.length * 11 + 22;
/** 左向右生长的连线路径：水平偏置的三次贝塞尔。 */
const edgePath = (from: { x: number; y: number }, to: { x: number; y: number }) =>
  `M ${from.x} ${from.y} C ${from.x + 48} ${from.y}, ${to.x - 48} ${to.y}, ${to.x} ${to.y}`;

/** 带标签的流式详情字段（既是 DetailField 也是 StreamId）。 */
const labeledStreamFields = ["question", "work", "evidence"] as const satisfies readonly (DetailField & StreamId)[];
const detailLabels: Record<(typeof labeledStreamFields)[number], string> = {
  question: "开放式问题",
  work: "代表性工作",
  evidence: "已有证据",
};

/**
 * Static mock shell of the CoResearch product UI — a dark three-column replica of the
 * real app (nav + session tree / conversation + composer / 研究图谱 + direction detail).
 * Every animation-frame mutation is owned by the stage applicator through data-pd-*
 * attributes; React renders once, never reconciles. With `settled`, the same shell
 * renders the final phase as a static frame (homepage entry card) without JS.
 */
export function DemoWindow({ settled = false }: { settled?: boolean } = {}) {
  // settled: render the final phase's state as static markup (single source: scenario).
  const final = settled ? sampleScenario(phases.length - 1) : null;
  const on = (visible: boolean | undefined) => (visible ? " pd-on" : "");
  // 流式元素的静态内容与状态一致（settled 即终态值；运行时由应用器按帧接管）。
  const streamText = (id: StreamId) => (final ? (final.streams[id] ?? streamFullCopy[id]) : "");
  const renderMessage = (message: (typeof conversation)[number], index: number) => (
    <div
      key={index}
      data-pd-msg=""
      style={{ "--i": String(index) } as CSSProperties}
      className={`pd-msg max-w-[88%] gap-1 ${message.role === "user" ? "self-end items-end" : "items-start"}${on(Boolean(final))}`}
    >
      <span className="px-1 text-[10px] tracking-wide text-(--pd-text3)">{authorNames[message.role]}</span>
      <p className={`rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${message.role === "user" ? "pd-bubble-user" : "pd-bubble-agent"}`}>
        {message.text}
      </p>
    </div>
  );
  const streamField = (field: DetailField & StreamId) => (
    <p className="mt-1 text-[12px] leading-5 text-[#c9c9c4]">
      <span data-pd-stream={field}>{streamText(field)}</span>
    </p>
  );

  return (
    <div
      data-pd-stage=""
      data-pd-settled={settled ? "" : undefined}
      className="pd-window overflow-hidden rounded-[22px] bg-[#171718] shadow-[0_30px_80px_rgba(20,20,18,0.35)] ring-1 ring-black/40"
    >
      {/* 窗框 */}
      <div className="flex h-10 items-center gap-2 border-b border-white/8 bg-(--pd-side) px-4" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <p className="ml-3 text-[11px] text-(--pd-text3)">{topbarCopy.breadcrumb}</p>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-(--pd-text3)">
          <span className="rounded-full border border-white/10 px-2 py-0.5">{topbarCopy.likesLabel} {topbarCopy.likes}</span>
          <span className="hidden rounded-full border border-white/10 px-2 py-0.5 sm:inline">{topbarCopy.modelShort}</span>
        </div>
      </div>

      <div className="pd-shell">
        {/* 左侧导航（<1024px 隐藏） */}
        <aside className="pd-nav flex-col border-r border-white/8 bg-(--pd-side)" aria-hidden="true">
          <div className="flex items-center gap-2 px-3.5 pt-3.5 text-[13px] font-semibold">
            <span className="grid size-5 place-items-center rounded-md bg-(--pd-blue) text-[11px] text-white">C</span>
            CoResearch
          </div>
          <nav className="mt-3 flex flex-col gap-0.5 px-2 text-[12px] text-[#b3b3ae]">
            {sidebarCopy.nav.map((item, index) => (
              <span key={item} className={`px-2.5 py-1.5 ${index === 0 ? "rounded-lg bg-white/10 text-white" : ""}`}>{item}</span>
            ))}
          </nav>
          <span className="mx-2 mt-3 rounded-lg bg-white/10 px-2.5 py-1.5 text-center text-[12px] text-white">{sidebarCopy.newSession}</span>
          <p className="mt-4 px-3.5 text-[10px] font-semibold tracking-[0.14em] text-(--pd-text3)">{sidebarCopy.projectsLabel}</p>
          <div className="mx-2 mt-1.5 rounded-xl border border-white/10 bg-(--pd-raise2) p-2.5 text-[11px]">
            <p className="flex items-center gap-1.5 font-medium text-[#e0e0dc]">
              <span className="size-1.5 rounded-sm bg-(--pd-blue)" aria-hidden="true" />
              {sidebarCopy.project}
            </p>
            <p className="mt-1 pl-3 text-[10px] text-(--pd-text3)">{sidebarCopy.projectMeta}</p>
            <div className="mt-2 flex flex-col gap-1 pl-1">
              <div data-pd-session="" className={`pd-session flex items-center gap-1.5 rounded-lg border border-(--pd-blue)/45 bg-[#25304a] px-2 py-1.5 text-[#bcd2f5]${on(final?.session)}`}>
                <span className="size-1.5 shrink-0 rounded-full bg-(--pd-blue)" aria-hidden="true" />
                <span className="truncate">{sidebarCopy.session}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-(--pd-text3)">
                <span className="size-1.5 shrink-0 rounded-full bg-white/20" aria-hidden="true" />
                <span className="truncate">{sidebarCopy.olderSession}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-(--pd-text3)">
                <span className="size-1.5 shrink-0 rounded-sm border border-white/30" aria-hidden="true" />
                <span className="truncate">{sidebarCopy.canvas}</span>
                <span data-pd-canvas-count="" className="ml-auto rounded-full bg-white/10 px-1.5 text-[10px] tabular-nums text-[#b3b3ae]">{final ? final.canvasCount : 0}</span>
              </div>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2 border-t border-white/8 px-3.5 py-3 text-[12px]">
            <span className="grid size-6 place-items-center rounded-full bg-[#3a3a40] text-[10px] text-white">{sidebarCopy.user.slice(0, 1).toUpperCase()}</span>
            <span className="text-[#d0d0cc]">{sidebarCopy.user}</span>
          </div>
        </aside>

        {/* 中间：会话流 + 输入框 */}
        <section className="flex min-w-0 flex-col bg-[#141415]">
          <div className="pd-chat flex flex-1 flex-col justify-end gap-3 overflow-hidden px-5 py-4">
            {conversation.slice(0, mentionBefore).map(renderMessage)}
            <div
              data-pd-mention=""
              style={{ "--i": String(mentionBefore) } as CSSProperties}
              className={`pd-field rounded-2xl border border-white/10 bg-(--pd-raise) p-3${on(final ? (final.messages > mentionBefore) : false)}`}
            >
              <p className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded-full bg-(--pd-blue)/15 px-2 py-0.5 font-medium text-[#9dbbef]">{shellCopy.mentionChip}</span>
              </p>
              <p className="mt-1.5 text-[12px] leading-5 text-[#c9c9c4]">{shellCopy.mentionBody}</p>
            </div>
            {conversation.slice(mentionBefore, processingAfter).map((message, offset) => renderMessage(message, offset + mentionBefore))}
            <div
              data-pd-processing=""
              style={{ "--i": String(processingAfter) } as CSSProperties}
              className={`pd-processing items-center gap-2 px-1 text-[11px] text-(--pd-text3)${on(final ? (final.timer > 0 || final.session) : false)}`}
            >
              <svg viewBox="0 0 16 16" className="pd-spin size-3.5" aria-hidden="true">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
                <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {shellCopy.processingPrefix} <span data-pd-timer="">{final ? final.timer : 0}</span>s
              <span data-pd-processing-meta="" className="text-(--pd-text3)">{final?.processingMeta ?? shellCopy.processingMeta}</span>
            </div>
            {conversation.slice(processingAfter, reviewAfter).map((message, offset) => renderMessage(message, offset + processingAfter))}
            <div
              data-pd-review=""
              style={{ "--i": String(reviewAfter) } as CSSProperties}
              className={`pd-review rounded-2xl border border-white/10 bg-[#1c1c1f] p-3.5${on(final ? final.checklist.some((check) => check !== "pending") : false)}`}
            >
              <p className="text-[10px] font-semibold tracking-[0.12em] text-(--pd-text3)">{shellCopy.reviewTitle}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {checklistLabels.map((label, index) => (
                  <li key={label} data-pd-check={String(index)} data-state={final ? final.checklist[index] : "pending"} className="pd-check flex items-center gap-2 text-[11.5px] leading-snug text-[#a3a39e]">
                    <span className="pd-check-mark size-3 shrink-0 rounded-full border-[1.5px] border-[#4a4a46]" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            {conversation.slice(reviewAfter).map((message, offset) => renderMessage(message, offset + reviewAfter))}
          </div>
          <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-(--pd-raise) px-3.5 pb-2.5 pt-3">
            <p className="min-h-[20px] text-[13px] leading-5">
              <span data-pd-stream="composer" className="pd-typed">{streamText("composer")}</span>
              <span className="pd-caret" aria-hidden="true" />
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-(--pd-text3)" aria-hidden="true">
              <span className="rounded-full border border-white/10 px-2 py-0.5">{shellCopy.modelChip}</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5">{shellCopy.autoChip}</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5">{shellCopy.tasksChip}</span>
              <span className="ml-auto whitespace-nowrap tabular-nums">{shellCopy.contextPrefix} <span data-pd-context="">{final ? final.context : 6}</span>%</span>
              <span className="grid size-6 place-items-center rounded-full bg-(--pd-blue) text-white">↑</span>
            </div>
          </div>
        </section>

        {/* 右侧：对话研究图谱 + 方向详情 */}
        <aside className="pd-graph min-w-0 flex-col border-l border-white/8 bg-(--pd-panel)">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/8 px-3.5" aria-hidden="true">
            <p className="text-[12px] font-semibold">{shellCopy.graphTitle}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-(--pd-text3)">
              {shellCopy.graphChips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 px-2 py-0.5">{chip}</span>
              ))}
            </div>
          </div>
          <div className="pd-canvas-box relative h-[340px] shrink-0 px-2">
            <svg className="pd-tree h-full w-full" viewBox="0 0 420 420" role="img" aria-label="对话研究图谱：从视频生成到候选方法的方向树">
              {treeEdges.map((edge) => {
                const from = treeNodeById.get(edge.from);
                const to = treeNodeById.get(edge.to);
                if (!from || !to) return null;
                return <path key={edge.id} data-pd-tree={edge.id} className={`pd-edge${on(final ? final.tree.includes(edge.id) : false)}`} d={edgePath(from, to)} />;
              })}
              <line data-pd-tree="boundary" className={`pd-boundary${on(final ? final.tree.includes("boundary") : false)}`} x1="356" y1="236" x2="356" y2="400" />
              <text data-pd-tree="boundary" className={`pd-boundary-label${on(final ? final.tree.includes("boundary") : false)}`} x="356" y="224" textAnchor="middle">研究边界</text>
              {treeNodes.map((node) => {
                const width = nodeWidth(node.label);
                return (
                  <g key={node.id} data-pd-tree={node.id} className={`pd-node pd-node-${node.kind}${on(final ? final.tree.includes(node.id) : false)}`}>
                    <rect x={node.x - width / 2} y={node.y - 14} width={width} height={28} rx={14} />
                    <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central">{node.label}</text>
                  </g>
                );
              })}
              <g
                data-pd-current=""
                className={`pd-current-badge${on(Boolean(final?.current))}`}
                transform={final?.current ? `translate(${treeNodeById.get(final.current)?.x ?? 0} ${treeNodeById.get(final.current)?.y ?? 0})` : undefined}
              >
                <rect x="-18" y="-34" width="36" height="16" rx="8" />
                <text x="0" y="-26" textAnchor="middle" dominantBaseline="central">当前</text>
              </g>
              <g
                data-pd-focus=""
                transform={`translate(${treeNodeById.get(final?.focus ?? "d-video")?.x ?? 0} ${treeNodeById.get(final?.focus ?? "d-video")?.y ?? 0})`}
              >
                <circle className="pd-focus-ring" r="22" />
                <circle className="pd-focus-core" r="4" />
              </g>
            </svg>
          </div>
          <div className="pd-detail flex flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 py-3">
            <div data-pd-detail="title" className={`pd-field${on(final?.detail.title)}`}>
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-semibold leading-tight">{detailCopy.title}</h4>
                <span className="rounded-full bg-(--pd-blue) px-1.5 py-0.5 text-[10px] font-semibold text-white">当前</span>
              </div>
            </div>
            <div data-pd-detail="intro" className={`pd-field${on(final?.detail.intro)}`}>
              {streamField("intro")}
            </div>
            {labeledStreamFields.map((field) => (
              <div key={field} data-pd-detail={field} className={`pd-field${on(final?.detail[field])}`}>
                <p className="text-[10px] font-semibold tracking-[0.08em] text-(--pd-text3)">{detailLabels[field]}</p>
                {streamField(field)}
              </div>
            ))}
            <div data-pd-detail="todo" className={`pd-todo rounded-xl border border-dashed border-(--pd-gold)/40 bg-[#292619] p-2.5${on(final?.detail.todo)}`}>
              <p className="text-[10px] font-semibold tracking-[0.08em] text-(--pd-gold)">尚待确认 · 待核实</p>
              <p className="mt-1 text-[12px] leading-5 text-[#dccca0]">{detailCopy.todo}</p>
            </div>
            <div data-pd-detail="mech" className={`pd-mech rounded-xl border border-(--pd-green)/40 bg-[#20261f] p-2.5${on(final?.detail.mech)}`}>
              <p className="text-[10px] font-semibold tracking-[0.08em] text-(--pd-green)">跨领域机制 · 候选</p>
              <p className="mt-1 text-[12px] leading-5 text-[#b6cdbd]">{detailCopy.mech}</p>
              <ul className="mt-1.5 flex flex-col gap-1 border-t border-(--pd-green)/20 pt-1.5 text-[10.5px] leading-snug">
                {mechPremises.map((premise) => (
                  <li key={premise.label} className="flex items-center gap-1.5 text-[#a9c0b1]">
                    <span className={`size-1.5 shrink-0 rounded-full ${premise.state === "pass" ? "bg-(--pd-green)" : "bg-(--pd-gold)"}`} aria-hidden="true" />
                    {premise.label}
                    <span className={premise.state === "pass" ? "text-(--pd-green)" : "text-(--pd-gold)"}>{premise.state === "pass" ? "✓" : "待验证"}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div data-pd-paper="" className={`pd-paper rounded-xl border border-white/10 bg-(--pd-raise) p-2.5${on(final?.paper)}`}>
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-[12px] font-semibold leading-snug text-[#e3e3df]">{paperRef.title}</h5>
                <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-[#b3b3ae]">打开</span>
              </div>
              <p className="mt-1 text-[10.5px] text-(--pd-text3)">{paperRef.meta}</p>
              <div className="mt-1.5 flex gap-1.5">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9.5px] text-[#c9c9c4]">{paperRef.tag}</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9.5px] text-[#c9c9c4]">Abstract</span>
              </div>
            </div>
            <div data-pd-candidate="" className={`pd-candidate-chip rounded-full border border-dashed border-(--pd-gold)/50 bg-[#3a3220] px-3 py-1.5${on(final?.candidate)}`}>
              <p className="text-[10.5px] font-semibold text-[#ecd9a0]">下一步比较 · 待研究者确认</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
