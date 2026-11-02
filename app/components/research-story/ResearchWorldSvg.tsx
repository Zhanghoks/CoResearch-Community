import { useId } from "react";
import { nodeAt, routeD, world } from "../../graph-svg/mock-world";

const future = new Set(["gap", "candidate"]);
const visibleNodes = world.nodes.filter((node) => !future.has(node.id));
const visibleEdges = world.edges.filter((edge) => !future.has(edge.source) && !future.has(edge.target));
const papers = visibleNodes.filter((node) => node.kind === "paper").filter((node, i) => node.id.startsWith("paper-") || i % 5 === 0);

/** All layers stay mounted. Only the scene controller changes their presentation. */
export function ResearchWorldSvg() {
  const prefix = useId().replace(/:/g, "");
  return (
    <svg className="rw-svg" viewBox="0 0 1440 850" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby={`${prefix}-title ${prefix}-desc`}>
      <title id={`${prefix}-title`}>同一张研究世界图谱中的文献关系、探索与候选方法</title>
      <desc id={`${prefix}-desc`}>所有节点及关系均为演示数据。下方提供完整文字讲解；位置与密度不作为科学结论的依据。</desc>
      <defs>
        <radialGradient id={`${prefix}-wash`}>
          <stop offset="0" stopColor="#e4eef5" stopOpacity=".45" />
          <stop offset="1" stopColor="#e4eef5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${prefix}-glow`}>
          <stop offset="0" stopColor="#efbf59" stopOpacity=".32" />
          <stop offset="1" stopColor="#efbf59" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g data-rw-camera="">
        <g data-rw-layer="ring" className="rw-reveal">
          <ellipse cx="712" cy="424" rx="645" ry="348" fill={`url(#${prefix}-wash)`} stroke="#b9cbd9" strokeWidth="1.2" />
          <text x="712" y="64" textAnchor="middle" className="rw-world-label">Research World</text>
        </g>
        <g className="rw-regions">
          <g data-rw-layer="core" className="rw-reveal">
            <path d="M170 280 C235 190 445 195 561 280 C624 352 611 545 495 635 C320 694 175 595 160 440 Z" fill="#c3ddf0" fillOpacity=".32" />
            <text x="342" y="248" textAnchor="middle" className="rw-region-label">核心区域</text>
          </g>
          <g data-rw-layer="frontier" className="rw-reveal">
            <path d="M579 281 C708 215 908 211 1025 320 C1065 420 995 570 874 615 C704 647 600 563 571 425 Z" fill="#daceeb" fillOpacity=".30" />
            <text x="798" y="254" textAnchor="middle" className="rw-region-label">研究前沿</text>
          </g>
          <g data-rw-layer="margin" className="rw-reveal">
            <path d="M1003 277 C1128 223 1181 299 1196 422 C1204 526 1187 589 1097 637 C1027 605 982 480 1003 277 Z" fill="#f1dfa8" fillOpacity=".36" />
            <text x="1114" y="250" textAnchor="middle" className="rw-region-label">边缘区域</text>
          </g>
        </g>
        <g data-rw-layer="base">
          <g fill="none" stroke="#8999a7" strokeWidth="1.05" opacity=".38">
            {visibleEdges.map((edge) => {
              const a = nodeAt(edge.source), b = nodeAt(edge.target);
              return <line key={`${edge.source}-${edge.target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
            })}
          </g>
          <g fill="#768696" stroke="#fff" strokeWidth=".65">
            {visibleNodes.map((node) => <circle key={node.id} data-rw-node={node.id} cx={node.x} cy={node.y} r={node.radius}><title>研究节点（示意）</title></circle>)}
          </g>
        </g>
        <g data-rw-layer="papers" className="rw-reveal">
          {papers.map((node) => <g key={node.id} transform={`translate(${node.x - 9} ${node.y - 12})`}>
            <rect width="18" height="24" rx="2" fill="#fff" stroke="#8599ae" strokeWidth="1.2" />
            <path d="M4 7h10M4 12h10M4 17h7" stroke="#a5b7c8" fill="none" />
          </g>)}
        </g>
        <g data-rw-layer="lineage" className="rw-reveal">
          <path data-rw-draw="lineage" pathLength="1" d={routeD(world.routes.lineage)} className="rw-route" stroke="#4c85b2" />
          {world.routes.lineage.map((id, i) => {
            const n = nodeAt(id);
            return <g key={id}><circle cx={n.x} cy={n.y} r="10" fill="#f4f9fd" stroke="#4c85b2" strokeWidth="2" /><text x={n.x} y={n.y + 42} textAnchor="middle" className="rw-node-label">{["基础工作 A", "方法改进 B", "比较工作 C", "邻近工作 D"][i]}</text></g>;
          })}
        </g>
        <g data-rw-layer="boundary" className="rw-reveal">
          <path d="M1160 280 C1135 390 1185 487 1195 620" fill="none" stroke="#9483b0" strokeWidth="2" strokeDasharray="8 8" />
          <text x="1222" y="525" className="rw-node-label" fill="#7c6c96">局部研究边界</text>
          <text x="1222" y="553" className="rw-small-label">基于当前证据</text>
          <circle cx="1300" cy="444" r="8" fill="none" stroke="#b8a9ce" strokeDasharray="3 3" />
          <circle cx="1281" cy="606" r="7" fill="none" stroke="#b8a9ce" strokeDasharray="3 3" />
        </g>
        <g data-rw-layer="explore" className="rw-reveal">
          <path data-rw-draw="explore" pathLength="1" d={routeD(world.routes.explore)} className="rw-route" stroke="#4c85b2" />
          {world.routes.explore.map((id, i) => {
            const n = nodeAt(id);
            return <g key={id} data-rw-stop={i}><circle cx={n.x} cy={n.y} r="9" fill="#edf5fb" stroke="#4c85b2" strokeWidth="2" /><text x={n.x} y={n.y - (i % 2 ? -42 : 28)} textAnchor="middle" className="rw-node-label">{n.label}</text></g>;
          })}
        </g>
        <g data-rw-layer="intent" className="rw-reveal">
          <path d="M272 398 Q350 350 403 394 M391 384L403 394L389 398" fill="none" stroke="#4c85b2" strokeWidth="2" strokeDasharray="6 5" />
          <path d="M270 409 Q337 464 393 488" fill="none" stroke="#8ca9c3" strokeWidth="1.5" strokeDasharray="5 5" />
          <text x="320" y="348" className="rw-node-label">Intent · 下一步倾向</text>
        </g>
        <g data-rw-layer="gap" className="rw-reveal">
          <circle cx="1122" cy="352" r="26" fill="#fff8e9" stroke="#c49654" strokeWidth="2" strokeDasharray="6 5" />
          <text x="1122" y="302" textAnchor="middle" className="rw-node-label">Gap Finder</text>
          <text x="1122" y="409" textAnchor="middle" className="rw-small-label">未默认上线 · 待核实</text>
        </g>
        <g data-rw-layer="transfer" className="rw-reveal">
          <path data-rw-draw="transfer" pathLength="1" d="M526 660 C665 790 844 693 954 510 S1045 361 1122 352" className="rw-route" stroke="#598a80" />
          <circle cx="526" cy="660" r="12" fill="#eff7f3" stroke="#598a80" strokeWidth="2" />
          <text x="526" y="704" textAnchor="middle" className="rw-node-label">其他领域的机制</text>
          <text x="831" y="671" className="rw-node-label" fill="#598a80">Innovator · 愿景</text>
        </g>
        <g data-rw-layer="candidate" className="rw-reveal">
          <path data-rw-draw="candidate" pathLength="1" d="M1122 352 Q1183 307 1254 313" className="rw-route" stroke="#c49654" />
          <circle cx="1254" cy="313" r="18" fill="#fff7e4" stroke="#c49654" strokeWidth="2" strokeDasharray="5 4" />
          <text x="1254" y="253" textAnchor="middle" className="rw-node-label">候选方法</text>
          <text x="1254" y="374" textAnchor="middle" className="rw-small-label">审查与实验后才能判断</text>
        </g>
        <g data-rw-layer="idea" className="rw-reveal">
          <g data-rw-marker="" transform="translate(250 395)">
            <circle r="37" fill={`url(#${prefix}-glow)`} />
            <circle r="18" fill="none" stroke="#e7b84c" strokeWidth="2.5" />
            <circle r="9" fill="#e7b84c" stroke="#fff" strokeWidth="2" />
          </g>
        </g>
      </g>
    </svg>
  );
}
