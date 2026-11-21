/** In-memory source evaluation only: no browser, generated files, or build. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const jsx = (type, props) => ({ type, props });
function compile(file, require, globals = {}) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { console, ...globals }, { filename: file })(require, loaded, loaded.exports);
  return loaded.exports;
}
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const result = compile(file, (id) => {
    if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
    assert.ok(id.startsWith("."), `Unexpected runtime dependency ${id}`);
    let target = path.resolve(path.dirname(file), id);
    if (!fs.existsSync(target)) target += fs.existsSync(`${target}.ts`) ? ".ts" : ".tsx";
    return load(target);
  });
  cache.set(file, result);
  return result;
}
const root = path.resolve("app");
const { videoIdentityWorld: world } = load(`${root}/demo/fixtures/video-identity.ts`);
const { fixtureVariants } = load(`${root}/demo/fixtures/variants.ts`);
const { demoTimeline } = load(`${root}/demo/timeline.ts`);
const { stateAt, validateWorld, validateTimeline } = load(`${root}/demo/evaluate.ts`);
const finish = (w, timeline = demoTimeline) => stateAt(w, timeline, timeline.durationMs);
const json = (value) => JSON.stringify(value);
validateWorld(world);
const complete = finish(world);
assert.equal(json(complete.counts), json({ discovered: 6, abstractBrowsed: 6, fullTextRead: 6 }));
assert.equal(json(complete.evidenceIds), json(["E01", "E02", "E03"]));
assert.equal(complete.coverageRevisions.length, 2);
assert.equal(complete.openQuestionId, "oq-identity-budget");

for (const [id, variant] of Object.entries(fixtureVariants)) {
  validateWorld(variant.world);
  validateTimeline(variant.world, demoTimeline);
  if (id === "default") continue;
  const state = finish(variant.world);
  assert.equal(state.paperReading.P03.fullTextRead, false);
  assert.equal(state.counts.fullTextRead, 5);
  assert.equal(json(state.evidenceIds), json(["E01"]));
  assert.equal(json(state.coverageRevisions.map((r) => r.counterexampleId)), json(["CE01"]));
  assert.equal(state.coverageRecordIds.includes("cov-complex-included"), false);
  assert.equal(state.openQuestionId, null);
  assert.equal(state.openQuestionStatus, null, "select_question cannot resurrect an unformed question");
  const incomplete = variant.world.evidence.find((e) => e.id === "E02");
  assert.equal(incomplete.epistemic, "unknown");
  assert.match(incomplete.claim, /材料不完整/);
  assert.equal(incomplete.excerptIds.includes("P03-ex-occlude-cut"), false);
  assert.equal(json(finish(variant.world)), json(state), "retry/evaluation is deterministic");
}
// Available text is not the same as text actually read. An open at full-text
// counts as a reading event, so remove both explicit reads and those opens.
const unread = { ...demoTimeline, events: demoTimeline.events.filter((e) => !(e.paperId === "P03" && (e.type === "read_full_text" || e.type === "open_paper"))) };
const unreadState = finish(world, unread);
assert.equal(unreadState.evidenceIds.includes("E02"), false);
assert.equal(unreadState.coverageRevisions.some((r) => r.counterexampleId === "CE02"), false);
assert.equal(unreadState.openQuestionId, null);
const noReading = { ...demoTimeline, events: demoTimeline.events.filter((e) => e.type !== "read_full_text" && e.type !== "open_paper") };
const noReadingState = finish(world, noReading);
assert.equal(noReadingState.evidenceIds.length, 0);
assert.equal(noReadingState.coverageRecordIds.length, 0, "unread evidence cannot establish a coverage judgment");
assert.equal(noReadingState.coverageRevisions.length, 0);
assert.equal(noReadingState.openQuestionId, null);
// Missing source anchors cannot produce claims even if availability/read flags say full text.
const noAnchor = { ...world, papers: world.papers.map((p) => p.id === "P03" ? { ...p, excerpts: [] } : p) };
assert.equal(finish(noAnchor).evidenceIds.includes("E02"), false);
assert.equal(finish(noAnchor).coverageRevisions.some((r) => r.counterexampleId === "CE02"), false);
assert.equal(finish(noAnchor).openQuestionId, null);
// Restoring readable evidence restores the ordinary deterministic chain.
assert.equal(finish(world).openQuestionId, "oq-identity-budget");
assert.equal(stateAt(world, demoTimeline, 25199).coverageRevisions.length, 0);
assert.equal(stateAt(world, demoTimeline, 25200).coverageRevisions.length, 1);
assert.equal(stateAt(world, demoTimeline, 25199).coverageRevisions.length, 0);

function nodes(value) {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object") return [];
  return [value, ...nodes(value.props?.children)];
}
function text(value) {
  if (Array.isArray(value)) return value.map(text).join(" ");
  if (value === null || value === undefined || typeof value === "boolean") return "";
  return typeof value === "object" ? text(value.props?.children) : String(value);
}
const { sampleConcept, chapters } = load(`${root}/graph-svg/story.ts`);
const { ConceptOverlay, paperConditionCells } = load(`${root}/components/research-story/ConceptOverlay.tsx`);
const overlay = (i) => ConceptOverlay({ facts: sampleConcept(i).facts, chapter: chapters[i], active: i });
const act4 = overlay(3);
const table = nodes(act4).find((n) => n.props?.["data-rw-conditions"] !== undefined);
assert.ok(table, "actual act-4 JSX includes a comparison table");
const rows = nodes(table).filter((n) => n.props?.["data-rw-condition-paper"]);
assert.equal(rows.length, 2);
const p01 = rows.find((n) => n.props["data-rw-condition-paper"] === "P01");
const p02 = rows.find((n) => n.props["data-rw-condition-paper"] === "P02");
assert.match(text(p01), /无遮挡/); assert.match(text(p01), /单镜头/); assert.match(text(p01), /短片段/);
assert.match(text(p02), /有切镜/); assert.match(text(p02), /持续可见/);
assert.match(text(table), /未注明 \/ 待核对/); assert.match(text(table), /不能直接外推或作同预算比较/);
assert.match(text(table), /场景不同不能直接外推/);
assert.equal(nodes(table).filter((n) => n.type === "th" && n.props.scope === "col").length, 6);
const act6 = overlay(5);
const act6Children = act6.props.children.filter(Boolean);
assert.equal(act6Children[0].props["data-rw-revises"], "true", "revision precedes the legend and detailed sources");
const act6ReadingOrder = nodes(act6).map((n) => n.props ?? {});
assert.ok(act6ReadingOrder.findIndex((props) => "data-rw-coverage-prev" in props) <
  act6ReadingOrder.findIndex((props) => "data-rw-counterexample" in props));
assert.ok(act6ReadingOrder.findLastIndex((props) => "data-rw-counterexample" in props) <
  act6ReadingOrder.findIndex((props) => "data-rw-coverage-next" in props));

assert.match(text(nodes(act6).find((n) => n.props?.["data-rw-condition-paper"] === "P03")), /较高计算预算/);
assert.match(text(nodes(act6).find((n) => n.props?.["data-rw-condition-paper"] === "P05")), /长序列/);
assert.equal(nodes(act6).some((n) => n.props?.["data-rw-coverage-prev"] !== undefined), true);
assert.equal(nodes(act6).some((n) => n.props?.["data-rw-coverage-next"] !== undefined), true);
assert.equal(nodes(overlay(4)).some((n) => n.props?.["data-rw-coverage-prev"] !== undefined), false);
const paper = world.papers.find((p) => p.id === "P01");
assert.equal(paperConditionCells(paper, false).cells.every((c) => c.length === 0), true);
assert.match(paperConditionCells(paper, false).comparison, /全文条件未核查/);
const altered = { ...paper, excerpts: [{ ...paper.excerpts[0], conditions: ["长序列", "较高计算预算"] }] };
assert.equal(json(paperConditionCells(altered, true).cells[2]), json(["长序列"]), "conditions come from supplied excerpt, not an id-based duplicate table");

// Compute the winning applicable font-size rule for the actual OQ paragraph.
// This intentionally checks selector specificity and source order, not constants.
const oqTree = overlay(6);
assert.ok(oqTree.props.children.filter(Boolean)[0].props["data-rw-question"], "lead with the research question in act 7");
const paragraph = nodes(oqTree).find((n) => n.props?.className === "rw-question-body");
assert.ok(paragraph);
const css = fs.readFileSync("app/components/research-story/research-story.css", "utf8");
const inherited = oqTree.props.style;
const applicable = [];
for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const size = rule[2].match(/(?:^|;)\s*font-size\s*:\s*([^;]+)/)?.[1]?.trim();
  if (!size) continue;
  for (const selector of rule[1].split(",").map((s) => s.trim())) {
    if (![".rw-question-body", ".rw-question .rw-question-body", ".rw-question p"].includes(selector)) continue;
    const specificity = (selector.match(/\.[\w-]+/g)?.length ?? 0) * 10 + (selector.match(/(?:^|\s)p(?:$|\s)/g)?.length ?? 0);
    applicable.push({ specificity, size, order: rule.index });
  }
}
applicable.sort((a, b) => a.specificity - b.specificity || a.order - b.order);
const winner = applicable.at(-1).size;
const variable = winner.match(/^var\((--[\w-]+)\)$/)?.[1];
assert.ok(parseFloat(variable ? inherited[variable] : winner) >= 16, `actual paragraph winning font-size: ${winner}`);

// Mount the real ResearchWorldStory with React hook/effect semantics and no DOM.
// Refs remain null so external animation installation is deliberately out of scope.
for (const [narrow, reduce, short] of [[true, false, false], [false, true, false], [false, false, true], [false, false, false]]) {
  const slots = []; let cursor = 0, pending = [], dirty = false, tree;
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial; return [slots[i], (v) => { const next = typeof v === "function" ? v(slots[i]) : v; if (!Object.is(next, slots[i])) { slots[i] = next; dirty = true; } }]; },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffect(fn, deps) { const i = cursor++; if (!slots[i] || !same(slots[i].deps, deps)) pending.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); },
  };
  const { ResearchWorldStory } = compile("app/components/research-story/ResearchWorldStory.tsx", (id) => {
    if (id === "react") return react;
    if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (id.includes("view-preferences")) return { useViewPreferences: () => [reduce, short] };
    if (id.includes("graph-svg/story")) return { chapters, sampleConcept };
    return {};
  }, { window: { matchMedia: () => ({ matches: narrow, addEventListener() {}, removeEventListener() {} }) } });
  for (let render = 0; render < 8; render++) {
    cursor = 0; dirty = false; tree = ResearchWorldStory(); const run = pending; pending = []; run.forEach((fn) => fn());
    if (!dirty) break;
    assert.ok(render < 7, "mode initialization must settle");
  }
  const expectedManual = narrow || reduce || short;
  assert.equal(tree.props.className.includes("rw-manual"), expectedManual);
  const autoplayControl = nodes(tree).some((n) => n.type === "button" && /继续播放|暂停|重新观看 ▶/.test(text(n)));
  assert.equal(autoplayControl, !expectedManual, `mount narrow=${narrow}, reduce=${reduce}, short=${short}`);
}
console.log("PASS: valid failure variants, source-reading/anchor dependencies, no unsupported judgments/OQ, deterministic recovery; actual act4/6 JSX condition rows, revision reversal, question CSS cascade >=16px, and mobile/reduced/short/desktop hook mounts.");
