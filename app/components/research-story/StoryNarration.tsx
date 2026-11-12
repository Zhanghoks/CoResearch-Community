"use client";

import { useEffect, useState } from "react";
import { chapters } from "../../graph-svg/story";

function NarrationBody({ index, leaving }: { index: number; leaving?: boolean }) {
  const chapter = chapters[index];
  return (
    <div className={`rw-narr-body${leaving ? " rw-narr-out" : ""}`} aria-hidden={leaving || undefined}>
      <p className="rw-eyebrow">{chapter.tag}</p>
      <h3>{chapter.title}</h3>
      <p className="rw-body">{chapter.body}</p>
      <p className="rw-takeaway"><span className="rw-takeaway-mark">要点</span>{chapter.takeaway}</p>
      {!leaving && (
        <div className="rw-key" aria-hidden="true">
          <span><i className="rw-key-paper" />前人工作</span>
          <span><i className="rw-key-idea" />当前想法</span>
          <span><i className="rw-key-candidate" />待验证</span>
        </div>
      )}
    </div>
  );
}

/**
 * Paired chapter transition: the outgoing copy fades up while the incoming copy
 * settles in from below, so text never pops between chapters.
 */
export function StoryNarration({ active }: { active: number }) {
  const [state, setState] = useState({ in: active, out: null as number | null });
  const [prevActive, setPrevActive] = useState(active);
  // Derive the paired transition during render when the chapter changes (React's
  // adjusting-state-on-prop-change pattern) instead of cascading through an effect.
  if (prevActive !== active) {
    setPrevActive(active);
    setState((current) => (current.in === active ? current : { in: active, out: current.in }));
  }
  useEffect(() => {
    if (state.out === null) return;
    const timer = setTimeout(() => setState((current) => ({ ...current, out: null })), 460);
    return () => clearTimeout(timer);
  }, [state.out]);
  return (
    <aside className="rw-narration" aria-label="当前图谱讲解">
      {state.out !== null && state.out !== state.in && <NarrationBody index={state.out} leaving />}
      <NarrationBody index={state.in} />
    </aside>
  );
}
