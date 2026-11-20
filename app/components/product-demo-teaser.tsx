import Link from "next/link";
import { productDemoCta, productDemoHref } from "../content";
import { DemoWindow } from "./product-demo/DemoPanels";

export function ProductDemoTeaser() {
  return (
    <section id="product-demo" className="mx-auto max-w-6xl px-5 py-16 md:py-20" aria-label="产品页入口">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">看 CoResearch 跑一次研究</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#3f413c]">
            产品页里有一段自动播放的运行演示：研究者输入一句模糊兴趣，Agent
            们在会话与图谱里接力推进，直到可验证的候选方法。
          </p>
        </div>
        <Link
          href={productDemoHref}
          className="rounded-full bg-[#262626] px-5 py-3 text-sm font-medium text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#262626]"
        >
          {productDemoCta} →
        </Link>
      </div>
      <Link
        href={productDemoHref}
        aria-label="进入产品页观看运行演示"
        className="mt-10 block overflow-hidden rounded-[32px] bg-[#101011] p-4 ring-1 ring-black/8 transition hover:ring-black/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#262626] md:p-6"
      >
        <div className="pointer-events-none mx-auto max-w-4xl">
          <DemoWindow settled />
        </div>
      </Link>
      <p className="mt-4 text-center text-xs leading-6 text-[#8a8c84]">
        产品界面复刻 mock · 内容为演示用数据，不代表已上线功能；候选结论均须核验。
      </p>
    </section>
  );
}
