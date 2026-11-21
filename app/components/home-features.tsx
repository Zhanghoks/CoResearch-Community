"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { HomeScene } from "../demo/scenes/home-runtime";
import { HomeCoreMotion } from "./home-core-motion";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const features = [
  { id: "directions", code: "EXPLORE", title: "把模糊兴趣变成几个可选方向。", body: "不必先写研究计划。发送一句兴趣，CoResearch 整理出具体方向，供你比较。", action: "输入主题，选择 Explore 后发送", result: "一组彼此有区别、可进入的方向", guide: "/docs/get-started/", image: "directions.webp", alt: "CoResearch 发送 Explore 后显示第一组研究方向" },
  { id: "evidence", code: "EVIDENCE", title: "不用猜答案是从哪来的。", body: "从方向打开相应论文，分清摘要、全文和适用条件。这里的切镜证据，并不能直接外推到遮挡后重现。", action: "从方向里打开一篇论文", result: "原文片段与适用边界", guide: "/docs/read-evidence/?step=read-level", image: "evidence.webp", alt: "CoResearch 论文预览显示全文状态和切镜适用条件" },
  { id: "refine", code: "REFINE", title: "下一轮沿着选中的方向做。", body: "从生成一致性收窄到跨镜头身份保持。新方向接在原方向下面，之前比较过的选项没有消失。", action: "选中方向，准备细分，再发送", result: "保留父方向的新一层候选", guide: "/docs/explore-directions/", image: "refine.webp", alt: "CoResearch 的下一级候选和原研究方向的关联" },
] as const satisfies readonly { id: HomeScene; code: string; title: string; body: string; action: string; result: string; guide: string; image: string; alt: string }[];

export function HomeFeatures() {
  const [selected, setSelected] = useState<HomeScene | null>(null);
  return (
    <section id="product-demo" className="home-features" aria-labelledby="features-title">
      <header>
        <p className="home-features-kicker">03 / PRODUCT FEATURES</p>
        <h2 id="features-title">把研究拆成下一步。</h2>
      </header>
      {features.map((feature, index) => (
        <article key={feature.id} className="home-feature" id={`feature-${feature.id}`}>
          <div className="home-feature-copy">
            <p className="home-features-kicker">{String(index + 1).padStart(2, "0")} / {feature.code}</p>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
            <dl><div><dt>你做</dt><dd>{feature.action}</dd></div><div><dt>你看到</dt><dd>{feature.result}</dd></div></dl>
            <Link href={feature.guide}>跟做这个步骤 ↗</Link>
          </div>
          <div className="home-feature-media">
            {selected === feature.id ? (
              <HomeCoreMotion chapter={feature.id} />
            ) : (
              <figure>
                <Image src={`${base}/product/${feature.image}`} alt={feature.alt} width={1040} height={580} unoptimized />
                <figcaption><span>实际 Core 界面 · 合成示例</span><button type="button" onClick={() => setSelected(feature.id)}>▶ 播放这个片段</button></figcaption>
              </figure>
            )}
          </div>
        </article>
      ))}
      <div className="home-end"><h2>从一次 Explore 开始。</h2><Link href="/docs/get-started/">跟做第一次 Explore →</Link><Link href="/product/#product-demo">看完整回放 ↗</Link></div>
    </section>
  );
}
