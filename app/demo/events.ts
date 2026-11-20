import type { PaperAvailability } from "./domain";

/**
 * Deterministic demo events. Each event has an absolute timestamp in milliseconds.
 * Events are the only source of data-state changes; camera and captions must not
 * invent papers, evidence, or research conclusions.
 */
export type DemoEvent =
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "prepare_task";
      readonly task: "explore";
      readonly prompt: string;
      readonly parentDirectionId?: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "send_task";
      readonly taskId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "task_progress";
      readonly taskId: string;
      readonly label: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "task_complete";
      readonly taskId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "direction_group_arrived";
      readonly groupId: string;
      readonly taskId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "select_direction";
      readonly directionId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "discover_paper";
      readonly paperId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "browse_abstract";
      readonly paperId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "read_full_text";
      readonly paperId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "open_paper";
      readonly paperId: string;
      readonly level: "abstract" | "full-text" | "metadata-only";
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "form_evidence";
      readonly evidenceId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "set_coverage";
      readonly recordId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "revise_coverage";
      readonly recordId: string;
      readonly previousRecordId: string;
      readonly reason: string;
      readonly counterexampleId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "form_open_question";
      readonly questionId: string;
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "select_question";
      readonly questionId: string;
      readonly status: "selected-for-investigation";
    }
  | {
      readonly id: string;
      readonly t: number;
      readonly type: "add_context";
      readonly directionId: string;
    };

export interface DemoTimeline {
  readonly events: readonly DemoEvent[];
  readonly durationMs: number;
}

export function sortEvents(events: readonly DemoEvent[]): DemoEvent[] {
  return [...events].sort((a, b) => (a.t - b.t) || a.id.localeCompare(b.id));
}

export function eventsAtOrBefore(events: readonly DemoEvent[], t: number): DemoEvent[] {
  return events.filter((event) => event.t <= t);
}

export function isPaperAvailability(value: string): value is PaperAvailability {
  return value === "full-text" || value === "metadata-only" || value === "unavailable";
}
