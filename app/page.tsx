import type { Metadata } from "next";
import { siteUrl } from "./content";
import { HomeHero } from "./components/home-hero";
import { ProductDemoTeaser } from "./components/product-demo-teaser";
import { ResearchWorldStory } from "./components/research-story/ResearchWorldStory";
import { SiteStory } from "./components/site-story";

export const metadata: Metadata = {
  alternates: { canonical: `${siteUrl}/` },
  openGraph: { url: siteUrl },
};

export default function Home() {
  return (
    <main id="main">
      <HomeHero />
      <ResearchWorldStory />
      <ProductDemoTeaser />
      <SiteStory />
    </main>
  );
}
