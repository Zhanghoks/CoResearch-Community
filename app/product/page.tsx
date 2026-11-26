import type { Metadata } from "next";
import { ProductDocs } from "../components/product-demo/ProductDocs";
import { ProductGuide } from "../components/product-demo/ProductGuide";
import { ProductHero } from "../components/product-demo/ProductHero";

export const metadata: Metadata = {
  title: "产品 · CoResearch",
  description:
    "看 CoResearch 如何从 Agent 对话与方向圆盘开始，查证据、界定 Open Problem，并修订下一步研究计划。",
};

export default function ProductPage() {
  return (
    <main>
      <ProductHero />
      <ProductGuide />
      <ProductDocs />
    </main>
  );
}
