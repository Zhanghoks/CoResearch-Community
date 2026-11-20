import { useId, type CSSProperties } from "react";
import { communityColor, communityMeta, isForegroundNode, nodeAt, routeD, world } from "../../graph-svg/mock-world";
import { fixtureIdToGraphId } from "../../demo/scenes/concept";

const backgroundNodes = world.nodes.filter((node) => !isForegroundNode(node));
const backgroundEdges = world.edges.filter((edge) => {
  try {
    return !isForegroundNode(nodeAt(edge.source)) && !isForegroundNode(nodeAt(edge.target));
  } catch {
    return false;
  }
});

const [viewX, viewY, viewW, viewH] = world.viewBox;
const worldCenterX = viewX + viewW / 2, worldCenterY = viewY + viewH / 2;
const worldSpan = Math.sqrt((viewW / 2) ** 2 + (viewH / 2) ** 2);
const entranceDelay = (x: number, y: number, index: number) => (((Math.sqrt((x - worldCenterX) ** 2 + (y - worldCenterY) ** 2) / worldSpan) * .7 + (index % 5) * .04).toFixed(2));

const seed = nodeAt("video");
const consistency = nodeAt("consistency");
const controllable = nodeAt("controllable");
const narrative = nodeAt("narrative");
const subject = nodeAt("subject");
const crossshot = nodeAt("multi-shot");
const p01 = nodeAt("P01");
const p02 = nodeAt("P02");
const p05 = nodeAt("P05");
const p03 = nodeAt("P03");
const p06 = nodeAt("P06");
const oq = nodeAt("oq-identity-budget");
const next = nodeAt("candidate");

/** All layers stay mounted. Only the scene controller changes their presentation. Critical text is in the HTML overlay so zoom cannot shrink it below 14/16px. */
export function ResearchWorldSvg() {
  const prefix = useId().replace(/:/g, "");
  return (
    <svg className="rw-svg" viewBox="0 0 1440 850" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby={`${prefix}-title ${prefix}-desc`}>
      <title id={`${prefix}-title`}>研究动作如何改变认识：从兴趣、证据与反例收敛到一个完整的开放式问题</title>
      <desc id={`${prefix}-desc`}>前景节点来自共享合成教学 fixture。背景只表示未展开的相关语境，不参与研究结论。完整问题、依据、反例和下一步在屏幕标签层中阅读。</desc>
      <defs>
        <radialGradient id={`${prefix}-wash`}>
          <stop offset="0" stopColor="#f0f5f9" stopOpacity=".35" />
          <stop offset="1" stopColor="#f0f5f9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${prefix}-glow`}>
          <stop offset="0" stopColor="#efbf59" stopOpacity=".28" />
          <stop offset="1" stopColor="#efbf59" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${prefix}-coverage`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d8f5a" stopOpacity=".22" />
          <stop offset="1" stopColor="#6d8f5a" stopOpacity=".05" />
        </linearGradient>
        {communityMeta.map((community) => (
          <radialGradient key={community.key} id={`${prefix}-c-${community.key}`}>
            <stop offset="0" stopColor={community.color} stopOpacity=".1" />
            <stop offset=".6" stopColor={community.color} stopOpacity=".04" />
            <stop offset="1" stopColor={community.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <marker id={`${prefix}-arrow-blue`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1.2 L9 5 L0 8.8" fill="none" stroke="#5b93c4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <g data-rw-camera="">
        <g className="rw-glow" aria-hidden="true">
          {communityMeta.map((community) => (
            <ellipse key={community.key} cx={community.cx} cy={community.cy} rx={community.rx * 1.2} ry={community.ry * 1.2} fill={`url(#${prefix}-c-${community.key})`} />
          ))}
        </g>
        <g data-rw-layer="base">
          <ellipse cx="712" cy="424" rx="640" ry="340" fill={`url(#${prefix}-wash)`} />
          <g className="rw-edges" fill="none" stroke="#94a7b8" strokeWidth=".6" opacity=".28">
            {backgroundEdges.map((edge) => {
              const a = nodeAt(edge.source), b = nodeAt(edge.target);
              return <line key={`${edge.source}-${edge.target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
            })}
          </g>
          <g stroke="#fff" strokeWidth=".5">
            {backgroundNodes.map((node, i) => (
              <circle key={node.id} data-rw-node={node.id} cx={node.x} cy={node.y} r={node.radius}
                fill={node.community ? communityColor(node.community) : "#35485c"}
                opacity={node.alpha ?? 1}
                style={{ "--rw-d": `${entranceDelay(node.x, node.y, i)}s` } as CSSProperties}>
                <title>未展开的相关语境（示意）</title>
              </circle>
            ))}
          </g>
        </g>
        <g data-rw-layer="path" className="rw-reveal">
          <path data-rw-draw="path" pathLength="1" d={routeD(world.routes.explore)} className="rw-route" stroke="#5b93c4" strokeWidth="3.2" />
          {world.routes.explore.map((id, i) => {
            const n = nodeAt(id);
            return (
              <g key={id} data-rw-stop={i} data-rw-foreground={n.fixtureId ?? id}>
                <circle cx={n.x} cy={n.y} r="8" fill="#edf5fb" stroke="#5b93c4" strokeWidth="2" />
              </g>
            );
          })}
          <g data-rw-dim="1" data-rw-foreground={controllable.fixtureId}>
            <circle cx={controllable.x} cy={controllable.y} r="6" fill="#f7fafc" stroke="#8aa0b3" strokeWidth="1.4" />
            <line x1={seed.x} y1={seed.y} x2={controllable.x} y2={controllable.y} stroke="#8aa0b3" strokeDasharray="5 5" strokeWidth="1.4" />
          </g>
          <g data-rw-dim="1" data-rw-foreground={narrative.fixtureId}>
            <circle cx={narrative.x} cy={narrative.y} r="6" fill="#f7fafc" stroke="#8aa0b3" strokeWidth="1.4" />
            <line x1={seed.x} y1={seed.y} x2={narrative.x} y2={narrative.y} stroke="#8aa0b3" strokeDasharray="5 5" strokeWidth="1.4" />
          </g>
        </g>
        <g data-rw-layer="coverage" className="rw-reveal">
          <path d="M430 430 C 480 330 700 310 760 400 C 800 470 720 540 600 545 C 490 550 400 500 430 430 Z" fill={`url(#${prefix}-coverage)`} stroke="#6d8f5a" strokeWidth="2" />
        </g>
        <g data-rw-layer="unverified" className="rw-reveal">
          <path data-rw-draw="unverified" pathLength="1" d={`M ${crossshot.x} ${crossshot.y} C 800 300 900 320 ${oq.x} ${oq.y}`} className="rw-route" stroke="#9483b0" strokeWidth="2.4" strokeDasharray="7 7" />
          <path d={`M ${oq.x} ${oq.y} C 1040 300 1080 310 ${next.x} ${next.y}`} fill="none" stroke="#c49654" strokeWidth="2.2" strokeDasharray="6 6" />
        </g>
        <g data-rw-layer="evidence" className="rw-reveal">
          <g data-rw-stagger="evidence:0:2" data-rw-foreground="P01">
            <rect x={p01.x - 14} y={p01.y - 18} width="28" height="36" rx="3" fill="#fff" stroke="#3f6f9b" strokeWidth="1.6" />
            <line x1={p01.x} y1={p01.y - 18} x2={crossshot.x} y2={crossshot.y} stroke="#3f6f9b" strokeWidth="1.6" />
          </g>
          <g data-rw-stagger="evidence:1:2" data-rw-foreground="P02">
            <rect x={p02.x - 14} y={p02.y - 18} width="28" height="36" rx="3" fill="#fff" stroke="#3f6f9b" strokeWidth="1.6" />
            <line x1={p02.x} y1={p02.y - 18} x2={crossshot.x} y2={crossshot.y} stroke="#3f6f9b" strokeWidth="1.6" />
          </g>
        </g>
        <g data-rw-layer="revision" className="rw-reveal">
          <g data-rw-foreground="P05">
            <rect x={p05.x - 14} y={p05.y - 18} width="28" height="36" rx="3" fill="#fff7e6" stroke="#a46a3a" strokeWidth="1.8" />
            <line x1={p05.x} y1={p05.y} x2={consistency.x + 80} y2={consistency.y + 20} stroke="#a46a3a" strokeWidth="1.8" />
          </g>
          <g data-rw-foreground="P03">
            <rect x={p03.x - 14} y={p03.y - 18} width="28" height="36" rx="3" fill="#fff7e6" stroke="#a46a3a" strokeWidth="1.8" />
            <line x1={p03.x} y1={p03.y} x2={consistency.x + 80} y2={consistency.y + 20} stroke="#a46a3a" strokeWidth="1.8" />
          </g>
        </g>
        <g data-rw-layer="question" className="rw-reveal">
          <circle cx={oq.x} cy={oq.y} r="16" fill="#fff" stroke="#3d5a74" strokeWidth="2.2" data-rw-foreground="oq-identity-budget" />
          <circle cx={oq.x} cy={oq.y} r="6" fill="#3d5a74" />
          <line x1={p06.x} y1={p06.y} x2={oq.x} y2={oq.y} stroke="#4e8f7f" strokeWidth="2" strokeDasharray="6 5" />
          <rect x={p06.x - 12} y={p06.y - 16} width="24" height="32" rx="3" fill="#eff7f3" stroke="#4e8f7f" strokeWidth="1.6" data-rw-foreground="P06" />
        </g>
        <g data-rw-layer="nextStep" className="rw-reveal">
          <circle cx={next.x} cy={next.y} r="12" fill="#fff3d6" stroke="#c49654" strokeWidth="2" strokeDasharray="4 3" data-rw-foreground="next-step" />
        </g>
        <g data-rw-layer="path" className="rw-focus-mark">
          <g data-rw-marker="" transform={`translate(${seed.x} ${seed.y})`}>
            <circle r="28" fill={`url(#${prefix}-glow)`} />
            <circle r="7.5" fill="#e0a63a" stroke="#fff" strokeWidth="2" />
          </g>
        </g>
        <g opacity="0" aria-hidden="true">
          <circle data-rw-node={fixtureIdToGraphId("d-identity")} cx={subject.x} cy={subject.y} r="1" />
        </g>
      </g>
    </svg>
  );
}
