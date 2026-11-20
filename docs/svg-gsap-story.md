# Research World: SVG + GSAP story

This implementation replaces only the rendered `ResearchWorldStory` section. The existing hero, navigation, community content, documentation, unused PixiJS renderer, and the #38 product-demo viewer remain intact.

## What changed in #39

The 13-chapter terminology walk (Graph → … → Gap Finder → Innovator → Candidate) is replaced by **eight causal acts** driven by the shared #37 synthetic fixture (`video-identity`). Viewers should be able to name the open question, at least one supporting evidence item, a counterexample that revised a prior coverage record, and the next verification step, without relying on narration alone.

The #35 engine is preserved where required: deterministic SVG world coordinates, no CSS blur, stroke-drawn paths, pure `sampleStory(progress)` / `sampleConcept(progress)` evaluation, reversible seek, manual and scroll modes, and reduced-motion complete keyframes.

## The eight acts

1. Interest: preset prompt「视频生成，我想找一个值得研究的问题」with seed and three comparable directions.
2. Choose and refine: 生成一致性 → 主体身份 → 跨镜头身份保持. Gold focus follows the chosen path; unselected branches stay dimmed.
3. Read P01/P02 and form E01 (conditional support under short, continuously visible clips).
4. Compare conditions and budgets (L01/L02). The solid region is “当前证据覆盖”, not a map of the field.
5. Record that coverage and start a follow-up search. No green success mark.
6. P05/P03 revise the **same** coverage record (`cov-short-visible` via CE01/CE02). The previous and revised statements are shown together; seeking back restores the pre-revision state.
7. Form the complete open question `oq-identity-budget` (scope, grounds, counterexamples, unknown, next step, unverified status). P06 is linked as “候选迁移，待验证”.
8. The researcher chooses the next comparison. The story stops; replay is explicit. This is a concept vision, not a claim that locked product tasks are available. Explore remains the only open task.

Screen typography: key labels ≥ 14 CSS px, the question body ≥ 16 CSS px, in an HTML overlay that does not shrink with SVG zoom. Desktop: local graph + evidence/question card. Mobile: current action on top, then the graph, then one card.

## Interaction

Autoplay on desktop uses the shared `createDemoPlayer` with a 62s clock, in-view start, content hover/focus pause, control events that do not count as user content pauses, and a final hold. Scroll mode from #35 remains available on desktop. Mobile and short viewports default to manual steps. Reduced motion jumps to complete keyframes. Skip, previous/next, chapter picker, keyboard arrows, and a full transcript cover all eight acts.

## Files

- `app/demo/scenes/concept.ts`: act timings, kernel checkpoints, `factsForAct`.
- `app/graph-svg/story.ts`, `scene.ts`, `types.ts`, `mock-world.ts`: camera vs facts, eight settled poses, weakened background (not a quality metric).
- `app/components/research-story/*`: SVG path/coverage/revision layers, HTML overlay, narration (action / change / next), player and mobile layout.
- `scripts/test-research-story.mjs` asserts eight acts, reversible act-6 revision, and fixture-backed foreground. `scripts/smoke-research-story.mjs` no longer treats node count ≥ 250 as quality.
