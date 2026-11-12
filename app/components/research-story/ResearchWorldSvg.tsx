import { useId, type CSSProperties } from "react";
import { communityColor, communityMeta, nodeAt, routeD, world } from "../../graph-svg/mock-world";

const future = new Set(["gap", "candidate"]);
const visibleNodes = world.nodes.filter((node) => !future.has(node.id));
const visibleEdges = world.edges.filter((edge) => !future.has(edge.source) && !future.has(edge.target));
// Paper glyphs sample background research only; lineage stops draw their own markers.
const papers = visibleNodes.filter((node) => node.kind === "paper" && !node.id.startsWith("paper-")).filter((_, i) => i % 3 === 0);
const lineageCount = world.routes.lineage.length;

// Ripple entrance: each background node wakes by its distance from the world center
// (derived from the viewBox). Math.sqrt is engine-stable; Math.hypot is not (see mock-world.ts).
const [viewX, viewY, viewW, viewH] = world.viewBox;
const worldCenterX = viewX + viewW / 2, worldCenterY = viewY + viewH / 2;
const worldSpan = Math.sqrt((viewW / 2) ** 2 + (viewH / 2) ** 2);
const entranceDelay = (x: number, y: number, index: number) => (((Math.sqrt((x - worldCenterX) ** 2 + (y - worldCenterY) ** 2) / worldSpan) * .7 + (index % 5) * .04).toFixed(2));

/** All layers stay mounted. Only the scene controller changes their presentation. */
export function ResearchWorldSvg() {
  const prefix = useId().replace(/:/g, "");
  return (
    <svg className="rw-svg" viewBox="0 0 1440 850" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby={`${prefix}-title ${prefix}-desc`}>
      <title id={`${prefix}-title`}>同一张研究世界图谱中的文献关系、探索与候选方法</title>
      <desc id={`${prefix}-desc`}>所有节点及关系均为演示数据。下方提供完整文字讲解；位置与密度不作为科学结论的依据。</desc>
      <defs>
        <radialGradient id={`${prefix}-wash`}>
          <stop offset="0" stopColor="#f0f5f9" stopOpacity=".55" />
          <stop offset="1" stopColor="#f0f5f9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${prefix}-glow`}>
          <stop offset="0" stopColor="#efbf59" stopOpacity=".4" />
          <stop offset="1" stopColor="#efbf59" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${prefix}-amber-glow`}>
          <stop offset="0" stopColor="#d9a44e" stopOpacity=".34" />
          <stop offset="1" stopColor="#d9a44e" stopOpacity="0" />
        </radialGradient>
        {communityMeta.map((community) => (
          <radialGradient key={community.key} id={`${prefix}-c-${community.key}`}>
            <stop offset="0" stopColor={community.color} stopOpacity=".17" />
            <stop offset=".6" stopColor={community.color} stopOpacity=".07" />
            <stop offset="1" stopColor={community.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <linearGradient id={`${prefix}-region-core`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5c4e0" stopOpacity=".34" />
          <stop offset="1" stopColor="#a5c4e0" stopOpacity=".05" />
        </linearGradient>
        <linearGradient id={`${prefix}-region-frontier`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9ec9d6" stopOpacity=".32" />
          <stop offset="1" stopColor="#9ec9d6" stopOpacity=".05" />
        </linearGradient>
        <linearGradient id={`${prefix}-region-margin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8c48f" stopOpacity=".34" />
          <stop offset="1" stopColor="#d8c48f" stopOpacity=".06" />
        </linearGradient>
        <marker id={`${prefix}-arrow-blue`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1.2 L9 5 L0 8.8" fill="none" stroke="#5b93c4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <marker id={`${prefix}-arrow-teal`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1.2 L9 5 L0 8.8" fill="none" stroke="#4e8f7f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <g data-rw-camera="">
        <g className="rw-glow" aria-hidden="true">
          {communityMeta.map((community) => (
            <ellipse key={community.key} cx={community.cx} cy={community.cy} rx={community.rx * 1.42} ry={community.ry * 1.42} fill={`url(#${prefix}-c-${community.key})`} />
          ))}
        </g>
        <g data-rw-layer="ring" className="rw-reveal">
          <ellipse cx="712" cy="424" rx="645" ry="348" fill={`url(#${prefix}-wash)`} stroke="#b9cbd9" strokeWidth="1.1" />
          <ellipse cx="712" cy="424" rx="630" ry="334" fill="none" stroke="#c6d5e0" strokeWidth=".8" strokeDasharray="2 7" />
          <text x="712" y="66" textAnchor="middle" className="rw-world-label">RESEARCH WORLD</text>
        </g>
        <g className="rw-regions">
          <g data-rw-layer="core" className="rw-reveal">
            <path d="M212 415 C 218 322 302 262 402 270 C 506 279 588 342 590 434 C 592 520 518 584 402 590 C 288 596 206 508 212 415 Z" fill={`url(#${prefix}-region-core)`} />
            <text x="398" y="242" textAnchor="middle" className="rw-region-label" fill="#3d5a74">核心区域</text>
          </g>
          <g data-rw-layer="frontier" className="rw-reveal">
            <path d="M625 385 C 645 302 736 256 834 270 C 932 285 1002 344 996 434 C 990 522 908 576 806 570 C 704 564 606 468 625 385 Z" fill={`url(#${prefix}-region-frontier)`} />
            <text x="812" y="242" textAnchor="middle" className="rw-region-label" fill="#3f6d7c">研究前沿</text>
          </g>
          <g data-rw-layer="margin" className="rw-reveal">
            <path d="M1012 385 C 1044 302 1136 282 1198 334 C 1252 380 1256 484 1212 548 C 1166 608 1076 602 1032 548 C 996 504 990 448 1012 385 Z" fill={`url(#${prefix}-region-margin)`} />
            <text x="1128" y="252" textAnchor="middle" className="rw-region-label" fill="#8a744a">边缘区域</text>
          </g>
        </g>
        <g data-rw-layer="base">
          <g className="rw-edges" fill="none" stroke="#94a7b8" strokeWidth=".7" opacity=".42">
            {visibleEdges.map((edge) => {
              const a = nodeAt(edge.source), b = nodeAt(edge.target);
              return <line key={`${edge.source}-${edge.target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
            })}
          </g>
          <g stroke="#fff" strokeWidth=".6">
            {visibleNodes.map((node, i) => (
              <circle key={node.id} data-rw-node={node.id} cx={node.x} cy={node.y} r={node.radius}
                fill={node.community ? communityColor(node.community) : "#35485c"}
                opacity={node.alpha ?? 1}
                style={{ "--rw-d": `${entranceDelay(node.x, node.y, i)}s` } as CSSProperties}>
                <title>研究节点（示意）</title>
              </circle>
            ))}
          </g>
        </g>
        <g data-rw-layer="papers" className="rw-reveal">
          {papers.map((node, i) => (
            <g key={node.id} data-rw-stagger={`papers:${i}:${papers.length}`}
              transform={`translate(${node.x - 8} ${node.y - 11}) rotate(${((i % 3) - 1) * 5} 8 11)`}>
              <rect width="16" height="22" rx="2.5" fill="#fff" opacity=".85" stroke="#93a7ba" strokeWidth="1.1" />
              <path d="M3.5 6.5h9M3.5 11h9M3.5 15.5h6" stroke="#aebfcf" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
        <g data-rw-layer="lineage" className="rw-reveal">
          <path data-rw-draw="lineage" pathLength="1" d={routeD(world.routes.lineage)} className="rw-route" stroke="#3f6f9b" strokeWidth="3.2" />
          {world.routes.lineage.map((id, i) => {
            const n = nodeAt(id);
            return <g key={id} data-rw-stagger={`lineage:${i}:${lineageCount}`}><circle cx={n.x} cy={n.y} r="9" fill="#f4f9fd" stroke="#3f6f9b" strokeWidth="2.2" /><text x={n.x} y={n.y + 44} textAnchor="middle" className="rw-node-label" fill="#2e4557">{["基础工作 A", "方法改进 B", "比较工作 C", "邻近工作 D"][i]}</text></g>;
          })}
        </g>
        <g data-rw-layer="boundary" className="rw-reveal">
          <path d="M1150 318 C 1122 400 1168 500 1178 596" fill="none" stroke="#9483b0" strokeWidth="2" strokeDasharray="7 8" strokeLinecap="round" />
          <circle cx="1150" cy="318" r="4" fill="#9483b0" />
          <circle cx="1240" cy="418" r="7" fill="none" stroke="#b8a9ce" strokeWidth="1.4" strokeDasharray="3 3" />
          <circle cx="1216" cy="586" r="6" fill="none" stroke="#b8a9ce" strokeWidth="1.4" strokeDasharray="3 3" />
          <text x="1206" y="470" className="rw-node-label" fill="#7c6c96">局部研究边界</text>
          <text x="1206" y="496" className="rw-small-label">基于当前证据</text>
        </g>
        <g data-rw-layer="explore" className="rw-reveal">
          <path data-rw-draw="explore" pathLength="1" d={routeD(world.routes.explore)} className="rw-route" stroke="#5b93c4" strokeWidth="3" />
          {world.routes.explore.map((id, i) => {
            const n = nodeAt(id);
            return <g key={id} data-rw-stop={i}><circle cx={n.x} cy={n.y} r="8" fill="#edf5fb" stroke="#5b93c4" strokeWidth="2" /><text x={n.x} y={n.y - (i % 2 ? -42 : 26)} textAnchor="middle" className="rw-node-label" fill="#2e4557">{n.label}</text></g>;
          })}
        </g>
        <g data-rw-layer="intent" className="rw-reveal">
          <path d="M282 396 Q352 352 400 392" fill="none" stroke="#5b93c4" strokeWidth="2" strokeDasharray="6 5" markerEnd={`url(#${prefix}-arrow-blue)`} />
          <path d="M280 408 Q338 462 388 486" fill="none" stroke="#8ca9c3" strokeWidth="1.5" strokeDasharray="5 5" />
          <text x="322" y="330" className="rw-node-label" fill="#3f6f9b">Intent · 下一步倾向</text>
        </g>
        <g data-rw-layer="gap" className="rw-reveal">
          <circle cx="1122" cy="352" r="48" fill={`url(#${prefix}-amber-glow)`} />
          <circle cx="1122" cy="352" r="27" fill="none" stroke="#c49654" strokeWidth="1.6" strokeDasharray="5 5" className="rw-spin" />
          <circle cx="1122" cy="352" r="13" fill="#fff7e6" stroke="#c49654" strokeWidth="2.2" />
          <circle cx="1122" cy="352" r="5" fill="#c49654" />
          <text x="1122" y="300" textAnchor="middle" className="rw-node-label" fill="#8a6a34">Gap Finder</text>
          <text x="1122" y="408" textAnchor="middle" className="rw-small-label">候选缺口 · 待核实</text>
        </g>
        <g data-rw-layer="transfer" className="rw-reveal">
          <path data-rw-draw="transfer" pathLength="1" d="M526 660 C 665 790 844 693 954 510 S 1045 361 1109 362" className="rw-route" stroke="#4e8f7f" strokeWidth="3.2" markerEnd={`url(#${prefix}-arrow-teal)`} />
          <circle cx="526" cy="660" r="11" fill="#eff7f3" stroke="#4e8f7f" strokeWidth="2.2" />
          <text x="526" y="704" textAnchor="middle" className="rw-node-label" fill="#2e4557">其他领域的机制</text>
          <text x="836" y="700" className="rw-node-label" fill="#3f7264">Innovator · 迁移候选</text>
        </g>
        <g data-rw-layer="candidate" className="rw-reveal">
          <path data-rw-draw="candidate" pathLength="1" d="M1122 352 Q 1180 307 1244 313" className="rw-route" stroke="#c49654" strokeWidth="3" />
          <circle cx="1254" cy="313" r="38" fill={`url(#${prefix}-amber-glow)`} />
          <circle cx="1254" cy="313" r="20" fill="none" stroke="#c49654" strokeWidth="1.6" strokeDasharray="5 4" className="rw-spin" />
          <circle cx="1254" cy="313" r="10" fill="#fff3d6" stroke="#c49654" strokeWidth="2.2" />
          <text x="1254" y="256" textAnchor="middle" className="rw-node-label" fill="#8a6a34">候选方法</text>
          <text x="1254" y="366" textAnchor="middle" className="rw-small-label">审查与实验后才能判断</text>
        </g>
        <g data-rw-layer="idea" className="rw-reveal">
          <g data-rw-marker="" transform="translate(250 395)">
            <circle r="42" fill={`url(#${prefix}-glow)`} />
            <circle r="16" fill="none" stroke="#e0a63a" strokeWidth="2.4" className="rw-breathe" />
            <circle r="7.5" fill="#e0a63a" stroke="#fff" strokeWidth="2" />
          </g>
        </g>
      </g>
    </svg>
  );
}
