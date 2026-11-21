import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Albert_Sans } from "next/font/google";
import { SiteHeader } from "./components/site-header";
import { siteDescription, siteTitle, siteUrl } from "./content";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const albert = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s",
  },
  description: siteDescription,
  applicationName: "CoResearch",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "CoResearch",
    images: [
      {
        url: `${siteUrl}/hero-wanderer.jpg`,
        width: 1024,
        height: 576,
        alt: "雾海上的漫游者，象征研究者在已有知识的边界上眺望下一步",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${siteUrl}/hero-wanderer.jpg`],
  },
  icons: {
    icon: [{ url: `${basePath}/favicon.svg`, type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`${albert.variable} scroll-smooth`}>
      <body
        className="bg-[#fdfff7] text-[#262626] antialiased"
        style={{
          fontFamily:
            'var(--font-albert), "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        }}
      >
        <a href="#main" className="skip-link">
          跳到主要内容
        </a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
