/**
 * Demo-only PreviewResourcePort-shaped adapter.
 * Field names follow the Core PreviewResourcePort / ResolvedPreviewResource
 * contract at LLM-Cube/CoResearch develop@a52c718, but this module is a local
 * reconstruction for Community playback. It does not import, copy, or ship
 * private UI components or Host networking.
 */
import type { Paper, ResearchWorld } from "../domain";

export interface PreviewResourceRef {
  scope: string;
  kind: string;
  id: string;
  revision: { mode: "latest" } | { mode: "pinned"; versionId: string };
  anchor?: string;
}

export interface PreviewResourceSummary {
  ref: PreviewResourceRef;
  title: string;
  updatedAt?: string;
  versionId?: string;
}

export interface ResolvedPreviewResource {
  ref: PreviewResourceRef;
  versionId: string;
  schema: { kind: string; version: number };
  title: string;
  content: unknown;
  integrity?: Readonly<Record<string, unknown>>;
  capabilities: readonly string[];
}

export interface PreviewCatalogQuery {
  scope: string;
  conversationId?: string;
  scopeMode?: "research_scope" | "conversation";
  query?: string;
  kind?: string;
  actionId?: string;
  cursor?: string;
  paperOffset?: number;
  directoryKind?: "artifacts" | "papers";
  limit: number;
  signal: AbortSignal;
}

export interface PreviewResourcePort {
  list(query: PreviewCatalogQuery): Promise<{
    items: readonly PreviewResourceSummary[];
    nextCursor?: string;
    total?: number;
  }>;
  get(ref: PreviewResourceRef, signal: AbortSignal): Promise<ResolvedPreviewResource>;
  listVersions?(
    ref: PreviewResourceRef,
    signal: AbortSignal,
  ): Promise<readonly { versionId: string; sequence?: number; createdAt?: number }[]>;
  subscribe?(listener: (event: { type: "invalidated" | "access_revoked"; ref?: PreviewResourceRef }) => void): () => void;
}

export class DemoResourceError extends Error {
  constructor(
    message: string,
    readonly code: "cancelled" | "missing" | "unavailable" | "metadata-only",
  ) {
    super(message);
    this.name = "DemoResourceError";
  }
}

export interface MockPortOptions {
  readonly world: ResearchWorld;
  readonly missingIds?: readonly string[];
  readonly scope?: string;
}

export interface PaperResourceContent {
  readonly paperId: string;
  readonly cardVersion: string;
  readonly title: string;
  readonly authors: readonly string[];
  readonly demoTag: "演示文献";
  readonly synthetic: true;
  readonly availability: Paper["availability"];
  readonly abstract: string;
  readonly method: string | null;
  readonly conditionSection: string | null;
  readonly excerpts: Paper["excerpts"];
}

function paperContent(paper: Paper): PaperResourceContent {
  const readable = paper.availability === "full-text";
  return {
    paperId: paper.id,
    cardVersion: paper.cardVersion,
    title: paper.title,
    authors: paper.authors,
    demoTag: "演示文献",
    synthetic: true,
    availability: paper.availability,
    abstract: paper.abstract,
    method: readable ? paper.method : null,
    conditionSection: readable ? paper.conditionSection : null,
    excerpts: readable ? paper.excerpts : [],
  };
}

function versionIdOf(paper: Paper): string {
  return paper.cardVersion;
}

function refFor(paper: Paper, scope: string): PreviewResourceRef {
  return {
    scope,
    kind: "paper",
    id: paper.id,
    revision: { mode: "pinned", versionId: versionIdOf(paper) },
  };
}

function assertNotAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new DemoResourceError("Request cancelled", "cancelled");
}

/**
 * Local table port. list/get only read the fixture; there is no Host, model, or retrieval call.
 * latest revisions are pinned to the fixture card version so the demo cannot drift.
 */
export function createMockPreviewPort(options: MockPortOptions): PreviewResourcePort {
  const scope = options.scope ?? "demo:video-identity";
  const missing = new Set(options.missingIds ?? []);
  const papers = new Map(options.world.papers.map((paper) => [paper.id, paper]));
  const listeners = new Set<(event: { type: "invalidated" | "access_revoked"; ref?: PreviewResourceRef }) => void>();

  const visiblePapers = () => options.world.papers.filter((paper) => !missing.has(paper.id));

  return {
    async list(query) {
      assertNotAborted(query.signal);
      const items = visiblePapers()
        .filter(() => !query.kind || query.kind === "paper")
        .filter((paper) => !query.query || paper.title.includes(query.query) || paper.id.includes(query.query))
        .slice(0, query.limit)
        .map((paper) => ({
          ref: refFor(paper, query.scope || scope),
          title: paper.title,
          versionId: versionIdOf(paper),
        }));
      return { items, total: items.length };
    },

    async get(ref, signal) {
      assertNotAborted(signal);
      if (missing.has(ref.id)) throw new DemoResourceError(`Resource ${ref.id} is missing`, "missing");
      const paper = papers.get(ref.id);
      if (!paper) throw new DemoResourceError(`Resource ${ref.id} is missing`, "missing");
      if (paper.availability === "unavailable") {
        throw new DemoResourceError(`Resource ${ref.id} is unavailable`, "unavailable");
      }
      const pinned = versionIdOf(paper);
      if (ref.revision.mode === "pinned" && ref.revision.versionId !== pinned) {
        throw new DemoResourceError(`Pinned version ${ref.revision.versionId} is missing for ${ref.id}`, "missing");
      }
      const content = paperContent(paper);
      if (paper.availability === "metadata-only" && (content.excerpts.length > 0 || content.method)) {
        throw new DemoResourceError("metadata-only resources must not invent excerpts", "metadata-only");
      }
      return {
        ref: { ...ref, revision: { mode: "pinned", versionId: pinned } },
        versionId: pinned,
        schema: { kind: "paper-demo", version: 1 },
        title: paper.title,
        content,
        capabilities: paper.availability === "full-text" ? ["read-full-text", "read-abstract"] : ["read-abstract"],
      };
    },

    async listVersions(ref, signal) {
      assertNotAborted(signal);
      if (missing.has(ref.id) || !papers.has(ref.id)) {
        throw new DemoResourceError(`Resource ${ref.id} is missing`, "missing");
      }
      const paper = papers.get(ref.id)!;
      return [{ versionId: versionIdOf(paper), sequence: 1, createdAt: 0 }];
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Map a demo paper id into a Core-shaped resource ref. Scope stays a string at this layer. */
export function toPreviewRef(paperId: string, versionId: string, scope = "demo:video-identity"): PreviewResourceRef {
  return { scope, kind: "paper", id: paperId, revision: { mode: "pinned", versionId } };
}

export function isFullTextReadAllowed(resource: ResolvedPreviewResource): boolean {
  return resource.capabilities.includes("read-full-text");
}
