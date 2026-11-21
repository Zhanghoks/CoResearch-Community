import type { Metadata } from "next";
import Link from "next/link";
import { docs, siteUrl } from "../content";
import { GUIDE_VERSION_NOTE, PRIMARY_GUIDE_IDS, guideById, guides } from "../demo/guides/catalog";

export const metadata: Metadata = {
  title: "使用指南 · CoResearch",
  description: "在站内用共享合成 fixture 完成 Explore、方向续探、证据查看和带引用追问。设计文档仍可在本页次要入口阅读。",
  alternates: { canonical: `${siteUrl}/docs/` },
  openGraph: { url: `${siteUrl}/docs/` },
};

export default function DocsPage() {
  const primary = PRIMARY_GUIDE_IDS.map((id) => guideById.get(id)!);
  const extra = guides.filter((guide) => !PRIMARY_GUIDE_IDS.includes(guide.id as typeof PRIMARY_GUIDE_IDS[number]));
  return (
    <main id="main" className="min-w-0">
      <section className="mx-auto min-w-0 max-w-6xl px-5 py-16 md:py-24">
        <p className="text-sm font-medium text-[#6d7a3a]">Get started</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">开始使用</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
          这些是站内可操作教程，使用与产品演示相同的离线 Core viewer 和共享合成 fixture。它们教会当前真实可用的 Explore 操作，不会把未开放能力写成当前按钮。
        </p>
        <p className="mt-4 max-w-3xl min-w-0 text-sm leading-7 break-words [overflow-wrap:anywhere] text-[#5c6148]">{GUIDE_VERSION_NOTE}</p>
        <div className="mt-12 grid gap-4">
          {primary.map((guide) => (
            <Link
              key={guide.id}
              href={guide.path}
              className="min-w-0 rounded-[24px] bg-white p-7 ring-1 ring-black/8 transition hover:bg-[#f7f8f1]"
            >
              <h2 className="text-2xl font-semibold tracking-tight">{guide.title}</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#3f413c]">{guide.task}</p>
              <p className="mt-5 text-sm font-medium">开始教程 →</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-16 text-3xl font-semibold tracking-tight">恢复与例外</h2>
        <div className="mt-6 grid gap-4">
          {extra.map((guide) => (
            <Link key={guide.id} href={guide.path} className="min-w-0 rounded-[24px] bg-white p-7 ring-1 ring-black/8 transition hover:bg-[#f7f8f1]">
              <h2 className="text-2xl font-semibold tracking-tight">{guide.title}</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#3f413c]">{guide.task}</p>
              <p className="mt-5 text-sm font-medium">打开说明 →</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-16 text-3xl font-semibold tracking-tight">产品理念 / 设计文档</h2>
        <p className="mt-4 max-w-2xl leading-7 text-[#3f413c]">
          以下是仍在演进的设计说明，不代表每个模块都已在公开版本中完整实现。Deep Dive、Idea State 等未开放能力只在这里介绍。
        </p>
        <Link href="/vision/" className="mt-4 inline-block font-semibold underline underline-offset-4">看完整产品理念 →</Link>
        <div className="mt-6 grid gap-4">
          {docs.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              className="min-w-0 rounded-[24px] bg-white p-7 ring-1 ring-black/8 transition hover:bg-[#f7f8f1]"
            >
              <h2 className="text-2xl font-semibold tracking-tight">{doc.title}</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#3f413c]">{doc.body}</p>
              <p className="mt-5 text-sm font-medium">阅读设计文档 →</p>
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
