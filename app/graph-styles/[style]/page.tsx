import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraphFrame } from "../GraphView";
import { isStyle, themes } from "../themes";
import "../graph-styles.css";

export function generateStaticParams() {
  return [{ style: "a" }, { style: "b" }, { style: "c" }];
}

export async function generateMetadata({ params }: { params: Promise<{ style: string }> }): Promise<Metadata> {
  const { style } = await params;
  if (!isStyle(style)) return { title: "图谱样式" };
  return { title: `${style.toUpperCase()} · ${themes[style].name}` };
}

export default async function GraphStylePage({ params }: { params: Promise<{ style: string }> }) {
  const { style } = await params;
  if (!isStyle(style)) notFound();
  return <GraphFrame style={style} />;
}
