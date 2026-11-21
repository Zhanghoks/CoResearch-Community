import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import ts from "typescript";
import { transpileModuleGraph } from "./transpile-app.mjs";

const root = path.resolve("app");
const tmp = path.resolve("tmp-viewer");
fs.rmSync(tmp, { recursive: true, force: true });
transpileModuleGraph({
  ts,
  root,
  tmp,
  entries: [
    "demo/index.ts",
    "demo/viewer/protocol.ts",
    "demo/viewer/fixture.ts",
    "demo/viewer/snapshot.ts",
    "demo/viewer/intents.ts",
    "demo/scenes/product-runtime.ts",
  ],
});

const require = createRequire(import.meta.url);
const { videoIdentityWorld, INTEREST_PROMPT, stateAt, demoTimeline, demoScenes } = require(path.join(tmp, "demo/index.js"));
const { serializeFixture } = require(path.join(tmp, "demo/viewer/fixture.js"));
const { snapshotFromWorld, mergeClockSnapshot, previewFromTimeline } = require(path.join(tmp, "demo/viewer/snapshot.js"));
const { applyUserIntent } = require(path.join(tmp, "demo/viewer/intents.js"));
const {
  parseParentMessage,
  parseViewerMessage,
  validateOrigin,
  viewerAssetPath,
  CONFIRMED_CAPABILITY_PROFILE,
  DEMO_VIEWER_PROTOCOL,
  DEMO_VIEWER_PARENT_SOURCE,
  DEMO_VIEWER_SOURCE,
} = require(path.join(tmp, "demo/viewer/protocol.js"));
const { productRuntimeTimeline, productRuntimeScenes, productRuntimeSignal, productSceneIndexAt, productPhaseCheckpointMs, PRODUCT_RUNTIME_DURATION_MS } = require(path.join(tmp, "demo/scenes/product-runtime.js"));

const fixture = serializeFixture(videoIdentityWorld);
assert.equal(fixture.papers.every((paper) => paper.synthetic === true && paper.demoTag === "演示文献"), true);
assert.equal(fixture.groups.find((group) => group.id === "G1").parent, null);
assert.equal(fixture.groups.find((group) => group.id === "G2").parent.directionId, "d-consistency");
assert.equal(fixture.openQuestions[0].id, "oq-identity-budget");
assert.equal("noveltyPass" in fixture.openQuestions[0], false);

const atPrepare = stateAt(videoIdentityWorld, demoTimeline, 3600);
const snapPrepare = snapshotFromWorld(videoIdentityWorld, atPrepare, demoTimeline, {
  generation: 1,
  layout: "desktop",
  draft: INTEREST_PROMPT,
  focusIds: ["d-video"],
});
assert.equal(snapPrepare.prepared, true);
assert.equal(snapPrepare.task.action, "explore");
assert.equal(snapPrepare.visibleGroupIds.includes("G1"), false);

const atG1 = stateAt(videoIdentityWorld, demoTimeline, 7600);
const snapG1 = snapshotFromWorld(videoIdentityWorld, atG1, demoTimeline, { generation: 2, layout: "desktop", draft: INTEREST_PROMPT });
assert.equal(snapG1.visibleGroupIds[0], "G1");
assert.equal(snapG1.sentTaskIds.includes("task-g1"), true);

const dirty = { ...snapPrepare, draft: "我自己写的草稿", draftDirty: true };
const merged = mergeClockSnapshot(dirty, snapG1);
assert.equal(merged.draft, "我自己写的草稿");
assert.equal(merged.draftDirty, true);
assert.equal(merged.visibleGroupIds[0], "G1");

const prepared = applyUserIntent({ ...snapPrepare, prepared: true, task: { action: "explore" } }, { type: "send_task" }, demoTimeline);
assert.equal(prepared.seekMs, 4200);
const sent = snapshotFromWorld(videoIdentityWorld, stateAt(videoIdentityWorld, demoTimeline, 4200), demoTimeline, { generation: 3, layout: "desktop", draft: INTEREST_PROMPT });
const duplicate = applyUserIntent({ ...sent, prepared: true, task: { action: "explore" } }, { type: "send_task" }, demoTimeline);
assert.equal(duplicate.ignored, "duplicate-send");

const locked = applyUserIntent(snapPrepare, { type: "pick_task", action: "deep-dive" }, demoTimeline);
assert.equal(locked.ignored, "locked-task");
assert.equal(CONFIRMED_CAPABILITY_PROFILE.openTasks.join(), "explore");
assert.equal(CONFIRMED_CAPABILITY_PROFILE.ideaStateInDemo, false);

const added = applyUserIntent(snapG1, { type: "add_context", directionId: "d-consistency" }, demoTimeline);
assert.equal(added.seekMs, undefined);
assert.deepEqual(added.snapshot.contextDirectionIds, ["d-consistency"]);
assert.equal(added.snapshot.visibleGroupIds[0], "G1");

const opened = applyUserIntent(snapG1, { type: "open_paper", paperId: "P02" }, demoTimeline);
assert.equal(opened.snapshot.preview.id, "P02");
const closed = applyUserIntent(opened.snapshot, { type: "close_preview" }, demoTimeline);
assert.equal(closed.snapshot.preview.kind, "none");
assert.equal(closed.snapshot.selectedDirectionId, opened.snapshot.selectedDirectionId);

assert.equal(previewFromTimeline(demoTimeline, 20000).id, "P02");
assert.equal(previewFromTimeline(demoTimeline, 1000).kind, "none");

assert.equal(validateOrigin("http://127.0.0.1:3000", "https://evil.example"), false);
assert.equal(
  parseViewerMessage({
    protocol: DEMO_VIEWER_PROTOCOL,
    source: DEMO_VIEWER_SOURCE,
    type: "userIntent",
    generation: 1,
    intent: { type: "run_host" },
  }),
  null,
);
const init = parseParentMessage({
  protocol: DEMO_VIEWER_PROTOCOL,
  source: DEMO_VIEWER_PARENT_SOURCE,
  type: "init",
  fixture,
  snapshot: snapPrepare,
  capabilityProfile: CONFIRMED_CAPABILITY_PROFILE,
});
assert.equal(init.type, "init");
assert.equal(parseViewerMessage({
  protocol: DEMO_VIEWER_PROTOCOL,
  source: DEMO_VIEWER_SOURCE,
  type: "listenerReady",
}).type, "listenerReady");
assert.equal(viewerAssetPath("/CoResearch-Community"), "/CoResearch-Community/demos/coresearch/a52c718-1.0.0/index.html");

assert.equal(productRuntimeScenes.length, 8);
assert.equal(PRODUCT_RUNTIME_DURATION_MS, 72000);
assert.equal(productRuntimeSignal(120), productRuntimeSignal(240), "progress without an event does not republish the viewer");
const runtimeSend = productRuntimeTimeline.events.find((e) => e.id === "ev-send-g1");
assert.notEqual(productRuntimeSignal(runtimeSend.t - 1), productRuntimeSignal(runtimeSend.t), "an actual scripted click must republish");
assert.equal(productRuntimeTimeline.durationMs, 72000);
assert.notEqual(productRuntimeTimeline.durationMs, demoTimeline.durationMs);
assert.equal(demoTimeline.durationMs, 36000);
assert.equal(demoScenes.length, 7);
const runtimeG1 = stateAt(videoIdentityWorld, productRuntimeTimeline, productPhaseCheckpointMs(1));
assert.equal(runtimeG1.visibleGroupIds.includes("G1"), true);
assert.equal(productSceneIndexAt(productPhaseCheckpointMs(1)), 1);
const afterCheckpoint = stateAt(videoIdentityWorld, productRuntimeTimeline, productPhaseCheckpointMs(1) + 50);
assert.equal(afterCheckpoint.visibleGroupIds.includes("G1"), true);
assert.equal(productSceneIndexAt(productPhaseCheckpointMs(7)), 7);


const preparedControllable = applyUserIntent(
  { ...snapG1, prepared: false, task: null },
  { type: "prepare_task", action: "explore", directionId: "d-controllable" },
  demoTimeline,
);
assert.equal(preparedControllable.snapshot.task.targetDirectionId, "d-controllable");
assert.equal(preparedControllable.seekMs, undefined, "unsupported branches must not seek a recorded prepare");
const sendWrongBranch = applyUserIntent(preparedControllable.snapshot, { type: "send_task" }, demoTimeline);
assert.equal(sendWrongBranch.ignored, "unsupported-target");
assert.equal(sendWrongBranch.seekMs, undefined, "preparing d-controllable at G1 must not execute the recorded d-consistency send");
assert.equal(sendWrongBranch.snapshot.visibleGroupIds.includes("G2"), false);

const preparedConsistency = applyUserIntent(snapG1, { type: "prepare_task", action: "explore", directionId: "d-consistency" }, demoTimeline);
assert.equal(preparedConsistency.snapshot.task.targetDirectionId, "d-consistency");
const sendConsistency = applyUserIntent(preparedConsistency.snapshot, { type: "send_task" }, demoTimeline);
assert.equal(sendConsistency.ignored, undefined);
assert.equal(sendConsistency.seekMs, 9000);

const withContext = { ...added.snapshot, mobilePane: "directions", generation: 20 };
const sameTimePause = mergeClockSnapshot(
  withContext,
  { ...snapG1, generation: 21, t: withContext.t, mobilePane: "composer", contextDirectionIds: [] },
  { reason: "clock", mode: "autoplay" },
);
assert.deepEqual(sameTimePause.contextDirectionIds, ["d-consistency"]);
assert.equal(sameTimePause.mobilePane, "directions");
assert.equal(sameTimePause.draftDirty, false);

const laterTick = mergeClockSnapshot(
  { ...withContext, draft: "我自己写的草稿", draftDirty: true },
  { ...snapG1, generation: 22, t: withContext.t + 800, mobilePane: "composer", contextDirectionIds: [], selectedDirectionId: "d-video" },
  { reason: "clock", mode: "autoplay" },
);
assert.deepEqual(laterTick.contextDirectionIds, ["d-consistency"], "manual context survives autoplay time advance");
assert.equal(laterTick.mobilePane, "directions");
assert.equal(laterTick.draft, "我自己写的草稿");
assert.equal(laterTick.selectedDirectionId, "d-video", "autoplay may advance selection when time moves");

const guidedTick = mergeClockSnapshot(
  { ...withContext, selectedDirectionId: "d-consistency", preview: { kind: "direction", id: "d-consistency" } },
  { ...snapG1, generation: 23, t: withContext.t + 800, selectedDirectionId: "d-video", preview: { kind: "none", id: null }, mobilePane: "composer", contextDirectionIds: [] },
  { reason: "clock", mode: "guided" },
);
assert.equal(guidedTick.selectedDirectionId, "d-consistency");
assert.equal(guidedTick.preview.id, "d-consistency");
assert.equal(guidedTick.mobilePane, "directions");

const afterReset = mergeClockSnapshot(withContext, { ...snapG1, generation: 24, mobilePane: "composer", contextDirectionIds: [] }, { reason: "reset", mode: "guided" });
assert.deepEqual(afterReset.contextDirectionIds, []);
assert.equal(afterReset.mobilePane, "composer");

const artifact = path.resolve("public/demos/coresearch/a52c718-1.0.0/index.html");
assert.equal(fs.existsSync(artifact), true);
const provenance = JSON.parse(fs.readFileSync(path.resolve("public/demos/coresearch/a52c718-1.0.0/PROVENANCE.json"), "utf8"));
assert.equal(provenance.coreSha, "a52c71845fecb7409e7f3df427650a6be85cebec");
assert.equal(provenance.offline, true);
assert.match(provenance.coreSourceCommit, /^[a-f0-9]{40}$/, "export identifies the actual companion Core commit, not only the teaching baseline");
assert.equal(provenance.sourceTreeClean, true);
const artifactRoot = path.dirname(artifact);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const artifactFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? artifactFiles(path.join(dir, entry.name)) : [path.relative(artifactRoot, path.join(dir, entry.name))]);
assert.deepEqual(artifactFiles(artifactRoot).filter((name) => name !== "PROVENANCE.json").sort(), Object.keys(provenance.files).sort(), "every published artifact is owned and hashed; no extra source/env/map files");
for (const [name, expected] of Object.entries(provenance.files)) {
  assert.equal(path.relative(artifactRoot, path.resolve(artifactRoot, name)), name);
  assert.doesNotMatch(name, /(?:^|\/)\.env|\.map$|\.(?:ts|tsx)$/i);
  assert.equal(digest(fs.readFileSync(path.join(artifactRoot, name))), expected, name);
}
for (const name of ["LICENSE", "NOTICE", "THIRD_PARTY_LICENSES.txt", "THIRD_PARTY_LICENSES.json"]) assert.ok(provenance.files[name], `legal artifact is hashed: ${name}`);
const legal = JSON.parse(fs.readFileSync(path.join(artifactRoot, "THIRD_PARTY_LICENSES.json"), "utf8"));
assert.deepEqual(legal.packages.map(({ name, version, license }) => ({ name, version, license })), provenance.bundledDependencies);
for (const name of ["react", "react-dom", "lucide-react", "katex", "@mariozechner/mini-lit", "tailwindcss"]) assert.ok(legal.packages.some((pkg) => pkg.name === name), `actual bundled JS/CSS vendor attribution: ${name}`);
const notices = fs.readFileSync(path.join(artifactRoot, "THIRD_PARTY_LICENSES.txt"), "utf8");
for (const pkg of legal.packages) for (const file of pkg.files) {
  assert.equal(digest(Buffer.from(file.text)), file.sha256, `${pkg.name} verbatim notice hash`);
  assert.ok(notices.includes(file.text), `${pkg.name} full notice is distributed in human-readable form`);
}
assert.match(legal.packages.find((pkg) => pkg.name === "lucide-react").files.map((file) => file.text).join(""), /Cole Bemis/, "inherited Feather copyright is retained");
assert.equal(fs.existsSync(path.resolve("public/demos/coresearch/a52c718-1.0.0/LICENSE")), true);
const bundle = fs.readFileSync(path.resolve("public/demos/coresearch/a52c718-1.0.0/assets", fs.readdirSync(path.resolve("public/demos/coresearch/a52c718-1.0.0/assets")).find((name) => name.endsWith(".js"))), "utf8");
assert.doesNotMatch(bundle, /api\.openai\.com/i);
assert.doesNotMatch(bundle, /sourceMappingURL/);
assert.doesNotMatch(bundle, /OPENAI_API_KEY/);
assert.doesNotMatch(bundle, /\/workspace\//);

console.log("PASS: demo viewer protocol, snapshot, intents, product-runtime, and reviewed artifact.");
