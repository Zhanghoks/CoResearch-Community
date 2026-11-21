import type { PauseReason, PauseSource, SceneScript, WorldState } from "./domain";
import type { DemoTimeline } from "./events";
import type { ResearchWorld } from "./domain";
import { stateAt } from "./evaluate";

export interface PlayerMeta {
  readonly t: number;
  readonly generation: number;
  readonly playing: boolean;
  readonly pauseReasons: readonly PauseReason[];
  readonly sceneId: string | null;
  readonly atCheckpoint: boolean;
  readonly ended: boolean;
}

export interface DemoPlayerOptions {
  readonly world: ResearchWorld;
  readonly timeline: DemoTimeline;
  readonly scenes: readonly SceneScript[];
  readonly now?: () => number;
  readonly maxDeltaMs?: number;
  readonly onTime?: (t: number, state: WorldState, meta: PlayerMeta) => void;
}

const CONTROL_SOURCES: ReadonlySet<PauseSource> = new Set(["player-control", "script"]);

/** Auto-pause only for real content interaction, content focus, named hover, or visibility. */
export function shouldAutoPause(source: PauseSource): boolean {
  if (CONTROL_SOURCES.has(source)) return false;
  return source === "content-pointer" || source === "content-focus" || source === "content-hover" || source === "visibility" || source === "offscreen";
}

export function createDemoPlayer(options: DemoPlayerOptions) {
  const maxDeltaMs = options.maxDeltaMs ?? 50;
  const now = options.now ?? (() => (typeof performance !== "undefined" ? performance.now() : Date.now()));
  const durationMs = options.timeline.durationMs;
  const lastScene = options.scenes[options.scenes.length - 1];

  let t = 0;
  let generation = 0;
  let playing = false;
  const pauseReasons = new Set<PauseReason>();
  let lastTick: number | null = null;
  let raf = 0;

  const sceneAt = (time: number): SceneScript | undefined => {
    let current = options.scenes[0];
    for (const scene of options.scenes) {
      if (time >= scene.startMs) current = scene;
    }
    return current;
  };

  const meta = (): PlayerMeta => {
    const scene = sceneAt(t);
    return {
      t,
      generation,
      playing: playing && pauseReasons.size === 0,
      pauseReasons: [...pauseReasons],
      sceneId: scene?.sceneId ?? null,
      atCheckpoint: scene ? t === scene.checkpointMs : false,
      ended: t >= durationMs || (Boolean(lastScene) && t >= lastScene.checkpointMs && t >= durationMs - 1 ? t >= lastScene.checkpointMs && !playing && pauseReasons.has("ended") : t >= durationMs),
    };
  };

  const emit = () => {
    const state = stateAt(options.world, options.timeline, t);
    options.onTime?.(t, state, meta());
  };

  const canRun = () => playing && pauseReasons.size === 0;

  const stopLoop = () => {
    if (raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(raf);
    raf = 0;
    lastTick = null;
  };

  const loop = (stamp: number) => {
    raf = 0;
    const currentGeneration = generation;
    if (!canRun()) {
      lastTick = null;
      return;
    }
    if (currentGeneration !== generation) return;
    const dt = lastTick === null ? 0 : Math.min(stamp - lastTick, maxDeltaMs);
    lastTick = stamp;
    if (dt > 0) {
      t = Math.min(durationMs, t + dt);
      if (t >= durationMs) {
        t = durationMs;
        playing = false;
        pauseReasons.add("ended");
        lastTick = null;
        emit();
        return;
      }
      emit();
    }
    if (canRun() && typeof requestAnimationFrame === "function") {
      raf = requestAnimationFrame(loop);
    }
  };

  const startLoop = () => {
    if (!canRun()) return;
    lastTick = null;
    if (typeof requestAnimationFrame === "function") {
      if (!raf) raf = requestAnimationFrame(loop);
    }
  };

  const invalidate = () => {
    generation += 1;
    lastTick = null;
  };

  return {
    getTime: () => t,
    getGeneration: () => generation,
    getMeta: meta,
    getState: () => stateAt(options.world, options.timeline, t),
    isPlaying: () => canRun(),
    pauseReasons: () => [...pauseReasons],

    /** Advance with an injected timestamp; used by tests and by the animation loop. */
    tick(stamp: number) {
      if (!canRun()) {
        lastTick = null;
        return meta();
      }
      const dt = lastTick === null ? 0 : Math.min(stamp - lastTick, maxDeltaMs);
      lastTick = stamp;
      if (dt > 0) {
        t = Math.min(durationMs, t + dt);
        if (t >= durationMs) {
          t = durationMs;
          playing = false;
          pauseReasons.add("ended");
          lastTick = null;
        }
        emit();
      }
      return meta();
    },

    play() {
      this.resume();
    },

    /** Explicit continue clears the user pause reason; hidden/offscreen stay until their own clear. */
    resume() {
      pauseReasons.delete("user");
      pauseReasons.delete("ended");
      if (t >= durationMs) return meta();
      playing = true;
      lastTick = null;
      startLoop();
      emit();
      return meta();
    },

    pause(reason: PauseReason = "user") {
      pauseReasons.add(reason);
      if (reason === "user" || reason === "ended") playing = reason === "ended" ? false : playing;
      if (reason === "user") playing = false;
      stopLoop();
      emit();
      return meta();
    },

    seek(ms: number) {
      invalidate();
      t = Math.max(0, Math.min(durationMs, ms));
      if (t < durationMs) pauseReasons.delete("ended");
      emit();
      return meta();
    },

    /** Jump to the scene's readable checkpoint; continue starts from that same timestamp. */
    seekToScene(sceneId: string) {
      const scene = options.scenes.find((item) => item.sceneId === sceneId);
      if (!scene) throw new Error(`Unknown scene: ${sceneId}`);
      return this.seek(scene.checkpointMs);
    },

    /** Replay the scene's actions from its start. */
    restartScene(sceneId: string) {
      const scene = options.scenes.find((item) => item.sceneId === sceneId);
      if (!scene) throw new Error(`Unknown scene: ${sceneId}`);
      return this.seek(scene.startMs);
    },

    restart() {
      pauseReasons.delete("ended");
      this.seek(0);
      return this.resume();
    },

    notifyHidden() {
      if (!shouldAutoPause("visibility")) return meta();
      pauseReasons.add("hidden");
      stopLoop();
      emit();
      return meta();
    },

    notifyVisible() {
      pauseReasons.delete("hidden");
      lastTick = null;
      if (canRun()) startLoop();
      emit();
      return meta();
    },

    notifyOffscreen() {
      if (!shouldAutoPause("offscreen")) return meta();
      pauseReasons.add("offscreen");
      stopLoop();
      emit();
      return meta();
    },

    notifyOnscreen() {
      pauseReasons.delete("offscreen");
      lastTick = null;
      if (canRun()) startLoop();
      emit();
      return meta();
    },

    notifyContentHover(hovering: boolean) {
      if (hovering) {
        if (!shouldAutoPause("content-hover")) return meta();
        pauseReasons.add("content-hover");
        stopLoop();
      } else {
        pauseReasons.delete("content-hover");
        lastTick = null;
        if (canRun()) startLoop();
      }
      emit();
      return meta();
    },

    notifyContentFocus(focused: boolean) {
      if (focused) {
        if (!shouldAutoPause("content-focus")) return meta();
        pauseReasons.add("content-focus");
        stopLoop();
      } else {
        pauseReasons.delete("content-focus");
        lastTick = null;
        if (canRun()) startLoop();
      }
      emit();
      return meta();
    },

    /** Player chrome (play, pause, seek, replay) and scripted cursors never become user pauses. */
    notifyControlOrScript(_kind?: string) {
      void _kind;
      return meta();
    },

    now,
    emit,
    startLoop,
    stopLoop,
    dispose() {
      invalidate();
      stopLoop();
      playing = false;
    },
  };
}

export type DemoPlayer = ReturnType<typeof createDemoPlayer>;
