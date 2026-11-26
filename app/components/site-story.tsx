import { FaqList } from "./faq-list";
import { SpaceSwitcher } from "./space-switcher";
import { Workflow } from "./workflow";
import { githubUrl, issuesUrl, newIssueUrl, principles, roles, spaceDocUrl } from "../content";

export function SiteStory() {
  return (
    <div>
      <section id="top" className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:pt-16">
        <p className="inline-flex items-center gap-2 text-sm font-medium">
          <span className="rounded-full bg-[#a9ff63] px-2 py-0.5 text-xs font-semibold">
            Vision
          </span>
          Explore the Research World
        </p>
        <h2 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-balance md:text-7xl md:leading-[1.05]">
          在前人的研究世界里，找到下一步
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#3f413c] md:text-xl">
          从模糊的研究兴趣出发，定位细分方向，看清前人做到了哪里，再在证据之上设计可验证的新方法。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#workflow"
            className="rounded-full bg-[#262626] px-5 py-3 text-sm font-medium text-white"
          >
            看研究工作流
          </a>
          <a
            href={spaceDocUrl}
            className="rounded-full bg-white px-5 py-3 text-sm font-medium ring-1 ring-black/10"
          >
            阅读空间设计
          </a>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-[#6b6d66]">
          这是一套持续演进的设计。页面描述愿景和工作流，不代表每个 Agent 角色都已在公开版本中完整实现。
        </p>

        <div className="mt-14 overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_30px_80px_rgba(38,38,38,0.06)]">
          <div className="grid md:grid-cols-2">
            <article className="border-b border-black/8 p-8 md:border-r md:border-b-0 md:p-10">
              <p className="text-xs font-medium tracking-[0.16em] text-[#6d7a3a]">
                LITERATURE SPACE
              </p>
              <h3 className="mt-3 text-2xl font-semibold">前人研究了什么</h3>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-[#3f413c]">
                <li>Domain → Subfield → Direction</li>
                <li>Paper → Problem → Method</li>
                <li>Evaluation → Result → Limitation</li>
              </ul>
            </article>
            <article className="bg-[#f7f8f1] p-8 md:p-10">
              <p className="text-xs font-medium tracking-[0.16em] text-[#6d7a3a]">IDEA SPACE</p>
              <h3 className="mt-3 text-2xl font-semibold">你正在推进什么</h3>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-[#3f413c]">
                <li>Idea State：随证据实时演化的已知与未知</li>
                <li>Intent：下一步最值得解决的不确定性</li>
                <li>Revision：证据、理由和用户确认</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

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
          目标不是把几篇论文的方法拼在一起，而是走完一条推理链：问题、Gap、相似挑战、可迁移机制、候选方法和验证计划。
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
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">社区</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
          这个仓库用来交流体验、提交 Bug 和讨论设计。先搜索是否已有类似问题，再分享你的场景。
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

      <footer className="border-t border-black/8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-[#6b6d66] md:flex-row md:items-center md:justify-between">
          <p>CoResearch Community</p>
          <div className="flex gap-5">
            <a href={githubUrl} className="hover:text-[#262626]">
              GitHub
            </a>
            <a href={issuesUrl} className="hover:text-[#262626]">
              GitHub Issues
            </a>
            <a href={spaceDocUrl} className="hover:text-[#262626]">
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
      <a href={href} className="mt-6 text-sm font-medium">
        {action} →
      </a>
    </article>
  );
}
