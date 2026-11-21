/** Serialized teaching fixture sent to the Core demo viewer. Not a second fact table. */
export interface DemoPaper {
  id: string;
  cardVersion: string;
  title: string;
  authors: readonly string[];
  abstract: string;
  method: string;
  conditionSection: string;
  excerpts: readonly { id: string; heading: string; text: string; conditions: readonly string[] }[];
  availability: "full-text" | "metadata-only" | "unavailable";
  demoTag: string;
  synthetic: true;
}

export interface DemoDirection {
  id: string;
  name: string;
  kind: "topic" | "direction";
  intro: string;
  paperIds: readonly string[];
  revisionId: string;
}

export interface DemoGroup {
  id: string;
  revisionId: string;
  parent: {
    groupId: string;
    directionId: string;
    groupRevisionId: string;
    directionRevisionId: string;
  } | null;
  directionIds: readonly string[];
}

export interface DemoOpenQuestion {
  id: string;
  question: string;
  scope: string;
  recentWork: string;
  evidenceIds: readonly string[];
  counterexampleIds: readonly string[];
  limitationIds: readonly string[];
  uncertainty: string;
  whyInvestigate: string;
  nextAction: string;
  status: "candidate" | "selected-for-investigation";
}

export interface DemoEvidence {
  id: string;
  claim: string;
}

export interface DemoLimitation {
  id: string;
  statement: string;
}

export interface DemoFixture {
  readonly missingResourceIds?: readonly string[];
  manifest?: { scenarioId?: string; fixtureVersion?: string; synthetic?: boolean };
  interestPrompt?: string;
  directions: readonly DemoDirection[];
  groups: readonly DemoGroup[];
  papers: readonly DemoPaper[];
  evidence: readonly DemoEvidence[];
  limitations?: readonly DemoLimitation[];
  openQuestions: readonly DemoOpenQuestion[];
}
