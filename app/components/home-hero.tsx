import Link from "next/link";
import { OPEN_QUESTION_ID, openQuestions } from "../demo/fixtures/video-identity";
import { chapters, sampleConcept, REVISION_STORY_ANCHOR } from "../graph-svg/story";
import { productDemoHref } from "../content";
import "./home-hero.css";

const revision = sampleConcept(chapters.findIndex(({ id }) => id === "revise")).facts.coverage;
const question = openQuestions.find(({ id }) => id === OPEN_QUESTION_ID)!;

export function HomeHero() {
  return (
    <section data-home-hero className="home-research-hero">
      <div className="home-research-intro">
        <p className="home-research-kicker">CORESEARCH / 研究工作台</p>
        <h1>从一个研究兴趣，<br className="home-research-break" />找到有依据的方向</h1>
        <p className="home-research-lede">
          在对话里用 Explore 找到候选方向，打开代表论文查看依据，再沿着你选中的方向继续细分。
        </p>
        <div className="home-research-actions">
          <Link href={productDemoHref} className="home-research-primary">看真实 Explore 界面 →</Link>
          <a href={`#${REVISION_STORY_ANCHOR}`} className="home-research-secondary">看反例如何改变判断 ↓</a>
        </div>
        <p className="home-research-note">图谱使用合成教学数据；问题的新颖性和有效性尚未验证。</p>
      </div>

      <div className="home-research-trace" aria-label="案例：长视频中的人物身份一致性">
        <p className="home-research-kicker">同一个案例 / 长视频人物身份一致性</p>
        <ol>
          <li className="home-research-evidence">
            <span className="home-research-marker" aria-hidden="true" />
            <div><h2>原证据覆盖</h2><p data-home-coverage-before>{revision?.previousStatement}</p></div>
          </li>
          <li className="home-research-revision">
            <span className="home-research-marker" aria-hidden="true" />
            <div><h2>反例修订 · {question.counterexampleIds.length} 条</h2><p data-home-coverage-after>{revision?.revisedStatement}</p></div>
          </li>
          <li className="home-research-question">
            <span className="home-research-marker" aria-hidden="true" />
            <div><h2>可检验的问题</h2><p data-home-open-question>{question.question}</p></div>
          </li>
        </ol>
      </div>
    </section>
  );
}
