import type { Metadata } from "next";
import Link from "next/link";
import { docs } from "../content";

export const metadata: Metadata = {
  title: "文档 · CoResearch",
  description: "Research World、Explore 和 Deep Research 的社区说明。",
};

export default function DocsPage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <p className="text-sm font-medium text-[#6d7a3a]">Docs</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          文档
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
          这些说明描述产品愿景和研究工作流。它们还在演进，不代表每个模块都已在公开版本中完整实现。产品源码开源准备中，暂未公开。
        </p>
        <div className="mt-12 grid gap-4">
          {docs.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              className="rounded-[24px] bg-white p-7 ring-1 ring-black/8 transition hover:bg-[#f7f8f1]"
            >
              <h2 className="text-2xl font-semibold tracking-tight">{doc.title}</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#3f413c]">{doc.body}</p>
              <p className="mt-5 text-sm font-medium">阅读文档 →</p>
            </a>
          ))}
        </div>
        <Link href="/" className="mt-10 inline-block text-sm font-medium hover:opacity-70">
          ← 返回首页
        </Link>
      </section>
    </main>
  );
}
