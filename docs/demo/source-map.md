# Offline teaching demo: provenance and integration map

Related to Community issues #36–#40. This is a synthetic, deterministic teaching experience for the CoResearch project, not a live research session, production capability certification, or a claim that the acceptance studies are complete.

## Version boundary

| Identity | Value | Meaning |
| --- | --- | --- |
| Community starting point | `7b9040fb48212450678f996fe8c9c370fadc83d8` | Public-site baseline before this change |
| Historical teaching baseline | `a52c71845fecb7409e7f3df427650a6be85cebec` | Pinned scenario/task semantics, not the final companion source commit |
| Companion Core source | `ab422528d72830e88f325c328a83b6e15b559b05` | Actual clean committed source used for this export |
| Companion source base | `8af90259761416cb2f7bc1a311d50319eca12dc0` | Current Core develop integrated before the companion commit |
| Viewer/profile identity | `a52c718-1.0.0` | Stable teaching profile and asset directory |
| Fixture | `video-identity`, `1.0.0`, `synthetic=true` | Invented papers, evidence, conditions and revisions, visibly labelled |

The checked-in [PROVENANCE.json](../../public/demos/coresearch/a52c718-1.0.0/PROVENANCE.json) is the authoritative artifact manifest. Its `coreSourceCommit` identifies the companion source; `coreSha` deliberately retains the historical lesson baseline. Playback does not fetch `latest` product data. Export built at **2026-11-21 00:22:08 Asia/Shanghai**.

### Current exported files

| File | SHA-256 |
| --- | --- |
| `LICENSE` | `586fe8965302b57c7a490a42911f847f0dba54e60d95df53f3ad53ed9eed6b83` |
| `NOTICE` | `4e21127a8301e50182df14bc60a80d8d8100645e0a04f4a1a8a699363d6b7ba0` |
| `THIRD_PARTY_LICENSES.json` | `98726e1f1b01659a4443ef7037a46218559c18e399ac98cde88a75a471e81d67` |
| `THIRD_PARTY_LICENSES.txt` | `1d98be66d3bea20ef1e72891b9ff9218cfbfa8c8f2bb949538e19d4f0ba00af0` |
| `assets/index-CeXFVUlW.css` | `722ba53775065b43007035ee1bbf7c488f61b678a83ce2c8fdbaf7409c8b1390` |
| `assets/index-ClJuelNc.js` | `5186d492aa76e3677ed7ab9fbe68739c2184c1790f08981266e5f7cb452fffb6` |
| `demo-viewer.html` | `66080ea44e4376589037825935d9822ec6156f85b0690d491648ebf57cf43535` |
| `index.html` | `66080ea44e4376589037825935d9822ec6156f85b0690d491648ebf57cf43535` |

The directory also contains `PROVENANCE.json` itself. There are no source maps or private Core source files in this export.

## What is genuinely reused

| Concern | Community integration | Core renderer/contract | Boundary or deliberate cut |
| --- | --- | --- | --- |
| Direction groups and revisions | `app/demo/fixtures/video-identity.ts`, `viewer/fixture.ts` | Fast direction-set/card contracts | G1/G2/G3 pin both parent group and parent direction revisions |
| Real direction UI | `ViewerFrame.tsx` displays the pinned export | DirectionCard, DirectionBlock, DirectionIntroduction | Actual components mount in the offline entry, not a recreated iframe shell |
| Real graph | Parent snapshot carries graph presentation | ResearchGraph | Optional `presentation`/`onPresentationChange` is a companion addition: selection/root/folds/pan/zoom/scroll/stow round-trip; later checkpoints restore actual DOM scroll. Default product mode remains uncontrolled |
| Task picker | Real task-picker callbacks emit parent intents | ContextChips + product Button | Optional `availableActions` restricts the embedded historical lesson to Explore; defaults retain the live product menu. This is not Host-bound composer/session chrome |
| Paper card and reading | Local PreviewResourcePort, pinned synthetic content | PreviewResourceView, PaperCardRenderer, PaperRenderer, PaperReadingView | Actual registered `paper_card` v1 and `paper-reading` v1 validators/renderers; not full Host PreviewPane chrome. Shared paper-card preview validator and already-resolved initial reading document are companion changes |
| Evidence and counts | Shared reducer/evaluator + reading events | Local fixture port | Counts are derived and de-duplicated. Unavailable excerpts/full text cannot manufacture claims or judgments |
| Concept story | `app/demo/scenes/concept.ts`, ConceptOverlay | Shared synthetic fixture | Eight causal acts, fixture-backed per-paper condition/budget table and visible reversible judgment revision |
| Product playback | `product-runtime.ts`, ProductDemo | Same viewer intent path | Eight acts/72 seconds, derived from the 36-second kernel; parent is the only clock |
| Guides | `app/demo/guides/*`, GuideExperience | Same actual viewer handlers and local port | Five sequential tutorials, plus troubleshooting; operation/result predicates, explicit retry/recovery/reset and fixture-version remounts |

## Semantics and lifecycle

- Historical lesson capability: **Explore only**; other workflows and Idea State are not presented as available. Newer Core source may expose different production tasks; this lesson does not certify them.
- Select/continue-direction prepares a task; **Send** executes the supported recorded target. Add as context adds only a reference. Ordinary referenced Send is distinct from Explore. Unsupported task/target combinations do not silently run another branch.
- Off-preset drafts are retained. Fixed results require explicit agreement to use the example; edits after preparation invalidate that agreement. Replay/unmount/StrictMode cancel and generation-fence delayed proof results.
- Normal guide Next preserves selected paper/context/draft/prepared task. Reset is explicit fresh practice at the current checkpoint: completion, operation history and preview are cleared; troubleshooting metadata practice must perform Back again. Interrupted-step recovery is a separate operation.
- Metadata-only, unavailable, missing-version, cancellation and retry are real local-port outcomes, not labels drawn over a successful resource. Missing resource IDs are propagated into the viewer port. No unavailable full text is called read.
- Transport is `coresearch-demo/v1`: parent `init`/`applySnapshot`/`dispose`; viewer `listenerReady`/`frameReady`/`userIntent`/`error`. Origin, actual source window, schema and generation are validated. The iframe listener installs before React and queues init. Parent subscriptions survive ordinary rerenders; cleanup is for lifetime boundaries, not every clock tick.
- The same-origin sandbox uses `allow-scripts allow-same-origin`; it is a reviewed local teaching asset, **not a security boundary for arbitrary untrusted code**. A failed viewer shows explicit failure/retry, never a hidden replica passed off as the real UI.

## Legal and public export boundary

Core LICENSE and NOTICE are retained. [THIRD_PARTY_LICENSES.txt](../../public/demos/coresearch/a52c718-1.0.0/THIRD_PARTY_LICENSES.txt) and its JSON companion distribute **48 actual bundled package/version attributions**, including React/ReactDOM, Lucide's inherited Feather copyright, and precompiled mini-lit/KaTeX/Tailwind CSS. File hashes are included above and in the artifact manifest.

The inventory comes from included Rollup modules and PostCSS inputs. Precompiled CSS vendors are checked against the exact upstream source lock and a reviewed stylesheet hash. Full-license texts omitted by npm have verbatim, hashed upstream supplements with explicit provenance. In particular, react-remove-scroll-bar's npm source gitHead was unavailable upstream: its supplement identifies the actual maintainer LICENSE commit rather than pretending it came from that release commit. No copyright wording is invented.

The companion Core exporter requires an explicit Community checkout, validates package identity, path containment and non-symlink ancestry, and refuses unowned or locally edited existing files. Only individually manifest-owned obsolete files are removed; it does not recursively delete the destination. It requires clean committed source so provenance is reproducible. Generated Core `dist-demo/` is ignored.

The public repository consumes only reviewed compiled assets and legal/provenance files. It does **not** need Core access, a private token, Host, model/retrieval services, analytics, credentials or environment files to build. Host clients and analytics are stubbed out of the viewer bundle. Scanner checks are not a substitute for native network/offline acceptance.

## Reproduce the public build

With this public repository's locked dependencies installed:

```sh
npm ci
npm run lint
npx tsc --noEmit --incremental false
npm run prebuild
NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_BASE_PATH=/CoResearch-Community NEXT_DIST_DIR=.next-review npm run build
```

Next and eslint-config-next are pinned to **16.4.5**. The static export uses trailing slashes and basePath `/CoResearch-Community`; the configured isolated output directory is the exported site, not an assumed `out/` directory. No Core checkout or environment configuration is required. The companion's own instructions describe rebuilding the viewer separately and exporting it only after its source is committed.

## Verified evidence versus unfinished acceptance

Code checks cover deterministic fixture/event dependencies, counts/revisions, actual JSX/effect lifecycles, sequential guide operations, Core registry/port contracts, real React/DOM graph handlers, boot sender isolation, safe export ownership and artifact/license hashes. Node/jsdom/hook tests are **not native browser evidence**.

Earlier immutable browser snapshots have reported evidence:

- Snapshot 4176: all five actual-click guide flows; 320/390 pointer tabs and P06 full text; docs SHA wrapping; Act 8 at 200% zoom passed.
- Snapshot 4178 (partial): troubleshooting reset/fresh Back requirement, get-started task menu→Send→G1, positive P02 reading criterion, 390 manual story/200% Act 8, and seek→Continue without rewinding passed. Two tool-intercepted clicks (graph Select and product Pause) did not establish an application hit-testing defect; they are incomplete observations, not claimed passes or fixed bugs.

**Those observations precede the current companion commit/export and ExploreProof changes. Current-candidate native browser recheck remains pending.** Core's whole-project typechecks are not reported as clean: the local incomplete backend dependency installation leaves 319 diagnostics in the separately run test-typecheck, with no diagnostics in changed viewer/renderer/regression files. Full Core lint/CI must run in a fully prepared Core checkout; targeted behavior suites and the viewer build are separate checks.

Outstanding acceptance is explicit: keyframe-vs-Core comparisons, required screenshots/continuous recordings, native keyboard/reduced-motion/overflow checks not evidenced above, network interception/offline/background evidence, genuinely uncoached 3–5-person studies and release capability/version signoff. No participants, recordings or research results are fabricated. This remains **Related to #36–#40**, not a claim that these issues can be closed.
