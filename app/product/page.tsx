import type { Metadata } from "next";
import Link from "next/link";
import { ExploreProof } from "../components/demo-proof/ExploreProof";
import { ProductDemo } from "../components/product-demo/ProductDemo";
import { docs, siteUrl } from "../content";

export const metadata: Metadata = {
  title: "产品 · CoResearch",
  description:
    "看 CoResearch 跑一次研究：用 Core 的实际界面离线演示 Explore、方向续探与论文证据查看。",
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
          在一个会话里找方向、看论文、继续探索
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#3f413c] md:text-xl">
          从一句兴趣开始：发送 Explore 获得一组候选方向；选中一条，打开相关论文核对依据，再决定是否继续细分。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#product-demo"
            className="rounded-full bg-[#262626] px-5 py-3 text-sm font-medium text-white"
          >
            观看运行演示
          </a>
          <Link href="/docs/get-started/" className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-[#262626]">
            跟做第一次 Explore
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-[#6b6d66]">
          下方是实际 Core 界面的离线回放，只演示 Explore。论文、证据和结果为固定教学数据，不会调用真实模型或搜索。开发分支的论文检索与单篇论文讲解不在这段演示里，不代表已上线。
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
