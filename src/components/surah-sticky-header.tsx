"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SurahStickyHeader({
  surahName,
  surahId,
  totalAyahs,
}: {
  surahName: string;
  surahId: number;
  totalAyahs: number;
}) {
  const [currentAyah, setCurrentAyah] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show header after scrolling past 100px
      setVisible(window.scrollY > 100);

      // Calculate scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));

      // Find current ayah
      const ayahElements = document.querySelectorAll<HTMLElement>("[id^='ayah-']");
      let current = 1;
      for (const el of ayahElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 80) {
          current = parseInt(el.id.replace("ayah-", ""), 10);
        } else {
          break;
        }
      }
      setCurrentAyah(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-2xl border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Back button */}
          <Link
            href="/quran"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          {/* Surah info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{surahName}</p>
            <p className="text-xs text-muted-foreground">
              Ayah {currentAyah} / {totalAyahs}
            </p>
          </div>

          {/* Ayah counter badge */}
          <div className="flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {Math.round(scrollProgress)}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-border">
          <div
            className="h-full bg-primary transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
