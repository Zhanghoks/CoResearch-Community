# Spec | 产品使用演示动画（Product Usage Demo）

> **状态**：`ready-for-agent`
> **来源**：对 coworkos-ai.github.io 展示动画的逆向分析（见会话记录）+ CoResearch 主页既有叙事结构
> **领域词汇**：遵循 docs/space.md 与 docs/actions/*（Research World、Literature Space、Idea Space、Explore、Deep Dive / Deep Research、Gap Finder、Innovator、Reviewer、Idea State、候选 Method）

## Problem Statement

主页用文字和静态卡片描述了 CoResearch 的多 Agent 协作（Research Lead、Gap Finder、Innovator、Reviewer）和四步工作流（Explore → Deep Dive → Frontier → Revision），但访问者无法**看到产品实际用起来是什么样子**：研究者如何发起一次研究、Agent 之间如何接力、证据如何变成候选方法、Idea State 如何随证据演化。抽象的图谱故事（Research World 图谱讲解）解释了"世界是什么"，但没有回答"我作为研究者怎么用它"。访问者需要一段不需要操作、不需要注册就能看懂的**产品使用过程演示**。

## Solution

在主页新增「产品使用演示」章节：一段**产品 UI 级别的 mock 动画**，在一个仿产品界面的容器（对话面板 + Agent 状态条 + 证据卡片 + Idea State 面板）中，自动循环播放一次完整研究流程——从研究者输入一个模糊兴趣开始，经 Explore 定位方向、Deep Dive 重建脉络、Gap Finder 提出待核实缺口、Innovator 带回跨领域机制、Reviewer 审查，到 Idea State 演化出候选方法并由研究者确认。滚入视口自动播放，悬停暂停细看，可手动逐阶段步进；页面明确标注这是产品理念演示、界面与内容均为 mock。

## User Stories

1. As a 首次访问者, I want 滚到演示区就能自动看到产品完整使用流程, so that 我不用注册或操作就能判断这个产品是否和我有关
2. As a 首次访问者, I want 演示看起来像真实产品界面而不是示意图, so that 我能想象自己使用它的样子
3. As a 首次访问者, I want 每个阶段配有简短说明文字, so that 我知道当前画面在流程中的哪一步、为什么
4. As a 首次访问者, I want 演示自动循环, so that 我中途才注意到它也能从头看起
5. As a 潜在用户, I want 看到研究者输入模糊兴趣后产品给出方向选择, so that 我理解 Explore 是"帮我定位"而不是"替我做研究"
6. As a 潜在用户, I want 看到论文证据卡片带着问题/方法/局限标签出现, so that 我理解产品主张的可追溯证据是什么形态
7. As a 潜在用户, I want 看到 Gap Finder 的候选缺口标注"待核实", so that 我不会误以为产品会替我断言研究空白
8. As a 潜在用户, I want 看到 Innovator 从相邻领域带回机制并检查迁移前提, so that 我理解跨领域迁移是候选而非结论
9. As a 潜在用户, I want 看到 Reviewer 的审查清单逐项给出通过/待议, so that 我理解候选方法要过新颖性与可行性检查
10. As a 潜在用户, I want 看到 Idea State 面板随阶段更新已知/未知/Intent, so that 我理解"想法随证据演化"的具体含义
11. As a 潜在用户, I want 最后看到研究者确认候选方法的动作, so that 我理解关键决策始终由人做
12. As a 潜在用户, I want 四个 Agent 卡片实时显示谁在工作、谁待命, so that 我一眼看懂协作分工
13. As a 忙碌的访问者, I want 悬停时动画暂停, so that 我能细看当前阶段的内容而不被打断
14. As a 想跳着看的访问者, I want 上一阶段/下一阶段按钮和阶段跳转选择器, so that 我能按自己的节奏看
15. As a 使用键盘的用户, I want 左右方向键切换阶段, so that 我无需鼠标也能操作
16. As a 开启"减少动态效果"的用户, I want 直接看到最终完整状态的静态画面, so that 我既不被动画打扰也能获得同样的信息
17. As a 小屏/矮屏用户, I want 演示切换为手动翻页模式并保持可读, so that 我的设备不会卡顿或截断
18. As a 移动端用户, I want 各面板纵向堆叠且字号适配, so that 我在手机上也能看懂流程
19. As a 无障碍用户, I want 演示区有清晰的 aria 标签、当前阶段可被读屏感知, so that 我能非视觉地跟随流程
20. As a 慢网络用户, I want 演示不依赖大体积媒体资源, so that 它随页面快速加载
21. As a 切换标签页后回来的用户, I want 演示在页面不可见时暂停而不是继续跑, so that 回来时画面不跳变、资源不浪费
22. As a 谨慎的研究者, I want 页面明确标注"产品理念演示、界面为 mock、候选结论须核验", so that 我不会误信演示中的研究结论
23. As a 想深入了解的访问者, I want 演示区和 Explore / Deep Dive 文档有链接呼应, so that 我能从演示自然走到设计文档
24. As a 仓库维护者, I want 演示的阶段状态是纯函数且可逆, so that 我能回归测试且修改阶段定义不怕破坏其他阶段
25. As a 仓库维护者, I want mock 文案集中定义, so that 我调整演示叙事不用碰动画机制代码
26. As a 仓库维护者, I want 演示复用站点既有设计语言（配色/字体/卡片样式）, so that 主页视觉保持统一且不需要新依赖
27. As a 仓库维护者, I want 动画不引入新的运行时依赖, so that 包体积和构建复杂度不增加

## Implementation Decisions

### 模块划分（复用 research-story 架构，四个模块 + 一个容器）

1. **场景定义模块（scenario）**：纯数据与纯函数。
   - 阶段（phase）数组：每阶段含 id、标签、标题、说明文案、时长（秒）与各面板的目标状态（可见性、状态文本、清单项状态、消息显隐、树可见节点/连线集合、焦点节点）。
   - `sampleScenario(progress)`：progress（以阶段为单位的连续值）→ 完整 ScenarioState（所有面板状态的快照）。整数 progress 严格等于该阶段 settled 状态；插值只用于阶段内进度（驱动入场动画进度与 caption 切换），不做跨状态混合。
   - 方向深化树的节点/连线与画布坐标作为声明式数据导出（树布局确定、可测试）；阶段状态声明可见集合（累积只增）与焦点节点。
   - 与 story.ts 相同的可逆性契约：同一 progress 永远得到同一状态，采样方向无关。
   - mock 内容（对话消息、文献卡片文案、清单项）全部为模块内字面量；渲染路径禁用 `Math.random` / `Date.now`。

2. **舞台应用器（stage renderer）**：`createDemoRenderer(root)` 缓存元素引用，逐帧把 ScenarioState 写到 DOM：
   - 根元素 `data-phase` 属性 + 阶段进度自定义属性；
   - Agent 状态文本与状态 class、清单项状态 class、Idea State 计数与 Intent 文本；
   - 方向树的节点/连线可见性切换与金色焦点标记的位移（坐标来自场景模块的树布局声明）；
   - paintKey 缓存：状态未变的帧不重复写 DOM（参考逆向所得 CoworkOS architecture.js 的 paintKey 手法）。
   - 不触碰 React；不查询除初始化外的 DOM。

3. **产品 UI mock 组件集（React，静态结构，站点自有 Tailwind 词汇）**：
   - 窗口顶栏 + Agent 状态横条（四张紧凑卡：Research Lead / Gap Finder / Innovator / Reviewer，状态由应用器驱动）。
   - `ConversationPanel`（左列）：研究者与 Research Lead 的对话流；消息元素带序号 data 属性，由 CSS 按阶段错峰入场，不在帧循环里挂载/卸载。
   - `DirectionTree`（右列 canvas）：静态 SVG 树，节点/连线/边界线带 data 属性由应用器切换；焦点标记为独立 g 元素由应用器位移。
   - `EvidenceCardList`：Deep Dive 阶段的文献卡片（标题 + 问题/方法/局限标签）。
   - `GapCard` / `MechanismCard` / `ReviewChecklist`：候选缺口（标注"待核实"）、跨领域机制与迁移前提、审查清单三个特化卡片（底部工作区行）。
   - `IdeaStatePanel`：树 canvas 下的页脚条（已知/未知/Intent + 候选方法 chip）。
   - 样式全部复用站点 Tailwind 工具类（白卡、`rounded-2xl`、`#262626` 墨色、`#6d7a3a` 橄榄强调），不引入新依赖；动态状态样式（pd-on 可见性、活动/清单状态、关键帧）集中在一个小 CSS 文件。

4. **演示容器（ProductDemo，React 客户端组件）**：
   - 时钟：rAF 循环累积 `elapsed += min((now - last) / 1000, 上限)`（参考 CoworkOS architecture.js：帧间隔钳制，节流环境下停帧而非跳变）；
   - 播放条件（全部满足才走帧）：IntersectionObserver 可见 + `document.hidden === false` + 未悬停 + 未手动暂停 + 未启用减少动态效果；
   - 阶段推进：elapsed 对阶段时长取模循环；阶段切换时通过 React state 更新 caption（与 StoryNarration 同模式：key 变化触发入场动画），帧内不重渲染 React；
   - 手动控制：上一/下一阶段按钮、阶段选择器、左右方向键；手动操作时暂停自动播放，显式"重新播放"恢复；
   - `prefers-reduced-motion` 或矮屏：进入手动模式，reduce 时直接呈现最终阶段完整静态状态；
   - 诚实标注文案："产品理念演示 · 界面与内容为 mock，不代表已上线功能；候选结论均须核验"。

### 演示阶段脚本（7 阶段，总时长约 33 秒循环）

**布局（用户确认的 v2）**：窗口顶部为 Agent 状态横条；左列是 agent 对话框（研究者 ↔ Research Lead）；右列是"方向深化树"canvas——一棵随阶段不断生长的 SVG 树：根（模糊兴趣）→ 候选方向（未选中的淡化保留）→ 聚焦分支 → 问题/方法/局限证据叶 → 待核实缺口（伴随虚线研究边界出现）→ 相邻领域机制分支（曲线连回缺口）→ 边界之外的候选方法（金色）。金色焦点标记随阶段在树节点间移动；Idea State 以页脚条形式挂在树 canvas 下。

对齐 docs/actions 的动作词汇与主页 Agent 卡片：

1. **发起**：研究者输入"我对视频生成感兴趣，但不确定该做什么"；Research Lead 建议先 Explore；其余 Agent 待命。
2. **Explore · 定位方向**：呈现候选细分方向（生成一致性 / 主体身份 / 跨镜头叙事），研究者选择「跨镜头身份保持」；Idea State 的 Intent 更新。
3. **Deep Dive · 重建脉络**：文献证据卡片依次入场（问题 → 方法 → 局限），Research Lead 协调中。
4. **Gap Finder · 候选缺口**：与最接近工作对比，给出一个标注"待核实"的候选缺口，并显示反例检查动作。
5. **Innovator · 跨领域迁移**：从相邻领域（如控制系统的状态估计）带回机制卡，迁移前提清单部分满足、一项待验证。
6. **Reviewer · 审查**：新颖性 / 可行性 / 迁移前提三项清单逐项给出 通过 / 通过 / 待议。
7. **Revision · 演化与确认**：Idea State 更新（已知增加、未知减少），生成候选方法卡，提示"由研究者决定下一步"；循环回绕到阶段 1。

### 页面放置

主页「多 Agent 协作」章节之后、「社区」章节之前，新增 `<section>`「产品使用演示」：标题 + 演示舞台 + 阶段说明条 + 控制条 + 免责说明。锚点 id 便于文档互链。

### 性能与降级纪律（来自逆向结论的直接映射）

- 不在动画帧内进行 React 协调或 DOM 查询；
- IntersectionObserver + visibilitychange + 悬停三重门控停帧；
- CSS transition 承担全部入场动效，帧循环只翻状态；
- 无 WebGL、无粒子、无媒体资源，纯 DOM/SVG；
- 环境级 rAF 饥饿（如嵌入式浏览器）下表现为暂停而非状态错乱——时间累积基于帧回调，不基于墙钟。

## Testing Decisions

- **好的测试只断言外部行为**：阶段采样契约（确定性、可逆、边界钳制）与应用器的 DOM 效果（属性、class、文本），不断言内部结构或实现细节。
- **新增测试脚本**，完全复用 test-research-story.mjs 的既有模式（TypeScript 转译到临时目录 + node:assert 断言）：
  1. 转译场景定义与应用器模块，零语法错误；
  2. 采样确定性：对一组 progress 值，正向采样两次结果 JSON 相等；反向遍历同一值结果与正向一致；
  3. 阶段边界：`sampleScenario(整数)` 的状态与阶段定义的 settled 状态深度相等；
  4. 钳制：NaN / 负数 / 超界 progress 分别落到首阶段与末阶段；
  5. 阶段 id 唯一、阶段时长为正、阶段覆盖的面板状态键完整；
  6. 应用器在假元素（与现有测试相同的 make 模式）上：写入 `data-phase`、按阶段切换可见性 class、更新状态文本；对相同状态重复调用不产生新的 DOM 写入（paintKey 生效）；
  7. reduce 路径：渲染器对终态阶段的输出等于完整显示状态。
- **prebuild 串联**：现有 prebuild 脚本改为依次运行研究故事测试与本测试，任一失败即阻断构建。
- **Prior art**：scripts/test-research-story.mjs（转译 + 纯函数采样断言 + 假元素应用器断言）。
- **浏览器手测清单**（不入自动化）：滚入自动播放、悬停暂停、手动步进与跳转、循环回绕无跳变、reduce 静态终态、移动端纵向堆叠可读。

## Out of Scope

- 真实后端 / API / 数据集成：本演示全部为 mock 内容，不发起任何真实研究任务；
- 可交互输入：用户不能真的输入研究兴趣，演示不可操作，只能观看与步进；
- 开屏类动画（logo → 粒子形变、星空流星等 WebGL/Canvas 效果）：独立潜在 feature，另行立项；
- 音频旁白与字幕音轨；
- 国际化与多语言文案（mock 文案仅中文）；
- 演示内容的录屏导出或分享卡片生成；
- 深色模式适配（站点当前无深色主题）。

## Further Notes

- **逆向技术映射**（本 spec 的实现手法来源）：
  - CoworkOS architecture.js 的"可见时自动播放 + 阶段时间轴 + paintKey 缓存 + getPointAtLength 式状态驱动" → 场景定义/应用器/容器的整体架构；
  - 其 rAF 帧间隔钳制（`min(dt, .05)`）→ 节流环境停帧不跳变；
  - 其 hover 高亮/pin 与阶段说明联动 → 阶段 caption + 手动步进；
  - starfield.js 的多重暂停条件（reduced-motion / forced-colors / visibility / 页面生命周期）→ 播放条件门控。
- 逆向过程中观察到嵌入式浏览器可能出现 rAF 饥饿：本设计的时间累积方式保证该场景下演示暂停而非错乱，属预期降级。
- 演示区与 docs/actions/01-explore.md、02-deep-dive-deep-research.md 的叙述顺序刻意一致，后续文档改动应同步检查阶段脚本文案。
- 诚实边界：主页既有声明"不代表每个 Agent 角色都已在公开版本中完整实现"对本演示同样适用，且演示区内需再次标注。
