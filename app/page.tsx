import type { Metadata } from "next";
import { siteUrl } from "./content";
import { HomeHero } from "./components/home-hero";
import { HomeFeatures } from "./components/home-features";
import { ResearchWorldStory } from "./components/research-story/ResearchWorldStory";

export const metadata: Metadata = {
  alternates: { canonical: `${siteUrl}/` },
  openGraph: { url: siteUrl },
};

export default function Home() {
  return (
    <main id="main">
      <HomeHero />
      <ResearchWorldStory />
      <HomeFeatures />
    </main>
  );
}
