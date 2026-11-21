/** Real component hooks + real DemoPlayer emissions; Node only, no browser. */
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
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "player-component-"));
const nodes = (n) => Array.isArray(n) ? n.flatMap(nodes) : n && typeof n === "object" ? [n, ...nodes(n.props?.children)] : [];
function target() {
  const listeners = new Map();
  return { listeners, addEventListener(type, fn) { (listeners.get(type) ?? (listeners.set(type, new Set()), listeners.get(type))).add(fn); }, removeEventListener(type, fn) { listeners.get(type)?.delete(fn); }, querySelector() { return null; }, style: { setProperty() {} } };
}
try {
  transpileModuleGraph({ ts, root, tmp, entries: ["app/demo/index.ts", "app/demo/scenes/concept.ts", "app/demo/scenes/product-runtime.ts", "app/demo/viewer/snapshot.ts", "app/demo/viewer/fixture.ts", "app/demo/viewer/intents.ts", "app/graph-svg/story.ts"] });
  const demo = require(path.join(tmp, "app/demo/index.js"));
  const concept = require(path.join(tmp, "app/demo/scenes/concept.js"));
  const product = require(path.join(tmp, "app/demo/scenes/product-runtime.js"));
  const story = require(path.join(tmp, "app/graph-svg/story.js"));
  function harness(kind, { reduce = false, short = false, narrow = false } = {}) {
    const cells = [], instances = [], observers = [], roots = new Map(), timers = new Map();
    let nextTimer = 0;
    let cursor, pending, dirty, tree, renders = 0;
    const document = { ...target(), hidden: false };
    const media = { matches: narrow, ...target() };
    const window = { ...target(), matchMedia: () => media, setTimeout(fn) { const id = ++nextTimer; const timer = { fn: () => { timer.active = false; fn(); }, active: true }; timers.set(id, timer); return id; }, clearTimeout(id) { if (timers.has(id)) timers.get(id).active = false; } };
    const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
    const react = {
      useRef(value) { return cells[cursor++] ??= { current: value }; },
      useState(initial) { const i = cursor++; cells[i] ??= { value: typeof initial === "function" ? initial() : initial }; return [cells[i].value, (arg) => { const value = typeof arg === "function" ? arg(cells[i].value) : arg; if (!Object.is(value, cells[i].value)) { cells[i].value = value; dirty = true; } }]; },
      useMemo(fn, deps) { const i = cursor++; if (!cells[i] || !same(cells[i].deps, deps)) cells[i] = { value: fn(), deps }; return cells[i].value; },
      useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
      useEffect(fn, deps) { const i = cursor++; if (!cells[i] || !same(cells[i].deps, deps)) pending.push({ i, fn, deps, previous: cells[i] }); },
    };
    function createDemoPlayer(options) {
      const player = demo.createDemoPlayer(options);
      const dispose = player.dispose.bind(player);
      player.disposals = 0;
      player.dispose = () => { player.disposals++; dispose(); };
      instances.push(player); return player;
    }
    const jsx = (type, props, key) => ({ type, props, key });
    const componentFile = kind === "proof" ? "app/components/demo-proof/ExploreProof.tsx" : kind === "product" ? "app/components/product-demo/ProductDemo.tsx" : "app/components/research-story/ResearchWorldStory.tsx";
    const code = ts.transpileModule(fs.readFileSync(path.join(root, componentFile), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
    const loadedModule = { exports: {} };
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { window, document, console, IntersectionObserver: class { constructor(callback) { this.callback = callback; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } } })((id) => {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "../../demo") return { ...demo, createDemoPlayer };
      if (id === "../../demo/player") return { createDemoPlayer };
      if (id === "../../demo/scenes/product-runtime") return product;
      if (id === "../../demo/scenes/concept") return concept;
      if (id === "../../demo/fixtures/video-identity") return { videoIdentityWorld: demo.videoIdentityWorld };
      if (id.startsWith("../../demo/viewer/")) return require(path.join(tmp, "app/demo/viewer", id.split("/").at(-1) + ".js"));
      if (id === "../../graph-svg/story") return story;
      if (id === "../../graph-svg/scene") return { createSceneRenderer: () => (progress) => Math.max(0, Math.min(story.chapters.length - 1, Math.floor(progress))) };
      if (id.includes("view-preferences")) return { useViewPreferences: () => [reduce, short] };
      if (id === "./ViewerFrame") return { ViewerFrame: "ViewerFrame" };
      if (id === "./ResearchWorldSvg") return { ResearchWorldSvg: "ResearchWorldSvg" };
      if (id === "./StoryNarration") return { StoryNarration: "StoryNarration" };
      if (id === "./ConceptOverlay") return { ConceptOverlay: "ConceptOverlay" };
      if (id.endsWith(".css")) return {};
      throw Error(id);
    }, loadedModule, loadedModule.exports);
    const component = loadedModule.exports[kind === "proof" ? "ExploreProof" : kind === "product" ? "ProductDemo" : "ResearchWorldStory"];
    function settle() {
      for (let i = 0; i < 30; i++) {
        cursor = 0; pending = []; dirty = false; tree = component(); renders++;
        // React retries render-phase state adjustments before committing effects.
        if (dirty) continue;
        for (const n of nodes(tree)) if (n.props?.ref) {
          const key = n.props.id ?? n.props.className ?? n.type;
          if (!roots.has(key)) roots.set(key, target());
          n.props.ref.current = roots.get(key);
        }
        for (const effect of pending) { effect.previous?.cleanup?.(); cells[effect.i] = { ...effect, cleanup: effect.fn(), effect: true }; }
        if (!dirty) return;
      }
      throw Error("component did not settle");
    }
    settle();
    const text = (n) => typeof n === "string" ? n : Array.isArray(n) ? n.map(text).join("") : n?.props ? text(n.props.children) : "";
    return { instances, observers, roots, settle, timers,
      click(label) { const button = nodes(tree).find((n) => n.type === "button" && text(n) === label); assert.ok(button, label); button.props.onClick(); settle(); },
      edit(value) { nodes(tree).find((n) => n.type === "textarea").props.onChange({ target: { value } }); settle(); },
      draft: () => nodes(tree).find((n) => n.type === "textarea").props.value,
      result: () => text(nodes(tree).find((n) => n.props?.["data-explore-proof-g1"] !== undefined)),
      task: () => text(nodes(tree).find((n) => n.props?.["data-explore-proof-task"] !== undefined)),
      frame: () => nodes(tree).find((n) => n.type === "ViewerFrame"),
      active: () => kind === "product" ? product.productSceneIndexAt(nodes(tree).find((n) => n.type === "ViewerFrame").props.snapshot.t) : nodes(tree).find((n) => n.type === "ConceptOverlay").props.active,
      ready: () => kind === "product" ? undefined : !nodes(tree).find((n) => n.type === "select").props.disabled,
      get renders() { return renders; },
      replay() { const effects = cells.filter((c) => c?.effect); for (const c of effects) c.cleanup?.(); for (const c of effects) c.cleanup = c.fn(); settle(); },
      unmount() { for (const c of cells.filter((c) => c?.effect)) c.cleanup?.(); },
    };
  }
  for (const preferences of [{}, { reduce: true }, { short: true }]) {
    const h = harness("product", preferences);
    assert.equal(h.instances.length, 0, "Product player waits for actual iframe readiness");
    h.frame().props.onStatus("ready"); h.settle();
    assert.equal(h.instances.length, 1);
    const player = h.instances[0];
    const expected = preferences.reduce ? product.productRuntimeScenes.length - 1 : 0;
    assert.equal(h.active(), expected, "manual initial chapter comes from real seek emission");
    assert.equal(h.frame().props.snapshot.t, preferences.reduce || preferences.short ? product.productPhaseCheckpointMs(expected) : 0);
    h.observers[0].callback([{ isIntersecting: true }]); h.settle();
    assert.equal(player.isPlaying(), !(preferences.reduce || preferences.short), "autoplay/manual policy unchanged");
    player.seek(product.productPhaseCheckpointMs(2)); h.settle();
    assert.equal(h.active(), 2);
    assert.equal(h.instances.length, 1, "ordinary player emissions do not replace subscriptions");
    h.replay(); assert.equal(player.disposals, 1);
    assert.equal(h.instances.length, 2); h.unmount();
    assert.equal(h.instances[1].disposals, 1);
    assert.ok(h.observers.every((o) => o.disconnected));
  }
  const h = harness("story");
  assert.equal(h.instances.length, 1);
  assert.equal(h.ready(), true, "actual initial player emission establishes ready controls");
  assert.equal(h.active(), 0);
  h.observers[0].callback([{ isIntersecting: true }]); h.settle();
  assert.equal(h.instances[0].isPlaying(), true);
  h.instances[0].seek(concept.conceptPhaseCheckpointMs(6)); h.settle();
  assert.equal(h.active(), 6); assert.equal(h.instances.length, 1);
  h.replay(); assert.equal(h.instances[0].disposals, 1);
  assert.equal(h.active(), 6, "StrictMode restores selected chapter");
  assert.equal(h.ready(), true); h.unmount();
  assert.ok(h.instances.every((player) => player.disposals === 1));
  const proof = harness("proof");
  proof.click("准备 Explore 任务"); proof.click("发送");
  const stale = [...proof.timers.values()].at(-1);
  proof.click("重新观看"); stale.fn(); proof.settle();
  assert.match(proof.result(), /发送后才会出现/, "Replay fences a previously queued G1 callback");
  proof.click("准备 Explore 任务"); proof.edit("我的未发送草稿"); proof.click("发送");
  assert.match(proof.task(), /尚未准备/, "editing after preparation invalidates the actual task agreement");
  assert.match(proof.result(), /发送后才会出现/);
  proof.click("使用示例继续"); assert.equal(proof.draft(), "我的未发送草稿", "explicit example agreement preserves the user's draft");
  proof.click("准备 Explore 任务"); proof.click("发送");
  [...proof.timers.values()].at(-1).fn(); proof.settle();
  assert.doesNotMatch(proof.result(), /发送后才会出现/, "an explicitly agreed example can complete");
  proof.click("重新观看"); proof.click("使用示例继续"); proof.click("准备 Explore 任务"); proof.click("发送");
  const beforeReplay = [...proof.timers.values()].at(-1); proof.replay();
  beforeReplay.fn(); proof.settle(); assert.match(proof.result(), /发送后才会出现/, "StrictMode cannot revive a retired request");
  assert.equal(proof.instances.length, 2); assert.equal(proof.instances[0].disposals, 1);
  proof.click("准备 Explore 任务"); proof.click("发送");
  const late = [...proof.timers.values()].at(-1); proof.unmount();
  const retiredTime = proof.instances.at(-1).getTime(); late.fn();
  assert.equal(proof.instances.at(-1).getTime(), retiredTime, "unmounted callbacks cannot move the retired player");
  assert.ok([...proof.timers.values()].every((timer) => !timer.active), "all pending callbacks are cancelled on lifecycle exit");
  assert.ok(proof.instances.every((player) => player.disposals === 1));
  console.log("PASS: actual ExploreProof lifecycle — Replay/unmount/StrictMode fence queued G1; edited preparation rejected; explicit example retains draft.");
  console.log("PASS: actual ProductDemo + ResearchWorldStory player/effect lifecycles — readiness, initial reduced/short/desktop checkpoints, autoplay policy, seek, stable subscription, StrictMode and cleanup.");
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
