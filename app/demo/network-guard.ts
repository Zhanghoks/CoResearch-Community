/**
 * Assert that demo playback never issues a real research, model, or retrieval request.
 * The Community site is a static export and the mock port is local-only; this guard
 * records any accidental fetch / WebSocket usage during tests or the proof slice.
 */

export type NetworkCall = { readonly kind: "fetch" | "websocket"; readonly input: string };

export interface NetworkGuard {
  readonly calls: NetworkCall[];
  restore(): void;
}

export function installNetworkGuard(target: { fetch?: typeof fetch; WebSocket?: typeof WebSocket } = globalThis): NetworkGuard {
  const calls: NetworkCall[] = [];
  const originalFetch = target.fetch;
  const originalWebSocket = target.WebSocket;

  if (typeof originalFetch === "function") {
    target.fetch = ((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      calls.push({ kind: "fetch", input: url });
      return Promise.reject(new Error(`Blocked unexpected network request: ${url}`));
    }) as typeof fetch;
  }

  if (originalWebSocket) {
    target.WebSocket = class BlockedWebSocket {
      constructor(url: string | URL) {
        const href = typeof url === "string" ? url : url.toString();
        calls.push({ kind: "websocket", input: href });
        throw new Error(`Blocked unexpected WebSocket: ${href}`);
      }
    } as unknown as typeof WebSocket;
  }

  return {
    calls,
    restore() {
      if (originalFetch) target.fetch = originalFetch;
      if (originalWebSocket) target.WebSocket = originalWebSocket;
    },
  };
}

const RESEARCH_WRITE_HINT = /\/(research|explore|retrieval|model|openai|anthropic|embeddings)/i;

export function assertNoResearchNetwork(calls: readonly NetworkCall[]): void {
  const research = calls.filter((call) => RESEARCH_WRITE_HINT.test(call.input));
  if (research.length > 0) {
    throw new Error(`Unexpected research network traffic: ${research.map((call) => call.input).join(", ")}`);
  }
  if (calls.length > 0) {
    throw new Error(`Unexpected network traffic during offline demo: ${calls.map((call) => call.input).join(", ")}`);
  }
}
