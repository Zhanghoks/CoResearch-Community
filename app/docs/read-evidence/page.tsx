import type { Metadata } from "next";
import { siteUrl } from "../../content";
import { GuideExperience } from "../../components/guides/GuideExperience";

export const metadata: Metadata = {
  title: "看论文和依据 · 使用指南 · CoResearch",
  description: "打开正确论文、辨认阅读状态并返回方向。",
  alternates: { canonical: `${siteUrl}/docs/read-evidence/` },
  openGraph: { url: `${siteUrl}/docs/read-evidence/` },
};

export default function Page() {
  return <GuideExperience guideId="read-evidence" />;
}
