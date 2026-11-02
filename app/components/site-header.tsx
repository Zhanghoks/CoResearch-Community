"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { githubUrl, issuesUrl } from "../content";

const links = [
  { href: "/", label: "首页" },
  { href: "/docs", label: "文档" },
  { href: issuesUrl, label: "反馈" },
];

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  const [glass, setGlass] = useState(false);

  useEffect(() => {
    const update = () => {
      const header = ref.current;
      if (!header) return;
      const line = header.getBoundingClientRect().bottom;
      const hero = document.querySelector("[data-home-hero]");
      if (hero) {
        setGlass(hero.getBoundingClientRect().top < line - 1);
        return;
      }
      setGlass(window.scrollY > 4);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-20 border-b transition-[background-color,border-color,backdrop-filter] duration-200 ${
        glass
          ? "border-white/40 bg-[#fdfff7]/40 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
        <Link href="/" className="order-1 text-lg font-semibold tracking-tight">
          CoResearch
        </Link>
        <a
          href={githubUrl}
          title="本社区仓库。产品源码开源准备中，暂未公开。"
          aria-label="社区仓库。产品源码开源准备中，暂未公开。"
          className="order-2 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#262626] px-4 py-2 text-sm font-medium text-white md:order-3"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          社区仓库
        </a>
        <nav className="order-3 flex w-full flex-wrap gap-x-5 gap-y-2 text-sm font-medium md:order-2 md:w-auto">
          {links.map((link) =>
            link.href.startsWith("http") ? (
              <a key={link.href} href={link.href} className="hover:opacity-70">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="hover:opacity-70">
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
