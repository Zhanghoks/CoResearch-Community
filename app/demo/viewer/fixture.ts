import type { ResearchWorld } from "../domain";
import type { DemoEvidence, DemoFixture, DemoLimitation } from "./fixture-types";

/**
 * Serialize the shared #37 world for the Core viewer. This is a projection of
 * the same teaching fixture, not a second fact table.
 */
export function serializeFixture(world: ResearchWorld): DemoFixture {
  return {
    manifest: {
      scenarioId: world.manifest.scenarioId,
      fixtureVersion: world.manifest.fixtureVersion,
      synthetic: world.manifest.synthetic,
    },
    interestPrompt: world.interestPrompt,
    directions: world.directions,
    groups: world.groups,
    papers: world.papers,
    evidence: world.evidence.map((item): DemoEvidence => ({ id: item.id, claim: item.claim })),
    limitations: world.limitations.map((item): DemoLimitation => ({ id: item.id, statement: item.statement })),
    openQuestions: world.openQuestions,
  };
}
