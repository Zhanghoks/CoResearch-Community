import type { Metadata } from "next";
import { siteUrl } from "../../content";
import { GuideExperience } from "../../components/guides/GuideExperience";

export const metadata: Metadata = {
  title: "用图谱定位 · 使用指南 · CoResearch",
  description: "在图谱、方向和详情之间定位，折叠不删除结果。",
  alternates: { canonical: `${siteUrl}/docs/research-graph/` },
  openGraph: { url: `${siteUrl}/docs/research-graph/` },
};

export default function Page() {
  return <GuideExperience guideId="research-graph" />;
}
