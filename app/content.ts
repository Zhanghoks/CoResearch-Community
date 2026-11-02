export const githubUrl = "https://github.com/Zhanghoks/CoResearch-Community";
export const issuesUrl = "https://github.com/Zhanghoks/CoResearch-Community/issues";
export const bugIssueUrl =
  "https://github.com/Zhanghoks/CoResearch-Community/issues/new?template=bug_report.md";
export const suggestionIssueUrl =
  "https://github.com/Zhanghoks/CoResearch-Community/issues/new?template=feature_request.md";
export const spaceDocUrl =
  "https://github.com/Zhanghoks/CoResearch-Community/blob/main/docs/space.md";
export const paperCardDocUrl = `${spaceDocUrl}#papercard`;

export const docs = [
  {
    title: "Research World · Literature Space · Idea Space",
    body: "双空间怎么分工。PaperCard 是结构化论文知识，不是 Canvas 外观卡片。Idea State 随证据实时演化是目标机制，不代表公开版本已默认具备。",
    href: spaceDocUrl,
  },
  {
    title: "Explore",
    body: "从模糊兴趣逐层定位到 Domain、Subfield 和更具体的研究方向。",
    href: "https://github.com/Zhanghoks/CoResearch-Community/blob/main/docs/actions/01-explore.md",
  },
  {
    title: "Deep Dive / Deep Research",
    body: "进入细分方向后如何梳理脉络。找 Gap 与跨域迁移写在 Deep Research 的愿景里，不代表这些能力已经默认上线。",
    href: "https://github.com/Zhanghoks/CoResearch-Community/blob/main/docs/actions/02-deep-dive-deep-research.md",
  },
] as const;

export const steps = [
  {
    id: "explore",
    index: "01",
    title: "Explore",
    summary: "从兴趣定位到细分方向",
    status: "",
    body: "从一个宽泛的兴趣、一篇论文或已有想法开始。沿着 Domain、Subfield、Research Direction 比较候选方向，先找到适合自己的位置。",
  },
  {
    id: "dive",
    index: "02",
    title: "Deep Dive",
    summary: "看清脉络、方法与局限",
    status: "",
    body: "进入细分方向后，梳理问题如何被提出、方法如何演进、实验能否比较，以及现有结论停在哪里。",
  },
  {
    id: "research",
    index: "03",
    title: "Deep Research",
    summary: "综合方向，并看见找 Gap / 跨域迁移",
    status: "找 Gap / 跨域迁移：愿景",
    body: "Deep Research 用来在细分方向上综合发展脉络、方法、评价和局限。找 Gap、把其他领域的机制迁过来，是这一步里的愿景表述：Gap Finder 与 Innovator 是目标协作机制，不代表公开版本已默认具备。候选方案仍需近邻工作核查。",
  },
  {
    id: "revise",
    index: "04",
    title: "Idea 修订",
    summary: "按证据修订当前认识",
    status: "实时 Idea State：目标机制",
    body: "认识发生变化时，保留修改内容、理由、证据和你的确认。Idea State 随证据实时演化是目标机制，不代表公开版本已默认具备。下一步建议仍要研究者确认；Focus 和核心构想由你决定后才改变。",
  },
] as const;

export const spaces = [
  {
    id: "literature",
    title: "Literature Space",
    question: "前人研究了什么？",
    body: "领域、论文、问题、方法、实验、结果和局限连成可追溯的证据关系。一篇论文可以关联多个问题，一个方法也可以跨领域迁移。PaperCard 是结构化的论文知识，不是 Canvas 上的外观卡片。",
  },
  {
    id: "idea",
    title: "Idea Space",
    question: "你正在研究什么？",
    body: "这里记录当前焦点、已知与未知、边界判断和修订历史。Idea State 随有意义的新证据实时演化，是目标机制，不代表公开版本已默认具备。核心构想由你确认后才改变。",
  },
  {
    id: "loop",
    title: "Research Loop",
    question: "下一步做什么？",
    body: "一次研究动作带来证据，证据再形成下一步建议。历史保留下来，下一轮仍由你授权。实时更新 Idea State 仍是目标机制，尚未默认上线。",
  },
] as const;

export const roles = [
  {
    title: "Research Lead",
    status: "",
    body: "结合当前研究状态选择问题、协调任务，并解释结果。它不代替你确认研究方向。",
  },
  {
    title: "Gap Finder",
    status: "愿景 · 未默认上线",
    body: "目标机制：在目标领域内部检查最相关的工作，找出方法缺陷和证据不足。不代表公开版本已具备这一独立角色。",
  },
  {
    title: "Innovator",
    status: "愿景 · 未默认上线",
    body: "目标机制：到相邻问题里寻找相似挑战，带回可能迁移的机制和研究直觉。不代表公开版本已具备这一独立角色。",
  },
  {
    title: "Reviewer",
    status: "愿景 · 未默认上线",
    body: "目标机制：检查候选思路是否已被覆盖，以及新颖性、可行性和迁移前提。不代表公开版本已具备这一独立角色。",
  },
] as const;

export const principles = [
  "先帮助研究者找到合适的方向，再决定如何深化。",
  "重要判断尽量连到真实论文、实验条件和可追溯证据。",
  "不只指出 Gap，也探索可能的机制与跨领域迁移。",
  "区分论文陈述、Agent 推断和用户假设。",
  "目标机制：Idea State 随有意义的新证据实时演化，并保留 Intent、反馈和修订历史。不代表公开版本已默认具备。",
  "Agent 整理信息，研究者决定目标并验证贡献。",
] as const;

export const faqs = [
  {
    q: "CoResearch 是什么？",
    a: "它是一个面向科研探索和 Idea 发展的多智能体研究协作设想。目标是帮助研究者从模糊兴趣出发，定位细分方向，理解前人做到了哪里，再设计有依据、可验证的下一步。",
  },
  {
    q: "页面上的能力现在都能用吗？",
    a: "不能直接这么理解。公开落地页展示的是理念与目标能力。Gap Finder、Innovator、Reviewer，以及 Idea State 随证据实时演化，都是愿景中的目标机制，不代表公开版本已默认具备。现在可以通过本社区提交反馈。",
  },
  {
    q: "Research World 是一个完整的论文库吗？",
    a: "不是。它应随着检索、阅读和研究反馈逐步长出来。没有检索到，不能直接当成前人没有研究过。",
  },
  {
    q: "Agent 会替我决定研究方向吗？",
    a: "不会。已确认的 Focus、Hypothesis 和 Method 仍由你决定。下一步需要你授权后，才会变成实际研究动作。",
  },
  {
    q: "如何反馈问题或建议？",
    a: "在 CoResearch-Community 仓库提交 Issue。Bug 和建议请分开填写：Bug 写清复现步骤，建议描述真实科研场景。产品源码仍在准备开源，暂未公开。分享材料前请去掉密钥、账号和私人研究数据。",
  },
] as const;
