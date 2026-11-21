import type { Metadata } from "next";
import { ExploreProof } from "../../components/demo-proof/ExploreProof";
import { siteUrl } from "../../content";

export const metadata: Metadata = {
  title: "Explore 回放验证 · CoResearch",
  description: "离线验证共享合成场景：准备 Explore、发送任务并收到 G1 方向组。",
  alternates: { canonical: `${siteUrl}/product/proof/` },
  openGraph: { url: `${siteUrl}/product/proof/` },
};

export default function ExploreProofPage() {
  return (
    <main id="main" className="pt-12">
      <ExploreProof />
    </main>
  );
}
