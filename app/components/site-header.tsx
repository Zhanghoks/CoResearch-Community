"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "首页" },
  { href: "/#product-guide", label: "产品" },
  { href: "/docs", label: "文档" },
];

export function SiteHeader() {
  const [glass, setGlass] = useState(false);

  useEffect(() => {
    const update = () => {
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
        <Link
          href="/#community"
          className="order-2 inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-[#262626] px-4 py-2 text-sm font-medium text-white hover:bg-[#41413b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#262626] md:order-3"
        >
          Contact Us
        </Link>
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
