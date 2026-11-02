import type { Metadata } from "next";
import Link from "next/link";
import { themes, type StyleId } from "./themes";
import "./graph-styles.css";

export const metadata: Metadata = {
  title: "图谱样式预览",
  description: "三套静止的研究世界图谱样式，供选择。节点与论文名均为示意。",
};

const order: StyleId[] = ["a", "b", "c"];

export default function GraphStyleIndex() {
  return (
    <main className="gs-index">
      <h1>图谱样式</h1>
      <p>三套静止预览，用来选视觉方向。名称和连线都是示意，不是真实论文。</p>
      <div className="gs-choices">
        {order.map((id) => (
          <Link key={id} href={`/graph-styles/${id}/`}>
            <strong>{id.toUpperCase()} · {themes[id].name}</strong>
            <span>{themes[id].line}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
