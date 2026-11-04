import type { CSSProperties } from "react";
import { agentProfiles, checklistLabels, conversation, evidenceCards, treeEdges, treeNodes } from "../../product-demo/scenario";
import type { AgentId } from "../../product-demo/scenario";

/** 树节点的胶囊宽度按文案长度估算，保证文字不换行。 */
const nodeWidth = (label: string) => label.length * 11 + 22;
/** 左向右生长的连线路径：水平偏置的三次贝塞尔。 */
const edgePath = (from: { x: number; y: number }, to: { x: number; y: number }) =>
  `M ${from.x} ${from.y} C ${from.x + 48} ${from.y}, ${to.x - 48} ${to.y}, ${to.x} ${to.y}`;
const nodeById = new Map(treeNodes.map((node) => [node.id, node]));

/**
 * Static mock panels of the CoResearch product UI, styled with the site's own
 * component vocabulary (Tailwind utilities, white cards, olive accents).
 * Layout: agent strip on top, conversation on the left, the deepening direction
 * tree canvas on the right. Every animation-frame mutation is owned by the stage
 * applicator through the data-pd-* attributes; React renders once, never reconciles.
 */
export function DemoWindow() {
  return (
    <div data-pd-stage="" className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(38,38,38,0.08)]">
      <div className="flex h-11 items-center gap-1.5 border-b border-black/5 bg-[#f7f8f4] px-5" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-[#dcded2]" />
        <span className="size-2.5 rounded-full bg-[#dcded2]" />
        <span className="size-2.5 rounded-full bg-[#dcded2]" />
        <p className="ml-3 text-xs tracking-wide text-[#8a8c84]">CoResearch · 研究会话 · mock</p>
      </div>
      <div className="grid grid-cols-2 gap-2 border-b border-black/5 bg-[#fafbf7] p-3 md:grid-cols-4" aria-label="Agent 状态">
        {(Object.keys(agentProfiles) as AgentId[]).map((id) => (
          <div key={id} data-pd-agent={id} data-activity="idle" className="pd-agent flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 transition">
            <span className="pd-agent-dot size-2 shrink-0 rounded-full bg-[#c9ccc0]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-[#262626]">{agentProfiles[id].name}</p>
              <p className="pd-agent-action truncate text-[10px] leading-tight text-[#6b6d66]" data-pd-agent-action="">待命</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_1.3fr]">
        <div className="flex min-h-[340px] flex-col border-b border-black/5 lg:border-b-0 lg:border-r">
          <div className="flex flex-1 flex-col justify-end gap-3.5 p-6">
            {conversation.map((message, index) => (
              <div
                key={index}
                data-pd-msg=""
                style={{ "--i": String(index) } as CSSProperties}
                className={`pd-msg max-w-[86%] flex-col gap-1.5 ${message.role === "user" ? "self-end items-end" : ""}`}
              >
                <span className="text-[10px] tracking-wide text-[#8a8c84]">{message.role === "user" ? "研究者" : "Research Lead"}</span>
                <p className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-[#262626] text-white" : "border border-black/5 bg-[#f4f6ee] text-[#3f413c]"}`}>
                  {message.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-[#fafbf7] px-4 py-3 text-sm text-[#8a8c84]" aria-hidden="true">
            <span>输入研究兴趣…</span>
            <span className="whitespace-nowrap text-xs text-[#b0b2a8]">演示界面 · 不可输入</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="px-5 pt-4 text-[10px] font-semibold tracking-[0.12em] text-[#8a8c84]">研究方向 · 随对话深化</p>
          <div className="min-h-[280px] flex-1 p-2">
            <svg className="pd-tree h-full w-full" viewBox="0 0 760 440" role="img" aria-label="研究方向树：从视频生成到候选方法">
              {treeEdges.map((edge) => {
                const from = nodeById.get(edge.from), to = nodeById.get(edge.to);
                if (!from || !to) return null;
                return <path key={edge.id} data-pd-tree={edge.id} className="pd-edge" d={edgePath(from, to)} />;
              })}
              <line data-pd-tree="boundary" className="pd-boundary" x1="676" y1="66" x2="676" y2="414" />
              <text data-pd-tree="boundary" className="pd-boundary-label" x="676" y="54" textAnchor="middle">研究边界</text>
              {treeNodes.map((node) => {
                const width = nodeWidth(node.label);
                return (
                  <g key={node.id} data-pd-tree={node.id} className={`pd-node pd-node-${node.kind}`}>
                    <rect x={node.x - width / 2} y={node.y - 15} width={width} height={30} rx={15} />
                    <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central">{node.label}</text>
                  </g>
                );
              })}
              <g data-pd-focus="" className="pd-focus">
                <circle className="pd-focus-ring" r="24" />
                <circle className="pd-focus-core" r="4.5" />
              </g>
            </svg>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/5 bg-[#f4f6ee] px-5 py-3 text-xs text-[#6b6d66]">
            <span className="flex items-baseline gap-1.5">已知 <strong data-pd-idea-known="" className="text-sm font-semibold tabular-nums text-[#262626]">0</strong></span>
            <span className="flex items-baseline gap-1.5">未知 <strong data-pd-idea-unknown="" className="text-sm font-semibold tabular-nums text-[#262626]">1</strong></span>
            <span className="flex min-w-0 items-baseline gap-1.5">Intent <strong data-pd-idea-intent="" className="truncate text-[11px] font-semibold text-[#262626]">—</strong></span>
            <div data-pd-card="candidate" className="pd-candidate ml-auto rounded-full border border-dashed border-[#d9b96a] bg-[#fdf8ec] px-3 py-1.5">
              <p className="text-[10px] font-semibold text-[#a4803c]">候选方法 · 待确认</p>
            </div>
          </div>
        </div>
      </div>
      <div className="pd-cards grid grid-cols-2 gap-2.5 border-t border-black/5 bg-[#fafbf7] p-4 md:grid-cols-3 lg:grid-cols-6">
        {evidenceCards.map((card, index) => (
          <article key={card.title} data-pd-evidence="" style={{ "--i": String(index) } as CSSProperties} className="flex-col gap-1.5 rounded-2xl border border-black/5 bg-white p-3.5">
            <p className="text-[9px] font-semibold tracking-[0.1em] text-[#8a8c84]">文献证据</p>
            <h4 className="text-[13px] font-semibold leading-snug text-[#262626]">{card.title}</h4>
            <dl className="flex flex-col gap-0.5">
              <div className="flex gap-2 text-[11px] leading-snug"><dt className="shrink-0 text-[#8a8c84]">问题</dt><dd className="text-[#3f413c]">{card.problem}</dd></div>
              <div className="flex gap-2 text-[11px] leading-snug"><dt className="shrink-0 text-[#8a8c84]">方法</dt><dd className="text-[#3f413c]">{card.method}</dd></div>
              <div className="flex gap-2 text-[11px] leading-snug"><dt className="shrink-0 text-[#8a8c84]">局限</dt><dd className="text-[#3f413c]">{card.limitation}</dd></div>
            </dl>
          </article>
        ))}
        <article data-pd-card="gap" className="flex-col gap-1.5 rounded-2xl border border-[#d9b96a]/50 bg-[#fdf8ec] p-3.5">
          <p className="text-[9px] font-semibold tracking-[0.1em] text-[#a4803c]">候选缺口 · 待核实</p>
          <h4 className="text-[13px] font-semibold leading-snug text-[#262626]">长时序下的身份漂移</h4>
          <p className="text-[11px] leading-relaxed text-[#6b5a2c]">最接近的工作只验证了 ≤4 秒片段；漂移随时长如何累积，证据不足。</p>
        </article>
        <article data-pd-card="mechanism" className="flex-col gap-1.5 rounded-2xl border border-[#7a9a6d]/40 bg-[#f4f8ef] p-3.5">
          <p className="text-[9px] font-semibold tracking-[0.1em] text-[#5d7a3a]">跨领域机制 · 候选</p>
          <h4 className="text-[13px] font-semibold leading-snug text-[#262626]">控制系统的状态估计</h4>
          <p className="text-[11px] leading-relaxed text-[#4c6640]">用观测渐进修正系统状态——或可迁移为「参考帧约束」。</p>
          <ul className="mt-1 flex flex-col gap-1 border-t border-[#7a9a6d]/20 pt-1.5 text-[10px] leading-snug">
            <li className="flex items-center gap-1.5 text-[#4c6640]"><span className="size-1.5 shrink-0 rounded-full bg-[#7a9a6d]" />迁移前提：状态可观测</li>
            <li className="flex items-center gap-1.5 text-[#4c6640]"><span className="size-1.5 shrink-0 rounded-full bg-[#7a9a6d]" />迁移前提：误差有界</li>
            <li className="flex items-center gap-1.5 text-[#a4803c]"><span className="size-1.5 shrink-0 rounded-full bg-[#d9b96a]" />待验证：观测噪声假设</li>
          </ul>
        </article>
        <article className="flex flex-col gap-1.5 rounded-2xl border border-black/5 bg-white p-3.5">
          <p className="text-[9px] font-semibold tracking-[0.1em] text-[#8a8c84]">REVIEWER 审查</p>
          <ul className="mt-1 flex flex-col gap-2">
            {checklistLabels.map((label, index) => (
              <li key={label} data-pd-check={String(index)} data-state="pending" className="pd-check flex items-center gap-2 text-[11px] leading-snug text-[#8a8c84]">
                <span className="pd-check-mark size-3 shrink-0 rounded-full border-[1.5px] border-[#d5d7cc]" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
