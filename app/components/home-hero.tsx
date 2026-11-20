import Link from "next/link";
import { productDemoCta, productDemoHref } from "../content";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#262626]";

export function HomeHero() {
  return (
    <section data-home-hero className="px-5 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
      <div className="mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium">
            <span className="rounded-full bg-[#a9ff63] px-2 py-0.5 text-xs font-semibold">
              Vision
            </span>
            Explore the Research World
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:mt-5 md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            在前人的研究世界里，找到下一步
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#3f413c] md:mt-5 md:text-lg md:leading-8">
            从模糊的研究兴趣出发，定位细分方向，看清前人做到了哪里，再在证据之上设计可验证的新方法。
          </p>
          <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
            <Link
              href={productDemoHref}
              className={`rounded-full bg-[#262626] px-5 py-3 text-sm font-medium text-white transition hover:bg-black ${focusRing}`}
            >
              {productDemoCta} →
            </Link>
            <a
              href="#workflow"
              className={`rounded-full bg-white px-5 py-3 text-sm font-medium ring-1 ring-black/10 transition hover:bg-[#f7f8f1] ${focusRing}`}
            >
              看研究工作流
            </a>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[#6b6d66]">
            这是一套持续演进的设计。页面描述愿景和工作流，不代表每个 Agent
            角色都已在公开版本中完整实现。下方演示为产品界面复刻 mock，不代表已上线功能。
          </p>
        </div>

        <div className="overflow-hidden rounded-[24px] md:rounded-[28px]">
          <img
            src={`${basePath}/hero-wanderer.jpg?v=576`}
            alt="雾海上的漫游者，象征研究者在已有知识的边界上眺望下一步"
            width={1024}
            height={576}
            className="block h-52 w-full object-cover object-[center_42%] sm:h-60 lg:h-full lg:min-h-[400px] lg:max-h-[min(62vh,520px)]"
          />
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_30px_80px_rgba(38,38,38,0.06)] md:mt-12">
        <div className="grid md:grid-cols-2">
          <article className="border-b border-black/8 p-6 md:border-r md:border-b-0 md:p-8">
            <p className="text-xs font-medium tracking-[0.16em] text-[#6d7a3a]">
              LITERATURE SPACE
            </p>
            <h2 className="mt-3 text-xl font-semibold">前人研究了什么</h2>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-[#3f413c]">
              <li>Domain → Subfield → Direction</li>
              <li>Paper → Problem → Method</li>
              <li>Evaluation → Result → Limitation</li>
            </ul>
          </article>
          <article className="bg-[#f7f8f1] p-6 md:p-8">
            <p className="text-xs font-medium tracking-[0.16em] text-[#6d7a3a]">IDEA SPACE</p>
            <h2 className="mt-3 text-xl font-semibold">你正在推进什么</h2>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-[#3f413c]">
              <li>Idea State：随证据实时演化的已知与未知</li>
              <li>Intent：下一步最值得解决的不确定性</li>
              <li>Revision：证据、理由和用户确认</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
