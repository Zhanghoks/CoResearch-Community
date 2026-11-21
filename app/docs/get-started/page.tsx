import type { Metadata } from "next";
import { siteUrl } from "../../content";
import { GuideExperience } from "../../components/guides/GuideExperience";

export const metadata: Metadata = {
  title: "第一次 Explore · 使用指南 · CoResearch",
  description: "用共享合成 fixture 完成第一次 Explore。",
  alternates: { canonical: `${siteUrl}/docs/get-started/` },
  openGraph: { url: `${siteUrl}/docs/get-started/` },
};

export default function Page() {
  return <GuideExperience guideId="get-started" />;
}
