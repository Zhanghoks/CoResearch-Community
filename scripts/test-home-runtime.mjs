import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import { transpileModuleGraph } from "./transpile-app.mjs";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "coresearch-home-runtime-"));
try {
  transpileModuleGraph({ ts, root: process.cwd(), tmp, entries: ["app/demo/scenes/home-runtime.ts"] });
  const require = createRequire(path.join(tmp, "index.cjs"));
  const { homeCueAt, homeFrame, homeFrameSignal, homeScenes, homeTimeline } = require("./app/demo/scenes/home-runtime.js");
  const frame = (t, layout = "desktop") => homeFrame(t, layout, 1).snapshot;
  assert.equal(homeFrame(0, "desktop", 1).scene.id, "ask");
  assert.equal(frame(0).draft, "");
  assert.ok(frame(1400).draft.length > 4);
  assert.equal(frame(3700).prepared, true);
  assert.match(homeCueAt(3700), /尚未发送/);
  assert.match(homeCueAt(4200), /发送第一轮/);
  assert.match(homeCueAt(20000), /P02 全文/);
  assert.deepEqual(frame(3700).sentTaskIds, []);
  assert.deepEqual(frame(4199).sentTaskIds, []);
  assert.deepEqual(frame(4200).sentTaskIds, ["task-g1"]);
  assert.deepEqual(frame(5200).visibleGroupIds, ["G1"]);
  assert.deepEqual(frame(10000).visibleGroupIds, ["G1", "G2"]);
  assert.deepEqual(frame(15000).visibleGroupIds, ["G1", "G2", "G3"]);
  assert.equal(frame(16800).selectedDirectionId, "d-crossshot");
  assert.equal(frame(19999).preview.id, "P01");
  assert.equal(frame(20000).preview.id, "P02");
  assert.equal(frame(20000).paperReading.P02.fullTextRead, true);
  assert.notEqual(frame(homeTimeline.durationMs).openQuestionStatus, "selected-for-investigation");
  assert.equal(frame(3800, "mobile").mobilePane, "composer");
  assert.equal(frame(5200, "mobile").mobilePane, "directions");
  assert.equal(frame(20000, "mobile").mobilePane, "preview");
  assert.notEqual(homeFrameSignal(5199, "desktop").key, homeFrameSignal(5200, "desktop").key);
  assert.equal(homeFrameSignal(21200, "desktop").key, homeFrameSignal(22600, "desktop").key);
  assert.notEqual(homeFrameSignal(21200, "desktop").key, homeFrameSignal(21200, "mobile").key);
  for (const scene of homeScenes) assert.equal(homeFrame(scene.result, "desktop", 1).scene.id, scene.id);
  assert.deepEqual(frame(0).visibleGroupIds, [], "reset never reuses the previous run");
  const home = fs.readFileSync("app/page.tsx", "utf8");
  assert.ok(home.indexOf("<HomeHero") < home.indexOf("<ResearchWorldStory") && home.indexOf("<ResearchWorldStory") < home.indexOf("<HomeFeatures"));
  console.log("PASS: homepage replay timing, prepare/send/result order, reset isolation, mobile focus, deduplicated snapshots and section order.");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
