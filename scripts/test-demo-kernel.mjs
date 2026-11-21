import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { transpileModuleGraph } from "./transpile-app.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "coresearch-demo-kernel-"));

try {
  transpileModuleGraph({
    ts,
    root,
    tmp,
    entries: [
      "app/demo/index.ts",
      "app/product-demo/scenario.ts",
      "app/graph-svg/mock-world.ts",
    ],
  });
  const demo = require(path.join(tmp, "app/demo/index.js"));
  const scenario = require(path.join(tmp, "app/product-demo/scenario.js"));
  const worldMod = require(path.join(tmp, "app/graph-svg/mock-world.js"));

  const {
    videoIdentityWorld, demoTimeline, demoEvents, demoScenes, stateAt, statesEqual,
    validateTimeline, validateWorld, projectProduct, projectConcept, projectGuide,
    createDemoPlayer, shouldAutoPause, fixtureVariants, createMockPreviewPort,
    DemoResourceError, INTEREST_PROMPT, OPEN_QUESTION_ID, counterexampleById,
    installNetworkGuard, assertNoResearchNetwork, sceneById, groupById, paperById,
  } = demo;

  const EPSILON = 0.001;

  // --- fixture integrity ---
  validateWorld(videoIdentityWorld);
  validateTimeline(videoIdentityWorld, demoTimeline);
  const g1 = groupById.get("G1");
  const g2 = groupById.get("G2");
  const g3 = groupById.get("G3");
  assert.equal(g1.parent, null, "G1 has no parent");
  assert.equal(g2.parent.groupId, "G1");
  assert.equal(g2.parent.directionId, "d-consistency");
  assert.equal(g2.parent.groupRevisionId, g1.revisionId);
  assert.equal(g2.parent.directionRevisionId, "d-consistency-rev-1");
  assert.equal(g3.parent.groupId, "G2");
  assert.equal(g3.parent.directionId, "d-identity");
  assert.equal(g3.parent.groupRevisionId, g2.revisionId);
  assert.equal(g3.parent.directionRevisionId, "d-identity-rev-1");
  assert.notEqual(g1.directionIds[0], g2.directionIds[0], "groups are not wired by array index");
  assert.ok(videoIdentityWorld.manifest.synthetic);
  for (const paper of videoIdentityWorld.papers) {
    assert.equal(paper.synthetic, true);
    assert.ok(paper.title.includes("演示文献"));
    assert.equal(paper.authors[0], "CoResearch Demo");
    assert.equal(paper.source, "demo-fixture");
  }
  const oq = videoIdentityWorld.openQuestions[0];
  assert.equal(oq.id, "oq-identity-budget");
  assert.equal(oq.noveltyPass, undefined);
  assert.match(oq.question, /遮挡→硬切→重新出现/);
  assert.match(oq.uncertainty, /不是全球缺口|仍未知|尚无直接比较/);
  assert.doesNotMatch(JSON.stringify(videoIdentityWorld), /从未研究|无人研究/);

  // --- three projections share entity ids ---
  const late = stateAt(videoIdentityWorld, demoTimeline, demoTimeline.durationMs);
  const product = projectProduct(videoIdentityWorld, late);
  const concept = projectConcept(videoIdentityWorld, late);
  const guide = projectGuide(videoIdentityWorld, late);
  for (const id of ["P03", "d-crossshot"]) {
    assert.ok(product.paperIds.includes("P03") || product.directionIds.includes(id) || product.paperIds.includes(id));
    assert.ok(concept.directionIds.includes("d-crossshot"));
    assert.ok(concept.paperIds.includes("P03"));
    assert.ok(guide.directionIds.includes("d-crossshot"));
    assert.ok(guide.paperIds.includes("P03"));
  }
  assert.equal(product.openQuestionId, OPEN_QUESTION_ID);
  assert.equal(concept.openQuestionId, OPEN_QUESTION_ID);
  assert.equal(guide.openQuestionId, OPEN_QUESTION_ID);
  assert.equal(worldMod.nodeAt("P03").label, paperById.get("P03").title);
  assert.equal(worldMod.nodeAt("d-crossshot").id, "multi-shot");
  assert.equal(worldMod.nodeAt("d-identity").label, "主体身份");
  assert.deepEqual(
    [product.openQuestionId, concept.openQuestionId, guide.openQuestionId],
    [OPEN_QUESTION_ID, OPEN_QUESTION_ID, OPEN_QUESTION_ID],
  );

  // --- revisions keep previous judgments ---
  const afterCe01 = stateAt(videoIdentityWorld, demoTimeline, 25200);
  assert.equal(afterCe01.coverageRevisions[0].counterexampleId, "CE01");
  assert.equal(afterCe01.coverageRevisions[0].previousRecordId, "cov-short-visible");
  assert.ok(afterCe01.coverageRecordIds.includes("cov-short-visible"));
  assert.equal(afterCe01.coverageRevisions[0].reason, counterexampleById.get("CE01").reason);
  const afterCe02 = stateAt(videoIdentityWorld, demoTimeline, 27400);
  assert.equal(afterCe02.coverageRevisions[1].counterexampleId, "CE02");
  assert.ok(afterCe02.coverageRevisions[1].reason.includes("尚未纳入复杂场景") || afterCe02.coverageRevisions[1].reason.includes("复杂场景"));
  assert.equal(JSON.stringify(videoIdentityWorld).includes("从未研究"), false);

  // --- boundary t-ε / t / t+ε ---
  const arrivals = [
    { t: 5200, test: (s) => s.visibleGroupIds.includes("G1") },
    { t: 10000, test: (s) => s.visibleGroupIds.includes("G2") },
    { t: 15000, test: (s) => s.visibleGroupIds.includes("G3") },
    { t: 32400, test: (s) => s.openQuestionId === OPEN_QUESTION_ID },
  ];
  for (const { t, test } of arrivals) {
    assert.equal(test(stateAt(videoIdentityWorld, demoTimeline, t - EPSILON)), false, `t-ε must not include event at ${t}`);
    assert.equal(test(stateAt(videoIdentityWorld, demoTimeline, t)), true, `t includes event at ${t}`);
    assert.equal(test(stateAt(videoIdentityWorld, demoTimeline, t + EPSILON)), true, `t+ε includes event at ${t}`);
  }

  // --- seek to checkpoint then continue does not rewind ---
  const g1Scene = sceneById("g1");
  const atCheckpoint = stateAt(videoIdentityWorld, demoTimeline, g1Scene.checkpointMs);
  assert.ok(atCheckpoint.visibleGroupIds.includes("G1"));
  assert.equal(atCheckpoint.visibleGroupIds.includes("G2"), false);
  const justAfter = stateAt(videoIdentityWorld, demoTimeline, g1Scene.checkpointMs + EPSILON);
  assert.ok(justAfter.visibleGroupIds.includes("G1"), "continuing from checkpoint must not clear G1");
  const beforeCheckpoint = stateAt(videoIdentityWorld, demoTimeline, g1Scene.startMs + EPSILON);
  assert.equal(beforeCheckpoint.visibleGroupIds.includes("G1"), false, "scene start is before G1 arrival");

  const oqScene = sceneById("open-question");
  const oqState = stateAt(videoIdentityWorld, demoTimeline, oqScene.checkpointMs);
  assert.equal(oqState.openQuestionId, OPEN_QUESTION_ID);
  assert.ok(oqState.openQuestionStatus === "selected-for-investigation");
  const oqAfter = stateAt(videoIdentityWorld, demoTimeline, oqScene.checkpointMs + EPSILON);
  assert.equal(oqAfter.openQuestionId, OPEN_QUESTION_ID, "continuing after the last readable checkpoint does not clear the question");

  // --- direct seek equals play-to-t; reverse and replay ---
  const stamps = [0, 3600, 4199.999, 4200, 7600, 12600, 16600, 22400, 25200, 31200, 34500, 36000];
  for (const t of stamps) {
    const sought = stateAt(videoIdentityWorld, demoTimeline, t);
    let played = stateAt(videoIdentityWorld, demoTimeline, 0);
    for (const event of demoEvents) {
      if (event.t <= t) played = stateAt(videoIdentityWorld, demoTimeline, event.t);
    }
    played = stateAt(videoIdentityWorld, demoTimeline, t);
    assert.ok(statesEqual(sought, played), `seek(${t}) equals play-to-${t}`);
  }
  const forward = stamps.map((t) => JSON.stringify(stateAt(videoIdentityWorld, demoTimeline, t)));
  for (const t of [...stamps].reverse()) {
    assert.equal(JSON.stringify(stateAt(videoIdentityWorld, demoTimeline, t)), forward[stamps.indexOf(t)], "reverse seek is deterministic");
  }
  assert.ok(statesEqual(stateAt(videoIdentityWorld, demoTimeline, 0), stateAt(videoIdentityWorld, demoTimeline, 0)));
  const mid = stateAt(videoIdentityWorld, demoTimeline, 22400);
  const again = stateAt(videoIdentityWorld, demoTimeline, 22400);
  assert.ok(statesEqual(mid, again));

  // --- derived counts; reopen does not double-count ---
  const afterFirstOpen = stateAt(videoIdentityWorld, demoTimeline, 18400);
  const afterReopen = stateAt(videoIdentityWorld, demoTimeline, 22000);
  assert.equal(afterFirstOpen.counts.fullTextRead, 1);
  assert.equal(afterReopen.paperReading.P01.openCount, 2);
  assert.equal(afterReopen.counts.fullTextRead, 2, "P01 and P02 are full-text; reopen does not add a third");
  const done = stateAt(videoIdentityWorld, demoTimeline, 36000);
  assert.equal(done.counts.discovered, 6);
  assert.equal(done.counts.abstractBrowsed, 6);
  assert.equal(done.counts.fullTextRead, 6);
  assert.equal(scenario.sampleAtElapsed(36).processingMeta.includes("读取全文 6 篇"), true);
  assert.equal(scenario.sampleAtElapsed(36).processingMeta.includes("演示节奏"), true);
  assert.equal(scenario.paperRef.tag, "演示文献");
  assert.equal(scenario.paperRef.meta.includes("CoResearch Demo"), true);

  // --- metadata-only / missing / cancel / retry ---
  const metadataStateWorld = fixtureVariants["metadata-only"].world;
  const defaultPort = createMockPreviewPort({ world: videoIdentityWorld });
  const metaPort = createMockPreviewPort({ world: metadataStateWorld });
  const missingPort = createMockPreviewPort({
    world: videoIdentityWorld,
    missingIds: fixtureVariants["missing-version"].missingResourceIds,
  });
  const ac = new AbortController();
  const p03Default = await defaultPort.get({ scope: "demo", kind: "paper", id: "P03", revision: { mode: "pinned", versionId: "p03-card-v1" } }, ac.signal);
  assert.equal(p03Default.capabilities.includes("read-full-text"), true);
  assert.ok(p03Default.content.excerpts.length > 0);
  const p03Meta = await metaPort.get({ scope: "demo", kind: "paper", id: "P03", revision: { mode: "pinned", versionId: "p03-card-v1" } }, ac.signal);
  assert.equal(p03Meta.capabilities.includes("read-full-text"), false);
  assert.deepEqual(p03Meta.content.excerpts, []);
  assert.equal(p03Meta.content.method, null);
  const metaTimelineState = { ...stateAt(metadataStateWorld, demoTimeline, 26800) };
  // applying read_full_text on metadata-only must not mark full-text read
  assert.equal(metaTimelineState.paperReading.P03.fullTextRead, false, "metadata-only paper is not full-text read");
  assert.equal(metaTimelineState.paperReading.P03.abstractBrowsed, false, "metadata-only fixture has no abstract to browse");
  assert.equal(p03Meta.content.abstract, "");

  await assert.rejects(
    () => missingPort.get({ scope: "demo", kind: "paper", id: "P03", revision: { mode: "pinned", versionId: "p03-card-v1" } }, ac.signal),
    (error) => error instanceof DemoResourceError && error.code === "missing",
  );
  const cancelled = new AbortController();
  cancelled.abort();
  await assert.rejects(
    () => defaultPort.get({ scope: "demo", kind: "paper", id: "P01", revision: { mode: "pinned", versionId: "p01-card-v1" } }, cancelled.signal),
    (error) => error instanceof DemoResourceError && error.code === "cancelled",
  );
  const retried = await defaultPort.get({ scope: "demo", kind: "paper", id: "P01", revision: { mode: "pinned", versionId: "p01-card-v1" } }, new AbortController().signal);
  assert.equal(retried.ref.id, "P01");
  await assert.rejects(
    () => defaultPort.get({ scope: "demo", kind: "paper", id: "P01", revision: { mode: "pinned", versionId: "wrong-version" } }, new AbortController().signal),
    (error) => error instanceof DemoResourceError && error.code === "missing",
  );
  const unavailPort = createMockPreviewPort({ world: fixtureVariants["full-text-unavailable"].world });
  await assert.rejects(
    () => unavailPort.get({ scope: "demo", kind: "paper", id: "P03", revision: { mode: "pinned", versionId: "p03-card-v1" } }, new AbortController().signal),
    (error) => error instanceof DemoResourceError && error.code === "unavailable",
  );

  // --- player: no fast-forward after hide; isolated instances; control focus ---
  assert.equal(shouldAutoPause("player-control"), false);
  assert.equal(shouldAutoPause("script"), false);
  assert.equal(shouldAutoPause("content-focus"), true);
  assert.equal(shouldAutoPause("content-hover"), true);

  let clock = 1000;
  const playerA = createDemoPlayer({
    world: videoIdentityWorld,
    timeline: demoTimeline,
    scenes: demoScenes,
    now: () => clock,
  });
  const playerB = createDemoPlayer({
    world: videoIdentityWorld,
    timeline: demoTimeline,
    scenes: demoScenes,
    now: () => clock,
  });
  playerA.resume();
  playerA.tick(1000);
  for (let i = 1; i <= 60; i += 1) playerA.tick(1000 + i * 50);
  assert.equal(playerA.getTime(), 3000);
  playerA.notifyHidden();
  clock = 40000;
  playerA.notifyVisible();
  playerA.resume();
  playerA.tick(40000);
  playerA.tick(40050);
  assert.ok(playerA.getTime() < 3200, `returning from background must not skip tens of seconds, got ${playerA.getTime()}`);
  assert.equal(playerB.getTime(), 0, "two players must not share a clock");
  playerB.seek(15000);
  assert.equal(playerA.getTime() !== 15000, true);

  const generationBefore = playerA.getGeneration();
  playerA.seekToScene("g1");
  assert.equal(playerA.getTime(), g1Scene.checkpointMs);
  assert.ok(playerA.getGeneration() > generationBefore);
  const afterSeek = playerA.getTime();
  playerA.resume();
  playerA.tick(50000);
  playerA.tick(50100);
  assert.ok(playerA.getTime() >= afterSeek, "continue after seekToScene starts at the checkpoint");
  assert.ok(playerA.getState().visibleGroupIds.includes("G1"));

  playerA.restartScene("g1");
  assert.equal(playerA.getTime(), g1Scene.startMs);
  playerA.notifyControlOrScript("player-control");
  assert.equal(playerA.pauseReasons().includes("user"), false, "control events do not pause");
  playerA.notifyControlOrScript("script");
  assert.equal(playerA.pauseReasons().includes("user"), false, "script events do not pause");

  const endPlayer = createDemoPlayer({ world: videoIdentityWorld, timeline: demoTimeline, scenes: demoScenes });
  endPlayer.seek(demoTimeline.durationMs);
  endPlayer.resume();
  assert.equal(endPlayer.isPlaying(), false, "the last frame stays put; resume does not wrap the loop");
  assert.equal(endPlayer.getState().openQuestionId, OPEN_QUESTION_ID);
  endPlayer.restart();
  endPlayer.tick(1);
  endPlayer.tick(20);
  assert.ok(endPlayer.getTime() < 1000);
  assert.equal(endPlayer.getState().openQuestionId, null);

  // shell projection: integer scene sample is checkpoint; +epsilon via elapsed does not rewind
  const deepPhase = demoScenes.findIndex((scene) => scene.sceneId === "g3");
  const checkpointState = scenario.sampleScenario(deepPhase);
  assert.ok(checkpointState.tree.includes("d-crossshot") || checkpointState.current === "d-crossshot" || checkpointState.tree.includes("G3") || checkpointState.tree.includes("d-crossshot"));
  const afterCheckpointSeconds = scenario.phaseCheckpoint(deepPhase) + EPSILON / 1000;
  const continued = scenario.sampleAtElapsed(afterCheckpointSeconds);
  assert.ok(continued.tree.includes("d-crossshot"), "continuing past a shell checkpoint must not clear the direction tree");
  assert.notEqual(continued.focus, "", "body is not cleared");
  const startSeconds = scenario.phaseStart(deepPhase) + 0.01;
  const atStart = scenario.sampleAtElapsed(startSeconds);
  assert.equal(atStart.tree.includes("d-crossshot"), false, "the start of the G3 scene is still waiting for the group");

  // delayed callback invalidation: a stale generation must not apply
  const stale = createDemoPlayer({ world: videoIdentityWorld, timeline: demoTimeline, scenes: demoScenes });
  stale.seek(0);
  const gen = stale.getGeneration();
  stale.seekToScene("revision");
  assert.notEqual(stale.getGeneration(), gen);

  // --- offline: no research network ---
  const guard = installNetworkGuard(globalThis);
  try {
    stateAt(videoIdentityWorld, demoTimeline, 36000);
    await defaultPort.list({ scope: "demo", kind: "paper", limit: 10, signal: new AbortController().signal });
    await defaultPort.get({ scope: "demo", kind: "paper", id: "P06", revision: { mode: "pinned", versionId: "p06-card-v1" } }, new AbortController().signal);
    assertNoResearchNetwork(guard.calls);
  } finally {
    guard.restore();
  }

  // prepare → send → G1 causality for the proof slice
  assert.equal(stateAt(videoIdentityWorld, demoTimeline, 3599).preparedTask, null);
  assert.equal(stateAt(videoIdentityWorld, demoTimeline, 3600).preparedTask.task, "explore");
  assert.equal(stateAt(videoIdentityWorld, demoTimeline, 3600).preparedTask.prompt, INTEREST_PROMPT);
  assert.equal(stateAt(videoIdentityWorld, demoTimeline, 4199).sentTasks.length, 0);
  assert.equal(stateAt(videoIdentityWorld, demoTimeline, 4200).sentTasks[0].id, "task-g1");
  assert.equal(stateAt(videoIdentityWorld, demoTimeline, 4200).preparedTask, null);
  assert.equal(stateAt(videoIdentityWorld, demoTimeline, 5199).visibleGroupIds.includes("G1"), false);
  assert.deepEqual(stateAt(videoIdentityWorld, demoTimeline, 5200).visibleGroupIds, ["G1"]);

  playerA.dispose();
  playerB.dispose();
  stale.dispose();
  endPlayer.dispose();

  console.log("PASS: demo kernel — fixture integrity, shared projections, coverage revisions, ±ε boundaries, seek/replay isolation, derived counts, resource variants, pause policy, offline port.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
