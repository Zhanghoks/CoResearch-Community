import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(import.meta.dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "coresearch-product-demo-"));
try {
  for (const filename of ["scenario", "stage"]) {
    const result = ts.transpileModule(fs.readFileSync(path.join(root, `app/product-demo/${filename}.ts`), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
      reportDiagnostics: true,
    });
    assert.equal((result.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0, `${filename} syntax`);
    fs.writeFileSync(path.join(tmp, `${filename}.js`), result.outputText);
  }
  const {
    phases, sampleScenario, progressAt, scenarioDuration,
    conversation, questionText, detailCopy, streamFullCopy, streamIds, detailFields, treeNodes, treeEdges,
  } = require(path.join(tmp, "scenario.js"));
  const { createDemoRenderer } = require(path.join(tmp, "stage.js"));

  // 阶段状态的键完整性：每个 settled 状态都覆盖 ScenarioState 的全部面板字段。
  const stateKeys = ["caption", "messages", "streams", "timer", "context", "tree", "current", "focus", "detail", "paper", "session", "canvasCount", "checklist", "candidate"];
  for (const phase of phases) {
    const settled = sampleScenario(phases.indexOf(phase));
    for (const key of stateKeys) assert.ok(key in settled, `${phase.id} covers ${key}`);
    for (const field of detailFields) assert.ok(field in settled.detail, `${phase.id} detail covers ${field}`);
  }
  // 流式目标与详情字段有声明；流式全文案与提问文案一一对应。
  assert.equal(streamFullCopy.composer, questionText);
  for (const id of streamIds) assert.ok(streamFullCopy[id].length > 0, `stream ${id} has declared copy`);
  for (const field of detailFields) assert.ok(typeof detailCopy[field] === "string", `detail ${field} declared`);

  // Phase definitions: unique ids, positive durations; the loop sits in the spec's 35–40s band.
  assert.equal(new Set(phases.map((p) => p.id)).size, phases.length, "phase ids are unique");
  for (const phase of phases) assert.ok(Number.isFinite(phase.duration) && phase.duration > 0, `${phase.id} duration`);
  assert.ok(scenarioDuration >= 35 && scenarioDuration <= 40, `loop of ${scenarioDuration}s matches the spec band`);

  // Determinism: the same progress always yields the same state, in either direction.
  const samples = new Map();
  for (let i = 0; i <= 140; i++) {
    const p = i / 20;
    samples.set(p, JSON.stringify(sampleScenario(p)));
    assert.equal(JSON.stringify(sampleScenario(p)), samples.get(p), "same progress yields the same state");
  }
  for (const [p, state] of [...samples].reverse()) assert.equal(JSON.stringify(sampleScenario(p)), state, "reverse seeking is deterministic");

  // Integer progress equals the phase's settled state (literals come from the spec script, not the implementation).
  assert.equal(sampleScenario(0).caption.tag, "INTENT");
  assert.equal(sampleScenario(0).messages, 2, "settled phase 0: the question was sent and Lead replied");
  assert.equal(sampleScenario(0).streams.composer, "", "settled phase 0: the composer was cleared by the send");
  assert.equal(sampleScenario(0).timer, 0);
  assert.equal(sampleScenario(0).context, 6);
  assert.equal(sampleScenario(0).current, "", "no direction is current before Explore");
  assert.equal(sampleScenario(0).session, true, "the session row appears once the question is sent");
  assert.equal(sampleScenario(0).canvasCount, 0);

  // 发起阶段内的发送时间线：打字（消息未出现）→ sendAt 发送（清空、消息与会话条目出现）。
  assert.equal(sampleScenario(0.4).messages, 0, "mid-typing nothing is sent yet");
  assert.equal(sampleScenario(0.4).session, false);
  assert.ok(sampleScenario(0.4).streams.composer.length > 0 && sampleScenario(0.4).streams.composer.length < questionText.length, "mid-typing the composer streams a prefix");
  assert.equal(sampleScenario(0.9).messages, 2);
  assert.equal(sampleScenario(0.9).session, true);
  assert.equal(sampleScenario(0.9).streams.composer, "");

  assert.equal(sampleScenario(1).messages, 4);
  assert.ok(!("composer" in sampleScenario(1).streams), "the composer stays cleared after the send");
  assert.equal(sampleScenario(1).streams.intro, detailCopy.intro, "the direction intro has streamed in full");
  assert.equal(sampleScenario(1).timer, 0);
  assert.equal(sampleScenario(1).context, 8);
  assert.equal(sampleScenario(1).current, "d-identity", "Explore marks the chosen direction current");
  assert.equal(sampleScenario(1).detail.title, true);
  assert.equal(sampleScenario(1).paper, false);

  assert.equal(sampleScenario(2).messages, 5);
  assert.equal(sampleScenario(2).streams.question, detailCopy.question);
  assert.equal(sampleScenario(2).streams.work, detailCopy.work);
  assert.equal(sampleScenario(2).timer, 30, "the processing timer settles at its final value");
  assert.equal(sampleScenario(2).context, 14);
  assert.equal(sampleScenario(2).current, "d-crossshot", "the focused subdirection becomes current");
  assert.equal(sampleScenario(2).paper, true, "the paper card arrives with the deep dive");
  assert.equal(sampleScenario(2).canvasCount, 3);

  assert.equal(sampleScenario(3).messages, 6);
  assert.equal(sampleScenario(3).streams.evidence, detailCopy.evidence);
  assert.equal(sampleScenario(3).detail.todo, true, "the pending confirmation shows with the gap");
  assert.equal(sampleScenario(3).context, 17);
  assert.equal(sampleScenario(4).messages, 7);
  assert.equal(sampleScenario(4).detail.mech, true, "the mechanism premises show with the transfer");
  assert.equal(sampleScenario(4).canvasCount, 4);
  assert.deepEqual(sampleScenario(5).checklist, ["pass", "pass", "hold"]);
  assert.equal(sampleScenario(5).context, 20);
  assert.equal(sampleScenario(6).candidate, true);
  assert.equal(sampleScenario(6).messages, 10);
  assert.equal(sampleScenario(6).context, 23, "context ends at its final value");
  assert.equal(sampleScenario(6).focus, "n-candidate");

  // Reviewer 逐项：清单在阶段内按时间点逐项给出，settled 时全部到位。
  assert.deepEqual(sampleScenario(5.3).checklist, ["pass", "pending", "pending"]);
  assert.deepEqual(sampleScenario(5.6).checklist, ["pass", "pass", "pending"]);
  assert.deepEqual(sampleScenario(5.95).checklist, ["pass", "pass", "hold"]);

  // 流式文本契约：任何时刻的流式值都是其全文案的确定性前缀。
  for (let i = 0; i <= 140; i++) {
    const state = sampleScenario(i / 20);
    for (const [id, value] of Object.entries(state.streams)) {
      assert.ok(id in streamFullCopy, `stream ${id} is declared`);
      assert.ok(streamFullCopy[id].startsWith(value), `stream ${id} at ${i / 20} is a prefix of its copy`);
    }
  }
  // 流式文本在阶段内单调增长（composer 的发送清空除外：sendAt 之后必须为空）。
  for (let i = 0; i < phases.length; i++) {
    const lens = new Map();
    for (let f = 1; f < 40; f++) {
      const frac = f / 40;
      const state = sampleScenario(i + frac);
      for (const [id, value] of Object.entries(state.streams)) {
        if (i === 0 && id === "composer") {
          if (frac >= 0.75) {
            assert.equal(value, "", "the composer is cleared at the send");
            continue;
          }
        }
        assert.ok(value.length >= (lens.get(id) ?? 0), `stream ${id} grows within phase ${i}`);
        lens.set(id, value.length);
      }
      assert.ok(state.timer >= 0 && state.timer <= 60, `timer ${state.timer} sane at phase ${i}`);
      assert.ok(state.context >= 6 && state.context <= 23, `context ${state.context} sane at phase ${i}`);
    }
  }
  // 计时器与上下文在阶段内单调不减（整数 progress 是阶段 settled 终态，不计入段内扫描）。
  for (let i = 0; i < phases.length; i++) {
    let prevTimer = -1, prevContext = -1;
    for (let f = 1; f < 40; f++) {
      const state = sampleScenario(i + f / 40);
      assert.ok(state.timer >= prevTimer, `timer grows within phase ${i}`);
      assert.ok(state.context >= prevContext, `context grows within phase ${i}`);
      prevTimer = state.timer;
      prevContext = state.context;
    }
  }

  // The workspace accumulates: later phases never drop earlier messages or evidence.
  for (let i = 1; i < phases.length; i++) {
    assert.ok(sampleScenario(i).messages >= sampleScenario(i - 1).messages, "messages accumulate");
  }

  // Clamping: out-of-range and non-finite progress settle on the first or last phase.
  assert.equal(sampleScenario(NaN).phase, 0);
  assert.equal(sampleScenario(-5).phase, 0);
  assert.equal(sampleScenario(-5).phaseProgress, 0);
  assert.equal(sampleScenario(1000).phase, phases.length - 1);

  // 方向研究图谱：每阶段声明的可见节点/连线，focus 是焦点标记，current 是「当前」徽标。
  assert.ok(treeNodes.length >= 12, "tree declares its nodes");
  assert.ok(treeNodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y) && node.id && node.label), "tree nodes carry layout");
  const nodeIds = new Set(treeNodes.map((n) => n.id));
  const edgeIds = new Set(treeEdges.map((e) => e.id));
  const declaredIds = new Set([...nodeIds, ...edgeIds, "boundary"]);
  for (const edge of treeEdges) assert.ok(nodeIds.has(edge.from) && nodeIds.has(edge.to), `edge ${edge.id} references declared nodes`);
  for (let i = 0; i < phases.length; i++) {
    for (const id of sampleScenario(i).tree) assert.ok(declaredIds.has(id), `phase ${i} tree id ${id} is declared`);
  }
  assert.equal(sampleScenario(0).tree.includes("d-video"), true, "phase 0 shows the root interest");
  assert.equal(sampleScenario(0).focus, "d-video");
  assert.equal(sampleScenario(1).tree.includes("d-identity"), true, "phase 1 branches candidates");
  assert.equal(sampleScenario(1).focus, "d-identity", "the chosen branch is focused");
  assert.equal(sampleScenario(2).tree.includes("n-method"), true, "phase 2 grows evidence leaves");
  assert.equal(sampleScenario(2).focus, "d-crossshot");
  assert.equal(sampleScenario(3).tree.includes("n-gap"), true, "phase 3 adds the gap");
  assert.equal(sampleScenario(3).tree.includes("boundary"), true, "the boundary appears with the gap");
  assert.equal(sampleScenario(4).tree.includes("m-estimation"), true, "phase 4 adds the cross-domain mechanism");
  assert.equal(sampleScenario(6).tree.includes("n-candidate"), true, "phase 6 adds the candidate beyond the boundary");
  assert.equal(sampleScenario(6).focus, "n-candidate");
  assert.equal(sampleScenario(6).current, "d-crossshot", "the current badge stays on the focused subdirection");
  for (let i = 1; i < phases.length; i++) {
    for (const id of sampleScenario(i - 1).tree) assert.ok(sampleScenario(i).tree.includes(id), `tree accumulates ${id}`);
  }

  // Elapsed seconds map onto phase units through the declared durations.
  assert.equal(progressAt(0), 0);
  for (let i = 0; i < phases.length; i++) {
    const start = phases.slice(0, i).reduce((t, p) => t + p.duration, 0);
    assert.equal(Math.floor(progressAt(start + .01)), i, `elapsed inside phase ${i}`);
  }
  assert.equal(progressAt(scenarioDuration), phases.length - 1, "end of the loop holds the final phase");
  assert.equal(scenarioDuration, phases.reduce((t, p) => t + p.duration, 0));

  // Stage renderer: fake elements with write counters, mirroring the research-story test harness.
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
  const tree = ["d-video", "d-consistency", "d-identity", "d-narrative", "d-crossshot", "n-problem", "n-method", "n-limitation", "n-gap", "boundary", "m-control", "m-estimation", "n-candidate"].map((id) => makeEl({ pdTree: id }));
  const paper = makeEl({ pdPaper: "" });
  const session = makeEl({ pdSession: "" });
  const candidate = makeEl({ pdCandidate: "" });
  const processing = makeEl({ pdProcessing: "" });
  const review = makeEl({ pdReview: "" });
  const mention = makeEl({ pdMention: "" });
  const canvasCount = makeEl({ pdCanvasCount: "" });
  const timerEl = makeEl({ pdTimer: "" });
  const contextEl = makeEl({ pdContext: "" });
  const currentBadge = makeEl();
  const focusMarker = makeEl();
  const bySelector = {
    "[data-pd-stage]": stage,
    "[data-pd-paper]": paper, "[data-pd-session]": session, "[data-pd-candidate]": candidate,
    "[data-pd-processing]": processing, "[data-pd-review]": review, "[data-pd-mention]": mention,
    "[data-pd-canvas-count]": canvasCount, "[data-pd-timer]": timerEl, "[data-pd-context]": contextEl,
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

  // First phase settled: the question was sent — composer cleared, first exchange visible.
  render(sampleScenario(0));
  assert.equal(stage.dataset.phase, "0");
  assert.equal(streamEls.composer.textContent, "", "the composer was cleared by the send");
  assert.equal(messages[0].classList.has("pd-on"), true, "the sent exchange is visible");
  assert.equal(messages[1].classList.has("pd-on"), true);
  assert.equal(messages[2].classList.has("pd-on"), false, "the Explore exchange is not yet visible");
  assert.equal(details.every((el) => !el.classList.has("pd-on")), true, "no detail field is on yet");
  assert.equal(session.classList.has("pd-on"), true, "the session row is on after the send");
  assert.equal(mention.classList.has("pd-on"), false, "the direction mention card waits for the choice");
  assert.equal(processing.classList.has("pd-on"), false, "no processing row before the dive");
  assert.equal(review.classList.has("pd-on"), false);
  assert.equal(timerEl.textContent, "0");
  assert.equal(contextEl.textContent, "6");
  assert.equal(canvasCount.textContent, "0");
  assert.equal(currentBadge.classList.has("pd-on"), false, "no current badge before Explore");
  const treeById = Object.fromEntries(tree.map((el) => [el.dataset.pdTree, el]));
  assert.equal(treeById["d-video"].classList.has("pd-on"), true, "root tree node is on");
  assert.equal(treeById["n-candidate"].classList.has("pd-on"), false, "candidate stays hidden");
  const rootPos = treeNodes.find((node) => node.id === "d-video");
  assert.equal(focusMarker.attributes["transform"], `translate(${rootPos.x} ${rootPos.y})`, "focus marker sits on the root");
  assert.equal(checks[0].dataset.state, "pending");

  // Final phase settled: the full workspace (the reduced-motion view).
  render(sampleScenario(phases.length - 1));
  assert.equal(stage.dataset.phase, String(phases.length - 1));
  assert.equal(tree.every((el) => el.classList.has("pd-on")), true, "the whole tree has grown");
  assert.equal(messages.every((message) => message.classList.has("pd-on")), true, "the whole conversation is visible");
  assert.equal(details.every((el) => el.classList.has("pd-on")), true, "every detail field is filled");
  assert.equal(paper.classList.has("pd-on"), true);
  assert.equal(session.classList.has("pd-on"), true, "the session row is visible");
  assert.equal(candidate.classList.has("pd-on"), true);
  assert.equal(processing.classList.has("pd-on"), true, "the processing row is visible");
  assert.equal(review.classList.has("pd-on"), true, "the review card is visible");
  assert.equal(mention.classList.has("pd-on"), true, "the direction mention card is visible");
  assert.equal(timerEl.textContent, "30");
  assert.equal(contextEl.textContent, "23");
  assert.equal(canvasCount.textContent, "4");
  assert.deepEqual(checks.map((check) => check.dataset.state), ["pass", "pass", "hold"]);
  const crossshotPos = treeNodes.find((node) => node.id === "d-crossshot");
  assert.equal(currentBadge.attributes["transform"], `translate(${crossshotPos.x} ${crossshotPos.y})`, "the current badge sits on the focused subdirection");
  const candidatePos = treeNodes.find((node) => node.id === "n-candidate");
  assert.equal(focusMarker.attributes["transform"], `translate(${candidatePos.x} ${candidatePos.y})`, "focus marker ends on the candidate");

  // Mid-run: streaming text lands in the right element, badge moves with the run.
  render(sampleScenario(2.25));
  assert.ok(streamEls.question.text.length > 0 && streamEls.question.text.length < detailCopy.question.length, "the question field is mid-stream");
  assert.equal(streamEls.intro.textContent, detailCopy.intro, "settled streams keep their full text");
  assert.equal(currentBadge.attributes["transform"], `translate(${crossshotPos.x} ${crossshotPos.y})`);

  // Identical states never rewrite the DOM (paintKey caching).
  const totalWrites = () => [stage, currentBadge, focusMarker, paper, session, candidate, processing, review, mention, canvasCount, timerEl, contextEl, ...Object.values(streamEls), ...messages, ...details, ...checks, ...tree].reduce((sum, el) => sum + el.writes, 0);
  render(sampleScenario(5));
  const writesAfterFirst = totalWrites();
  render(sampleScenario(5));
  assert.equal(totalWrites(), writesAfterFirst, "same state writes nothing new");

  console.log(`PASS: ${phases.length} phases, ${scenarioDuration}s loop; settled literals, send timeline, per-item review, streaming prefixes, determinism, reverse seeks, clamping, duration mapping and stage effects.`);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
