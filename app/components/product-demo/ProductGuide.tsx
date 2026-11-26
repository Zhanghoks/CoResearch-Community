const chapters = [
  { id: "deep-dive", number: "02", name: "Deep Dive", label: "查证与对照" },
  { id: "frontier", number: "03", name: "Frontier", label: "界定 Open Problem" },
  { id: "revision", number: "04", name: "Revision", label: "修订研究状态" },
] as const;

function ChapterCopy({
  chapter,
  title,
  body,
  output,
}: {
  chapter: (typeof chapters)[number];
  title: string;
  body: string;
  output: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-3 text-sm font-medium text-[#454c3e]">
        <span className="rounded-full border border-[#c9d2bd] px-2.5 py-1 tabular-nums">{chapter.number}</span>
        {chapter.name}
      </p>
      <h3 id={`${chapter.id}-title`} className="mt-5 max-w-sm text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h3>
      <p className="mt-4 max-w-md text-base leading-7 text-[#4b5147]">{body}</p>
      <p className="mt-5 border-l-2 border-[#a9ba96] pl-3 text-sm leading-6 text-[#383f33]"><strong>这一环的产出：</strong>{output}</p>
    </div>
  );
}

const auditRows = [
  { control: "方法不变", change: "改写术语、重排描述", check: "是否误报为新方法？" },
  { control: "术语不变", change: "替换核心处理步骤", check: "是否漏掉实际变化？" },
] as const;

function EvidencePanel() {
  return (
    <div className="rounded-[22px] border border-[#dce2d4] bg-white p-5 shadow-[0_10px_30px_-20px_#27362a50] sm:p-7">
      <p className="text-xs font-medium tracking-wide text-[#505b4b]">Literature Space · 对照记录</p>
      <p className="mt-2 text-xl font-semibold tracking-tight">方向 02：表述相似，不等于方法相同</p>
      <ol className="mt-5 space-y-2.5" aria-label="两组对照">
        {auditRows.map((row, i) => (
          <li key={row.control} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl bg-[#f2f5ee] p-3 sm:p-4">
            <span aria-hidden="true" className="pt-0.5 text-xs tabular-nums text-[#54624e]">0{i + 1}</span>
            <div><p className="text-sm font-semibold">{row.control} · {row.change}</p><p className="mt-1 text-sm leading-5 text-[#505b4b]">{row.check}</p></div>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm leading-6 text-[#505b4b]">两组用同一份盲评量表，按输入、核心步骤和适用条件比对。实际误判率：尚未测量。</p>
    </div>
  );
}

function FrontierPanel() {
  return (
    <div className="rounded-[22px] border border-[#dce2d4] bg-white p-5 shadow-[0_10px_30px_-20px_#27362a50] sm:p-7">
      <p className="text-xs font-medium tracking-wide text-[#505b4b]">边界判断 · 初稿</p>
      <dl className="mt-4 space-y-3 text-sm leading-6">
        <div className="rounded-xl bg-[#f2f5ee] p-4"><dt className="font-semibold">现有对照能回答</dt><dd className="mt-0.5 text-[#4b5748]">固定方法、只改写术语，观察评审会不会跟着措辞改变判断。</dd></div>
        <div className="rounded-xl border border-dashed border-[#b3a476] bg-[#fbf8ee] p-4">
          <dt className="font-semibold text-[#584822]">Open Problem · 待查证</dt>
          <dd className="mt-0.5 text-[#51472f]">当术语和方法步骤同时改变时，评审还能分清改写和实质变化吗？现有两组对照无法回答。</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-[#505b4b]">先核对近邻研究是否已有这类交叉对照。没检索到，不等于没人做过。</p>
    </div>
  );
}

function RevisionPanel() {
  return (
    <div className="rounded-[22px] border border-[#dce2d4] bg-white p-5 shadow-[0_10px_30px_-20px_#27362a50] sm:p-7">
      <p className="text-xs font-medium tracking-wide text-[#505b4b]">Idea State · 修订提案</p>
      <dl className="mt-4 text-sm leading-6">
        <div className="border-b border-[#e3e8de] pb-3"><dt className="font-medium text-[#505b4b]">原焦点</dt><dd className="mt-0.5">AI 能否判断研究方法的新颖性？</dd></div>
        <div className="border-b border-[#e3e8de] py-3"><dt className="font-medium text-[#505b4b]">建议焦点 · 待研究者确认</dt><dd className="mt-0.5 font-semibold">比较术语与方法同时变化时，评审的误报与漏报。</dd></div>
        <div className="pt-3"><dt className="font-medium text-[#505b4b]">下一步 Intent · 未执行</dt><dd className="mt-0.5">先核查已有交叉对照；若仍缺证据，再做一轮术语 × 方法的四组盲评试测。</dd></div>
      </dl>
    </div>
  );
}

const panels = [
  { title: "把一个方向查深", body: "从方向 02 出发，不急着找更多论文，先比对最近邻工作：问题、输入、核心机制、评价条件。Deep Dive 查一个机制；要梳理整个方向的演进与方法地图，再做 Deep Research。", output: "两组可比较的对照，以及目前不能下的结论。", detail: <EvidencePanel /> },
  { title: "说清楚证据停在哪", body: "把已覆盖的情况和没验证过的情况分开。Open Problem 不是系统给问题盖章，而是用当前证据说明：具体哪里还答不了，什么证据能推翻这个判断。", output: "一个带范围限定、可追查的待验证问题。", detail: <FrontierPanel /> },
  { title: "把进展变成下一步", body: "把已知、未知和判断变化记进 Idea State。Agent 可以提出修订与下一步，但不会替研究者改掉已确认的核心问题，也不会自动执行试测。", output: "一份可回看的修订提案，和一项待确认的下一步。", detail: <RevisionPanel /> },
] as const;

export function ProductGuide() {
  return (
    <section id="product-guide" aria-labelledby="product-guide-title" className="scroll-mt-28 mx-auto max-w-6xl px-5 pb-18 pt-12 text-[#273023] sm:px-8 sm:pt-20">
      <header className="max-w-3xl">
        <p className="text-xs font-medium tracking-[.12em] text-[#505b4b]">研究流程 · 同一个案例</p>
        <h2 id="product-guide-title" className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">选定方向之后，怎么继续研究？</h2>
        <p className="mt-4 text-base leading-7 text-[#4b5147] sm:text-lg">首屏的 Explore 把「新方法还是改写？」拆成两个方向。下面沿着方向 02 继续：查证据、定边界，再决定下一步要验证什么。</p>
        <p className="mt-3 text-sm leading-6 text-[#505b4b]">以下沿用演示数据，展示研究工作流，不代表真实论文结论或所有能力已上线。</p>
      </header>
      <nav aria-label="产品流程章节" className="mt-7 flex flex-wrap gap-2">
        <a href="#product-demo" className="rounded-full border border-[#d2d9cb] bg-white px-3.5 py-2 text-sm font-medium hover:border-[#68815a]">01 Explore · 回看演示 ↑</a>
        {chapters.map((chapter) => <a key={chapter.id} href={`#${chapter.id}`} className="rounded-full border border-[#d2d9cb] bg-white px-3.5 py-2 text-sm font-medium hover:border-[#68815a]">{chapter.number} {chapter.label}</a>)}
      </nav>
      <div className="mt-9 space-y-4 sm:mt-11 sm:space-y-5">
        {chapters.map((chapter, i) => {
          const panel = panels[i];
          return (
            <section key={chapter.id} id={chapter.id} aria-labelledby={`${chapter.id}-title`} className="grid scroll-mt-32 gap-6 rounded-[26px] border border-[#dce2d5] bg-[#f1f4ec] p-5 sm:p-8 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-12 lg:p-10">
              <ChapterCopy chapter={chapter} title={panel.title} body={panel.body} output={panel.output} />
              {panel.detail}
            </section>
          );
        })}
      </div>
    </section>
  );
}
