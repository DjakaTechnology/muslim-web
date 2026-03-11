"use client";

import { useEffect, useState } from "react";
import { type FontSize, loadFontSize, saveFontSize, getAllFontSizes } from "~/lib/font-size-store";

export function FontSizeSelector() {
  const [current, setCurrent] = useState<FontSize>("medium");
  const sizes = getAllFontSizes();

  useEffect(() => {
    setCurrent(loadFontSize());
  }, []);

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {sizes.map((s) => (
        <button
          key={s.key}
          onClick={() => {
            setCurrent(s.key);
            saveFontSize(s.key);
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary"
        >
          <span className="flex-1 text-sm font-medium">{s.label}</span>
          {/* Preview */}
          <span className="font-quran text-muted-foreground" style={{ fontSize: s.key === "small" ? 16 : s.key === "medium" ? 20 : s.key === "large" ? 24 : 28 }} dir="rtl">
            بِسْمِ
          </span>
          {/* Check */}
          {current === s.key && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 text-primary">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
