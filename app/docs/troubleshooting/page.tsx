import type { Metadata } from "next";
import { siteUrl } from "../../content";
import { GuideExperience } from "../../components/guides/GuideExperience";

export const metadata: Metadata = {
  title: "恢复与例外 · 使用指南 · CoResearch",
  description: "元数据-only、全文不可用、版本缺失与中断后的恢复。",
  alternates: { canonical: `${siteUrl}/docs/troubleshooting/` },
  openGraph: { url: `${siteUrl}/docs/troubleshooting/` },
};

export default function Page() {
  return <GuideExperience guideId="troubleshooting" />;
}
