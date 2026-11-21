import { SiteStory } from "../components/site-story";

export default function VisionPage() {
  return (
    <main id="main">
      <header className="mx-auto max-w-6xl px-5 pt-16">
        <p className="text-sm font-semibold tracking-widest text-[#465b45]">CORESEARCH / 产品理念</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">研究世界的设计</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#3f413c]">了解产品背后的研究路径、两类空间，以及规划中的协作方式。这些是设计解释，不是上线功能列表。</p>
      </header>
      <SiteStory />
    </main>
  );
}
