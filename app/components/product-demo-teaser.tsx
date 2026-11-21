import Image from "next/image";
import Link from "next/link";
import { productDemoCta, productDemoHref, productWorkflow } from "../content";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function ProductDemoTeaser() {
  return (
    <section id="product-demo" className="mx-auto max-w-6xl px-5 py-16 md:py-20" aria-labelledby="product-overview-title">
      <p className="text-xs font-semibold tracking-widest text-[#4c6b83]">PRODUCT / EXPLORE</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="product-overview-title" className="text-4xl font-semibold tracking-tight md:text-5xl">在 CoResearch 里，研究是怎么开始的？</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#3f413c]">
            在对话里发送 Explore，对照一组候选方向与代表论文，再沿着选中的方向继续细分。此前的方向和依据仍然可回看。
          </p>
        </div>
        <Link href={productDemoHref} className="rounded-full bg-[#293f53] px-5 py-3 text-sm font-medium text-white hover:bg-[#3d5a74] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#293f53]">
          {productDemoCta} →
        </Link>
      </div>
      <figure className="mt-8">
        <Link href={productDemoHref} aria-label="进入真实 Explore 界面的离线演示" className="block overflow-hidden rounded-[18px] border border-[#c9d8e1] bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#293f53]">
          <Image
            src={`${basePath}/product/core-explore-preview.webp`}
            width={1112}
            height={515}
            alt="CoResearch Explore 实际界面：左侧研究方向卡，中间跨镜头身份保持方向图，右侧演示论文的全文状态和适用条件"
            className="block h-auto w-full"
            sizes="(min-width:1200px) 1112px, 100vw"
          />
        </Link>
        <figcaption className="mt-2 text-sm leading-6 text-[#546778]">实际 Core 展示组件截图 · 同一长视频案例 · 内容为合成教学数据</figcaption>
      </figure>
      <ol className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Explore 的三个操作">
        {productWorkflow.map(({title, description}, index) => (
          <li key={title} className="rounded-xl border border-[#dce5ea] bg-white px-4 py-3">
            <h3 className="font-semibold text-[#293946]"><span className="mr-2 text-xs text-[#4c6b83]">0{index+1}</span>{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[#546778]">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
