import { FaqList } from "./faq-list";
import { SpaceSwitcher } from "./space-switcher";
import { Workflow } from "./workflow";
import {
  bugIssueUrl,
  githubUrl,
  issuesUrl,
  paperCardDocUrl,
  principles,
  roles,
  spaceDocUrl,
  suggestionIssueUrl,
} from "../content";

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
        <p className="mt-6 max-w-2xl text-sm leading-6 text-[#3f413c]">
          <span className="mr-2 inline-flex rounded-full bg-[#f4f6ee] px-2 py-0.5 text-xs font-semibold ring-1 ring-black/10">
            现在 / 还在建
          </span>
          现在可以通过本社区提交反馈。公开落地页展示的是理念与目标能力；部分研究流程、多 Agent 协作，以及 Idea State 随证据实时演化，仍在建设，尚未默认上线。
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
                <li>
                  <a href={paperCardDocUrl} className="font-medium underline decoration-black/20 underline-offset-2">
                    PaperCard
                  </a>
                  ：结构化论文知识，不是 Canvas 外观卡片
                </li>
              </ul>
            </article>
            <article className="bg-[#f7f8f1] p-8 md:p-10">
              <p className="text-xs font-medium tracking-[0.16em] text-[#6d7a3a]">IDEA SPACE</p>
              <h3 className="mt-3 text-2xl font-semibold">你正在推进什么</h3>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-[#3f413c]">
                <li>Idea State：已知与未知（实时演化是目标机制，未默认上线）</li>
                <li>Intent：下一步最值得减少的不确定性</li>
                <li>Idea 修订：保留证据、理由和你的确认</li>
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
          研究者不必先写好完整计划。路径按用户动作展开：Explore、Deep Dive、Deep Research、Idea 修订，并且可以回头。找 Gap、跨域迁移，以及 Idea State 随证据实时演化，是目标机制，尚未默认上线。
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
          Literature Space 保存可追溯的证据，Idea Space 记录你的探索轨迹。两边一起生长，而不是两份分开的笔记。{" "}
          <a href={paperCardDocUrl} className="font-medium underline decoration-black/20 underline-offset-4">
            PaperCard
          </a>{" "}
          是结构化的论文知识，不是 Canvas 上的外观卡片。
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
          Gap Finder、Innovator、Reviewer 是愿景中的目标协作机制，不代表公开版本已默认具备这些独立角色。目标推理链仍是：问题、有依据的 Gap、相似挑战、可迁移机制、候选方法和验证计划。
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <article key={role.title} className="rounded-[24px] bg-white p-7 ring-1 ring-black/8">
              <h3 className="text-xl font-semibold">{role.title}</h3>
              {role.status ? (
                <p className="mt-3 text-xs font-semibold tracking-wide text-[#6d7a3a]">{role.status}</p>
              ) : null}
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
          这个仓库用来交流体验。Bug 和建议分开发送：故障写复现，想法写科研场景。产品源码开源准备中，暂未公开；这里不能打开主仓源码。
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <CommunityCard
            title="提交 Bug"
            body="只报告已经发生的问题：复现步骤、预期行为、实际行为，以及必要的环境信息。"
            href={bugIssueUrl}
            action="填写 Bug"
          />
          <CommunityCard
            title="提出建议"
            body="只写希望新增或改进的能力：真实科研场景、当前困难，以及希望改善的使用流程。"
            href={suggestionIssueUrl}
            action="填写建议"
          />
          <CommunityCard
            title="参与讨论"
            body="Explore、Deep Research、两个 Space 和仍在建设的多 Agent 协作，都可以在 Issues 里展开。"
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
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-[#6b6d66] md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="font-medium text-[#262626]">CoResearch Community</p>
            <p>
              产品源码开源准备中，暂未公开。页眉进入的是本社区仓库，用来交流和反馈，不是可浏览的产品源码。
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={githubUrl} className="hover:text-[#262626]">
              社区仓库
            </a>
            <a href={bugIssueUrl} className="hover:text-[#262626]">
              反馈 Bug
            </a>
            <a href={suggestionIssueUrl} className="hover:text-[#262626]">
              提建议
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
