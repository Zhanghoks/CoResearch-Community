import type {
  CapabilityProfile,
  CoverageRecord,
  Counterexample,
  Direction,
  DirectionGroup,
  Evidence,
  Limitation,
  Manifest,
  OpenQuestion,
  Paper,
  ResearchWorld,
} from "../domain";
import {
  DEMO_COMMUNITY_BASELINE,
  DEMO_CORE_BASELINE,
  DEMO_FIXTURE_VERSION,
  DEMO_SCENARIO_ID,
} from "../domain";

const capabilityProfile: CapabilityProfile = {
  openTasks: ["explore"],
  lockedTasks: ["deep_dive", "deep_research"],
  ideaStateInDemo: false,
  unverified: [
    "Running Core binary and production feature flags were not verified in this Community workstream.",
    "Idea State display is source-present but capability-gated; it is excluded from this demo profile.",
    "Mobile end-to-end product behavior and live Host PreviewResourcePort were not exercised.",
  ],
};

export const manifest: Manifest = {
  scenarioId: DEMO_SCENARIO_ID,
  fixtureVersion: DEMO_FIXTURE_VERSION,
  sourceCommit: { community: DEMO_COMMUNITY_BASELINE, core: DEMO_CORE_BASELINE },
  capabilityProfile,
  synthetic: true,
};

/** Preset teaching prompt. Fixed results must not be presented as answers to arbitrary free input. */
export const INTEREST_PROMPT = "视频生成，我想找一个值得研究的问题";

const topicIntro = "演示用主题节点，用于展开 Explore，不是生产环境中的 Direction artifact。";

export const directions: readonly Direction[] = [
  {
    id: "d-video",
    name: "视频生成",
    kind: "topic",
    intro: topicIntro,
    paperIds: [],
    revisionId: "d-video-rev-1",
  },
  {
    id: "d-consistency",
    name: "生成一致性",
    kind: "direction",
    intro: "在已生成视频中保持对象、场景与运动可比较的一致表现。本条为教学方向，不是已发表结论。",
    paperIds: ["P01", "P02"],
    revisionId: "d-consistency-rev-1",
  },
  {
    id: "d-controllable",
    name: "可控生成",
    kind: "direction",
    intro: "G1 未选分支：对生成条件进行控制。保留在组内，不被删除。",
    paperIds: [],
    revisionId: "d-controllable-rev-1",
  },
  {
    id: "d-narrative",
    name: "叙事结构",
    kind: "direction",
    intro: "G1 未选分支：生成视频的叙事组织。保留在组内，不被删除。",
    paperIds: [],
    revisionId: "d-narrative-rev-1",
  },
  {
    id: "d-identity",
    name: "主体身份",
    kind: "direction",
    intro: "在生成一致性下关注主体身份是否可维持。本条由 G2 给出，父方向是生成一致性。",
    paperIds: ["P01", "P02", "P04"],
    revisionId: "d-identity-rev-1",
  },
  {
    id: "d-scene",
    name: "场景一致性",
    kind: "direction",
    intro: "G2 未选分支：场景布局与背景是否保持一致。",
    paperIds: [],
    revisionId: "d-scene-rev-1",
  },
  {
    id: "d-motion",
    name: "运动一致性",
    kind: "direction",
    intro: "G2 未选分支：运动轨迹是否可比较地保持一致。",
    paperIds: [],
    revisionId: "d-motion-rev-1",
  },
  {
    id: "d-crossshot",
    name: "跨镜头身份保持",
    kind: "direction",
    intro: "在主体身份下继续细分：跨镜头时身份是否保持。本条由 G3 给出，父方向是主体身份。",
    paperIds: ["P01", "P02", "P03", "P04", "P05", "P06"],
    revisionId: "d-crossshot-rev-1",
  },
  {
    id: "d-multi-person",
    name: "多人身份区分",
    kind: "direction",
    intro: "G3 未选分支：同时出现的多个主体如何区分。",
    paperIds: [],
    revisionId: "d-multi-person-rev-1",
  },
  {
    id: "d-style",
    name: "风格变化下身份保持",
    kind: "direction",
    intro: "G3 未选分支：风格变化时身份线索是否仍可跟随。",
    paperIds: [],
    revisionId: "d-style-rev-1",
  },
];

export const groups: readonly DirectionGroup[] = [
  {
    id: "G1",
    revisionId: "g1-rev-1",
    parent: null,
    directionIds: ["d-consistency", "d-controllable", "d-narrative"],
  },
  {
    id: "G2",
    revisionId: "g2-rev-1",
    parent: {
      groupId: "G1",
      directionId: "d-consistency",
      groupRevisionId: "g1-rev-1",
      directionRevisionId: "d-consistency-rev-1",
    },
    directionIds: ["d-identity", "d-scene", "d-motion"],
  },
  {
    id: "G3",
    revisionId: "g3-rev-1",
    parent: {
      groupId: "G2",
      directionId: "d-identity",
      groupRevisionId: "g2-rev-1",
      directionRevisionId: "d-identity-rev-1",
    },
    directionIds: ["d-crossshot", "d-multi-person", "d-style"],
  },
];

const demoAuthor = ["CoResearch Demo"] as const;

export const papers: readonly Paper[] = [
  {
    id: "P01",
    cardVersion: "p01-card-v1",
    title: "演示文献 A · 身份嵌入约束",
    authors: demoAuthor,
    source: "demo-fixture",
    synthetic: true,
    demoTag: "演示文献",
    abstract:
      "【合成教学摘要】在短片段、单镜头、无遮挡的示意设定下，用身份嵌入约束主体外观。该摘要不是真实论文结论。",
    method:
      "【示意方法】将身份嵌入作为附加约束写入生成过程。仅用于演示如何展示方法段落，不代表已发表算法。",
    conditionSection:
      "【示意条件】短片段；单镜头；主体持续可见、无遮挡。不得外推到遮挡、硬切或长序列。",
    excerpts: [
      {
        id: "P01-ex-short-visible",
        heading: "短片段、无遮挡下的身份约束",
        text: "在持续可见的短片段中，身份嵌入可以约束主体外观。这是教学用示意片段，不是实验结果。",
        conditions: ["短片段", "单镜头", "无遮挡", "主体持续可见"],
      },
    ],
    availability: "full-text",
  },
  {
    id: "P02",
    cardVersion: "p02-card-v1",
    title: "演示文献 B · 跨镜头参考对应",
    authors: demoAuthor,
    source: "demo-fixture",
    synthetic: true,
    demoTag: "演示文献",
    abstract:
      "【合成教学摘要】在主体持续可见的条件下，演示已有切镜参考对应。不能外推到遮挡后恢复。",
    method:
      "【示意方法】在相邻镜头之间建立参考对应，要求切换前后主体保持可见。",
    conditionSection:
      "【示意条件】切镜发生时主体持续可见。遮挡后重新出现不在本条材料的适用范围内。",
    excerpts: [
      {
        id: "P02-ex-cut-visible",
        heading: "持续可见条件下的切镜对应",
        text: "当主体在切镜前后始终可见时，参考对应可以继续对齐身份线索。遮挡后恢复未被本条材料覆盖。",
        conditions: ["主体持续可见", "有切镜", "无遮挡后恢复"],
      },
    ],
    availability: "full-text",
  },
  {
    id: "P03",
    cardVersion: "p03-card-v1",
    title: "演示文献 C · 频繁锚点更新",
    authors: demoAuthor,
    source: "demo-fixture",
    synthetic: true,
    demoTag: "演示文献",
    abstract:
      "【合成教学摘要】遮挡并切镜时，每次切换都更新参考锚点。预算较高，用作条件补充与反例，不比较算法优劣。",
    method:
      "【示意方法】在每次镜头切换时更新参考锚点。该设定用于引入计算预算限制，不是性能承诺。",
    conditionSection:
      "【示意条件】遮挡 + 切镜；每次切换更新参考；计算预算高于固定间隔更新，两套预算不能直接比较。",
    excerpts: [
      {
        id: "P03-ex-occlude-cut",
        heading: "遮挡与切镜下的频繁更新",
        text: "在遮挡并切镜的示意片段中，每次切换都更新锚点。材料表明复杂场景已被部分纳入，但不证明联合条件已解决，也不能在不同预算下直接比较。",
        conditions: ["遮挡", "切镜", "每次切换更新", "较高计算预算"],
      },
    ],
    availability: "full-text",
  },
  {
    id: "P04",
    cardVersion: "p04-card-v1",
    title: "演示文献 D · 身份恢复失败案例",
    authors: demoAuthor,
    source: "demo-fixture",
    synthetic: true,
    demoTag: "演示文献",
    abstract:
      "【合成教学摘要】按遮挡、切镜与姿态变化分组整理身份恢复失败案例，用于提供评价维度。不编造领先分数。",
    method:
      "【示意方法】用失败案例分组展示可观察的漂移表现，供后续比较使用。不含排行或胜出声明。",
    conditionSection:
      "【示意条件】失败案例按遮挡 / 切镜 / 姿态分组。用于定义评价维度，不声称某方法已经解决这些失败。",
    excerpts: [
      {
        id: "P04-ex-failure-dims",
        heading: "可观察的失败与评价维度",
        text: "失败案例可按遮挡、切镜和姿态分组观察身份漂移。这些维度用于后续比较，不是已发表基准分数。",
        conditions: ["遮挡", "切镜", "姿态变化", "失败案例"],
      },
    ],
    availability: "full-text",
  },
  {
    id: "P05",
    cardVersion: "p05-card-v1",
    title: "演示文献 E · 长视频一致性",
    authors: demoAuthor,
    source: "demo-fixture",
    synthetic: true,
    demoTag: "演示文献",
    abstract:
      "【合成教学摘要】在长序列、连续机位、无遮挡的示意设定下讨论一致性。用于扩大原先仅含短片段的材料覆盖，并收窄问题。",
    method:
      "【示意方法】沿连续机位观察长序列中的一致性保持。不包含遮挡后重现的联合条件。",
    conditionSection:
      "【示意条件】长序列；连续机位；无遮挡。可修正“当前仅掌握短片段证据”的覆盖记录，但不能外推遮挡→硬切→重现。",
    excerpts: [
      {
        id: "P05-ex-long-visible",
        heading: "长序列、无遮挡下的一致性",
        text: "在连续机位的长序列中，主体保持可见时可以看到一致性材料。这扩大了短片段覆盖，但未覆盖遮挡后重现。",
        conditions: ["长序列", "连续机位", "无遮挡"],
      },
    ],
    availability: "full-text",
  },
  {
    id: "P06",
    cardVersion: "p06-card-v1",
    title: "演示文献 F · 跟踪中的不确定性更新",
    authors: demoAuthor,
    source: "demo-fixture",
    synthetic: true,
    demoTag: "演示文献",
    abstract:
      "【合成教学摘要】在跟踪任务且存在外部观测时，按不确定性触发更新。这是候选迁移机制；它在视频生成任务中是否适用仍未知。",
    method:
      "【示意方法】当身份不确定性升高时触发记忆更新，并与固定间隔更新对照设想。来源是跟踪任务，不是生成任务实验。",
    conditionSection:
      "【示意条件】跟踪任务；有外部观测。生成任务、遮挡→硬切→重现、固定计算预算下的直接比较均未提供。",
    excerpts: [
      {
        id: "P06-ex-uncertainty-update",
        heading: "按不确定性触发的更新（跟踪任务）",
        text: "在有外部观测的跟踪任务中，可按身份不确定性触发更新。该机制是否适用于视频生成仍待验证。",
        conditions: ["跟踪任务", "有外部观测", "按不确定性更新", "生成任务适用性未知"],
      },
    ],
    availability: "full-text",
  },
];

export const evidence: readonly Evidence[] = [
  {
    id: "E01",
    claim: "身份约束在短片段、主体持续可见的条件下有支持。",
    paperIds: ["P01", "P02"],
    excerptIds: ["P01-ex-short-visible", "P02-ex-cut-visible"],
    conditions: ["短片段", "主体持续可见", "不外推其他条件"],
    coverageRound: "round-initial",
    epistemic: "reported",
    synthetic: true,
  },
  {
    id: "E02",
    claim: "新纳入的长序列、遮挡与切镜材料使原先证据范围和问题表述需要修正。这些条件已有部分支持，但不证明所有组合条件已解决。",
    paperIds: ["P05", "P03"],
    excerptIds: ["P05-ex-long-visible", "P03-ex-occlude-cut"],
    conditions: ["长序列（无遮挡）", "遮挡+切镜（较高预算）", "不证明全部组合已解决"],
    coverageRound: "round-followup",
    epistemic: "inferred",
    synthetic: true,
  },
  {
    id: "E03",
    claim: "当前材料未提供固定预算、遮挡→硬切→重现组合下两种更新策略的直接比较。这是本轮检索覆盖中的证据缺口，不是全球缺口。",
    paperIds: ["P01", "P02", "P03", "P04", "P05", "P06"],
    excerptIds: [
      "P01-ex-short-visible",
      "P02-ex-cut-visible",
      "P03-ex-occlude-cut",
      "P04-ex-failure-dims",
      "P05-ex-long-visible",
      "P06-ex-uncertainty-update",
    ],
    conditions: ["固定计算预算", "遮挡→硬切→重现", "两种更新策略的直接比较缺失"],
    coverageRound: "round-aligned",
    epistemic: "unknown",
    synthetic: true,
  },
];

export const limitations: readonly Limitation[] = [
  { id: "L01", statement: "场景不同不能直接外推。" },
  { id: "L02", statement: "更新预算不同不能直接比较。" },
];

export const coverageRecords: readonly CoverageRecord[] = [
  {
    id: "cov-short-visible",
    statement: "目前材料主要覆盖短片段与持续可见条件。",
    round: "round-initial",
  },
  {
    id: "cov-long-included",
    statement: "补入长序列、连续机位（无遮挡）材料后，覆盖已扩大；问题不再用笼统的“长序列缺失”来表述。",
    round: "round-followup",
  },
  {
    id: "cov-complex-included",
    statement: "补入遮挡与切镜材料后，复杂场景已被部分纳入；仍不能在不同更新预算下直接比较，也不能声称组合条件已解决。",
    round: "round-followup",
  },
];

export const counterexamples: readonly Counterexample[] = [
  {
    id: "CE01",
    paperId: "P05",
    revisesRecordId: "cov-short-visible",
    previousStatement: "当前仅掌握短片段证据。",
    revisedStatement:
      "补入长序列、连续机位（无遮挡）材料后，覆盖已扩大；问题不再用笼统的“长序列缺失”来表述。",
    reason: "P05 提供了长序列且主体可见的示意材料，因此“当前仅掌握短片段证据”的覆盖记录需要修正。",
  },
  {
    id: "CE02",
    paperId: "P03",
    revisesRecordId: "cov-short-visible",
    previousStatement: "当前材料尚未纳入复杂场景。",
    revisedStatement:
      "补入遮挡与切镜材料后，复杂场景已被部分纳入；仍不能在不同更新预算下直接比较，也不能声称组合条件已解决。",
    reason: "P03 提供了遮挡+切镜下的示意材料，因此“当前材料尚未纳入复杂场景”的覆盖记录需要修正。",
  },
];

export const OPEN_QUESTION_ID = "oq-identity-budget";

export const openQuestions: readonly OpenQuestion[] = [
  {
    id: OPEN_QUESTION_ID,
    question:
      "在“遮挡→硬切→重新出现”的连续场景中，在相同计算预算下，按身份不确定性触发记忆更新，能否比固定间隔更新减少身份漂移？",
    scope: "教学设定下的连续场景：人物被遮挡，随后镜头硬切，人物重新出现；比较须在相同计算预算下进行。",
    recentWork:
      "已阅读的演示文献覆盖短片段与持续可见条件（P01/P02），并补充了长序列无遮挡（P05）、遮挡+切镜但预算较高（P03）、失败评价维度（P04），以及跟踪任务中的不确定性更新（P06）。",
    evidenceIds: ["E01", "E02", "E03"],
    counterexampleIds: ["CE01", "CE02"],
    limitationIds: ["L01", "L02"],
    uncertainty:
      "两种更新策略在固定预算、遮挡→硬切→重现组合下尚无直接比较；P06 来自跟踪任务，在生成任务中是否适用仍未知。",
    whyInvestigate:
      "现有材料可以提出一个可检验的比较，但不能把本轮未覆盖写成“从未被研究”。值得调查的是这一组限定条件下的策略差异。",
    nextAction: "在相同计算预算下比较按不确定性触发的更新与固定间隔更新，并核对失败案例中的身份漂移。",
    status: "candidate",
  },
];

export const videoIdentityWorld: ResearchWorld = {
  manifest,
  directions,
  groups,
  papers,
  evidence,
  limitations,
  coverageRecords,
  counterexamples,
  openQuestions,
  interestPrompt: INTEREST_PROMPT,
};

export const directionById = new Map(directions.map((item) => [item.id, item]));
export const groupById = new Map(groups.map((item) => [item.id, item]));
export const paperById = new Map(papers.map((item) => [item.id, item]));
export const evidenceById = new Map(evidence.map((item) => [item.id, item]));
export const limitationById = new Map(limitations.map((item) => [item.id, item]));
export const coverageById = new Map(coverageRecords.map((item) => [item.id, item]));
export const counterexampleById = new Map(counterexamples.map((item) => [item.id, item]));
export const openQuestionById = new Map(openQuestions.map((item) => [item.id, item]));
