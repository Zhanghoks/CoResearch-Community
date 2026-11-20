import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export function transpileModuleGraph({ ts, root, entries, tmp }) {
  const queue = [...entries];
  const seen = new Set();
  while (queue.length) {
    const rel = queue.pop().replaceAll("\\", "/");
    if (seen.has(rel)) continue;
    seen.add(rel);
    const src = path.join(root, rel);
    const text = fs.readFileSync(src, "utf8");
    for (const match of text.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
      const resolved = resolveImport(root, path.dirname(rel), match[1]);
      if (resolved) queue.push(resolved);
    }
    const result = ts.transpileModule(text, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        strict: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: src,
      reportDiagnostics: true,
    });
    const errors = (result.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, `${rel} syntax: ${errors.map((diagnostic) => diagnostic.messageText).join("; ")}`);
    const out = path.join(tmp, rel.replace(/\.tsx?$/, ".js"));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, result.outputText);
  }
  return seen;
}

function resolveImport(root, fromDir, specifier) {
  const base = path.normalize(path.join(fromDir, specifier));
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(root, candidate)) && fs.statSync(path.join(root, candidate)).isFile()) {
      return candidate.replaceAll("\\", "/");
    }
  }
  throw new Error(`Cannot resolve ${specifier} from ${fromDir}`);
}
