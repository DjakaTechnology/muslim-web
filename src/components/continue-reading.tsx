"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLastRead, getAllReadingStates } from "~/lib/reading-store";

interface SurahMeta {
  id: number;
  name_simple: string;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return `${Math.floor(diffDays / 30)} bulan lalu`;
}

export function ContinueReading({ surahs }: { surahs: SurahMeta[] }) {
  const [lastRead, setLastRead] = useState<{
    surahId: number;
    lastAyah: number;
    surahName: string;
  } | null>(null);

  useEffect(() => {
    void getLastRead().then((state) => {
      if (state) {
        const surah = surahs.find((s) => s.id === state.surahId);
        setLastRead({
          surahId: state.surahId,
          lastAyah: state.lastAyah,
          surahName: surah?.name_simple ?? `Surah ${state.surahId}`,
        });
      }
    });
  }, [surahs]);

  if (!lastRead) return null;

  return (
    <Link href={`/quran/${lastRead.surahId}`}>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4 transition-colors active:bg-primary/15">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-primary">Lanjut Membaca</p>
          <p className="truncate text-sm font-semibold">
            {lastRead.surahName}
          </p>
          <p className="text-xs text-muted-foreground">
            Ayat {lastRead.lastAyah}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-5 shrink-0 text-primary"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </Link>
  );
}

export function LastReadBadge({
  surahId,
}: {
  surahId: number;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    void getAllReadingStates().then((states) => {
      const state = states.find((s) => s.surahId === surahId);
      if (state) {
        setLabel(timeAgo(new Date(state.lastReadAt)));
      }
    });
  }, [surahId]);

  if (!label) return null;

  return (
    <span className="text-[10px] text-primary/70">
      {label}
    </span>
  );
}
