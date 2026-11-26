import { ProductDocs } from "./components/product-demo/ProductDocs";
import { ProductGuide } from "./components/product-demo/ProductGuide";
import { ProductHero } from "./components/product-demo/ProductHero";
import { ResearchWorldStory } from "./components/research-story/ResearchWorldStory";
import { SiteStory } from "./components/site-story";

export default function Home() {
  return (
    <main>
      <ProductHero />
      <ResearchWorldStory />
      <div id="workflow" className="scroll-mt-28">
        <ProductGuide />
      </div>
      <ProductDocs />
      <SiteStory />
    </main>
  );
}
