import Link from "next/link";
import { HomeCoreMotion } from "./home-core-motion";
import "./home-hero.css";

export function HomeHero() {
  return (
    <section id="top" data-home-hero className="home-stage">
      <div className="home-stage-bg" aria-hidden="true">
        <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="currentColor">
            <ellipse cx="600" cy="340" rx="495" ry="210" />
            <ellipse cx="600" cy="340" rx="406" ry="170" />
            <ellipse cx="600" cy="340" rx="290" ry="120" strokeDasharray="2 7" />
            <path d="M0 308 130 264 225 340 349 261 541 334 724 271 897 326 1016 221 1200 273M130 264 187 152 349 261 408 117 541 334M724 271 790 135 1016 221 1112 151M225 340 160 404M897 326 1002 407" />
          </g>
          <g fill="currentColor">{[[130,264],[225,340],[349,261],[187,152],[408,117],[790,135],[897,326],[1016,221],[1112,151],[1002,407],[160,404]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" />)}</g>
        </svg>
      </div>
      <div className="home-stage-intro">
        <p className="home-stage-kicker"><i aria-hidden="true" /> CORESEARCH / 研究工作台</p>
        <h1>从一个研究兴趣，<br />找到有依据的方向</h1>
        <p className="home-stage-lede">用 Explore 找方向、核对论文，再沿着选中的方向继续研究。</p>
        <div className="home-stage-actions">
          <a href="#home-replay" className="home-stage-primary">看 Explore 演示 ↓</a>
          <Link href="/docs/get-started/" className="home-stage-secondary">跟做一次 ↗</Link>
        </div>
      </div>
      <div id="home-replay" className="home-stage-window"><HomeCoreMotion /></div>
      <p className="home-stage-foot">使用合成教学数据，不调用真实搜索或模型。<a href="#research-world">往下看研究是怎么推进的 ↓</a></p>
    </section>
  );
}
