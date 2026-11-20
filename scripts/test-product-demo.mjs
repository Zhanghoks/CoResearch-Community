import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { transpileModuleGraph } from "./transpile-app.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "coresearch-product-demo-"));
try {
  transpileModuleGraph({
    ts,
    root,
    tmp,
    entries: ["app/product-demo/scenario.ts", "app/product-demo/stage.ts"],
  });
  const {
    phases, sampleScenario, sampleAtElapsed, phaseStart, phaseCheckpoint, scenarioDuration,
    conversation, questionText, detailCopy, streamFullCopy, streamIds, detailFields, treeNodes, treeEdges,
    paperRef,
  } = require(path.join(tmp, "app/product-demo/scenario.js"));
  const { createDemoRenderer } = require(path.join(tmp, "app/product-demo/stage.js"));

  const stateKeys = ["caption", "messages", "streams", "timer", "context", "tree", "current", "focus", "detail", "paper", "session", "canvasCount", "checklist", "candidate", "processingMeta"];
  for (const phase of phases) {
    const settled = sampleScenario(phases.indexOf(phase));
    for (const key of stateKeys) assert.ok(key in settled, `${phase.id} covers ${key}`);
    for (const field of detailFields) assert.ok(field in settled.detail, `${phase.id} detail covers ${field}`);
  }
  assert.equal(streamFullCopy.composer, questionText);
  assert.equal(questionText, "视频生成，我想找一个值得研究的问题");
  for (const id of streamIds) assert.ok(streamFullCopy[id].length > 0, `stream ${id} has declared copy`);
  for (const field of detailFields) assert.ok(typeof detailCopy[field] === "string", `detail ${field} declared`);
  assert.ok(paperRef.title.includes("演示文献"));
  assert.ok(paperRef.meta.includes("CoResearch Demo"));

  assert.equal(new Set(phases.map((phase) => phase.id)).size, phases.length, "phase ids are unique");
  for (const phase of phases) assert.ok(Number.isFinite(phase.duration) && phase.duration > 0, `${phase.id} duration`);
  assert.ok(scenarioDuration >= 35 && scenarioDuration <= 40, `loop of ${scenarioDuration}s matches the spec band`);
  assert.equal(scenarioDuration, phases.reduce((total, phase) => total + phase.duration, 0));

  // Integer N is the readable checkpoint, not the start of the phase.
  const intent = sampleScenario(0);
  assert.equal(intent.caption.tag, "INTENT");
  assert.equal(intent.messages, 2, "checkpoint 0: the Explore task was sent");
  assert.equal(intent.session, true);
  assert.equal("composer" in intent.streams ? intent.streams.composer : "", "");
  assert.equal(intent.current, "");
  assert.equal(intent.tree.includes("d-video"), true);
  assert.equal(intent.tree.includes("d-consistency"), false, "G1 has not arrived at the intent checkpoint");

  const g1 = sampleScenario(1);
  assert.equal(g1.caption.tag.includes("G1"), true);
  assert.ok(g1.tree.includes("d-consistency") && g1.tree.includes("d-controllable") && g1.tree.includes("d-narrative"));
  assert.equal(g1.tree.includes("d-identity"), false, "subject identity is not a G1 sibling");

  const g2 = sampleScenario(2);
  assert.ok(g2.tree.includes("d-identity") && g2.tree.includes("d-scene") && g2.tree.includes("d-motion"));
  assert.equal(g2.current, "d-consistency");

  const g3 = sampleScenario(3);
  assert.ok(g3.tree.includes("d-crossshot") && g3.tree.includes("d-multi-person") && g3.tree.includes("d-style"));
  assert.equal(g3.current, "d-identity");

  const evidence = sampleScenario(4);
  assert.equal(evidence.paper, true);
  assert.equal(evidence.detail.evidence, true);
  assert.equal(evidence.processingMeta.includes("读取全文"), true);

  const revision = sampleScenario(5);
  assert.equal(revision.checklist[0], "pass");
  assert.equal(revision.checklist[1], "pass");
  assert.ok(revision.tree.includes("n-revision"));

  const last = sampleScenario(phases.length - 1);
  assert.equal(last.candidate, true);
  assert.equal(last.current, "d-crossshot");
  assert.equal(last.focus, "n-candidate");
  assert.equal(last.streams.question, detailCopy.question);
  assert.ok(last.processingMeta.includes("读取全文 6 篇"));
  assert.ok(last.processingMeta.includes("演示节奏"));
  assert.deepEqual(last.checklist, ["pass", "pass", "hold"]);
  assert.equal(last.canvasCount, 6);

  // Absolute-time midpoints: composer types before prepare; it does not rewind after a checkpoint.
  const typing = sampleAtElapsed(2);
  assert.equal(typing.messages, 0);
  assert.equal(typing.session, false);
  assert.ok(typing.streams.composer.length > 0 && typing.streams.composer.length < questionText.length, "composer streams a prefix");
  const sent = sampleAtElapsed(4.2);
  assert.equal(sent.messages, 2);
  assert.equal(sent.session, true);

  const g3Checkpoint = phaseCheckpoint(3);
  const g3Continued = sampleAtElapsed(g3Checkpoint + 0.000001);
  assert.ok(g3Continued.tree.includes("d-crossshot"), "continuing past the G3 checkpoint does not clear the tree");
  const g3Started = sampleAtElapsed(phaseStart(3) + 0.01);
  assert.equal(g3Started.tree.includes("d-crossshot"), false, "the G3 scene start is still before the group arrives");

  // Determinism in both directions over absolute seconds.
  const samples = new Map();
  for (let i = 0; i <= 72; i++) {
    const elapsed = i / 2;
    samples.set(elapsed, JSON.stringify(sampleAtElapsed(elapsed)));
    assert.equal(JSON.stringify(sampleAtElapsed(elapsed)), samples.get(elapsed));
  }
  for (const [elapsed, state] of [...samples].reverse()) {
    assert.equal(JSON.stringify(sampleAtElapsed(elapsed)), state, "reverse seeking is deterministic");
  }

  // Streams, when present, are prefixes / full declared copy. Open question appears in full.
  for (const [elapsed, serialized] of samples) {
    const state = JSON.parse(serialized);
    for (const [id, value] of Object.entries(state.streams)) {
      assert.ok(streamFullCopy[id].startsWith(value), `stream ${id} at ${elapsed}s is a prefix`);
    }
    if (state.detail.question) assert.equal(state.streams.question, detailCopy.question, "the open question is not typed out character by character");
  }

  for (let i = 1; i < phases.length; i++) {
    assert.ok(sampleScenario(i).messages >= sampleScenario(i - 1).messages, "messages accumulate across checkpoints");
    for (const id of sampleScenario(i - 1).tree) {
      assert.ok(sampleScenario(i).tree.includes(id), `tree accumulates ${id}`);
    }
  }

  assert.equal(sampleScenario(NaN).phase, 0);
  assert.equal(sampleScenario(-5).phase, 0);
  assert.equal(sampleScenario(1000).phase, phases.length - 1);

  assert.ok(treeNodes.length >= 12);
  assert.ok(treeNodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y) && node.id && node.label));
  const nodeIds = new Set(treeNodes.map((node) => node.id));
  const edgeIds = new Set(treeEdges.map((edge) => edge.id));
  const declaredIds = new Set([...nodeIds, ...edgeIds]);
  for (const edge of treeEdges) assert.ok(nodeIds.has(edge.from) && nodeIds.has(edge.to), `edge ${edge.id} references declared nodes`);
  for (let i = 0; i < phases.length; i++) {
    for (const id of sampleScenario(i).tree) assert.ok(declaredIds.has(id), `phase ${i} tree id ${id} is declared`);
  }

  function makeEl(dataset = {}) {
    const classes = new Set();
    const el = {
      dataset, writes: 0, attributes: {}, text: "", children: null, lists: null,
      style: { setProperty() {} },
      classList: {
        toggle(name, on) {
          const want = Boolean(on);
          const has = classes.has(name);
          if (has === want) return;
          if (want) classes.add(name); else classes.delete(name);
          el.writes++;
        },
        has: (name) => classes.has(name),
      },
      setAttribute(key, value) { el.attributes[key] = value; el.writes++; },
      querySelector(selector) { return el.children?.[selector] ?? null; },
      querySelectorAll(selector) { return el.lists?.[selector] ?? []; },
    };
    Object.defineProperty(el, "textContent", {
      get: () => el.text,
      set(value) { const next = String(value); if (el.text !== next) { el.text = next; el.writes++; } },
    });
    return el;
  }
  assert.throws(() => createDemoRenderer({ querySelector: () => null, querySelectorAll: () => [] }), /missing its stage/, "a missing stage is a hard error");

  const stage = makeEl();
  const streamEls = Object.fromEntries(streamIds.map((id) => [id, makeEl({ pdStream: id })]));
  const messages = conversation.map(() => makeEl());
  const details = detailFields.map((field) => makeEl({ pdDetail: field }));
  const checks = [0, 1, 2].map((index) => makeEl({ pdCheck: String(index) }));
  const tree = [...nodeIds, ...edgeIds].map((id) => makeEl({ pdTree: id }));
  const paper = makeEl({ pdPaper: "" });
  const session = makeEl({ pdSession: "" });
  const candidate = makeEl({ pdCandidate: "" });
  const processing = makeEl({ pdProcessing: "" });
  const review = makeEl({ pdReview: "" });
  const mention = makeEl({ pdMention: "" });
  const canvasCount = makeEl({ pdCanvasCount: "" });
  const timerEl = makeEl({ pdTimer: "" });
  const contextEl = makeEl({ pdContext: "" });
  const processingMeta = makeEl({ pdProcessingMeta: "" });
  const currentBadge = makeEl();
  const focusMarker = makeEl();
  const bySelector = {
    "[data-pd-stage]": stage,
    "[data-pd-paper]": paper, "[data-pd-session]": session, "[data-pd-candidate]": candidate,
    "[data-pd-processing]": processing, "[data-pd-review]": review, "[data-pd-mention]": mention,
    "[data-pd-canvas-count]": canvasCount, "[data-pd-timer]": timerEl, "[data-pd-context]": contextEl,
    "[data-pd-processing-meta]": processingMeta,
    "[data-pd-current]": currentBadge, "[data-pd-focus]": focusMarker,
  };
  const listsBySelector = {
    "[data-pd-stream]": Object.values(streamEls),
    "[data-pd-msg]": messages, "[data-pd-detail]": details, "[data-pd-check]": checks,
    "[data-pd-tree]": tree,
  };
  const render = createDemoRenderer({
    querySelector: (q) => bySelector[q] ?? null,
    querySelectorAll: (q) => listsBySelector[q] ?? [],
  });

  render(sampleScenario(0));
  assert.equal(stage.dataset.phase, "0");
  assert.equal(streamEls.composer.textContent, "", "the composer was cleared by the send");
  assert.equal(messages[0].classList.has("pd-on"), true);
  assert.equal(messages[1].classList.has("pd-on"), true);
  assert.equal(messages[2].classList.has("pd-on"), false);
  assert.equal(session.classList.has("pd-on"), true);
  assert.equal(processing.classList.has("pd-on"), true, "the processing row can show compressed timing after send");
  const treeById = Object.fromEntries(tree.map((el) => [el.dataset.pdTree, el]));
  assert.equal(treeById["d-video"].classList.has("pd-on"), true);
  assert.equal(treeById["n-candidate"].classList.has("pd-on"), false);
  const rootPos = treeNodes.find((node) => node.id === "d-video");
  assert.equal(focusMarker.attributes["transform"], `translate(${rootPos.x} ${rootPos.y})`);

  render(sampleScenario(phases.length - 1));
  assert.equal(stage.dataset.phase, String(phases.length - 1));
  const finalTree = new Set(last.tree);
  for (const id of finalTree) assert.equal(treeById[id].classList.has("pd-on"), true, `final tree shows ${id}`);
  assert.equal(messages.every((message) => message.classList.has("pd-on")), true);
  assert.equal(details.every((el) => el.classList.has("pd-on")), true);
  assert.equal(paper.classList.has("pd-on"), true);
  assert.equal(candidate.classList.has("pd-on"), true);
  assert.equal(review.classList.has("pd-on"), true);
  assert.equal(processingMeta.textContent.includes("读取全文 6 篇"), true);
  assert.deepEqual(checks.map((check) => check.dataset.state), ["pass", "pass", "hold"]);
  const crossshotPos = treeNodes.find((node) => node.id === "d-crossshot");
  assert.equal(currentBadge.attributes["transform"], `translate(${crossshotPos.x} ${crossshotPos.y})`);
  const candidatePos = treeNodes.find((node) => node.id === "n-candidate");
  assert.equal(focusMarker.attributes["transform"], `translate(${candidatePos.x} ${candidatePos.y})`);

  render(sampleAtElapsed(2));
  assert.ok(streamEls.composer.text.length > 0 && streamEls.composer.text.length < questionText.length, "composer is mid-stream");

  const totalWrites = () => [stage, currentBadge, focusMarker, paper, session, candidate, processing, review, mention, canvasCount, timerEl, contextEl, processingMeta, ...Object.values(streamEls), ...messages, ...details, ...checks, ...tree].reduce((sum, el) => sum + el.writes, 0);
  render(sampleScenario(5));
  const writesAfterFirst = totalWrites();
  render(sampleScenario(5));
  assert.equal(totalWrites(), writesAfterFirst, "same state writes nothing new");

  console.log(`PASS: ${phases.length} phases, ${scenarioDuration}s duration; shared-fixture checkpoints, hierarchy, derived counts, absolute-time playback and stage effects.`);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
