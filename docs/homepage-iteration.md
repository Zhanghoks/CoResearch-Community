# Homepage: run CoResearch, explain the concept, then show each feature

- Reference: CrommaCode’s public landing page for composition only (centered statement, prominent workspace, screen-paced feature sections). No third-party images, styles or font copied.
- Base: Community main `7b9040fb48212450678f996fe8c9c370fadc83d8`. The first commit ports the existing public offline viewer, synthetic fixture and tutorial foundation previously reviewed in #41. This PR is independently based on main; the old draft is not merged or changed.
- Order: live viewport-sized offline replay of actual Core UI → concept graph explaining how a judgment changes → separate direction, evidence, and refinement sections. Reuse a single video-identity fixture.
- The 25.5-second homepage replay starts when visible and ready, stops only at its end or on an explicit pause/jump, and suspends offscreen or in a background tab. Reduced motion shows a readable manual checkpoint with no timer. No autoplay of multiple embedded viewer instances at once: feature excerpts mount on demand, one at a time, and suspend offscreen. The full product page is unchanged in scope and still supports the complete example.
- The real viewer is the previously published offline component bundle with provenance; see its manifest in `public/demos/coresearch/a52c718-1.0.0/PROVENANCE.json`. Feature posters are screenshots of this viewer on local static Pages export with the synthetic fixture, not generated UI. No real query, account, LLM, or data mutation is part of the demonstration.
- Review flow: Play the homepage through to P02, replay, move to concept Act 6 then Act 7, reveal conditions, open a feature excerpt, then follow the evidence guide deep link. Check real keyboard activation and short/mobile dimensions as well as pointer inputs.
- Rollback if later deployed: revert the homepage PR's merge commits and allow GitHub Pages to rebuild from main. This draft changes neither deployment settings nor public main. Do not combine it with the overlapping #41 draft.

## Reproduce the browser checks

1. Install the lockfile dependencies and run `NEXT_PUBLIC_BASE_PATH=/CoResearch-Community npm run build`.
2. With Firefox and GeckoDriver installed, run `npm run test:homepage:browser`. Use `FIREFOX_BIN` and `GECKODRIVER` for nonstandard executable locations. Also run `CORESEARCH_REDUCED_MOTION=1 npm run test:homepage:browser` for the static-reader flow. It serves only the static export on loopback.
3. The smoke test checks real timed UI changes and keyboard handling, all eight graph scenes at five widths, current-group visibility in the mobile viewer, the matching P02 guide, and request/console boundaries. A narrow CSS viewport is a responsive layout check, not proof of physical device behavior.

The graph’s revision has four beats: original coverage, P05 (long/continuously visible), P03 (occlusion and cutting with different update budget), and the revised judgment. The two added coverage regions are separate. The dashed onward path explicitly remains unverified. On phones, manual is the initial mode; users who have not requested reduced motion can opt into playback.
