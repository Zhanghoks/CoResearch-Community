import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { transpileModuleGraph } from "./transpile-app.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "coresearch-story-"));
try {
  transpileModuleGraph({
    ts,
    root,
    tmp,
    entries: ["app/graph-svg/mock-world.ts", "app/graph-svg/story.ts", "app/graph-svg/scene.ts", "app/demo/scenes/concept.ts"],
  });
  const { world, nodeAt, communityMeta, sharedForegroundIds, isForegroundNode } = require(path.join(tmp, "app/graph-svg/mock-world.js"));
  const { chapters, sampleStory, sampleConcept, cameraTransform, LABEL_MIN_PX, QUESTION_MIN_PX, CONCEPT_DURATION_MS, paperCardLabel } = require(path.join(tmp, "app/graph-svg/story.js"));
  const { createSceneRenderer } = require(path.join(tmp, "app/graph-svg/scene.js"));
  const { factsForAct, CONCEPT_KERNEL_T, conceptPhaseCheckpointMs, conceptProgressAt, conceptActTimings } = require(path.join(tmp, "app/demo/scenes/concept.js"));
  const { OPEN_QUESTION_ID, coverageById, counterexamples, openQuestions, INTEREST_PROMPT } = require(path.join(tmp, "app/demo/fixtures/video-identity.js"));

  assert.equal(chapters.length, 8, "the concept story is eight causal acts");
  assert.equal(new Set(chapters.map((c) => c.id)).size, 8);
  assert.deepEqual(chapters.map((c) => c.id), ["interest", "choose", "read", "compare", "coverage", "revise", "question", "next-step"]);
  assert.equal(LABEL_MIN_PX, 14);
  assert.equal(QUESTION_MIN_PX, 16);
  assert.ok(CONCEPT_DURATION_MS >= 60000 && CONCEPT_DURATION_MS <= 75000, `duration ${CONCEPT_DURATION_MS} should be 60–75s`);
  assert.equal(conceptActTimings.length, 8);
  assert.equal(conceptActTimings[7].holdMs, 12000);
  assert.equal(conceptPhaseCheckpointMs(7), conceptActTimings[7].checkpointMs);

  for (const chapter of chapters) {
    assert.ok(chapter.action && chapter.change && chapter.next, `${chapter.id} states action, change, and next`);
    assert.doesNotMatch(chapter.title + chapter.body + chapter.takeaway, /Gap Finder|候选缺口/);
  }
  assert.match(chapters.map((chapter) => chapter.body + chapter.takeaway).join("\n"), /合成教学|演示文献/);
  assert.match(chapters[0].body, /合成教学数据/);
  assert.match(chapters[7].takeaway, /概念演示/);

  const question = openQuestions[0];
  const atQuestion = sampleConcept(6);
  const atNext = sampleConcept(7);
  assert.equal(atQuestion.facts.openQuestionId, OPEN_QUESTION_ID);
  assert.equal(atNext.facts.openQuestionId, OPEN_QUESTION_ID);
  assert.equal(atQuestion.facts.statusLabel.includes("未验证"), true);
  assert.match(question.question, /相同计算预算/);
  assert.match(chapters[6].body, /相同计算预算/);
  assert.ok(chapters[6].body.includes(question.question) || chapters[6].body.includes("不确定性"));

  const before = sampleConcept(4);
  const after = sampleConcept(5);
  assert.equal(before.active, 4);
  assert.equal(after.active, 5);
  assert.equal(before.facts.coverage && before.facts.coverage.revises, false, "act 5 records coverage without revising it");
  assert.equal(before.facts.coverage.recordId, "cov-short-visible");
  assert.equal(after.facts.coverage.revises, true, "act 6 revises the same coverage record");
  assert.equal(after.facts.coverage.recordId, "cov-short-visible");
  assert.ok(after.facts.coverage.previousStatement);
  assert.ok(after.facts.coverage.revisedStatement);
  assert.notEqual(after.facts.coverage.previousStatement, after.facts.coverage.revisedStatement);
  assert.deepEqual(after.facts.coverage.counterexampleIds, ["CE01", "CE02"]);
  assert.ok(after.facts.paperIds.includes("P05") && after.facts.paperIds.includes("P03"));
  assert.ok(after.facts.relations.every((relation) => relation.label.length > 0));
  assert.deepEqual(sampleConcept(4).facts, before.facts, "seeking back to act 5 restores the pre-revision record");
  assert.notDeepEqual(before.facts, after.facts);
  const cov = coverageById.get("cov-short-visible");
  assert.equal(before.facts.coverage.statement, cov.statement);
  assert.ok(counterexamples.every((item) => item.revisesRecordId === "cov-short-visible"));

  for (let index = 0; index < 8; index += 1) {
    const facts = factsForAct(index);
    assert.ok(facts.foregroundIds.length >= 4 && facts.foregroundIds.length <= 7, `act ${index + 1} foreground ${facts.foregroundIds.length}`);
    assert.equal(facts.kernelT, CONCEPT_KERNEL_T[index]);
    assert.equal(facts.interestPrompt, INTEREST_PROMPT);
  }
  assert.equal(factsForAct(0).paperIds.length, 0);
  assert.deepEqual(factsForAct(2).paperIds, ["P01", "P02"]);
  assert.ok(paperCardLabel("P01").includes("P01"));

  const ids = new Set(world.nodes.map((n) => n.id));
  assert.equal(ids.size, world.nodes.length);
  for (const n of world.nodes) assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y) && n.radius > 0);
  for (const e of world.edges) { assert.ok(ids.has(e.source) && ids.has(e.target)); assert.equal(e.verified, false); }
  assert.equal(communityMeta.length, 7);
  const palette = new Set();
  for (const c of communityMeta) {
    assert.ok(c.key && /^#[0-9a-f]{6}$/i.test(c.color));
    assert.ok(!palette.has(c.key));
    palette.add(c.key);
  }
  const mapped = sharedForegroundIds();
  for (const fixtureId of ["d-video", "d-consistency", "d-identity", "d-crossshot", "P01", "P02", "P05", "P03", "P06", OPEN_QUESTION_ID]) {
    assert.equal(nodeAt(fixtureId).fixtureId, fixtureId);
    assert.ok(mapped[fixtureId]);
  }
  const foreground = world.nodes.filter((node) => isForegroundNode(node));
  const background = world.nodes.filter((node) => !isForegroundNode(node));
  assert.ok(foreground.length >= 10);
  assert.ok(background.length > 0, "weak background context remains, but it is not a quality metric");
  for (const n of foreground) assert.equal(n.alpha, 1);
  for (const n of background) {
    assert.ok(palette.has(n.community));
    assert.ok(n.alpha < 0.5, `background ${n.id} stays visually weak`);
  }
  for (const c of communityMeta) assert.ok(!["idea", "gap", "candidate"].includes(c.key));
  const accents = { idea: "#e0a63a", gap: "#c49654", boundary: "#9483b0", transfer: "#4e8f7f" };
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const channelGap = (a, b) => Math.max(...rgb(a).map((v, i) => Math.abs(v - rgb(b)[i])));
  for (const c of communityMeta) {
    for (const [role, hex] of Object.entries(accents)) {
      assert.ok(channelGap(c.color, hex) >= 20, `community ${c.color} collides with the ${role} accent ${hex}`);
    }
  }

  const { routeArrivals } = require(path.join(tmp, "app/graph-svg/mock-world.js"));
  assert.deepEqual(world.routes.explore, ["video", "consistency", "subject", "multi-shot"]);
  for (const route of [world.routes.explore, world.routes.lineage]) {
    const arrivals = routeArrivals(route);
    assert.equal(arrivals.length, route.length);
    assert.ok(arrivals.every((v, i) => v >= 0 && v <= 1 && (i === 0 || v > arrivals[i - 1])));
    assert.equal(arrivals.at(-1), 1);
    for (let i = 1; i < route.length; i++) assert.ok(world.edges.some((e) => e.source === route[i - 1] && e.target === route[i]), "semantic path follows defined edges");
  }

  const samples = new Map();
  for (let i = 0; i <= 160; i++) {
    const p = i / 20;
    const state = sampleConcept(p);
    assert.ok(Object.values(state.pose).every((value) => Number.isFinite(value)));
    assert.ok(state.active >= 0 && state.active < 8);
    samples.set(p, JSON.stringify(state));
  }
  for (const [p, state] of [...samples].reverse()) assert.equal(JSON.stringify(sampleConcept(p)), state, "reverse seeking is deterministic");
  for (let i = 0; i < chapters.length; i++) {
    assert.deepEqual(sampleStory(i).pose, chapters[i].pose);
    assert.equal(sampleStory(i).active, i);
    assert.equal(sampleConcept(i).facts.kernelT, CONCEPT_KERNEL_T[i]);
  }
  assert.equal(sampleStory(NaN).active, 0);
  assert.equal(sampleStory(-5).active, 0);
  assert.equal(sampleStory(1000).active, 7);
  assert.equal(sampleStory(0).pose.question, 0);
  assert.equal(sampleStory(4).pose.revision, 0);
  assert.ok(sampleStory(5).pose.revision > 0);
  assert.equal(sampleStory(1).pose.markerX, nodeAt("multi-shot").x);
  assert.ok(cameraTransform(sampleStory(7).pose).startsWith("translate("));
  assert.equal(conceptProgressAt(conceptPhaseCheckpointMs(5)), 5);
  assert.ok(conceptProgressAt(conceptActTimings[5].startMs + 10) < 5);

  const make = (dataset = {}) => ({ dataset, style: {}, attributes: {}, setAttribute(k, v) { this.attributes[k] = v; } });
  const camera = make(), marker = make(), bar = make();
  const layers = ["base", "path", "evidence", "coverage", "unverified", "revision", "question", "nextStep"].map((name) => make({ rwLayer: name }));
  const draws = ["path", "unverified"].map((name) => make({ rwDraw: name }));
  const stops = Array.from({ length: 4 }, (_, i) => make({ rwStop: String(i) }));
  const staggered = ["evidence:0:2", "evidence:1:2"].map((spec) => make({ rwStagger: spec }));
  const render = createSceneRenderer({
    querySelector: (q) => q.includes("camera") ? camera : q.includes("marker") ? marker : bar,
    querySelectorAll: (q) => q.includes("layer") ? layers : q.includes("draw") ? draws : q.includes("stagger") ? staggered : q.includes("dim") ? [] : stops,
    setAttribute() {},
  });
  render(7, chapters.length);
  assert.equal(layers.find((e) => e.dataset.rwLayer === "question").style.visibility, "visible");
  render(0, chapters.length);
  assert.equal(layers.find((e) => e.dataset.rwLayer === "question").style.visibility, "hidden");
  assert.equal(layers.find((e) => e.dataset.rwLayer === "revision").style.visibility, "hidden");
  const base = layers.find((e) => e.dataset.rwLayer === "base");
  for (const p of [0, 3, 5, 7]) {
    render(p, chapters.length);
    assert.ok(!base.style.filter, `base layer stays filter-free at act ${p}`);
  }
  render(5, chapters.length);
  assert.equal(layers.find((e) => e.dataset.rwLayer === "revision").style.visibility, "visible");
  render(4, chapters.length);
  assert.equal(layers.find((e) => e.dataset.rwLayer === "revision").style.visibility, "hidden");
  const stopAt = (p, i) => { render(p, chapters.length); return Number(stops[i].style.opacity); };
  assert.equal(stopAt(1, 3), 1, "the chosen path keeps every stop after it settles");
  assert.equal(stopAt(5, 3), 1, "explored stops persist into later acts");
  const mid = stopAt(0.4, 2);
  assert.ok(mid >= 0 && mid <= 1);
  console.log(`PASS: ${chapters.length} causal acts, fixture-backed foreground, act-6 coverage revision is reversible; ${world.nodes.length} nodes remain context only, not a quality metric.`);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
