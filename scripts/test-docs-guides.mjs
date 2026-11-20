import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { transpileModuleGraph } from "./transpile-app.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "coresearch-guides-"));

try {
  transpileModuleGraph({
    ts,
    root,
    tmp,
    entries: ["app/demo/guides/index.ts", "app/demo/viewer/intents.ts", "app/demo/viewer/snapshot.ts", "app/demo/viewer/fixture.ts"],
  });
  const {
    PRIMARY_GUIDE_IDS,
    GUIDE_PRESET_PROMPT,
    applyExpectedStep,
    applyGuideIntent,
    goToStep,
    guideById,
    isStepComplete,
    missingResourceIds,
    resetStep,
    recoverInterruptedStep,
    startGuide,
    useExampleContinue: acknowledgeExample,
    worldForVariant,
  } = require(path.join(tmp, "app/demo/guides/index.js"));

  assert.deepEqual([...PRIMARY_GUIDE_IDS], ["get-started", "explore-directions", "read-evidence", "research-graph", "continue-research"]);
  for (const id of [...PRIMARY_GUIDE_IDS, "troubleshooting"]) {
    const guide = guideById.get(id);
    assert.ok(guide, id);
    assert.equal(guide.path, `/docs/${id}/`);
    assert.ok(guide.task && guide.versionNote && guide.presetLabel && guide.staticSteps.length);
    for (const step of guide.steps) {
      assert.ok(step.stepId && step.instruction && step.success && step.targetAnchor);
      assert.equal("x" in step, false);
      assert.equal("y" in step, false);
      assert.ok(!Number.isNaN(step.startCheckpointMs));
    }
    const src = fs.readFileSync(path.join(root, "app/docs", id, "page.tsx"), "utf8");
    assert.match(src, new RegExp(`guideId="${id}"`));
  }

  const { serializeFixture } = require(path.join(tmp, "app/demo/viewer/fixture.js"));
  // Optional cross-repository integration runs the actual Core port, not a replica.
  let corePort;
  if (process.env.CORE_DEMO_ROOT) {
    const source = fs.readFileSync(path.join(process.env.CORE_DEMO_ROOT, "src/demo-viewer/mock-port.ts"), "utf8");
    const mod = { exports: {} };
    new Function("module", "exports", ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(mod, mod.exports);
    corePort = mod.exports.createDemoPreviewPort;
  }
  const begin = (id) => startGuide(guideById.get(id), { instanceId: id });
  const complete = (s, expected = true) => assert.equal(isStepComplete(s), expected, `${s.guideId}/${s.stepId}`);
  const next = (s) => {
    complete(s);
    const steps = guideById.get(s.guideId).steps;
    const at = steps.findIndex((step) => step.stepId === s.stepId);
    assert.ok(steps[at + 1], "no skipped or restarted steps");
    return goToStep(s, steps[at + 1].stepId);
  };
  const act = applyGuideIntent;
  const choose = (s, id) => {
    const world = worldForVariant();
    const direction = world.directions.find((d) => d.id === id);
    const group = world.groups.find((g) => g.directionIds.includes(id));
    return act(s, { type: "graph_presentation", presentation: { ...s.snapshot.graph, selected: { groupId: group.id, groupRevisionId: group.revisionId, artifactId: id, revisionId: direction.revisionId, name: direction.name } } });
  };
  const resource = async (s, expectedStatus, expectedLevel) => {
    const step = guideById.get(s.guideId).steps.find((item) => item.stepId === s.stepId);
    const paperId = s.snapshot.preview.id;
    assert.equal(s.snapshot.preview.kind, "paper");
    if (corePort) {
      const fixture = { ...serializeFixture(worldForVariant(step.variant)), missingResourceIds: missingResourceIds(step.variant) };
      const port = corePort(fixture, s.snapshot, (result) => { s = act(s, result); });
      try { await port.get({ scope: "demo", kind: "paper", id: paperId, revision: { mode: "latest" } }, new AbortController().signal); }
      catch (error) { assert.equal(error.code, expectedStatus); }
    } else {
      s = act(s, { type: "resource_result", paperId, status: expectedStatus, readingLevel: expectedLevel });
    }
    assert.equal(s.resource.status, expectedStatus);
    if (expectedLevel) assert.equal(s.resource.readingLevel, expectedLevel);
    return s;
  };

  // 1. Every transition uses Next, with actual Task picker + Send handlers.
  let first = begin("get-started"); complete(first, false);
  first = act(first, { type: "edit_draft", text: GUIDE_PRESET_PROMPT });
  first = next(first); complete(first, false);
  first = act(first, { type: "prepare_task", action: "explore" }); // actual TaskMenu/DemoApp callback
  assert.equal(first.snapshot.visibleGroupIds.includes("G1"), false);
  first = next(first); complete(first); // confirm the actual prepared chip
  first = next(first); complete(first, false);
  first = act(first, { type: "send_task" }); complete(first);
  assert.deepEqual(first.snapshot.visibleGroupIds, ["G1"]);
  assert.ok(["duplicate-send", "not-prepared"].includes(act(first, { type: "send_task" }).ignored));
  assert.deepEqual(act(first, { type: "send_task" }).snapshot.sentTaskIds, first.snapshot.sentTaskIds);
  assert.equal(begin("get-started").snapshot.visibleGroupIds.length, 0);

  // 2. Actual graph callback bridges selection into direction state and Explore.
  let refine = begin("explore-directions"); complete(refine, false);
  const wrong = act(act(refine, { type: "prepare_task", action: "explore", directionId: "d-controllable" }), { type: "send_task" });
  assert.equal(wrong.ignored, "unsupported-target");
  assert.equal(wrong.snapshot.visibleGroupIds.includes("G2"), false);
  refine = choose(refine, "d-consistency"); complete(refine);
  refine = next(refine); complete(refine, false);
  refine = act(refine, { type: "prepare_task", action: "explore", directionId: refine.snapshot.selectedDirectionId });
  assert.equal(refine.snapshot.task.targetDirectionId, "d-consistency");
  refine = next(refine); complete(refine, false);
  refine = act(refine, { type: "send_task" }); complete(refine);
  assert.deepEqual(refine.snapshot.visibleGroupIds, ["G1", "G2"]);
  assert.equal(worldForVariant().groups.find((g) => g.id === "G2").parent.directionId, "d-consistency");

  // 3. Paper remains open across ordinary Next; ready comes from the real port.
  let papers = begin("read-evidence"); complete(papers, false);
  papers = act(papers, { type: "edit_draft", text: "我的阅读笔记" });
  papers = act(papers, { type: "open_paper", paperId: "P02" }); complete(papers, false);
  papers = await resource(papers, "ready", "full_text"); complete(papers);
  const openSnapshot = papers.snapshot;
  papers = next(papers);
  assert.equal(papers.snapshot, openSnapshot, "Next must not replace the paper/checkpoint");
  assert.equal(papers.snapshot.preview.id, "P02"); complete(papers);
  papers = next(papers); complete(papers, false);
  papers = act(papers, { type: "close_preview" }); complete(papers);
  assert.equal(papers.snapshot.selectedDirectionId, "d-crossshot");
  assert.equal(papers.snapshot.draft, "我的阅读笔记");

  // 4. Fold and Back need an operation, not seeded visible groups/root state.
  let graph = begin("research-graph"); complete(graph, false);
  graph = act(graph, { type: "graph_presentation", presentation: graph.snapshot.graph }); complete(graph, false);
  graph = act(graph, { type: "graph_presentation", presentation: { ...graph.snapshot.graph, rootOpen: !graph.snapshot.graph.rootOpen } }); complete(graph);
  assert.deepEqual(graph.snapshot.visibleGroupIds, ["G1", "G2", "G3"]);
  graph = next(graph); complete(graph, false);
  graph = choose(graph, "d-crossshot"); complete(graph);
  graph = next(graph); complete(graph);
  graph = next(graph); complete(graph, false);
  graph = act(graph, { type: "close_preview" }); complete(graph);
  assert.deepEqual(graph.snapshot.visibleGroupIds, ["G1", "G2", "G3"]);

  // 5. Ordinary referenced Send is NOT Explore, and normal Next retains context.
  let follow = begin("continue-research"); complete(follow, false);
  follow = act(follow, { type: "add_context", directionId: "d-crossshot" });
  follow = next(follow);
  assert.deepEqual(follow.snapshot.contextDirectionIds, ["d-crossshot"]); complete(follow, false);
  const unsupported = act(act(follow, { type: "prepare_task", action: "explore", directionId: "d-controllable" }), { type: "send_task" });
  assert.equal(unsupported.ignored, "unsupported-target"); complete(unsupported, false);
  const beforeTasks = follow.snapshot.sentTaskIds;
  follow = act(follow, { type: "edit_draft", text: "请继续比较这些条件" });
  const blocked = act(follow, { type: "send_message" });
  assert.equal(blocked.ignored, "need-example"); complete(blocked, false);
  follow = acknowledgeExample(blocked);
  follow = act(follow, { type: "send_message" }); complete(follow);
  assert.equal(follow.snapshot.draft, "请继续比较这些条件");
  assert.deepEqual(follow.snapshot.sentTaskIds, beforeTasks, "message must never launch an Explore result");
  assert.ok(follow.snapshot.reply.text.includes("预录"));
  assert.equal(act(follow, { type: "send_message" }).ignored, "duplicate-message");
  const restoredFollow = resetStep(follow);
  assert.equal(restoredFollow.snapshot.draft, follow.snapshot.draft);
  assert.deepEqual(restoredFollow.snapshot.contextDirectionIds, ["d-crossshot"]);
  assert.equal(restoredFollow.snapshot.reply, undefined);
  complete(restoredFollow, false);
  assert.equal(restoredFollow.exampleAcknowledged, false);
  assert.equal(act(restoredFollow, { type: "send_message" }).ignored, "need-example");
  complete(act(acknowledgeExample(restoredFollow), { type: "send_message" }));

  // Exceptions traverse fixture/version boundaries; labels alone cannot complete.
  let recovery = begin("troubleshooting");
  for (const [status, level] of [["ready", "metadata"], ["unavailable"], ["missing"]]) {
    complete(recovery, false);
    complete(resetStep(recovery), false);
    const unrelated = act(act(recovery, { type: "open_paper", paperId: "P01" }), { type: "resource_result", paperId: "P01", status: "missing" });
    complete(act(unrelated, { type: "close_preview" }), false);
    const wrongOutcome = act(act(recovery, { type: "open_paper", paperId: "P03" }), { type: "resource_result", paperId: "P03", status: "cancelled" });
    complete(act(wrongOutcome, { type: "close_preview" }), false);
    recovery = act(recovery, { type: "open_paper", paperId: "P03" }); complete(recovery, false);
    recovery = await resource(recovery, status, level); complete(recovery, false);
    recovery = act(recovery, { type: "cancel_preview" }); complete(recovery);
    assert.ok(recovery.completedStepIds.includes(recovery.stepId));
    const currentStepId = recovery.stepId;
    const checkpoint = guideById.get(recovery.guideId).steps.find((item) => item.stepId === currentStepId).recoveryCheckpointMs;
    recovery = resetStep(recovery); complete(recovery, false);
    assert.equal(recovery.snapshot.t, checkpoint);
    assert.equal(recovery.snapshot.preview.kind, "direction");
    assert.equal(recovery.resource, null);
    assert.equal(recovery.recoveryObserved, false);
    assert.equal(recovery.recovered, false);
    assert.deepEqual(recovery.stepActions, []);
    assert.equal(recovery.completedStepIds.includes(currentStepId), false);
    recovery = act(recovery, { type: "resource_result", paperId: "P03", status, readingLevel: level }); complete(recovery, false);
    recovery = act(recovery, { type: "close_preview" }); complete(recovery, false);
    recovery = act(recovery, { type: "open_paper", paperId: "P03" });
    recovery = await resource(recovery, status, level); complete(recovery, false);
    recovery = act(recovery, { type: "close_preview" }); complete(recovery);
    recovery = next(recovery);
  }
  complete(recovery, false);
  recovery = act(recovery, { type: "edit_draft", text: "中断前的草稿" });
  recovery = act(recovery, { type: "add_context", directionId: "d-crossshot" }); complete(recovery, false);
  recovery = resetStep(recovery); complete(recovery, false);
  complete(recoverInterruptedStep(recovery), false);
  recovery = act(recovery, { type: "edit_draft", text: "中断前的草稿" });
  recovery = recoverInterruptedStep(recovery); complete(recovery);
  const recoveredAgain = resetStep(recovery); complete(recoveredAgain, false);
  assert.deepEqual(recoveredAgain.stepActions, []);
  assert.equal(recoveredAgain.completedStepIds.includes("interruption"), false);
  assert.equal(recovery.snapshot.draft, "中断前的草稿");
  assert.deepEqual(recovery.snapshot.contextDirectionIds, ["d-crossshot"]);

  // Watch uses the same reducer and transitions, with a real read acknowledgement.
  for (const id of PRIMARY_GUIDE_IDS) {
    let watch = startGuide(guideById.get(id), { mode: "watch" });
    const steps = guideById.get(id).steps;
    for (let i = 0; i < steps.length; i++) {
      watch = applyExpectedStep(watch);
      if (id === "read-evidence" && i === 0) watch = await resource(watch, "ready", "full_text");
      complete(watch);
      if (i + 1 < steps.length) watch = next(watch);
    }
    const restart = begin(id);
    assert.equal(restart.stepId, steps[0].stepId);
    assert.equal(restart.followupSent, false);
  }
  const docsPage = fs.readFileSync(path.join(root, "app/docs/page.tsx"), "utf8");
  assert.match(docsPage, /开始使用/);
  assert.match(docsPage, /产品理念 \/ 设计文档/);
  assert.match(docsPage, /PRIMARY_GUIDE_IDS/);

  console.log(`PASS: all five COMPLETE sequential practice + watch flows; graph callbacks, Next retention, ordinary Send, real recovery/cancel/retry; Core port integration=${Boolean(corePort)}.`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
