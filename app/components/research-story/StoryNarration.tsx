import { chapters } from "../../graph-svg/story";

export function StoryNarration({ active }: { active: number }) {
  const chapter = chapters[active];
  return (
    <aside className="rw-narration" aria-label="当前图谱讲解">
      <div className="rw-caption-meta"><p className="rw-eyebrow">{chapter.tag}</p><span className="rw-step-count" aria-label={`第 ${active + 1} 步，共 ${chapters.length} 步`}>{String(active + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</span></div>
      <h3>{chapter.title}</h3>
      <p className="rw-body">{chapter.body}</p>
      <p className="rw-takeaway">{chapter.takeaway}</p>
      <div className="rw-key" aria-hidden="true">
        <span><i className="rw-key-paper" />前人工作</span>
        <span><i className="rw-key-idea" />当前想法</span>
        <span><i className="rw-key-candidate" />待验证</span>
      </div>
    </aside>
  );
}
