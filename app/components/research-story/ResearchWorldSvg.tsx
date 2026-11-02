import { useId } from "react";
import { domains, ellipse, nodeAt, point, routeD, sectorPath, world } from "../../graph-svg/mock-world";
const future = new Set(["gap", "candidate"]);
const nodes = world.nodes.filter(n => !future.has(n.id));
const edges = world.edges.filter(e => !future.has(e.source) && !future.has(e.target));
function Paper({ x, y, large = false, color = "#41647a" }: { x: number; y: number; large?: boolean; color?: string }) {
  const w = large ? 28 : 16, h = large ? 36 : 21;
  return <g transform={`translate(${x - w / 2} ${y - h / 2})`}><rect x="2" y="3" width={w} height={h} rx="3" fill="#253e4f" opacity=".08"/><rect width={w} height={h} rx="3" fill="#fffef8" stroke={color} strokeWidth={large ? 1.8 : 1.3}/><path d={`M ${w * .23} ${h * .3} H ${w * .77} M ${w * .23} ${h * .48} H ${w * .77} M ${w * .23} ${h * .66} H ${w * .63}`} fill="none" stroke={color} strokeWidth={large ? 2 : 1.3} strokeLinecap="round"/></g>;
}
/** Every scene uses this one mounted map. Camera motion never repositions its nodes. */
export function ResearchWorldSvg() {
  const prefix = useId().replace(/:/g, "");
  return <svg className="rw-svg" viewBox="0 0 1440 850" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby={`${prefix}-title ${prefix}-desc`}>
    <title id={`${prefix}-title`}>从研究节点生长为领域图谱，再进入一块椭圆切片</title>
    <desc id={`${prefix}-desc`}>示意图：径向环层表示成熟程度，扇区表示不同领域。所有节点与关系均为演示数据，不构成真实学术结论。</desc>
    <defs>
      <radialGradient id={`${prefix}-gold`}><stop stopColor="#e9b843" stopOpacity=".35"/><stop offset="1" stopColor="#e9b843" stopOpacity="0"/></radialGradient>
      <pattern id={`${prefix}-paper`} width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".55" fill="#375468" opacity=".035"/></pattern>
    </defs>
    <g data-rw-camera="">
      <g data-rw-terrain="">
      <g data-rw-layer="ring" className="rw-reveal">
        <ellipse cx={ellipse.cx} cy={ellipse.cy} rx="600" ry="325" fill="#f3efe5" stroke="#b8b4a5" strokeWidth="1.6"/>
        <ellipse cx={ellipse.cx} cy={ellipse.cy} rx="600" ry="325" fill={`url(#${prefix}-paper)`}/>
        <text x="720" y="51" textAnchor="middle" className="rw-world-label">RESEARCH WORLD</text>
      </g>
      <g data-rw-layer="margin" className="rw-reveal"><ellipse cx="720" cy="425" rx="600" ry="325" fill="#f4dfab" fillOpacity=".55" stroke="#bca06b" strokeWidth="1.5" strokeDasharray="7 6"/></g>
      <g data-rw-layer="frontier" className="rw-reveal"><ellipse cx="720" cy="425" rx="420" ry="227.5" fill="#ded5ed" fillOpacity=".85" stroke="#9c87b0" strokeWidth="1.5"/></g>
      <g data-rw-layer="core" className="rw-reveal"><ellipse cx="720" cy="425" rx="230" ry="124.6" fill="#cee1ed" stroke="#7098ae" strokeWidth="1.5"/></g>
      </g>
      <g data-rw-layer="domains" className="rw-reveal">
        {domains.map(domain => { const label = point(1.0, domain.angle), a = point(.04, domain.angle - 30), b = point(1, domain.angle - 30); return <g key={domain.id}>
          <path d={sectorPath(.04, 1, domain.angle - 29, domain.angle + 29)} fill={domain.color} fillOpacity=".09"/>
          <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke={domain.color} strokeWidth="1.4" strokeDasharray="5 6"/>
          <text x={label.x} y={label.y} textAnchor="middle" className="rw-domain-label" fill={domain.color}>{domain.label}</text>
        </g>; })}
      </g>
      <g data-rw-layer="base">
        {edges.map((edge, i) => { const a = nodeAt(edge.source), b = nodeAt(edge.target); return <path key={i} data-rw-grow={Math.max(a.born, b.born)} pathLength="1" d={`M${a.x} ${a.y} L${b.x} ${b.y}`} fill="none" stroke="#54748a" strokeWidth="1.45" opacity=".47"/>; })}
        {nodes.map(n => <g key={n.id} data-rw-node={n.id} data-rw-born={n.born}>{n.kind === "paper" ? <Paper x={n.x} y={n.y} large={n.id === "foundation"}/> : <circle cx={n.x} cy={n.y} r={n.radius} fill="#fffef9" stroke="#4b6c80" strokeWidth="1.8"/>}</g>)}
      </g>
      {/* Overview labels are suppressed as the camera enters the selected wedge. */}
      <g data-rw-overview="">
        <g data-rw-layer="core" className="rw-reveal"><text x="720" y="400" textAnchor="middle" className="rw-zone-title">核心区域</text><text x="720" y="459" textAnchor="middle" className="rw-zone-caption">较成熟的知识与证据</text></g>
        <g data-rw-layer="frontier" className="rw-reveal"><text x="720" y="237" textAnchor="middle" className="rw-zone-title">研究前沿</text></g>
        <g data-rw-layer="margin" className="rw-reveal"><text x="720" y="144" textAnchor="middle" className="rw-zone-title">边缘区域</text><text x="720" y="812" textAnchor="middle" className="rw-zone-caption">更远处，仍是待探索的未知</text></g>
      </g>
      <g data-rw-layer="slice" className="rw-reveal">
        <path d={sectorPath(.04, 1.16, -30, 30)} fill="#fffdf5" fillOpacity=".36" stroke="#3d657e" strokeWidth="1.5"/>
        <path d={sectorPath(.04, .3833, -30, 30)} fill="#b9d8e9" fillOpacity=".85"/>
        <path d={sectorPath(.3833, .7, -30, 30)} fill="#d3c3e7" fillOpacity=".8"/>
        <path d={sectorPath(.7, 1, -30, 30)} fill="#f2d896" fillOpacity=".8"/>
        <text x="805" y="310" textAnchor="middle" className="rw-slice-label">核心 · 已有基础</text>
        <text x="1052" y="287" textAnchor="middle" className="rw-slice-label">前沿 · 持续验证</text>
        <text x="1220" y="261" textAnchor="middle" className="rw-slice-label">边缘 · 尚待解决</text>
      </g>
      <g data-rw-layer="lineage" className="rw-reveal">
        <path data-rw-draw="lineage" pathLength="1" d={routeD(world.routes.lineage)} className="rw-route" stroke="#355e7c"/>
        {world.routes.lineage.map((id, i) => { const n = nodeAt(id); return <g key={id}><Paper x={n.x} y={n.y} large/><text x={n.x} y={n.y + 40} textAnchor="middle" className="rw-detail-label">{n.label}</text><text x={n.x} y={n.y + 60} textAnchor="middle" className="rw-detail-caption">{["提出问题", "改进方法", "比较证据", "发现限制"][i]}</text></g>; })}
      </g>
      <g data-rw-layer="boundary" className="rw-reveal">
        <path d="M1284 314 A600 325 0 0 1 1284 536" fill="none" stroke="#a58a51" strokeWidth="2" strokeDasharray="5 5"/>
        <text x="1334" y="560" textAnchor="middle" className="rw-detail-caption">当前证据边界</text>
      </g>
      <g data-rw-layer="explore" className="rw-reveal">
        <path data-rw-draw="explore" pathLength="1" d={routeD(world.routes.explore)} className="rw-route" stroke="#3c8091"/>
        {world.routes.explore.map((id, i) => { const n = nodeAt(id); return <g key={id} data-rw-stop={i}><circle cx={n.x} cy={n.y} r="9" fill="#fffdf8" stroke="#3c8091" strokeWidth="2"/><text x={n.x} y={n.y - 24} textAnchor="middle" className="rw-detail-label">{n.label}</text></g>; })}
      </g>
      <g data-rw-layer="intent" className="rw-reveal"><path d="M790 395 Q825 350 880 374" fill="none" stroke="#b8882a" strokeWidth="2" strokeDasharray="5 4"/><text x="834" y="344" textAnchor="middle" className="rw-detail-caption">选择探索方向</text></g>
      <g data-rw-layer="gap" className="rw-reveal"><circle cx="1280" cy="440" r="27" fill="#fff8df" stroke="#b58a36" strokeWidth="2" strokeDasharray="5 4"/><text x="1280" y="393" textAnchor="middle" className="rw-detail-label">候选缺口</text><text x="1280" y="488" textAnchor="middle" className="rw-detail-caption">待反例与证据核查</text></g>
      <g data-rw-layer="transfer" className="rw-reveal"><path data-rw-draw="transfer" pathLength="1" d="M1040 660 C1170 690 1270 565 1280 440" className="rw-route" stroke="#4c8b72"/><Paper x={1040} y={660} large color="#4c8b72"/><text x="1040" y="700" textAnchor="middle" className="rw-detail-label">其他领域的机制</text><text x="1215" y="610" textAnchor="middle" className="rw-detail-caption">检查迁移前提</text></g>
      <g data-rw-layer="candidate" className="rw-reveal"><path data-rw-draw="candidate" pathLength="1" d="M1280 440 Q1340 390 1400 402" className="rw-route" stroke="#b58a36"/><circle cx="1400" cy="402" r="22" fill="#fff5d6" stroke="#b58a36" strokeWidth="2" strokeDasharray="5 4"/><text x="1400" y="356" textAnchor="middle" className="rw-detail-label">候选方法</text><text x="1400" y="453" textAnchor="middle" className="rw-detail-caption">下一步：审查与实验</text></g>
      <g data-rw-layer="idea" className="rw-reveal"><g data-rw-marker=""><circle r="41" fill={`url(#${prefix}-gold)`}/><circle r="19" fill="#f3cb6b" stroke="#fffdf5" strokeWidth="3"/><circle r="8" fill="#8d641e"/><text data-rw-idea-label="" x="0" y="-31" textAnchor="middle" className="rw-detail-label">你的 Idea</text></g></g>
    </g>
  </svg>;
}
