"use client";

import { useFontSize } from "~/components/font-size-provider";

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

interface AyahData {
  verseNumber: number;
  verseKey: string;
  textUthmaniTajweed: string;
  transliteration: string;
  translation: string;
}

function AyahCard({ ayah, arabicClass, latinClass, showVerseNumbers }: { ayah: AyahData; arabicClass: string; latinClass: string; showVerseNumbers: boolean }) {
  return (
    <div
      id={`ayah-${ayah.verseNumber}`}
      className={`group rounded-xl px-2 py-5 transition-colors duration-700 ring-2 ring-transparent data-[last-read=true]:bg-primary/10 data-[last-read=true]:ring-primary/30 ${
        showVerseNumbers ? "show-verse-numbers" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {ayah.verseNumber}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <p
            className={`text-right font-quran leading-[2.2] ${arabicClass}`}
            dir="rtl"
            dangerouslySetInnerHTML={{
              __html: ayah.textUthmaniTajweed,
            }}
          />

          <p className={`leading-relaxed text-primary/80 italic ${latinClass}`}>
            {stripHtmlTags(ayah.transliteration)}
          </p>

          <p
            className={`leading-relaxed text-muted-foreground ${latinClass}`}
            dangerouslySetInnerHTML={{
              __html: ayah.translation,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function AyahList({ ayahs }: { ayahs: AyahData[] }) {
  const { arabicClass, latinClass, showVerseNumbers } = useFontSize();

  return (
    <div className="divide-y divide-border">
      {ayahs.map((ayah) => (
        <AyahCard key={ayah.verseKey} ayah={ayah} arabicClass={arabicClass} latinClass={latinClass} showVerseNumbers={showVerseNumbers} />
      ))}
    </div>
  );
}
