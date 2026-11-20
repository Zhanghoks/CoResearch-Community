import Link from "next/link";
import { FaqList } from "./faq-list";
import { SpaceSwitcher } from "./space-switcher";
import { Workflow } from "./workflow";
import {
  githubUrl,
  issuesUrl,
  newIssueUrl,
  principles,
  productDemoCta,
  productDemoHref,
  roles,
  spaceDocUrl,
} from "../content";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#262626]";

export function SiteStory() {
  return (
    <div>
      <section id="workflow" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          四步，从兴趣走到可验证的下一步
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
          研究者不必先写好完整计划。CoResearch 希望把探索、深读、边界判断和修订连成一条可以回头的路径。
        </p>
        <div className="mt-12">
          <Workflow />
        </div>
      </section>

      <section id="world" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          一个研究世界，两个相互影响的空间
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
          Literature Space 保存可追溯的证据，Idea Space 记录你的探索轨迹。两边一起生长，而不是两份分开的笔记。
        </p>
        <div className="mt-10">
          <SpaceSwitcher />
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          多 Agent 协作，服务一次有依据的判断
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
          目标不是把几篇论文的方法拼在一起，而是走完一条推理链：问题、Gap、相似挑战、可迁移机制、候选方法和验证计划。这些角色描述的是目标协作机制，不代表公开版本已经完整实现。
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <article key={role.title} className="rounded-[24px] bg-white p-7 ring-1 ring-black/8">
              <h3 className="text-xl font-semibold">{role.title}</h3>
              <p className="mt-3 leading-7 text-[#3f413c]">{role.body}</p>
            </article>
          ))}
        </div>
        <ol className="mt-10 grid gap-3 text-sm leading-6 text-[#3f413c] md:grid-cols-2">
          {principles.map((item, index) => (
            <li key={item} className="rounded-2xl bg-[#f4f6ee] px-5 py-4">
              <span className="mr-2 font-semibold text-[#6d7a3a]">0{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section id="community" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">社区与反馈</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
          本页介绍 CoResearch。如需交流体验、提交 Bug 或讨论设计，请使用本仓库的 Issues。先搜索是否已有类似问题，再分享你的场景。
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <CommunityCard
            title="提交 Bug"
            body="写清复现步骤、预期行为、实际行为，以及必要的环境信息。"
            href={newIssueUrl}
            action="新建 Issue"
          />
          <CommunityCard
            title="提出建议"
            body="描述真实科研场景、当前困难，以及希望改善的使用流程。"
            href={newIssueUrl}
            action="写下场景"
          />
          <CommunityCard
            title="参与讨论"
            body="Explore、两个 Space、Frontier 和多 Agent 协作，都可以在 Issues 里展开。"
            href={issuesUrl}
            action="查看 Issues"
          />
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">常见问题</h2>
        <div className="mt-8">
          <FaqList />
        </div>
      </section>

      <section
        id="get-started"
        className="mx-auto max-w-6xl px-5 pb-20"
        aria-label="下一步"
      >
        <div className="rounded-[32px] bg-[#262626] px-8 py-10 text-[#fdfff7] md:px-12 md:py-12">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            下一步：先看一次产品演示
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
            运行演示使用当前 CoResearch 展示组件的离线 viewer 和合成教学数据，用来说明研究工作流，不是一次真实模型请求，也不代表已上线功能。如需反馈问题或讨论设计，请到本仓库的 Issues。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={productDemoHref}
              className="rounded-full bg-[#a9ff63] px-5 py-3 text-sm font-medium text-[#262626] transition hover:bg-[#c0ff8a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9ff63]"
            >
              {productDemoCta} →
            </Link>
            <a
              href={issuesUrl}
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              前往社区与反馈
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-[#6b6d66] md:flex-row md:items-center md:justify-between">
          <p>CoResearch · 产品介绍页</p>
          <div className="flex flex-wrap gap-5">
            <a href={githubUrl} className={`hover:text-[#262626] ${focusRing}`}>
              GitHub
            </a>
            <a href={issuesUrl} className={`hover:text-[#262626] ${focusRing}`}>
              GitHub Issues
            </a>
            <a href={spaceDocUrl} className={`hover:text-[#262626] ${focusRing}`}>
              Space 文档
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CommunityCard({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <article className="flex flex-col rounded-[24px] bg-white p-7 ring-1 ring-black/8">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 flex-1 leading-7 text-[#3f413c]">{body}</p>
      <a href={href} className={`mt-6 text-sm font-medium ${focusRing}`}>
        {action} →
      </a>
    </article>
  );
}
