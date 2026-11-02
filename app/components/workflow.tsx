"use client";

import { useState } from "react";
import { steps } from "../content";

export function Workflow() {
  const [active, setActive] = useState(0);
  const current = steps[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col" role="tablist" aria-label="研究步骤">
        {steps.map((step, index) => {
          const selected = index === active;
          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(index)}
              className={`border-t border-black/10 py-5 text-left transition ${
                selected ? "text-[#262626]" : "text-[#8a8c84] hover:text-[#262626]"
              }`}
            >
              <span className="mb-1 block text-xs tracking-[0.16em]">{step.index}</span>
              <span className="block text-2xl font-semibold tracking-tight">{step.title}</span>
              <span className="mt-1 block text-sm">{step.summary}</span>
              {step.status ? (
                <span className="mt-1 block text-xs font-medium text-[#6d7a3a]">{step.status}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        className="flex min-h-[320px] flex-col justify-between rounded-[28px] bg-white p-8 shadow-[0_20px_60px_rgba(38,38,38,0.06)] md:p-12"
      >
        <div>
          <p className="text-sm font-medium text-[#6d7a3a]">{current.index}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {current.title}
          </h3>
          {current.status ? (
            <p className="mt-4 text-sm font-medium text-[#6d7a3a]">{current.status}</p>
          ) : null}
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#3f413c]">{current.body}</p>
        </div>
        <p className="mt-10 text-sm text-[#6b6d66]">
          这些步骤可以反复进行。更换方向、补充证据或重新审视方法，都是研究过程的一部分。
        </p>
      </div>
    </div>
  );
}
