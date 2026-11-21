"use client";

import { useState, type KeyboardEvent } from "react";
import { steps } from "../content";

export function Workflow() {
  const [active, setActive] = useState(0);
  const current = steps[active];
  const panelId = "workflow-panel";

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = steps.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    const button = event.currentTarget.querySelector<HTMLButtonElement>(`#workflow-tab-${steps[next].id}`);
    button?.focus();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
      <div
        className="flex flex-col"
        role="tablist"
        aria-label="研究步骤"
        aria-orientation="vertical"
        onKeyDown={onTabKeyDown}
      >
        {steps.map((step, index) => {
          const selected = index === active;
          return (
            <button
              key={step.id}
              id={`workflow-tab-${step.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className={`border-t border-black/10 py-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#262626] ${
                selected ? "text-[#262626]" : "text-[#8a8c84] hover:text-[#262626]"
              }`}
            >
              <span className="mb-1 block text-xs tracking-[0.16em]">{step.index}</span>
              <span className="block text-2xl font-semibold tracking-tight">{step.title}</span>
              <span className="mt-1 block text-sm">{step.summary}</span>
            </button>
          );
        })}
      </div>
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`workflow-tab-${current.id}`}
        className="flex min-h-[320px] flex-col justify-between rounded-[28px] bg-white p-8 shadow-[0_20px_60px_rgba(38,38,38,0.06)] md:p-12"
      >
        <div>
          <p className="text-sm font-medium text-[#6d7a3a]">{current.index}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {current.title}
          </h3>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#3f413c]">{current.body}</p>
        </div>
        <p className="mt-10 text-sm text-[#6b6d66]">
          这些步骤可以反复进行。更换方向、补充证据或重新审视方法，都是研究过程的一部分。
        </p>
      </div>
    </div>
  );
}
