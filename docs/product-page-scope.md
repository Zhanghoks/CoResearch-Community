# Product page scope and source checks

CoResearch Community is the public introduction to the Core research workspace. It is neither the hosted research runtime nor a rollout announcement.

| Surface | What it shows | Source of truth / boundary |
| --- | --- | --- |
| Home and product page | Prepare + send Explore, inspect a saved direction group and its papers, continue along a selected direction | The Core member Explore flow and Direction Card. Preparation is not submission. A direction’s attached paper is not proof that its full text was read. |
| Product screenshot and replay | Direction cards, Core research graph and paper preview for the same synthetic long-video example | The screenshot is cropped from the public viewer’s `read-evidence` guide at step `read-level`. See `public/demos/coresearch/a52c718-1.0.0/PROVENANCE.json` for the source of the bundled UI. Labels and results are teaching data. |
| Task availability | Only Explore is interactive in the public replay and guides | Core `main@1148a6e3` offers Explore in the reviewed menu. Core `develop@8af90259` also offers Paper Search and single-paper Explanation (requires a paper target). These development-branch capabilities are not claimed as deployed or included in the replay. |
| Research World | An illustrated example of comparing evidence, revising a judgment and framing the next question | A shared teaching fixture, not a product feature animation of a live research run or evidence of novelty. |

When refreshing the product page, verify the current Core member workflow and capability configuration independently of the historical viewer version. Do not infer live deployment status from a source branch, or full-text access from a saved reference.
