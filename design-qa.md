# CoResearch Community product demo · visual QA

## Reference
- Owner-supplied ZIP, `design-1to1.png` (L2 focus) and `product-ui.png` (5-direction overview); both 3420 × 1999, downsampled to 1440 × 842 for comparison with real Chromium screenshots at DPR 1.
- The supplied `replica.html` is an interaction reference, not the visual target; its send and direction commands were only placeholders.
- Product source checked: CoResearch `develop` workspace/chat and DirectionGroupWheelView. Rebuilt as new standalone UI and fixture, not an export of the Core application or account data.

## Findings and fixes
- P1: Previous Community demo showed a pale two-panel UI. Restored the dark three-track workspace, app tabs, compact toolbar and bottom composer; confirmed in focus and overview browser captures.
- P1: The supplied reference package shows two groups with different counts. The focused snapshot now starts on the two-direction group, and the neighboring conversation opens the five-direction panorama. The replay exercises the two-direction group from prompt to follow-up.
- P2: Active-sector copy was too far right, toolbar vertically offset, and the chart/compass missed the silvery ring and ruler structure; corrected framing, text inset and ticks in the second render and compared the detail region.
- P2: The embedded control was waiting for an iframe load event that could occur before hydration. Replaced it with a two-way readiness handshake; passed against both exported routes.
- Expected differences: fixture dialogue and public-safe workspace/session labels intentionally differ from the reference content; font rasterization depends on OS, icons and subpixel spacing are not screenshot pixels. The graph is programmatic and selectable, not a background image. At <=720 px the two working panes use tabs rather than shrinking the desktop screenshot.
- Typography: platform UI fallback, compact dark control labels and reserved serif wordmark. Spacing: desktop sidebar 13.65%, remaining split 45.3 / 54.7, stage and composer checked against both references. Colors: charcoal app chrome, near-black plot, neutral active-sector gradient and muted gold/cyan chart semantics. Image quality: vector geometry and DOM text, checked both fit-to-window and focused rather than pixelated art. Copy: reference control labels retained, example-only data and no exposed account IDs.

## Behavior
- Standalone HTML opens from file://; no network requests.
- Chromium covered 5-direction overview, graph keyboard selection, direction details, draft without send, explicit send, pending send while moving to another sector, children assigned to original parent, tree view and 320px touch layout.
- Static exports at the Pages base path: Community homepage and /product/ both load the same sandboxed HTML and pass play/pause/resume. No live deployment made.
- `NEXT_PUBLIC_BASE_PATH=/CoResearch-Community npm run build`; `RW_CHROMIUM_PATH=<chromium> EXPLORE_SMOKE_URL=<served-export>/CoResearch-Community/ node scripts/smoke-explore-demo.mjs`.

final result: passed

## Light presentation follow-up
- Input: owner-supplied real dark workspace screenshots dated 2026-11-26, 3420 × 1999. The public product-page overlay uses that workspace aspect and tracks (sidebar 13.65%, then 45.3/54.7), compact desktop tab/tool rows, graph breadcrumb and control rows, direction receipt, and bottom composer. No screenshot or signed-in workspace data is embedded.
- Separate light look verified in Core develop shell tokens (white cards, cool gray sidebar and indigo brand mark). The knowledge-canvas host uses a fixed dark canvas surround and the only-SVG wheel; it is not a green disk or an all-white stage. The demo keeps those two surfaces separate. Screenshot font rasterization, fixture text, vector paths and mock result are not pixel-identical to a running authenticated Core light session; no live Core light visual snapshot was supplied.
- Two-direction overview and L2 crop are different views of the same mocked group. A selected sector retains its geometry before and after the two outer children appear. Compare → select → pinned composer draft → scripted send → result, only in the presentation mode. Preserve homepage graph and interactive demo; mobile reflows the visible chat and disk rather than shrinking three panels.

## Full-light product palette
User subsequently asked for the wheel itself to be light. The promotional showcase now overrides the plot plate, rings and ticks, fills, slate text and mini-map with light tokens; actual Core keeps its native design and the standalone and homepage interactive embeds retain their dark palette. No wheel geometry, fixture, motion, product artwork or homepage story changed.
