# Vector Research World renderer

The original GIF contains 218 frames of a 1,327-node, 3,306-edge synthetic graph. This iteration uses the original graph and episode data, rather than enlarging the raster. Every source frame maps to an SVG state, with colored states sampled from the source GIF, restricted to the source sequence's known node IDs. The boundary is redrawn from the highlighted node geometry. Strokes, nodes, leader lines and research-boundary outlines are vectors; chapter text and callouts remain HTML. This is a geometric remake of the range and marker styling, not a claim of pixel-identical GIF playback. The section remains transparent.

Run `python scripts/export-idea-vector.py GRAPH.json SEQUENCE.json SOURCE.gif` to regenerate the compact runtime asset (Pillow, NumPy, SciPy and contourpy). Homepage production uses one lazily loaded vector asset; the older raster atlases are no longer requested by the player. The poster is only a fallback before loading. The optional tour, one-gesture-per-step, skip and resume are retained.

## 15-step tour
The opening restores the five Research World beats (Foundations, Accumulation, Divergence, Connection, Research World) from the separate 118-frame growth reference. The reveal uses the original graph's birth order, with visible counts fitted to that GIF's rendered centers. Edges appear only when both endpoints have appeared. The settled full graph is shared with the beginning of Idea Space, so the handoff doesn't change any node or edge positions. The subsequent ten chapters retain all 218 mapped Idea frames and the existing HTML labels. The unnumbered overview remains an opt-in poster, not an extra step.

Regenerate the growth timeline with `python scripts/export-world-growth.py <graph.json> <research_world_organic.gif>`. The payload stores the source hash and exact five chapter cuts; neither GIF is shipped by this change.

Chapters 14–15 distinguish the blue Idea State from a violet dashed local literature frontier. The frontier first appears without a crossing. During chapter 15, a gap opens in that arc and an amber trace reaches a hollow question marker outside it. Source frame indices drive all three changes so reversing removes the candidate and closes the gap. The frontier is an illustrative local annotation, not a measured literature boundary or a verified research gap.
