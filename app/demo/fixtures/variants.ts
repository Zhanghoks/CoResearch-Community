import type { Paper, ResearchWorld } from "../domain";
import { videoIdentityWorld } from "./video-identity";

export type FixtureVariantId = "default" | "metadata-only" | "full-text-unavailable" | "missing-version";

export interface FixtureVariant {
  readonly id: FixtureVariantId;
  readonly world: ResearchWorld;
  /** Resource ids that the mock port should treat as missing (version not in the table). */
  readonly missingResourceIds: readonly string[];
}

function withPaper(world: ResearchWorld, paperId: string, patch: Partial<Paper>): ResearchWorld {
  const papers = world.papers.map((paper) => (paper.id === paperId ? { ...paper, ...patch } : paper));
  const excerptIds = new Set(papers.flatMap((paper) => paper.excerpts.map((excerpt) => excerpt.id)));
  return {
    ...world,
    papers,
    // Keep scenario/event ids stable, but never leave orphan excerpt references.
    // These incomplete evidence definitions are not established judgments:
    // evaluate.ts requires their source papers to have actually been read.
    evidence: world.evidence.map((item) => item.paperIds.includes(paperId) && patch.availability !== "full-text"
      ? {
          ...item,
          excerptIds: item.excerptIds.filter((id) => excerptIds.has(id)),
          epistemic: "unknown" as const,
          claim: `【材料不完整：${paperId} 全文不可用；以下判断尚未建立】${item.claim}`,
        }
      : item),
  };
}

/** P03 is discoverable metadata only: no full-text, no excerpts to support a judgment. */
export const metadataOnlyWorld: ResearchWorld = withPaper(videoIdentityWorld, "P03", {
  availability: "metadata-only",
  abstract: "",
  excerpts: [],
  method: "【元数据变体】全文不可用，不提供方法段落或示意片段。",
  conditionSection: "【元数据变体】不可把缺失全文当成已经阅读。",
});

/** P03 is listed as unavailable after a failed fetch. */
export const unavailableWorld: ResearchWorld = withPaper(videoIdentityWorld, "P03", {
  availability: "unavailable",
  excerpts: [],
  method: "【不可用变体】全文当前不可用。",
  conditionSection: "【不可用变体】取消或失败后可重试，成功前不得生成片段。",
});

export const fixtureVariants: Record<FixtureVariantId, FixtureVariant> = {
  default: { id: "default", world: videoIdentityWorld, missingResourceIds: [] },
  "metadata-only": { id: "metadata-only", world: metadataOnlyWorld, missingResourceIds: [] },
  "full-text-unavailable": { id: "full-text-unavailable", world: unavailableWorld, missingResourceIds: [] },
  // An unresolved pinned version is not readable evidence, even if another
  // version's text exists in the default teaching world.
  "missing-version": { id: "missing-version", world: unavailableWorld, missingResourceIds: ["P03"] },
};
