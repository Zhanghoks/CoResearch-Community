import { FaqList } from "./faq-list";
import { githubUrl, issuesUrl, newIssueUrl, spaceDocUrl } from "../content";

export function SiteStory() {
  return (
    <div>
      <section id="community" className="scroll-mt-28 mx-auto max-w-6xl px-5 pb-12 pt-4 sm:px-8 sm:pb-16">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">社区</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#3f413c]">
          先搜索是否已有类似问题，再提交 Bug、建议或使用场景。分享材料前，请去掉密钥、账号和私人研究数据。
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

      <section id="faq" className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20">
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
