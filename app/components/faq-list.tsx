"use client";

import { useState } from "react";
import { faqs } from "../content";

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-black/10">
      {faqs.map((item, index) => {
        const expanded = open === index;
        const buttonId = `faq-button-${index}`;
        const panelId = `faq-panel-${index}`;
        return (
          <div key={item.q} className="border-b border-black/10">
            <button
              type="button"
              id={buttonId}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpen(expanded ? null : index)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#262626]"
            >
              {item.q}
              <span className="text-2xl font-light leading-none text-[#6b6d66]" aria-hidden="true">
                {expanded ? "–" : "+"}
              </span>
            </button>
            {expanded ? (
              <p
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="max-w-3xl pb-6 text-base leading-7 text-[#3f413c]"
              >
                {item.a}
              </p>
            ) : (
              <div id={panelId} hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
