import { docs } from "../../content";

export function ProductDocs() {
  return (
    <section aria-labelledby="product-docs-title" className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8">
      <h2 id="product-docs-title" className="text-2xl font-semibold tracking-tight">设计文档</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {docs.map((doc) => (
          <a key={doc.title} href={doc.href} className="flex flex-col rounded-[24px] bg-white p-7 ring-1 ring-black/8 transition hover:ring-black/20">
            <h3 className="text-lg font-semibold">{doc.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-7 text-[#3f413c]">{doc.body}</p>
            <span className="mt-5 text-sm font-medium">阅读文档 →</span>
          </a>
        ))}
      </div>
    </section>
  );
}
