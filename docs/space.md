# Space | Research World 中的 Literature Space 与 Idea Space

> **Research World 是 CoResearch 的统一研究世界；Literature Space 描述前人研究，Idea Space 描述用户在其中的研究位置、判断和探索路径。** 两者相互关联，让研究者能够从已有知识出发，定位方向、逼近 Frontier，并尝试设计新的 Method。

[返回社区 README](../README.md) · [Explore](actions/01-explore.md) · [Deep Dive / Deep Research](actions/02-deep-dive-deep-research.md)

> **文档性质**：这是一份面向社区的产品心智模型与目标交互说明，不是数据库迁移方案，也不代表完整的知识图谱、Gap Finder 或 Innovator 已在公开版本上线。文中示例节点、连线和研究结论均为概念示意；真实科学判断必须以实际文献证据为准。

## 1. 为什么需要 Research World？

传统的论文管理工具通常以“文件和标签”组织资料；一次性的 Deep Research 往往产生一份报告，随后研究过程又回到新的会话。

CoResearch 想要的是另一个连续过程：

**用户进入前人研究构成的世界 → 找到感兴趣的具体研究位置 → 理解周围的研究关系 → 识别可能的知识边界 → 寻找方法上的突破机会 → 继续修正自己的研究构想。**

它不是将每篇论文简单挂到一棵分类树上，也不是在用户每次提问时都生成一个互不关联的新 Idea。已有研究的知识结构与用户的探索轨迹，需要能够相互参照，并随证据持续演化。

其中，**Idea State 不是一轮研究结束后才生成的阶段报告**。它是该 Idea 上实时演化的研究状态：有意义的新证据出现时就更新认识，并据此重新形成下一步 Intent。完整定义见 [4.2 Idea State：实时演化的研究状态](#live-idea-state)。

因此，**Research World 同时包含 Literature Space 与 Idea Space**。它是一个概念上的研究环境，不要求物理上必须有一个“存放所有人类知识”的单体数据库。

~~~text
+------------------------------------------------------------------------------------------------+
| RESEARCH WORLD  [one conceptual research environment]                                          |
|                                                                                                |
|   Prior evidence meets user-specific research decisions                                        |
|                                                                                                |
|   +----------------------------------------+     +----------------------------------------+    |
|   | LITERATURE SPACE  [prior research]     |     | IDEA SPACE  [user research path]       |    |
|   |                                        |     |                                        |    |
|   | Domains / subfields / directions       |     | Focus / stable Idea                    |    |
|   | Papers / PaperCards / evidence         | <-> | State: formulation / knowledge         |    |
|   | Problems / methods / mechanisms        |     | Agenda / next Intent                   |    |
|   | Evaluation / results / limitations     |     | Candidate methods / proposals          |    |
|   | Versioned relations and coverage       |     | Revision and action history            |    |
|   +----------------------------------------+     +----------------------------------------+    |
|                                                                                                |
|   Explore: locate a direction    Deep research: test a boundary                                |
|   Frontier: evidence-based hypothesis, not a proven fact                                       |
|   Innovation: grounded gap + transferable mechanism -> proposal                                |
+------------------------------------------------------------------------------------------------+
~~~

上图中的双向关联主要意味着：文献证据影响用户的研究认识；用户新的 Intent 又决定接下来需要在 Literature Space 中检索、核查或扩展哪些内容。

## 2. 三个层次：Research World、两个知识空间、产品界面

这里的 **Space** 容易与现有产品里的 Canvas Space 混淆，必须分开理解。

| 名称 | 它是什么 | 不是什么 |
| --- | --- | --- |
| **Research World** | 统一的研究语义世界，包含 Literature Space 与 Idea Space | 一个额外的 UI 页面或宣称完整收录全人类科研的数据库 |
| **Literature Space** | 在可访问研究范围内持续积累的论文知识、证据、关系与覆盖情况 | 只按标题分类的 PDF 文件夹 |
| **Idea Space** | 用户围绕一个或多个 Idea 形成的实时研究状态、候选方法、Intent 与修订轨迹 | 文献空间的拷贝，或等某个 Skill 结束后才一次性生成的阶段摘要 |
| **Product Space / Canvas** | 项目内用来摆放 Paper、Direction、Idea、Note 等节点的可视化工作区域 | Literature 或 Idea 知识的独立真相来源 |
| **Conversation** | 用户向 Research Lead 提问、下达 Research Action、讨论和审阅结果的交互入口 | 自动拥有所有相关项目的私有研究记录 |
| **Research Scope** | 数据访问、写入和复用的权限边界 | Research World 中的学科分类 |
| **Workspace** | Agent 执行命令及使用文件的运行目录（工程术语） | 前述研究知识空间 |

**Canvas 是一种投影，Conversation 是一种入口，Research World 是研究的语义组织方式。** 它们不应分别维护互相矛盾的论文事实或当前 Idea 正文。

## 3. Literature Space：前人研究的知识图谱式表示

### 3.1 它要回答什么？

Literature Space 不只是回答“有哪些论文”，还要回答：

- 研究领域如何分化成 Subfield 和 Direction？不同方向有什么交叉？
- 某个 **Problem** 已被哪些论文研究？
- 哪些 **Method / Mechanism** 被用来解决它？它们如何比较或改进？
- 哪些 **Benchmark / Metric / Protocol** 被用于评估？结果的可比范围是什么？
- 哪些研究报告了 **Limitation、失败条件或未解决问题**？
- 这些关系是否足以提出可复查的 **Gap / Frontier Candidate**？

知识单位既包括 Paper，也包括论文内部提取的研究问题、方法、评价、结果、限制，以及由多份证据支持的关系。

### 3.2 它的连接不是只有 Citation

下面是**虚构的关系示意**，不是关于 Agent Memory 真实文献的事实断言：

~~~text
[DOMAIN: Agent Systems]
          |
          v
[SUBFIELD: Memory] ------ related_to ------> [SUBFIELD: Planning]
          |
          v
[DIRECTION: Memory Updating]
          |
          +----- studies ----> [PROBLEM: outdated/conflicting memory]
          |                                 |
          +----- includes ----> [PAPER A]   |  analogous challenge
          |                      |          |             |
          |                      v          v             v
          |                  [METHOD A]  [CHALLENGE]  [OTHER DOMAIN]
          |                      |                        |
          |                      v                        v
          |                [EVALUATION A]           [MECHANISM B]
          |                      |                        |
          |                      v                        |
          +----------------> [LIMITATION L] <--- transfer candidate
                                    |
                                    v
                            [GAP HYPOTHESIS]
                                    |
                                    v
                            [FRONTIER CANDIDATE]
~~~

相较于 Paper A 引用 Paper B，CoResearch 更关心为什么它们有研究上的关系。例如：

| 关系（示意语义） | 含义 |
| --- | --- |
| Direction — contains / overlaps — Direction | 研究方向之间有层级或交叉 |
| Paper — studies — Problem | 论文研究了哪个问题 |
| Paper — proposes — Method | 论文提出了何种方法 |
| Method — addresses — Challenge | 方法试图解决什么困难 |
| Method — evaluated_on — Benchmark | 方法在什么条件下被评价 |
| Result — reported_in — Paper | 某项结果来自何篇文献 |
| Method — limited_by — Limitation | 哪些条件限制了方法有效性 |
| Method B — extends / contrasts — Method A | 两种方法有哪些改进或差异 |
| Challenge A — analogous_to — Challenge B | 两个领域是否存在可迁移的相似困难 |

这些是**知识图谱的目标关系语义**，不代表已有相同名称的数据库边类型或接口。图谱可以逐步构建，不必在第一版把所有关系结构化。

<a id="papercard"></a>

### 3.3 PaperCard、Evidence 与版本

**PaperCard** 是论文研究内容的结构化知识表示，而非 Canvas 上的小卡片外观。它的内容包括元数据、Problem、Challenge、Method、Evaluation、Results、Limitations 和原文证据等。

重要边界：

1. 论文内容必须来自实际可读取的材料；全文、部分全文、摘要级阅读需要明确区分。
2. 一条关系可能是“论文报告”“Agent 推断”或“用户假设”，不能混为同一种确定事实。
3. 来源应能固定到具体论文、Card 版本、字段及证据锚点。
4. PaperCard 重新阅读生成新版本后，旧引用仍保持指向旧版本；相关判断可以标记需要复查。
5. 检索未命中、来源失败和文献尚未覆盖，不代表研究问题不存在。

**Research World 是增量可探索的图，而不是预先构建完成的全域知识图谱。** 未检索区域、阅读深度与来源限制应始终可见。

## 4. Idea Space：用户在知识世界中的探索轨迹

Idea Space 不是“再保存一份文献”。它描述：**对这个用户而言，当前研究焦点在哪里、已有证据意味着什么、下一步应该研究什么。**

### 4.1 Idea、Idea State、Agenda 与 Intent

| 对象 | 核心问题 | 更新方式 |
| --- | --- | --- |
| **Idea** | 用户持续发展的研究主体是什么？ | 保持稳定身份，不因问题收窄就自动新建 |
| **Formulation** | 当前 Problem、Hypothesis、Approach 等构想写成什么？ | 沿用 Living Idea 12 Sections；核心修改由用户确认 |
| **Epistemic State** | 目前知道什么、存在哪些冲突、哪些证据不足？ | 出现有证据的认识变化时立即提交版本化增量 |
| **Agenda** | 尚有什么值得研究？哪些问题更紧迫？ | 保存候选研究问题及优先级理由；可随新证据调整 |
| **Research Intent** | 根据**最新** State，下一步最值得减少什么不确定性？ | 关联特定 State Revision、用户目标和完成标准；State 变化后重新评估 |
| **Research Action** | 本轮实际获授权研究什么？ | 由用户发起的有界任务；执行中可以产生进度和 State 增量 |
| **Idea Revision** | 研究认识或核心构想改变了什么、为什么？ | 保存版本、原因、证据与用户决定；认识增量不必等到 Action 结束 |

从用户心智模型看，**Idea State 就是当前 Idea 的研究进展与位置，并且在研究进行中持续变化**。在正式版本化数据中，应明确它属于哪个 Idea：同一 Research Scope 可以包含多个 Idea，同一 Conversation 可以显式选定当前 Idea。不能把整个项目的所有 Idea 强行合并成一个 State，也不能把聊天记录本身当作权威 State。

普通学术问答也可以只收集私有材料，而**不必隐式创建一个长期 Idea**。

<a id="live-idea-state"></a>

### 4.2 Idea State：实时演化的研究状态

> Idea State 是 CoResearch 的实时研究状态，而非阶段性静态报告。
>
> 在 Research World 中，用户的 Idea 具有持续存在的身份。随着 Explore、Deep Dive、Deep Research 及其他研究行为开展，新的论文证据、方法理解、研究缺口、反证和候选创新机制不断进入系统。
>
> Research Lead 持续判断这些新信息对当前 Idea 的意义，并通过可追溯的增量更新维护 State。已知、未知、争议、Frontier Assessment 和 Agenda 可以随着有意义的研究进展实时演化；用户维护的核心 Formulation 则通过直接编辑或 Proposal 确认机制变化。
>
> Research Intent 根据最新 State 动态形成下一步探索建议，用户的明确选择决定下一次实际 Research Action。Conversation 和 Canvas 始终呈现同一个版本化状态，并允许用户在研究过程中观察、干预和修正探索路径。

因此，CoResearch 的核心循环是：

**Research Action → Evidence → Live State Update → Intent Re-evaluation → 下一次 Research Action。**

State 是持续运行的认知中心。Explore、Deep Dive、Deep Research 是围绕它工作的研究能力，不属于“谁执行完谁就拥有一份新 State”。Canvas 是这个动态过程的主要可视化交互界面。

~~~text
RESEARCH WORLD
  Literature Space 持续增长
  Idea Space 持续演化
            |
            v
  LIVE IDEA STATE
  Current Focus · Known / Unknown · Frontier
  Method · Evaluation · Agenda
            |
            |  每次有意义的研究发现都可能引发更新
            v
  RESEARCH INTENT
  基于最新 State，决定下一步希望探索什么
            |
     +------+------+------+
     |             |      |
     v             v      v
 Explore      Deep Dive  Deep Research
     |             |      |
     +------+------+------+
            |
            v
 新证据 → Research Lead 重新评估 State → 新的 Intent
~~~

Research Lead 在每次获得有意义的新信息后，重新评估当前 State，并把变化呈现给用户。新的 State 又会影响后续 Research Intent 和研究路径。系统不会等一个 Skill 全部执行完毕，才统一生成新状态。

#### 实时更新具体意味着什么

下面用一个**模拟**主题说明时间顺序：“多镜头视频生成中的人物身份一致性”。它不是已核验的文献结论。假设用户已经启动一次 Deep Dive：

| 研究进展 | State 的实时变化 |
| --- | --- |
| 用户确定细分方向 | `Current Focus` 更新为用户确认的方向 |
| 检索到身份保持研究 | Literature Space 新增论文候选；State 显示已有材料的覆盖进展 |
| 读完关键论文 | `Known Findings` 新增有证据支持的认识 |
| 发现两个方法存在冲突 | `Conflicting Evidence` 新增待核查问题 |
| 确认某种方法存在具体限制 | `Frontier Understanding` 增加候选边界判断 |
| 发现新论文挑战原判断 | 旧判断保留并标记需复查，同时更新相关 Unknown |
| 研究执行结束 | 保存本轮结果，以及建议的 Next Intent |

用户应在 Deep Dive 尚未全部结束时，就能看到系统已经形成了哪些认识。搜索到 20 篇论文，首先是执行进度。只有新证据实际改变了研究认识、未知或判断，才形成正式的 State 增量。不是每次 Tool 调用都创建一次永久 State Revision。

#### 三种同时可见的层次

实时性需要分成三层，避免把候选说法写成已确认的研究结论：

| 层次 | 含义 | 更新方式 |
| --- | --- | --- |
| **Live Research Progress** | 正在搜索、阅读、分析什么 | 高频展示；不改变 Idea State 版本 |
| **Epistemic State** | 已知、未知、证据冲突、Frontier 判断 | 出现有效知识变化时，立即提交版本化增量 |
| **Confirmed Formulation** | 用户正式接受的 Focus、Hypothesis、Approach、Method | Agent 可以实时提出 Proposal；核心正文由用户确认后变化 |

Agent 发现一个候选 Gap 时，可以立即显示：“发现可能的研究缺口——正在核查最近邻方法。” 这时它仍是候选。最近邻工作、反证和实验条件尚未核完之前，不能把它标成“已确认的科研创新”。

同样，Agent 可以实时产生 Method Candidate，供用户查看。未经用户确认，它不能覆盖用户正在维护的 Method 正文。

#### 增量如何进入正式 State

目标设计沿用已有的 **State Commit + Outbox**，在研究运行过程中增加增量提交和事件通知。事件记录、版本化状态和读取投影可以参考 Event Sourcing 的关系，但这里不另建一套完整的 Event Sourcing / CQRS 平台；那种架构会明显增加系统复杂性。实现上复用现有 PostgreSQL 提交机制，只增加必要的增量事件和实时视图。可参考 [Event Sourcing 模式说明](https://learn.microsoft.com/azure/architecture/patterns/event-sourcing) 与 [MDN：Server-sent events](https://developer.mozilla.org/docs/Web/API/Server-sent_events)。

产品里一次研究迭代提交（`record_idea_iteration`）目前会在研究结果落地时，把 Epistemic、Agenda、Proposal、Next Intent 和 Receipt 合并到同一次提交。这样能保证该次回执的原子性，但还不能表达研究进行过程中的持续增量。

目标行为是：**保留这个最终 Receipt**，同时增加内部能力 `commit_state_delta`。仍在执行、且权限有效的 Action，可以提交有证据支持的认识变化。每一次增量提交继续受这些约束：

- Research Scope 与写入权限；
- 当前 State 版本，避免用旧版本覆盖新认识；
- 幂等，避免同一次发现重复入库；
- 该 Action 的截止时间与取消状态。

~~~text
Research Action 执行中
        |
        v
Paper / Tool 产生新结果
        |
        v
Research Lead 评估 State Delta
        |
        +---- 有实质认知变化？ ----+
        |                          |
        否                         是
        |                          |
        v                          v
保存执行进度              权限、证据、版本检查
（不产生 State 版本）              |
                                   v
                          增量提交 Idea State
                                   |
                                   v
                          Outbox / SSE Event
                                   |
                    +--------------+--------------+
                    |                             |
                    v                             v
             Conversation                      Canvas
             读取最新授权 State            同步同一 State 版本
                    |
                    v
          更新候选 Research Intent
          （仍需用户选择才成为下一次 Action）
~~~

前端可以继续使用现有 SSE 连接。SSE 的具名事件、事件 ID 和断线重连，适合把新 State 版本通知给 Canvas 和 Conversation。建议事件数据只携带 `ideaId`、`stateVersion`、`changedComponents` 和 `actionId`。前端收到后读取最新授权 State，再刷新界面。未经版本和权限校验的 Agent 文本，不能直接写进正式文档。

本仓库记录的是这一目标行为。`record_idea_iteration` 与 `commit_state_delta` 是产品实现中的提交能力名称，不是本社区仓库里的源代码文件。

#### Canvas 上如何看到演化

Canvas 应在当前 Idea 节点旁保持一个 **Idea State · Live View**，而不是等研究全部完成后突然出现一批结果节点。这个视图展示当前 Focus、已知与未知、Frontier Assessment 和 Agenda，并在 State 变化时给出简短 Delta，例如：

- “新增一项方法限制”
- “一项 Gap 判断受到挑战”
- “建议复查 Methodology”

用户点击 Delta，就能看到对应证据和历史版本。不需要为此打开完整 Agent 日志。拖动时间或版本来回看同一个 State 如何随新证据和反证演化，可以作为回顾方式；用于说明的示例数据必须标明为模拟，不能呈现成已核实的科研结论。

执行进度和正式认识继续分开：正在检索、正在阅读，显示为 Live Research Progress；只有已提交的 State 版本才进入 Live View 的正式内容。

### 4.3 探索轨迹不是一条不可逆直线

用户可以从 Agent Memory 开始，先探索 Retrieval，再转到 Updating，也可以在新的证据出现后返回早期 Direction、修改假设或放弃不合适的 Method。

状态历史需要保留：

- 当前位置和已确认的 Research Focus；
- 曾经探索过的 Direction 以及当时选择或放弃的理由；
- 支持与挑战原有判断的 Finding / Assessment；
- 尚未解决的 Unknown、备选方案与研究 Agenda；
- 已提交的 Revision、未审阅的 Proposal，以及下一步 Intent。

用户不必看到“State、Intent、Revision”这些内部词汇。界面可以表达成：**当前构想 / 已知与未知 / 下一步探索 / 研究历史**。

## 5. 两个 Space 之间如何建立关系？

最重要的不是简单地将 Paper 添加到 Idea 节点下面，而是保存“**这份研究证据为什么与当前 Idea 有关系**”。

~~~text
LITERATURE SPACE                   IDEA SPACE
+----------------------+           +------------------------+
| Paper P @ version v3 |           | Idea I @ revision r8   |
| Problem / Method     |           | Focus / Hypothesis     |
| Result / Limitation  |           | Findings / Unknowns    |
| Evidence anchor A    |           | Agenda / Next Intent   |
+----------------------+           +------------------------+
           |                                    ^
           | fixed reference + relation role    |
           +------------------------------------+
                          |
              +------------------------+
              | "supports / challenges"|
              | "baseline / inspiration"|
              | "reported vs inferred" |
              +------------------------+

New PaperCard version v4 DOES NOT replace citations pinned to v3.
New evidence can trigger a review mark; core Idea text changes by
member edit or accepted Proposal, not by silent overwriting.
~~~

例如，同一篇 PaperCard 可以同时作为：

- Direction A 的代表论文；
- Direction B 的对照方法；
- 某个 Idea Hypothesis 的支持证据；
- 另一个候选 Method 的 Baseline；
- 一次跨领域 Innovator 搜索的机制启发。

因此，**论文事实与“论文对某个 Idea 的意义”要分开存储**。

概念上的关联记录至少应说明：

| 关联信息 | 作用 |
| --- | --- |
| Source reference | 关联哪篇论文、哪个 Card 版本及什么证据位置 |
| Target reference | 关联哪个 Direction、Idea Section、Finding 或候选 Method |
| Relation role | 支持、挑战、比较、Baseline、启发等 |
| Relevance reason | 为什么这份材料对目标重要 |
| Interpretation origin | 论文作者陈述、Agent 推断还是用户假设 |
| Review status | 是否因新增证据或来源版本变化需要重新判断 |

这些关联需要可追溯、可撤回错误解释，但不能因此删除不可变的原始证据和历史。

**Literature Space 记录论文报告了什么；Idea Space 记录这些报告对当前研究意味着什么。** 由 Research Lead 解释影响，Host 执行权限、版本与正式提交校验。

## 6. Space 如何承载完整研究 Workflow？

~~~text
[User Seed / Paper / Existing Idea]
                 |
                 v
         [EXPLORE: navigation]
                 |
        +--------+---------+
        |                  |
        v                  v
[Literature Space]   [Idea State: current position]
  papers + directions       |
        |                   v
        |          [Next Intent suggestion]
        |                   |
        +----- (user starts Action) ----+
                            |
                            v
               [DEEP DIVE / DEEP RESEARCH]
                            |
        [Live State update when evidence changes understanding]
                            |
                  +---------+---------+
                  |                   |
                  v                   v
          [Evidence / history]   [Gap / Frontier]
                  |                   |
                  |            +------+------+
                  |            |             |
                  |            v             v
                  |      [Gap Finder]   [Innovator]
                  |            |             |
                  |            +------+------+
                  |                   |
                  |                   v
                  |          [Method candidate]
                  |                   |
                  +---------+---------+
                            |
                            v
                   [Review / Interpret]
                            |
                +-----------+-----------+
                |                       |
                v                       v
         [Literature update]     [State deltas already
                                  committed; Proposal
                                  if core text changes]
                                        |
                                        v
                                [Next Research Intent]
                                        |
                              (user authorizes next run)
~~~

### 6.1 Explore：定位

用户以 Seed、论文或已有 Idea 进入，Explore 根据目标与现有文献知识比较 Domain / Subfield / Direction。

- **Literature Space 更新**：搜索记录、实际阅读的 PaperCards、有依据的 Direction Group 和关系。
- **Idea Space 更新**：执行中出现有证据的新认识、未知或候选定位时，写入同一个 Idea State；已确认的核心 Focus 保持不变，除非用户确认。检索和阅读进度本身只作为 Live Research Progress。
- **下一步**：用户可以继续沿方向 Explore，也可以进入 Deep Dive 或 Deep Research。

### 6.2 Deep Dive / Deep Research：逼近 Frontier

进入明确的细分方向后，系统关注历史发展、Method、Evaluation、Limitations、最近邻研究及反证。

- **Deep Dive** 偏向解决一个窄问题：具体机制、近邻方法、评价比较、假设支持或挑战。
- **Deep Research** 偏向方向级研究综合：发展脉络、方法地图、评价范围与阶段性报告。
- **Literature Space 更新**：更多可核验证据、比较关系、阅读覆盖与候选 Frontier 的依据。
- **Idea Space 更新**：有依据的 Finding、Assessment、Unknown 和 Agenda 在认识形成时写入 State，不必等本轮 Action 结束。核心 Idea 文字如需改动，则提出 Proposal，由用户确认。

### 6.3 Gap Finder × Innovator：寻找候选突破路径

Frontier Exploration 以 [IdeaScientist](https://arxiv.org/abs/2610.04074) 为启发，包含两个互补方向：

**Gap Finder（纵向）**：在目标 Direction 内核查最接近的已有 Method，找到具体的机制缺陷、限制与反证，判断 Gap 是否真的存在。

**Innovator（横向）**：在其他 Domain 或 Direction 中寻找解决类似 Challenge 的机制，解释可迁移的核心 Intuition、迁移前提与失败风险。

两者产出经 Method Synthesis 与 Reviewer 审查，形成**候选 Method / Research Proposal**。这不是已被实验证实的突破。

> Gap Finder、Innovator、Reviewer 是目标协作机制，不代表公开版本里已具备这些独立 Agent。当前产品可以先借助 Research Lead、Searcher 和受限分析子任务逐步实现对应能力。

### 6.4 Idea Iteration：在研究进行中更新认识

每次获得有意义的新信息，Research Lead 都重新评估当前 State。评估要回答：

1. 新材料实际证明或报告了什么？
2. 与当前 Idea 的已知判断有何关系？
3. 哪些判断需要改变、需要复查，或有依据地维持？
4. 是否需要用户审阅 Hypothesis、Approach、Focus 等核心 Section 修改？
5. 哪个剩余 Unknown 最值得成为下一 Research Intent？

认识变化通过 [4.2](#live-idea-state) 的增量提交进入 Idea State，并可以据此更新候选 Intent。Action 结束时仍保存本轮 Receipt 和建议的 Next Intent。没有新信息的合法研究可以留下“维持现状及原因”的回执，不虚构 Revision。

**Intent 是下一次探索的倾向和理由，不是自动执行权限。** 用户没有明确开始新的 Action 时，当前授权的研究结束。实时更新 State 不表示系统可以在后台连续启动下一轮。

## 7. 用户实际在哪个界面看到 Space？

| 用户看到的入口 | 应看到什么 | 数据一致性要求 |
| --- | --- | --- |
| **Project / Space / Canvas** | Paper、Direction、Idea、研究成果，以及当前 Idea 旁的 State Live View 与简短 Delta | Canvas 节点只是正式对象的投影；移动、展开、删除布局节点不改写研究事实。Delta 指向已提交版本和证据 |
| **Conversation** | 对 Research Lead 的消息、目标 Chip、引用、研究过程、State 变化与结果回执 | 与 Canvas 读取同一个授权 State。发起研究 Action 的入口；不根据 UI 选择偷偷启动任务 |
| **Paper details / Literature view** | PaperCard、实际阅读深度、固定证据和相关研究关系 | 论文内容和来源版本与其他界面一致 |
| **Idea details** | 当前 Living Idea、研究认识、Agenda、Next Intent、Proposal 和历史 | 同一个 ideaId、同一个正式 State head；研究进行中即可看到已提交增量 |
| **Tasks / Outputs** | 正在搜索或阅读什么、哪些材料已保存、Report 和待完成工作 | Live Research Progress 与 Idea State 版本分开；未通过提交的文本不能宣称已更新 Idea |

产品层的 Space 可以是用户放置和组织知识的地方；**它不应变成第二套平行维护的论文库或 Idea 数据库**。跨 Conversation 和 Canvas 打开相同 Idea，应显示一致的版本和证据引用。

### 7.1 多个 Idea、共享材料与权限

一个合法 Research Scope 内可以有多个 Idea，并在有权限时复用同一篇 PaperCard；**每个 Idea 的 State、Intent 和 Revision 分开维护**。

一个被分享的 Canvas 并不自动授权他人读取创建者的私有 Idea State、反馈、Conversation 历史或本地 Workspace 文件。权限检查属于 Research Scope / Host 层，不由可视化连线决定。

当用户从 Conversation 切换到另一 Space 或另一个 Idea，已经开始的 Research Action 仍然属于启动时的原目标；用户界面的切换不能转移正在执行的任务或其结果归属。

## 8. 一个从 Space 出发的示例

下面是**虚构的研究路径**，仅用于说明对象与空间如何协作，不代表已验证的 Agent Memory 学术事实。

用户输入：“我对 LLM Agent 的长期记忆感兴趣。”

1. **Explore** 在 Literature Space 中收集并组织相关研究方向，用户沿 Memory → Updating → Conflict-aware Updating 逐层深入。
2. **Idea Space** 记录该用户为什么关注这个分支、已经了解什么、仍不知道什么，并推荐下一步研究问题。
3. **Deep Research** 建立该 Direction 的方法演进与评价地图；Deep Dive 进一步比较一个具体机制是否已被前人解决。
4. **Gap Finder** 尝试核实“某种现有冲突处理机制存在特定失败条件”这一候选 Gap；有反证则纠正它。
5. **Innovator** 从其他研究方向寻找处理相似 Challenge 的机制，分析是否具备迁移条件。
6. **Reviewer / Method Synthesis** 组织候选方案、最接近的 Prior Art、假设的突破点及可证伪评价设计。
7. **Idea Space** 在上述研究进行中就写入新发现、冲突、待复查判断和候选 Method；核心 Hypothesis 或 Approach 的正式改变等待用户确认。Action 结束时保存本轮 Receipt 与建议的 Next Intent。
8. **Next Intent** 指出下一次最值得验证的具体问题，但不会未经用户授权自动开始新研究。

整条路径中，前人知识的图谱逐渐扩展，用户的 Idea State 也持续更新。**这就是 CoResearch 所说的在 Research World 中探索并寻求 Frontier Breakthrough。**

## 9. 必须守住的设计原则

1. **双空间属于一个 World**：不要把 Research World 错画成与 Literature Space、Idea Space 并列的第三个平行空间。
2. **图谱不等于文件夹**：核心是 Problem、Method、Evaluation、Limitation 与跨论文、跨领域的可解释关系。
3. **知识不是无条件确定的**：论文报告、Agent 推断、用户假设、未覆盖区域和 Frontier Candidate 必须区分。
4. **Idea 是用户研究的连续对象**：同一个 Idea 可以收窄 Focus、修订 Hypothesis 和更换方法，不因为每轮探索而自动新建。
5. **Idea State 是实时演化的认知中心**：它不属于任何一个 Skill。有意义的新证据出现时更新已知、未知、争议、Frontier Assessment 和 Agenda；Research Intent 随最新 State 重新形成。执行进度本身不产生 State 版本。核心 Formulation 由用户直接编辑或确认 Proposal 后变化。
6. **State 和 Intent 不等于任务状态机**：State 表示研究认识，Intent 表示下一步倾向，Action 才承载执行授权。
7. **一篇论文多处关联，但不重复制造知识副本**：论文事实保存在 Literature Space，针对 Idea 的解释保存在关系与 Idea State 中。
8. **前端投影同一个已授权版本**：Conversation 与 Canvas 通过版本通知刷新后，读取同一份正式 State。未校验的 Agent 文本不直接成为文档正文。
9. **候选突破必须经得起核验**：发现可能的 Gap 可以立即显示为正在核查的候选；在近邻工作和反证核完之前，不能标成已确认的科研创新。
10. **实时认识与有界授权同时成立**：每一轮 Action 仍有权限、截止时间和最终 Receipt。State 可以在这一轮内部持续更新；下一轮 Action 仍由用户主动授权。

---

**延伸阅读**：[Explore：研究方向导航](actions/01-explore.md) · [Deep Dive / Deep Research：研究边界与方法创新](actions/02-deep-dive-deep-research.md)

**社区讨论**：[提出关于 Research World、Literature Space 或 Idea Space 的建议](https://github.com/Zhanghoks/CoResearch-Community/issues/new?template=feature_request.md)。已经发生的故障请用 [Bug 反馈](https://github.com/Zhanghoks/CoResearch-Community/issues/new?template=bug_report.md)。
