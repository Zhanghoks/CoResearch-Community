# Community Research World: transparent graph and native copy

- Homepage only. Retains the full 218-frame sequence: the overview, Idea Space 01–10, and Open Question.
- The transparent frame atlases contain the graph, path, and original label outlines, not the masthead, caption, chapter counter, legend copy, or callout copy. Those are rendered as semantic HTML. On narrow screens the callouts are listed below the graph.
- Each distinct wheel gesture or swipe advances one step. Reverse to revisit a step; past the last step, scrolling returns to the rest of the page. The visible progress marks can also be selected. Reduced motion exposes the same steps without hijacking scroll.
- No GIF download button or shipped source GIF. To regenerate the assets, use `python scripts/export-idea-frames.py /path/to/research_world_organic_idea.gif` with Pillow and NumPy. Source SHA-256: `ab1e5df55df1706aa7893f334c590e7beea5f31dc9cdda80c8202b13ec388311`. The original matte is recovered as alpha, including the antialiased edges; card fills stay opaque. Compositing onto the old matte reproduces the source graph within one RGB level, excluding the designated callout text regions.
- `npm run test:visual` targets the running preview. It tests the complete desktop wheel sequence, touch, reverse/exit, reduced-motion, HTML labels and alpha without a dependence on the current homepage background.
