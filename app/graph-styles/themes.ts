import type { Region } from "./model";

export type StyleId = "a" | "b" | "c";

export type Theme = {
  id: StyleId;
  name: string;
  line: string;
  bg: string;
  vignette: string;
  ink: string;
  label: string;
  caption: string;
  regions: Record<Region, { halo: string; node: string; ring: string }>;
  idea: { fill: string; stroke: string; glow: string; edge: string };
  edge: string;
  plate: string;
  mode: "ink" | "glow" | "field";
};

export const themes: Record<StyleId, Theme> = {
  a: {
    id: "a",
    name: "纸上墨色",
    line: "暖纸底、墨色节点，三个区域用饱和色环和色晕分开，想法空间是独立的铜色。",
    bg: "#f3f0e8",
    vignette: "#e4ddd0",
    ink: "#1c2430",
    label: "#1a1814",
    caption: "#5c564c",
    regions: {
      core: { halo: "#2f6bff", node: "#1d4ed8", ring: "#2f6bff" },
      frontier: { halo: "#7c3aed", node: "#6d28d9", ring: "#7c3aed" },
      boundary: { halo: "#e39b12", node: "#b45309", ring: "#d4920a" },
    },
    idea: { fill: "#c56a12", stroke: "#fff8ee", glow: "#f0b15a", edge: "#c56a12" },
    edge: "#243041",
    plate: "#f7f4ee",
    mode: "ink",
  },
  b: {
    id: "b",
    name: "夜间星图",
    line: "深色星图，节点按区域发光，想法空间是更亮的金线。",
    bg: "#101218",
    vignette: "#06070b",
    ink: "#f4f0e6",
    label: "#f7f4ee",
    caption: "#c9c2b4",
    regions: {
      core: { halo: "#3b82f6", node: "#8eb7ff", ring: "#dbeafe" },
      frontier: { halo: "#a78bfa", node: "#d2c2ff", ring: "#ede9fe" },
      boundary: { halo: "#f5b942", node: "#ffd27a", ring: "#fff1cc" },
    },
    idea: { fill: "#ffb020", stroke: "#fff6df", glow: "#ffc14d", edge: "#ffc14d" },
    edge: "#d5e2f2",
    plate: "#1a1d27",
    mode: "glow",
  },
  c: {
    id: "c",
    name: "双空间",
    line: "文献节点按区域平涂成三块纯色，想法空间用留白节点和暖色丝带叠在上面。",
    bg: "#f5f7f4",
    vignette: "#e3eee7",
    ink: "#12202c",
    label: "#12202c",
    caption: "#4d5d6a",
    regions: {
      core: { halo: "#1d4ed8", node: "#1d4ed8", ring: "#1e3a8a" },
      frontier: { halo: "#6d28d9", node: "#6d28d9", ring: "#4c1d95" },
      boundary: { halo: "#c2410c", node: "#c2410c", ring: "#9a3412" },
    },
    idea: { fill: "#fffdf8", stroke: "#e08a00", glow: "#f6c453", edge: "#e08a00" },
    edge: "#5c6d7e",
    plate: "#ffffff",
    mode: "field",
  },
};

export function isStyle(value: string): value is StyleId {
  return value === "a" || value === "b" || value === "c";
}
