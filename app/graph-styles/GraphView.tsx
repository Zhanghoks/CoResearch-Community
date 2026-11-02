import {
  bendFor,
  curve,
  edgesFor,
  fieldLabels,
  graphNodes,
  halos,
  pos,
  radius,
  regionOrder,
  type Frame,
  type GraphEdge,
  type GraphNode,
  type Tier,
} from "./model";
import type { StyleId, Theme } from "./themes";
import { themes } from "./themes";

const tierStyle: Record<StyleId, Record<Tier, { width: number; opacity: number }>> = {
  a: {
    hair: { width: 1.15, opacity: 0.2 },
    local: { width: 1.55, opacity: 0.38 },
    bridge: { width: 2.15, opacity: 0.58 },
    key: { width: 2.9, opacity: 0.9 },
    idea: { width: 3.1, opacity: 0.95 },
  },
  b: {
    hair: { width: 0.85, opacity: 0.22 },
    local: { width: 1.15, opacity: 0.4 },
    bridge: { width: 1.7, opacity: 0.62 },
    key: { width: 2.35, opacity: 0.92 },
    idea: { width: 2.6, opacity: 1 },
  },
  c: {
    hair: { width: 1.2, opacity: 0.28 },
    local: { width: 1.7, opacity: 0.48 },
    bridge: { width: 2.3, opacity: 0.7 },
    key: { width: 3.1, opacity: 0.92 },
    idea: { width: 3.4, opacity: 1 },
  },
};

function nodeById(id: string) {
  const node = graphNodes.find((item) => item.id === id);
  if (!node) throw new Error(`Missing graph node ${id}`);
  return node;
}

function edgeColor(theme: Theme, edge: GraphEdge, source: GraphNode) {
  if (edge.tier === "idea") return theme.idea.edge;
  if (theme.mode === "field") return theme.regions[source.region].node;
  return theme.edge;
}

function NodeShape({
  node,
  frame,
  theme,
  prefix,
}: {
  node: GraphNode;
  frame: Frame;
  theme: Theme;
  prefix: string;
}) {
  const { x, y } = pos(node, frame);
  const r = radius(node.importance, frame);
  const palette = theme.regions[node.region];
  const glow = node.importance >= 4 ? `${prefix}-glow-strong` : `${prefix}-glow-soft`;

  if (node.space === "idea") {
    return (
      <g>
        <circle cx={x} cy={y} r={r + 10} fill={theme.idea.glow} opacity={theme.mode === "glow" ? 0.45 : 0.28} filter={`url(#${prefix}-halo)`} />
        <circle cx={x} cy={y} r={r + 3.5} fill="none" stroke={theme.idea.stroke} strokeWidth={1.4} opacity={0.9} />
        <circle cx={x} cy={y} r={r} fill={theme.idea.fill} stroke={theme.idea.stroke} strokeWidth={theme.mode === "field" ? 3 : 1.6} filter={theme.mode === "glow" ? `url(#${glow})` : undefined} />
        {theme.mode !== "field" && <circle cx={x - r * 0.18} cy={y - r * 0.22} r={r * 0.38} fill="#fff" opacity={0.35} />}
      </g>
    );
  }

  if (theme.mode === "ink") {
    const hub = node.importance >= 3;
    return (
      <g opacity={node.importance === 1 ? 0.72 : 1} filter={node.importance === 1 ? `url(#${prefix}-recede)` : undefined}>
        <circle cx={x} cy={y} r={r} fill={palette.node} stroke={hub ? "#fffdf8" : theme.bg} strokeWidth={hub ? 2.4 : 1} />
        {hub && <circle cx={x - r * 0.16} cy={y - r * 0.2} r={r * 0.32} fill="#fff" opacity={0.22} />}
      </g>
    );
  }

  if (theme.mode === "glow") {
    return (
      <g opacity={node.importance === 1 ? 0.62 : 1} filter={`url(#${glow})`}>
        <circle cx={x} cy={y} r={r} fill={palette.node} />
        <circle cx={x - r * 0.15} cy={y - r * 0.2} r={Math.max(1.2, r * 0.42)} fill="#fff" opacity={node.importance >= 3 ? 0.55 : 0.28} />
      </g>
    );
  }

  return (
    <g filter={node.importance >= 3 ? `url(#${prefix}-shadow)` : undefined} opacity={node.importance === 1 ? 0.8 : 1}>
      <circle cx={x} cy={y} r={r} fill={palette.node} stroke="#fff" strokeWidth={node.importance >= 4 ? 2.4 : 1.3} />
    </g>
  );
}

function Label({
  node,
  frame,
  theme,
}: {
  node: GraphNode;
  frame: Frame;
  theme: Theme;
}) {
  if (!node.label) return null;
  const { x, y } = pos(node, frame);
  const r = radius(node.importance, frame);
  const size = frame === "phone" ? (node.importance >= 5 ? 15 : 13) : node.importance >= 5 ? 18 : 15;
  const below = y < (frame === "phone" ? 70 : 175);
  const baseline = below ? y + r + size + 4 : y - r - 8;
  const width = node.label.length * size + 14;
  const height = size + 8;
  const plateY = baseline - size;
  return (
    <g className="gs-label">
      {theme.mode === "field" && (
        <rect x={x - width / 2} y={plateY - 2} width={width} height={height} rx={7} fill={theme.plate} opacity={0.94} />
      )}
      <text x={x} y={baseline} textAnchor="middle" fontSize={size} fill={node.space === "idea" ? theme.idea.edge : theme.label} fontWeight={650}>
        {node.label}
      </text>
    </g>
  );
}

function Edges({
  frame,
  theme,
  prefix,
}: {
  frame: Frame;
  theme: Theme;
  prefix: string;
}) {
  const widths = tierStyle[theme.id];
  const edges = edgesFor(frame);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {edges.map((edge) => {
        const source = nodeById(edge.source);
        const target = nodeById(edge.target);
        const path = curve(pos(source, frame), pos(target, frame), bendFor(edge));
        const style = widths[edge.tier];
        const color = edgeColor(theme, edge, source);
        const id = `${prefix}-e-${edge.source}-${edge.target}`;
        const under = edge.tier === "key" || edge.tier === "idea";
        return (
          <g key={id}>
            <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={path.x1} y1={path.y1} x2={path.x2} y2={path.y2}>
              <stop offset="0" stopColor={color} stopOpacity="0" />
              <stop offset={edge.tier === "hair" ? "0.18" : "0.08"} stopColor={color} stopOpacity={style.opacity} />
              <stop offset={edge.tier === "hair" ? "0.82" : "0.92"} stopColor={color} stopOpacity={style.opacity} />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
            {under && !edge.dashed && (
              <path d={path.d} stroke={color} strokeWidth={style.width + (edge.tier === "idea" ? 7 : 5)} strokeOpacity={theme.mode === "glow" ? 0.2 : 0.13} />
            )}
            <path d={path.d} stroke={`url(#${id})`} strokeWidth={style.width} strokeDasharray={edge.dashed ? "1.2 7" : undefined} />
          </g>
        );
      })}
    </g>
  );
}

export function GraphSvg({ style, frame }: { style: StyleId; frame: Frame }) {
  const theme = themes[style];
  const prefix = `${style}-${frame}`;
  const box = frame === "phone" ? "0 0 390 844" : "0 0 1280 800";
  const literature = graphNodes.filter((node) => node.space === "literature");
  const ideas = graphNodes.filter((node) => node.space === "idea");
  const ordered = [...literature].sort((a, b) => a.importance - b.importance);

  return (
    <svg className={`gs-svg gs-only-${frame}`} viewBox={box} preserveAspectRatio="xMidYMid slice" role="img">
      <title>{theme.name}：文献空间与想法空间的示意图谱</title>
      <defs>
        <radialGradient id={`${prefix}-vignette`} cx="50%" cy="46%" r="68%">
          <stop offset="0" stopColor={theme.bg} stopOpacity="0" />
          <stop offset="1" stopColor={theme.vignette} stopOpacity="1" />
        </radialGradient>
        {regionOrder.map((region) => (
          <radialGradient key={region} id={`${prefix}-halo-${region}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={theme.regions[region].halo} stopOpacity={theme.mode === "glow" ? 0.72 : 0.62} />
            <stop offset="0.42" stopColor={theme.regions[region].halo} stopOpacity={theme.mode === "glow" ? 0.32 : 0.28} />
            <stop offset="1" stopColor={theme.regions[region].halo} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id={`${prefix}-halo`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={frame === "phone" ? 6 : 8} />
        </filter>
        <filter id={`${prefix}-recede`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.45" />
        </filter>
        <filter id={`${prefix}-glow-soft`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${prefix}-glow-strong`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={frame === "phone" ? 2.4 : 3.4} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${prefix}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.5" floodColor="#14202b" floodOpacity="0.16" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill={theme.bg} />
      <rect width="100%" height="100%" fill={`url(#${prefix}-vignette)`} />
      <g>
        {regionOrder.map((region) => {
          const halo = halos[frame][region];
          return (
            <ellipse
              key={region}
              cx={halo.cx}
              cy={halo.cy}
              rx={halo.rx}
              ry={halo.ry}
              fill={`url(#${prefix}-halo-${region})`}
              filter={`url(#${prefix}-halo)`}
            />
          );
        })}
      </g>
      <Edges frame={frame} theme={theme} prefix={prefix} />
      <g>
        {ordered.map((node) => (
          <NodeShape key={node.id} node={node} frame={frame} theme={theme} prefix={prefix} />
        ))}
        {ideas.map((node) => (
          <NodeShape key={node.id} node={node} frame={frame} theme={theme} prefix={prefix} />
        ))}
      </g>
      <g className="gs-field-label">
        {fieldLabels[frame].map((label) => (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
            textAnchor={frame === "phone" && label.kind !== "idea" ? "start" : "middle"}
            fontSize={frame === "phone" ? 12 : 14}
            fontWeight={700}
            letterSpacing={frame === "phone" ? 1.5 : 3}
            fill={label.kind === "idea" ? theme.idea.edge : theme.regions[label.kind].ring}
            opacity={0.92}
          >
            {label.text}
          </text>
        ))}
      </g>
      <g>
        {graphNodes.map((node) => (
          <Label key={node.id} node={node} frame={frame} theme={theme} />
        ))}
      </g>
    </svg>
  );
}

export function GraphFrame({ style }: { style: StyleId }) {
  const theme = themes[style];
  return (
    <div className={`gs-frame gs-${style}`} style={{ background: theme.bg, color: theme.label }}>
      <GraphSvg style={style} frame="desktop" />
      <GraphSvg style={style} frame="phone" />
      <p className="gs-caption" style={{ color: theme.caption }}>
        <strong>{style.toUpperCase()} · {theme.name}</strong>
        <span>示意名称，非真实论文</span>
      </p>
    </div>
  );
}
