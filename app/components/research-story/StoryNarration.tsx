"use client";

import { useEffect, useState } from "react";
import { chapters } from "../../graph-svg/story";

function NarrationBody({ index, leaving }: { index: number; leaving?: boolean }) {
  const chapter = chapters[index];
  if (!chapter) return null;
  const hasLeadCard = chapter.id === "revise" || chapter.id === "question" || chapter.id === "next-step";
  return (
    <div className={`rw-narr-body${leaving ? " rw-narr-out" : ""}`} aria-hidden={leaving || undefined}>
      <p className="rw-eyebrow">{chapter.tag}</p>
      <h3>{chapter.title}</h3>
      <p className="rw-action"><span className="rw-takeaway-mark">动作</span>{chapter.action}</p>
      {hasLeadCard ? null : (
        <>
          <p className="rw-body">{chapter.body}</p>
          <p className="rw-change"><span className="rw-takeaway-mark">变化</span>{chapter.change}</p>
          <p className="rw-takeaway"><span className="rw-takeaway-mark">要点</span>{chapter.takeaway}</p>
          <p className="rw-next"><span className="rw-takeaway-mark">下一步</span>{chapter.next}</p>
        </>
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
    <aside className="rw-narration" aria-label="当前研究动作讲解">
      {state.out !== null && state.out !== state.in && <NarrationBody index={state.out} leaving />}
      <NarrationBody index={state.in} />
    </aside>
  );
}
