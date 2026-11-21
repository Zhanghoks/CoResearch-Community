/** Node-only component/effect regression; no browser, DOM emulator, or artifact build. */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadSource(file, require, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { console, process, ...globals }, { filename: file })(require, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const protocol = loadSource("app/demo/viewer/protocol.ts", () => { throw Error("Unexpected protocol import"); });
const draftContinuity = loadSource("app/demo/viewer/draft-continuity.ts", () => { throw Error("Unexpected draft helper import"); });
const fixture = { groups: [], papers: [], directions: [] };
const snapshot = (generation) => ({ t: generation * 16, generation, draft: "example", focusIds: [] });

// Models React's state/ref/callback identity, dependency comparison, commit ref
// replacement, cleanup-before-setup, and StrictMode passive effect replay.
// JSX is only inspected, not rendered. The component under test is actual TSX.
function createHarness() {
  const slots = [], listeners = new Set(), timers = new Map(), peers = [], statuses = [], ready = [], intents = [];
  let cursor = 0, pending = [], dirty = false, tree, currentProps, nextTimer = 0, currentKey, currentPeer;
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const window = {
    location: { origin: "http://127.0.0.1:3000" },
    addEventListener(type, fn) { assert.equal(type, "message"); listeners.add(fn); },
    removeEventListener(type, fn) { assert.equal(type, "message"); listeners.delete(fn); },
    setTimeout(fn, ms) { const id = ++nextTimer; timers.set(id, { fn, ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
  };
  const react = {
    useRef(initial) { const i = cursor++; return slots[i] ??= { kind: "ref", current: initial }; },
    useState(initial) {
      const i = cursor++;
      if (!slots[i]) {
        const cell = { kind: "state", value: typeof initial === "function" ? initial() : initial };
        cell.set = (input) => {
          const next = typeof input === "function" ? input(cell.value) : input;
          if (!Object.is(next, cell.value)) { cell.value = next; dirty = true; }
        };
        slots[i] = cell;
      }
      return [slots[i].value, slots[i].set];
    },
    useCallback(fn, deps) {
      const i = cursor++;
      if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { kind: "callback", deps, value: fn };
      return slots[i].value;
    },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!slots[i] || !same(slots[i].deps, deps)) pending.push({ i, fn, deps, previous: slots[i] });
    },
  };
  react.useLayoutEffect = react.useEffect;
  const jsx = (type, props, key) => ({ type, props, key });
  const { ViewerFrame } = loadSource("app/components/product-demo/ViewerFrame.tsx", (id) => {
    if (id === "react") return react;
    if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (id === "../../demo/viewer/protocol") return protocol;
    if (id === "../../demo/viewer/draft-continuity") return draftContinuity;
    throw Error(`Unexpected import ${id}`);
  }, { window, fetch: () => Promise.resolve({ ok: true }) });
  function nodes(value) {
    if (Array.isArray(value)) return value.flatMap(nodes);
    if (!value || typeof value !== "object") return [];
    return [value, ...nodes(value.props?.children)];
  }
  function makePeer() {
    const peer = {
      messages: [], fixture: null, snapshot: null,
      postMessage(message, origin) {
        assert.equal(origin, window.location.origin);
        assert.equal(message.protocol, protocol.DEMO_VIEWER_PROTOCOL);
        assert.equal(message.source, protocol.DEMO_VIEWER_PARENT_SOURCE);
        this.messages.push(message);
        // Same storage transitions as Core DemoApp's message subscription.
        if (message.type === "init") { this.fixture = message.fixture; this.snapshot = message.snapshot; }
        if (message.type === "dispose") { this.fixture = null; this.snapshot = null; }
        if (message.type === "applySnapshot") this.snapshot = message.snapshot;
      },
    };
    peers.push(peer);
    return peer;
  }
  function commit() {
    const frameNode = nodes(tree).find((n) => n.type === "iframe");
    if (!currentPeer || currentKey !== frameNode.key) { currentPeer = makePeer(); currentKey = frameNode.key; }
    // React attaches the new ref before passive cleanup of the old effect.
    frameNode.props.ref.current = { contentWindow: currentPeer };
    const effects = pending; pending = [];
    for (const effect of effects) effect.previous?.cleanup?.();
    for (const effect of effects) slots[effect.i] = { kind: "effect", ...effect, cleanup: effect.fn() };
  }
  function render(props = currentProps) {
    currentProps = props; cursor = 0; dirty = false;
    tree = ViewerFrame(props); commit();
  }
  function settle() {
    let count = 0;
    while (dirty) { assert.ok(++count < 30, "component effect/render loop"); render(); }
  }
  function props(generation, label = "latest") {
    // Deliberately new callback identities on every parent render.
    return { fixture, snapshot: snapshot(generation), onStatus: (s) => statuses.push([label, s]), onReady: (_a, g) => ready.push([label, g]), onIntent: (i, g) => intents.push([label, i.type, g]) };
  }
  function receive(type, data = {}, source = currentPeer, origin = window.location.origin) {
    for (const fn of [...listeners]) fn({ source, origin, data: { protocol: protocol.DEMO_VIEWER_PROTOCOL, source: protocol.DEMO_VIEWER_SOURCE, type, ...data } });
  }
  return {
    render(generation, label) { render(props(generation, label)); settle(); }, settle, receive,
    ack(generation, source = currentPeer) { receive("frameReady", { generation, anchors: [] }, source); settle(); },
    load() { nodes(tree).find((n) => n.type === "iframe").props.onLoad(); settle(); },
    replayEffects() {
      const effects = slots.filter((s) => s?.kind === "effect");
      for (const effect of effects) effect.cleanup?.();
      for (const effect of effects) effect.cleanup = effect.fn();
      settle();
    },
    timeout() { for (const [id, timer] of [...timers]) { timers.delete(id); assert.equal(timer.ms, 10000); timer.fn(); } settle(); },
    retry() { const button = nodes(tree).find((n) => n.type === "button"); assert.ok(button, "visible retry required"); button.props.onClick(); settle(); },
    unmount() { for (const s of slots) if (s?.kind === "ref" && s.current?.contentWindow) s.current = null; for (const s of slots) if (s?.kind === "effect") s.cleanup?.(); },
    get peer() { return currentPeer; }, get tree() { return tree; },
    statuses, ready, intents, peers, timers, listeners,
    get overlay() { return nodes(tree).find((n) => n.props?.role === "status" || n.props?.role === "alert"); },
  };
}

// Missed pre-hydration onLoad: no event/marker exists, setup must initialize.
{
  const h = createHarness(); h.render(1, "first");
  assert.equal(h.peer.messages[0].type, "init");
  assert.equal(h.peer.fixture, fixture);
  h.ack(1); assert.equal(h.overlay, undefined);
  const before = h.peer.messages.length;
  for (let generation = 2; generation <= 20; generation++) {
    h.render(generation); h.ack(generation);
    assert.equal(h.peer.fixture, fixture);
    assert.equal(h.overlay, undefined);
  }
  const sent = h.peer.messages.slice(before).map((m) => m.type);
  assert.equal(sent.filter((t) => t === "applySnapshot").length, 19);
  assert.equal(sent.includes("dispose"), false);
  assert.equal(sent.includes("init"), false);
  assert.deepEqual(h.ready.at(-1), ["latest", 20]);
  h.receive("userIntent", { generation: 20, intent: { type: "send_task" } });
  assert.deepEqual(h.intents.at(-1), ["latest", "send_task", 20]);
  h.unmount(); assert.equal(h.peer.messages.at(-1).type, "dispose");
  assert.equal(h.listeners.size, 0); assert.equal(h.timers.size, 0);
}

// A changed snapshot during boot rejects the old ack and resends current init.
{
  const h = createHarness(); h.render(1); h.render(2);
  h.ack(1); assert.equal(h.ready.length, 0); assert.ok(h.overlay);
  assert.equal(h.peer.messages.at(-1).type, "init");
  assert.equal(h.peer.snapshot.generation, 2);
  h.ack(2); assert.equal(h.overlay, undefined); h.unmount();
}

// StrictMode cleanup/setup must dispose then recover the same child window.
{
  const h = createHarness(); h.render(1); h.ack(1);
  h.replayEffects();
  assert.deepEqual(h.peer.messages.slice(-2).map((m) => m.type), ["init", "applySnapshot"]);
  assert.equal(h.peer.messages.some((m) => m.type === "dispose"), true);
  assert.equal(h.peer.fixture, fixture); assert.ok(h.overlay);
  h.ack(1); assert.equal(h.overlay, undefined);
  h.load(); assert.ok(h.overlay); h.ack(1); assert.equal(h.overlay, undefined);
  h.unmount();
}

// Stale/future/wrong-source/wrong-origin acknowledgements cannot open the gate.
// Changing callbacks must not postpone the timeout or cause destructive dispose.
{
  const h = createHarness(); h.render(4); const timer = [...h.timers.keys()][0];
  h.render(4, "new-callbacks"); assert.equal([...h.timers.keys()][0], timer);
  h.ack(3); h.ack(5);
  h.receive("frameReady", { generation: 4, anchors: [] }, {}, "http://127.0.0.1:3000");
  h.receive("frameReady", { generation: 4, anchors: [] }, h.peer, "https://other.example");
  assert.equal(h.ready.length, 0); assert.ok(h.overlay);
  assert.equal(h.peer.messages.some((m) => m.type === "dispose"), false);
  h.timeout(); assert.equal(h.overlay.props.role, "alert");
  assert.equal(h.statuses.at(-1)[1], "error");
  const old = h.peer; h.retry();
  assert.notEqual(h.peer, old); assert.equal(old.messages.at(-1).type, "dispose");
  assert.equal(h.peer.messages.some((m) => m.type === "dispose"), false);
  assert.equal(h.peer.messages[0].type, "init"); assert.equal(h.peer.fixture, fixture);
  h.ack(4, old); assert.ok(h.overlay); assert.equal(h.ready.length, 0);
  h.ack(4); assert.equal(h.overlay, undefined); assert.equal(h.statuses.at(-1)[1], "ready");
  h.render(8); const acknowledgements = h.ready.length;
  h.ack(4); assert.equal(h.ready.length, acknowledgements);
  assert.equal(h.peer.snapshot.generation, 8); assert.equal(h.peer.fixture, fixture);
  h.ack(8); assert.equal(h.ready.at(-1)[1], 8);
  h.unmount();
}
console.log("PASS: actual ViewerFrame effects: missed onLoad, frameReady→19 ticks, callback freshness, StrictMode dispose/recover, load, stale acknowledgements, timeout, retry window isolation, unmount.");
