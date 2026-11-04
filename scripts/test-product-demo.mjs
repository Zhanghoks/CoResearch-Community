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
  const { phases, sampleScenario, progressAt, scenarioDuration, conversation, evidenceCards, treeNodes, treeEdges } = require(path.join(tmp, "scenario.js"));
  const { createDemoRenderer } = require(path.join(tmp, "stage.js"));

  // 阶段状态的键完整性：每个 settled 状态都覆盖 ScenarioState 的全部面板字段。
  const stateKeys = ["caption", "agents", "idea", "messages", "evidence", "gap", "mechanism", "checklist", "candidate", "tree", "focus"];
  for (const phase of phases) {
    const settled = sampleScenario(phases.indexOf(phase));
    for (const key of stateKeys) assert.ok(key in settled, `${phase.id} covers ${key}`);
    assert.ok(Object.keys(settled.agents).length === 4, `${phase.id} declares all agents`);
  }
  // 树声明完整：每条边的两端都是已声明节点；阶段树集合里的 id 都是已声明节点/连线或边界元素。
  const nodeIds = new Set(treeNodes.map((n) => n.id));
  const edgeIds = new Set(treeEdges.map((e) => e.id));
  const declaredIds = new Set([...nodeIds, ...edgeIds, "boundary"]);
  for (const edge of treeEdges) assert.ok(nodeIds.has(edge.from) && nodeIds.has(edge.to), `edge ${edge.id} references declared nodes`);
  for (let i = 0; i < phases.length; i++) {
    for (const id of sampleScenario(i).tree) assert.ok(declaredIds.has(id), `phase ${i} tree id ${id} is declared`);
  }

  // Phase definitions: unique ids, positive durations.
  assert.equal(new Set(phases.map((p) => p.id)).size, phases.length, "phase ids are unique");
  for (const phase of phases) assert.ok(Number.isFinite(phase.duration) && phase.duration > 0, `${phase.id} duration`);

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
  assert.equal(sampleScenario(0).messages, 2);
  assert.equal(sampleScenario(0).agents.lead.activity, "working");
  assert.equal(sampleScenario(0).agents.reviewer.activity, "idle");
  assert.equal(sampleScenario(1).messages, 4);
  assert.equal(sampleScenario(1).idea.intent, "跨镜头的主体身份保持");
  assert.equal(sampleScenario(2).evidence, 3);
  assert.equal(sampleScenario(2).gap, false);
  assert.equal(sampleScenario(3).gap, true);
  assert.equal(sampleScenario(3).agents.gap.activity, "working");
  assert.equal(sampleScenario(4).mechanism, true);
  assert.equal(sampleScenario(4).agents.innovator.activity, "working");
  assert.deepEqual(sampleScenario(5).checklist, ["pass", "pass", "hold"]);
  assert.equal(sampleScenario(5).agents.reviewer.activity, "working");
  assert.equal(sampleScenario(6).candidate, true);
  assert.equal(sampleScenario(6).messages, 6);
  assert.equal(sampleScenario(6).idea.unknown, 0);
  assert.equal(sampleScenario(6).agents.lead.activity, "working");

  // The workspace accumulates: later phases never drop earlier messages or evidence.
  for (let i = 1; i < phases.length; i++) {
    assert.ok(sampleScenario(i).messages >= sampleScenario(i - 1).messages, "messages accumulate");
    assert.ok(sampleScenario(i).evidence >= sampleScenario(i - 1).evidence, "evidence accumulates");
  }

  // Clamping: out-of-range and non-finite progress settle on the first or last phase.
  assert.equal(sampleScenario(NaN).phase, 0);
  assert.equal(sampleScenario(-5).phase, 0);
  assert.equal(sampleScenario(-5).phaseProgress, 0);
  assert.equal(sampleScenario(1000).phase, phases.length - 1);

  // 方向深化树：每阶段声明的可见节点/连线，focus 是当前聚焦节点。
  assert.ok(treeNodes.length >= 12, "tree declares its nodes");
  assert.ok(treeNodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y) && node.id && node.label), "tree nodes carry layout");
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
  const ideaKnown = makeEl(), ideaUnknown = makeEl(), ideaIntent = makeEl();
  const agents = ["lead", "gap", "innovator", "reviewer"].map((id) => {
    const action = makeEl();
    const card = makeEl({ pdAgent: id });
    card.children = { "[data-pd-agent-action]": action };
    return { id, card, action };
  });
  const messages = conversation.map(() => makeEl());
  const evidence = evidenceCards.map(() => makeEl());
  const cards = ["gap", "mechanism", "candidate"].map((key) => makeEl({ pdCard: key }));
  const checks = [0, 1, 2].map((index) => makeEl({ pdCheck: String(index) }));
  const tree = ["d-video", "d-identity", "d-crossshot", "n-method", "n-gap", "m-estimation", "n-candidate", "boundary"].map((id) => makeEl({ pdTree: id }));
  const focusMarker = makeEl();
  const bySelector = {
    "[data-pd-stage]": stage,
    "[data-pd-idea-known]": ideaKnown, "[data-pd-idea-unknown]": ideaUnknown, "[data-pd-idea-intent]": ideaIntent,
    "[data-pd-focus]": focusMarker,
  };
  const listsBySelector = {
    "[data-pd-agent]": agents.map((a) => a.card),
    "[data-pd-msg]": messages, "[data-pd-evidence]": evidence,
    "[data-pd-card]": cards, "[data-pd-check]": checks,
    "[data-pd-tree]": tree,
  };
  const render = createDemoRenderer({
    querySelector: (q) => bySelector[q] ?? null,
    querySelectorAll: (q) => listsBySelector[q] ?? [],
  });

  // First phase: intro state on the fake DOM.
  render(sampleScenario(0));
  assert.equal(stage.dataset.phase, "0");
  const treeById = Object.fromEntries(tree.map((el) => [el.dataset.pdTree, el]));
  assert.equal(treeById["d-video"].classList.has("pd-on"), true, "root tree node is on");
  assert.equal(treeById["n-candidate"].classList.has("pd-on"), false, "candidate stays hidden");
  const rootPos = treeNodes.find((node) => node.id === "d-video");
  assert.equal(focusMarker.attributes["transform"], `translate(${rootPos.x} ${rootPos.y})`, "focus marker sits on the root");
  assert.equal(messages[0].classList.has("pd-on"), true);
  assert.equal(messages[1].classList.has("pd-on"), true);
  assert.equal(messages[2].classList.has("pd-on"), false);
  assert.equal(agents[0].card.dataset.activity, "working");
  assert.equal(agents[0].action.textContent, "梳理候选方向");
  assert.equal(agents[3].card.dataset.activity, "idle");
  assert.equal(ideaKnown.textContent, "0");
  assert.equal(ideaUnknown.textContent, "1");
  assert.equal(ideaIntent.textContent, "视频生成（模糊兴趣）");
  assert.equal(checks[0].dataset.state, "pending");
  assert.equal(cards.every((card) => !card.classList.has("pd-on")), true);

  // Final phase: the full settled workspace (the reduced-motion view).
  render(sampleScenario(phases.length - 1));
  assert.equal(stage.dataset.phase, String(phases.length - 1));
  assert.equal(tree.every((el) => el.classList.has("pd-on")), true, "the whole tree has grown");
  const candidatePos = treeNodes.find((node) => node.id === "n-candidate");
  assert.equal(focusMarker.attributes["transform"], `translate(${candidatePos.x} ${candidatePos.y})`, "focus marker ends on the candidate");
  assert.equal(messages.every((message) => message.classList.has("pd-on")), true);
  assert.equal(evidence.every((card) => card.classList.has("pd-on")), true);
  assert.equal(cards.every((card) => card.classList.has("pd-on")), true);
  assert.deepEqual(checks.map((check) => check.dataset.state), ["pass", "pass", "hold"]);
  assert.equal(ideaUnknown.textContent, "0");
  assert.equal(agents[0].card.dataset.activity, "working");

  // Identical states never rewrite the DOM (paintKey caching).
  const totalWrites = () => [stage, ideaKnown, ideaUnknown, ideaIntent, focusMarker, ...agents.flatMap((a) => [a.card, a.action]), ...messages, ...evidence, ...cards, ...checks, ...tree].reduce((sum, el) => sum + el.writes, 0);
  render(sampleScenario(5));
  const writesAfterFirst = totalWrites();
  render(sampleScenario(5));
  assert.equal(totalWrites(), writesAfterFirst, "same state writes nothing new");

  console.log(`PASS: ${phases.length} phases, ${scenarioDuration}s loop; settled literals, determinism, reverse seeks, clamping, duration mapping and stage effects.`);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
