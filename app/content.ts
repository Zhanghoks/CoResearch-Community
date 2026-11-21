export const githubUrl = "https://github.com/Zhanghoks/CoResearch-Community";
export const issuesUrl = "https://github.com/Zhanghoks/CoResearch-Community/issues";
export const newIssueUrl = "https://github.com/Zhanghoks/CoResearch-Community/issues/new";
export const spaceDocUrl =
  "https://github.com/Zhanghoks/CoResearch-Community/blob/main/docs/space.md";

export const siteUrl = "https://zhanghoks.github.io/CoResearch-Community";
export const siteName = "CoResearch";
export const siteTitle = "CoResearch · 从研究兴趣到有依据的方向";
export const siteDescription =
  "用 Explore 探索研究兴趣、比较方向、查看 PaperCard，并沿选定方向继续细分。";
export const productDemoHref = "/product";
export const productDemoCta = "看 Explore 演示";

export const productWorkflow = [
  { title: "准备并发送 Explore", description: "输入研究兴趣，选中 Explore 后还需要点击发送，才会开始探索。" },
  { title: "对照方向与论文", description: "比较 Direction Group 的候选方向，从方向卡或图谱打开论文预览，辨认摘要和全文状态。" },
  { title: "选一个方向继续", description: "选择「细分方向」会准备下一轮任务；再次发送后，子方向挂在原方向下。" },
] as const;

export const docs = [
  {
    title: "Research World · Literature Space · Idea Space",
    body: "双空间怎么分工，以及 Idea State 如何在研究进行中实时演化。",
    href: spaceDocUrl,
  },
  {
    title: "Explore",
    body: "从模糊兴趣逐层定位到 Domain、Subfield 和更具体的研究方向。",
    href: "https://github.com/Zhanghoks/CoResearch-Community/blob/main/docs/actions/01-explore.md",
  },
  {
    title: "Deep Dive / Deep Research",
    body: "进入细分方向后，如何梳理脉络、识别 Frontier，并探索可验证的突破方法。",
    href: "https://github.com/Zhanghoks/CoResearch-Community/blob/main/docs/actions/02-deep-dive-deep-research.md",
  },
] as const;

export const steps = [
  {
    id: "explore",
    index: "01",
    title: "Explore",
    summary: "从兴趣定位到细分方向",
    body: "从一个宽泛的兴趣、一篇论文或已有想法开始。沿着 Domain、Subfield、Research Direction 比较候选方向，先找到适合自己的位置。",
  },
  {
    id: "dive",
    index: "02",
    title: "Deep Dive",
    summary: "看清脉络、方法与局限",
    body: "进入细分方向后，梳理问题如何被提出、方法如何演进、实验能否比较，以及现有结论停在哪里。",
  },
  {
    id: "frontier",
    index: "03",
    title: "Frontier",
    summary: "在证据边界上寻找突破",
    body: "Gap Finder 检查目标领域里的具体缺陷，Innovator 寻找其他领域可迁移的机制。候选方案仍需近邻工作核查。",
  },
  {
    id: "revision",
    index: "04",
    title: "Revision",
    summary: "State 随证据演化",
    body: "Idea State 随着新证据持续更新，不必等一轮研究结束。下一步 Intent 根据最新状态提出建议；Focus 和核心构想仍由研究者确认。",
  },
] as const;

export const spaces = [
  {
    id: "literature",
    title: "Literature Space",
    question: "前人研究了什么？",
    body: "领域、论文、问题、方法、实验、结果和局限连成可追溯的证据关系。一篇论文可以关联多个问题，一个方法也可以跨领域迁移。",
  },
  {
    id: "idea",
    title: "Idea Space",
    question: "你正在研究什么？",
    body: "Idea State 记录当前焦点、已知与未知、Frontier 判断和修订历史，并随有意义的新证据更新。核心构想由你确认后才改变。",
  },
  {
    id: "loop",
    title: "Research Loop",
    question: "下一步做什么？",
    body: "一次研究动作带来证据，证据更新 Idea State，最新状态再形成下一步建议。历史保留下来，下一轮仍由你授权。",
  },
] as const;

export const roles = [
  {
    title: "Research Lead",
    body: "结合当前研究状态选择问题、协调任务，并解释结果。",
  },
  {
    title: "Gap Finder",
    body: "在目标领域内部检查最相关的工作，找出方法缺陷和证据不足。",
  },
  {
    title: "Innovator",
    body: "到相邻问题里寻找相似挑战，带回可能迁移的机制和研究直觉。",
  },
  {
    title: "Reviewer",
    body: "检查候选思路是否已被覆盖，以及新颖性、可行性和迁移前提。",
  },
] as const;

export const principles = [
  "先帮助研究者找到合适的方向，再决定如何深化。",
  "重要判断尽量连到真实论文、实验条件和可追溯证据。",
  "不只指出 Gap，也探索可能的机制与跨领域迁移。",
  "区分论文陈述、Agent 推断和用户假设。",
  "Idea State 随有意义的新证据实时演化，并保留 Intent、反馈和修订历史。",
  "Agent 整理信息，研究者决定目标并验证贡献。",
] as const;

export const faqs = [
  {
    q: "CoResearch 是什么？",
    a: "它是一个研究工作台。你可以从一个兴趣开始，用 Explore 找方向，查看相关 PaperCard，再沿着选中的方向继续探索。",
  },
  {
    q: "页面上的能力现在都能用吗？",
    a: "本页演示的是 Explore、方向续探和证据查看，使用合成数据，不调用真实搜索或模型。图谱故事用于解释研究思路；Gap Finder、Innovator 等是设计中的角色。",
  },
  {
    q: "Research World 是一个完整的论文库吗？",
    a: "不是。它应随着检索、阅读和研究反馈逐步长出来。没有检索到，不能直接当成前人没有研究过。",
  },
  {
    q: "Agent 会替我决定研究方向吗？",
    a: "不会。Agent 可以在研究过程中更新有证据的认识，并实时提出候选判断。已确认的 Focus、Hypothesis 和 Method 仍由你决定。下一步 Intent 需要你授权后才会变成实际研究动作。",
  },
  {
    q: "如何反馈问题或建议？",
    a: "在 CoResearch-Community 仓库提交 Issue。反馈 Bug 时写清复现步骤；提建议时描述真实科研场景。分享材料前请去掉密钥、账号和私人研究数据。",
  },
] as const;
