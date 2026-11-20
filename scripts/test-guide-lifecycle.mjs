/** Actual GuideExperience JSX + hook/effect lifecycle, Node only (not a browser). */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import { transpileModuleGraph } from "./transpile-app.mjs";
const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "guide-component-"));
const nodes = (n) => Array.isArray(n) ? n.flatMap(nodes) : n && typeof n === "object" ? [n, ...nodes(n.props?.children)] : [];
const text = (n) => typeof n === "string" ? n : Array.isArray(n) ? n.map(text).join("") : n?.props ? text(n.props.children) : "";
try {
  transpileModuleGraph({ ts, root, tmp, entries: ["app/demo/guides/index.ts", "app/demo/viewer/fixture.ts"] });
  const guides = require(path.join(tmp, "app/demo/guides/index.js"));
  const fixture = require(path.join(tmp, "app/demo/viewer/fixture.js"));
  function harness(guideId, { mobile = false, step } = {}) {
    const cells = [], events = new Map(), renders = [];
    let cursor, pending, dirty, tree;
    const media = { matches: mobile, addEventListener(_t, f) { this.listener = f; }, removeEventListener() {} };
    const window = {
      location: { href: `http://localhost/CoResearch-Community/docs/${guideId}/${step ? `?step=${step}` : ""}` },
      matchMedia: () => media,
      addEventListener(type, fn) { events.set(type, fn); },
      removeEventListener(type) { events.delete(type); },
    };
    Object.defineProperty(window.location, "search", { get() { return new URL(this.href).search; } });
    window.history = {
      state: { nativeRouter: true },
      replaceState(state, _title, url) { assert.deepEqual(state, this.state); window.location.href = new URL(url, window.location.href).href; },
      pushState(state, title, url) { this.replaceState(state, title, url); },
    };
    const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
    const react = {
      useRef(initial) { return cells[cursor++] ??= { current: initial }; },
      useState(initial) {
        const i = cursor++;
        if (!cells[i]) cells[i] = { value: typeof initial === "function" ? initial() : initial };
        return [cells[i].value, (arg) => { const value = typeof arg === "function" ? arg(cells[i].value) : arg; if (!Object.is(value, cells[i].value)) { cells[i].value = value; dirty = true; } }];
      },
      useMemo(fn, deps) { const i = cursor++; if (!cells[i] || !same(cells[i].deps, deps)) cells[i] = { deps, value: fn() }; return cells[i].value; },
      useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
      useEffect(fn, deps) { const i = cursor++; if (!cells[i] || !same(cells[i].deps, deps)) pending.push({ i, fn, deps, previous: cells[i], layout: false }); },
      useLayoutEffect(fn, deps) { const i = cursor++; if (!cells[i] || !same(cells[i].deps, deps)) pending.push({ i, fn, deps, previous: cells[i], layout: true }); },
    };
    const jsx = (type, props, key) => ({ type, props, key });
    const loadedModule = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(path.join(root, "app/components/guides/GuideExperience.tsx"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { window, URL, URLSearchParams, console })(
      (id) => {
        if (id === "react") return react;
        if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
        if (id === "next/link") return { default: "Link" };
        if (id === "../../demo/guides") return guides;
        if (id === "../../demo/viewer/fixture") return fixture;
        if (id === "../product-demo/ViewerFrame") return { ViewerFrame: "ViewerFrame" };
        if (id.endsWith(".css")) return {};
        throw Error(id);
      }, loadedModule, loadedModule.exports);
    function render() {
      cursor = 0; pending = []; dirty = false;
      tree = loadedModule.exports.GuideExperience({ guideId }); renders.push(tree);
      for (const effect of pending.sort((a, b) => Number(b.layout) - Number(a.layout))) {
        effect.previous?.cleanup?.(); cells[effect.i] = { ...effect, cleanup: effect.fn(), isEffect: true };
      }
    }
    function settle() { for (let i = 0; dirty; i++) { assert.ok(i < 30, "no render loop"); render(); } }
    const frame = () => nodes(tree).find((n) => n.type === "ViewerFrame");
    const click = (label) => { const button = nodes(tree).find((n) => n.type === "button" && text(n).includes(label)); assert.ok(button, label); assert.ok(!button.props.disabled, label); button.props.onClick(); settle(); };
    const intent = (value, generation = frame().props.snapshot.generation) => { frame().props.onIntent(value, generation); settle(); };
    render(); settle();
    return { frame, click, intent, renders, window,
      criterion: () => text(nodes(tree).find((n) => n.type === "p" && text(n).startsWith("完成判据："))),
      nextDisabled: () => nodes(tree).find((n) => n.type === "button" && text(n) === "下一步").props.disabled,
      completed: () => nodes(tree).some((n) => n.props?.className === "guide-complete"),
      strictReplay() { for (const c of cells.filter((c) => c?.isEffect)) { c.cleanup?.(); c.cleanup = c.fn(); } settle(); },
      resize(matches) { media.matches = matches; media.listener(); settle(); },
      status(value) { frame().props.onStatus(value); settle(); },
      pop(step) { window.location.href = new URL(`?step=${step}`, window.location.href).href; events.get("popstate")(); settle(); },
    };
  }
  for (const id of ["explore-directions", "read-evidence", "continue-research"]) {
    const initial = harness(id);
    assert.match(initial.criterion(), /选中|打开|引用/);
    assert.doesNotMatch(initial.criterion(), /不是|尚未|还没有|不完整|丢失|不一致/);
  }
  const paper = harness("read-evidence", { mobile: true, step: "read-level" });
  assert.equal(nodes(paper.renders[0]).some((n) => n.type === "ViewerFrame"), false, "no desktop viewer before viewport resolution");
  assert.equal(paper.frame().props.snapshot.layout, "mobile");
  assert.equal(paper.frame().props.snapshot.mobilePane, "preview");
  assert.equal(paper.frame().props.snapshot.preview.id, "P02");
  paper.strictReplay();
  assert.equal(new URL(paper.window.location.href).searchParams.get("step"), "read-level", "StrictMode must not overwrite the deep link with the first step");
  paper.intent({ type: "edit_draft", text: "保留阅读笔记" });
  paper.intent({ type: "add_context", directionId: "d-crossshot" });
  const key = paper.frame().key;
  paper.click("观看演示"); paper.click("我来操作");
  assert.equal(paper.frame().props.snapshot.draft, "保留阅读笔记");
  assert.deepEqual(paper.frame().props.snapshot.contextDirectionIds, ["d-crossshot"]);
  assert.equal(paper.frame().key, key, "ordinary rerender/mode switch must not remount iframe");
  paper.resize(false);
  assert.equal(paper.frame().props.snapshot.layout, "desktop");
  assert.equal(paper.frame().props.snapshot.preview.id, "P02");
  const before = paper.frame().props.snapshot;
  paper.intent({ type: "resource_result", paperId: "P02", status: "ready", readingLevel: "full_text" }, before.generation - 1);
  assert.equal(paper.frame().props.snapshot, before, "late resource acknowledgement cannot change a newer snapshot");
  paper.intent({ type: "resource_result", paperId: "P02", status: "ready", readingLevel: "full_text" });
  paper.click("下一步");
  assert.equal(paper.frame().props.snapshot.preview.id, "P02");
  paper.intent({ type: "close_preview" });
  paper.status("error"); assert.equal(paper.frame(), undefined);
  paper.click("重置这一步"); assert.ok(paper.frame(), "connection failure offers a real remount/retry");
  paper.pop("open-p02");
  assert.equal(paper.frame().props.snapshot.preview.kind, "direction", "history restore is an explicit checkpoint boundary");
  assert.equal(paper.frame().props.snapshot.draft, "保留阅读笔记");

  const recovery = harness("troubleshooting", { mobile: true });
  const fixtures = [], keys = [];
  for (const [status, readingLevel] of [["ready", "metadata"], ["unavailable"], ["missing"]]) {
    fixtures.push(recovery.frame().props.fixture); keys.push(recovery.frame().key);
    assert.equal(recovery.frame().props.snapshot.layout, "mobile");
    assert.equal(recovery.frame().props.snapshot.mobilePane, "preview");
    recovery.intent({ type: "open_paper", paperId: "P03" });
    recovery.intent({ type: "resource_result", paperId: "P03", status, readingLevel });
    recovery.intent({ type: "close_preview" });
    assert.equal(recovery.completed(), true);
    recovery.click("重置这一步");
    assert.equal(recovery.completed(), false, "fresh reset clears completed UI");
    assert.equal(recovery.nextDisabled(), true, "fresh reset disables Next until a new recovery operation");
    assert.equal(recovery.frame().props.snapshot.preview.kind, "direction");
    recovery.intent({ type: "resource_result", paperId: "P03", status, readingLevel });
    assert.equal(recovery.nextDisabled(), true, "late outcome after reset cannot complete closed preview");
    recovery.intent({ type: "open_paper", paperId: "P03" });
    recovery.intent({ type: "resource_result", paperId: "P03", status, readingLevel });
    assert.equal(recovery.nextDisabled(), true, "must perform a new Back/cancel");
    recovery.intent({ type: "close_preview" }); recovery.click("下一步");
  }
  assert.equal(new Set(keys).size, 3, "each fixture version is a new iframe lifetime");
  assert.equal(fixtures[0].papers.find((p) => p.id === "P03").availability, "metadata-only");
  assert.equal(fixtures[1].papers.find((p) => p.id === "P03").availability, "unavailable");
  assert.deepEqual(fixtures[2].missingResourceIds, ["P03"], "actual pinned missing ids reach Core init");
  assert.equal(recovery.frame().props.snapshot.mobilePane, "composer");
  recovery.intent({ type: "edit_draft", text: "中断笔记" });
  recovery.click("恢复中断 checkpoint");
  assert.equal(recovery.completed(), true);
  recovery.click("重置这一步");
  assert.equal(recovery.completed(), false);
  assert.equal(recovery.frame().props.snapshot.draft, "中断笔记");
  console.log("PASS: actual GuideExperience hook lifecycle — mobile first mount/resize, StrictMode deep link, mode preservation, fixture remount + missing ids, real retry, history and Next.");
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
