import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-5 py-20">
      <p className="text-sm font-semibold tracking-widest text-[#465b45]">CORESEARCH / 404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">找不到这个页面</h1>
      <p className="mt-4 max-w-lg text-lg leading-8 text-[#3f413c]">
        链接可能已变更。你可以回到首页继续浏览产品演示。
      </p>
      <Link href="/" className="mt-6 inline-block font-semibold underline underline-offset-4">
        返回 CoResearch 首页
      </Link>
    </main>
  );
}
