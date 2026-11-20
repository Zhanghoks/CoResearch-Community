import type { Metadata } from "next";
import { ExploreProof } from "../components/demo-proof/ExploreProof";
import { ProductDemo } from "../components/product-demo/ProductDemo";
import { docs, siteUrl } from "../content";

export const metadata: Metadata = {
  title: "产品 · CoResearch",
  description:
    "看 CoResearch 跑一次研究：由当前产品展示组件驱动的离线演示，从一句模糊兴趣到可验证的候选方法。",
  alternates: { canonical: `${siteUrl}/product/` },
  openGraph: { url: `${siteUrl}/product/` },
};

export default function ProductPage() {
  return (
    <main id="main">
      <section className="mx-auto max-w-6xl px-5 pb-2 pt-12 md:pt-16">
        <p className="inline-flex items-center gap-2 text-sm font-medium">
          <span className="rounded-full bg-[#a9ff63] px-2 py-0.5 text-xs font-semibold">
            Product
          </span>
          Explore the Research World
        </p>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-balance md:text-6xl">
          在一个会话里，走完一次有依据的研究
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#3f413c] md:text-xl">
          CoResearch 把 Explore、Deep Dive、边界判断和修订连成一条可以回头的路径：研究者说出兴趣，多 Agent 协作补全证据链，关键决策始终由人确认。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#product-demo"
            className="rounded-full bg-[#262626] px-5 py-3 text-sm font-medium text-white"
          >
            观看运行演示
          </a>
          <a href="#explore-proof" className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-[#262626]">
            验证 Explore 回放切片
          </a>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-[#6b6d66]">
          下方演示使用当前 CoResearch 展示组件的离线 viewer，输入与结果来自固定合成教学数据，不是一次真实模型或检索请求，也不代表已上线功能。页面描述愿景和工作流，不代表每个 Agent 角色都已在公开版本中完整实现。
        </p>
      </section>
      <ProductDemo />
      <ExploreProof />
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-4">
        <h2 className="text-2xl font-semibold tracking-tight">设计文档</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {docs.map((doc) => (
            <a
              key={doc.title}
              href={doc.href}
              className="flex flex-col rounded-[24px] bg-white p-7 ring-1 ring-black/8 transition hover:ring-black/20"
            >
              <h3 className="text-lg font-semibold">{doc.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#3f413c]">{doc.body}</p>
              <span className="mt-5 text-sm font-medium">阅读文档 →</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
