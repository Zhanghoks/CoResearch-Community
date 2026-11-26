import { ResearchWorldStory } from "./components/research-story/ResearchWorldStory";
import { ExploreDemo } from "./components/product-demo/ExploreDemo";
import { SiteStory } from "./components/site-story";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Home() {
  return (
    <main>
      <section data-home-hero className="p-6 md:p-10">
        <div className="relative overflow-hidden rounded-[24px] md:rounded-[28px]">
          <img
            src={`${basePath}/hero-wanderer.jpg?v=576`}
            alt="雾海上的漫游者"
            width={1024}
            height={576}
            className="block h-auto w-full"
          />
          <div className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-8 md:pt-12">
            <h1 className="text-center text-5xl font-semibold tracking-tight text-[#262626] md:text-7xl">
              CoResearch
            </h1>
          </div>
        </div>
      </section>
      <ResearchWorldStory />
      <ExploreDemo />
      <SiteStory />
    </main>
  );
}
