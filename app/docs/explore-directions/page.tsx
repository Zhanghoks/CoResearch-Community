import type { Metadata } from "next";
import { siteUrl } from "../../content";
import { GuideExperience } from "../../components/guides/GuideExperience";

export const metadata: Metadata = {
  title: "继续细分方向 · 使用指南 · CoResearch",
  description: "在选定方向上继续细分，并核对 parent/revision。",
  alternates: { canonical: `${siteUrl}/docs/explore-directions/` },
  openGraph: { url: `${siteUrl}/docs/explore-directions/` },
};

export default function Page() {
  return <GuideExperience guideId="explore-directions" />;
}
