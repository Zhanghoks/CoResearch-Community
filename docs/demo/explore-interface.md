# Explore: conversation ↔ direction wheel

The original standalone fixture at `public/demos/coresearch-explore.html` has two modes. The standalone file opens the dark, interactive workbench with playback and manual controls; compact screens switch between conversation and graph. The homepage opens with the read-only light workbench and wheel in a single macOS-style window, followed by the concept graph and workflow guide. The product route remains available for existing links. The product window plays when visible unless reduced motion is enabled, and has a keyboard-accessible playback control. Both modes use illustrative data with no network requests or persistence; neither runs real research.

## Source comparison

The CoResearch workbench was used as a visual and behavior reference. Its source code, reference captures, and workspace data are not included in this demo.

| Source under `plugins/web-ui/src/` | What the replay shows |
| --- | --- |
| `research-workspace.ts`, `shell.css` | Conversation and preview are peers; neutral light shell, small controls, 14px bounded panes, thin separators. |
| `chat.ts`, `island/output-renderers/renderers.tsx` | The chat shows a direction-group result; opening it exposes a preview owned by the current conversation. |
| `island/output-renderers/knowledge-canvas/KnowledgeCanvas.tsx`, `knowledge-canvas.css`, `views/DirectionGroupWheelView.tsx` (under the same knowledge-canvas directory) | Dark dot-grid plate, concentric mechanical sectors, an overview-to-focus camera move, and separate warm current / cool child rings. |
| `island/DirectionsTab.tsx`, `task-actions.ts`, `direction-follow-up.ts`, `composer.ts`, `locales/zh.ts` | “细分方向” prepares the follow-up in the composer. Selecting and inspecting a direction never sends a new turn; member send is separate. |

The wheel geometry, prompt, timings and directions are simplified illustrations. The fixed replay does not imply verified evidence, actual response timings, product tree/sunburst support in this demo, or a new persistence contract. CrommaCode is the display reference: place a working-looking product window on stage and tell the story inside it, not a source of CoResearch colors, labels, or components.

Serve the static Pages export and run `EXPLORE_SMOKE_URL=http://localhost:3485/CoResearch-Community node scripts/smoke-explore-demo.mjs`. The smoke covers the offline document's request boundary, play/pause, manually sending both rounds, rotation, immutable sent text, branch ownership, both embed routes, and the 320px mobile handoff with reduced motion.

Guided playback and a manually submitted fixture reply have independent timers. Reopening the original group, returning to overview, rotating, or inspecting a neighboring direction while waiting does not stop the reply or rewrite its parent. Finishing a reply keeps the view the reader navigated to; the result card reopens the submitted branch. Resetting or explicitly seeking the timeline may discard pending fixture work.

## Owner-supplied 1:1 design update

The current standalone screen follows the dark three-column Web workspace in the supplied `CoResearch-product-demo.zip`: two-direction L2 focus (`design-1to1.png`) and a second conversation with a five-direction overview (`product-ui.png`). The fixture data is independently authored and the reference images are not shipped. See [design QA](../../design-qa.md). Standalone users can replay from the chat overflow menu. Product-page autoplay is non-interactive apart from pause, resume, and replay.


## Product showcase fixture

The passive product-page window uses a separate synthetic workspace. The active project is AI research novelty, with an active Explore session and adjacent screening, rubric, and replication sessions. Retrieval evaluation and experimental reproducibility are adjacent projects. The scripted conversation starts by distinguishing rewritten claims from genuinely different methods, identifies two testable directions, and adds a nested “方向 02 验证方案” session only when its two proposed tests appear on the wheel. Replay restores the initial sidebar. No user workspaces, unpublished results, or real model calls are used.
