import type { ProductProjection, ResearchWorld, WorldState } from "../domain";
import { demoScenes } from "../timeline";

export const productScenes = demoScenes;

export function projectProduct(world: ResearchWorld, state: WorldState): ProductProjection {
  const visibleDirections = world.groups
    .filter((group) => state.visibleGroupIds.includes(group.id))
    .flatMap((group) => group.directionIds);
  const paperIds = Object.values(state.paperReading)
    .filter((record) => record.discovered)
    .map((record) => record.paperId);
  return {
    kind: "product",
    directionIds: unique(["d-video", ...visibleDirections]),
    groupIds: [...state.visibleGroupIds],
    paperIds,
    evidenceIds: [...state.evidenceIds],
    openQuestionId: state.openQuestionId,
    counts: state.counts,
    selectedDirectionId: state.selectedDirectionId,
  };
}

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}
