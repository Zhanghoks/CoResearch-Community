import type { GuideProjection, ResearchWorld, SceneScript, WorldState } from "../domain";

/**
 * Guide scripts for later #40 integration. #37 only needs the shared entities
 * and a start checkpoint for the first Explore task.
 */
export const guideScenes: readonly SceneScript[] = [
  {
    sceneId: "guide-first-explore",
    action: "complete_first_explore",
    targetId: "G1",
    startMs: 0,
    checkpointMs: 7600,
    focusIds: ["d-video", "G1"],
    caption: {
      tag: "GUIDE 1",
      title: "第一次 Explore",
      body: "输入预置主题，选择 Explore，核对 Task，发送，并等到 G1 出现。",
    },
    readingHold: true,
  },
  {
    sceneId: "guide-refine",
    action: "refine_selected_direction",
    targetId: "G2",
    startMs: 7600,
    checkpointMs: 12600,
    focusIds: ["d-consistency", "G2"],
    caption: {
      tag: "GUIDE 2",
      title: "继续细分方向",
      body: "选择生成一致性，准备目标任务并发送，查看 G2。",
    },
    readingHold: true,
  },
  {
    sceneId: "guide-papers",
    action: "inspect_papers",
    targetId: "P01",
    startMs: 16600,
    checkpointMs: 22400,
    focusIds: ["P01", "P02", "E01"],
    caption: {
      tag: "GUIDE 3",
      title: "查看论文和依据",
      body: "打开正确论文，辨认阅读状态，查看条件片段。",
    },
    readingHold: true,
  },
  {
    sceneId: "guide-graph",
    action: "locate_on_graph",
    targetId: "d-crossshot",
    startMs: 15000,
    checkpointMs: 16600,
    focusIds: ["G3", "d-crossshot"],
    caption: {
      tag: "GUIDE 4",
      title: "使用图谱定位",
      body: "展开、选择、查看详情，并回到上一层。",
    },
    readingHold: true,
  },
  {
    sceneId: "guide-followup",
    action: "add_context_and_ask",
    targetId: "d-crossshot",
    startMs: 16600,
    checkpointMs: 34500,
    focusIds: ["d-crossshot", "oq-identity-budget"],
    caption: {
      tag: "GUIDE 5",
      title: "带引用继续研究",
      body: "在已保存方向上添加上下文，再明确发送追问。",
    },
    readingHold: true,
  },
];

export function projectGuide(world: ResearchWorld, state: WorldState): GuideProjection {
  const visibleDirections = world.groups
    .filter((group) => state.visibleGroupIds.includes(group.id))
    .flatMap((group) => group.directionIds);
  const paperIds = Object.values(state.paperReading)
    .filter((record) => record.discovered)
    .map((record) => record.paperId);
  return {
    kind: "guide",
    directionIds: unique(["d-video", ...visibleDirections]),
    paperIds,
    evidenceIds: [...state.evidenceIds],
    openQuestionId: state.openQuestionId,
    preparedTask: state.preparedTask,
    counts: state.counts,
  };
}

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}
