import type { Metadata } from "next";
import { siteUrl } from "../../content";
import { GuideExperience } from "../../components/guides/GuideExperience";

export const metadata: Metadata = {
  title: "带引用继续研究 · 使用指南 · CoResearch",
  description: "先添加引用，再明确发送追问。",
  alternates: { canonical: `${siteUrl}/docs/continue-research/` },
  openGraph: { url: `${siteUrl}/docs/continue-research/` },
};

export default function Page() {
  return <GuideExperience guideId="continue-research" />;
}
