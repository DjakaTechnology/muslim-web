import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchSurahDetail,
  fetchSurahAyahs,
  type AyahData,
} from "~/lib/quran-api";
import { ReadingTracker } from "~/components/reading-tracker";

export const revalidate = 86400;

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surah: String(i + 1),
  }));
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function stripAyahNumbers(html: string): string {
  // Remove all forms of ayah end markers:
  // 1. With ornate parentheses: ﴿١﴾ ﴿٢٣﴾
  // 2. With end-of-ayah sign: ۝١٢
  // 3. Bare Arabic-Indic digits at end of text: ٨٨
  // 4. Same patterns wrapped in HTML tags
  return html
    .replace(/<[^>]*>[\uFD3E\u06DD]?[\u0660-\u0669\u06F0-\u06F9]+[\uFD3F]?<\/[^>]*>/g, "")
    .replace(/\s*[\uFD3E\u06DD][\u0660-\u0669\u06F0-\u06F9]+[\uFD3F]?\s*/g, "")
    .replace(/\s+[\u0660-\u0669\u06F0-\u06F9]+\s*$/g, "")
    .replace(/\s+[\u0660-\u0669\u06F0-\u06F9]+(\s*<)/g, "$1");
}

function AyahCard({ ayah }: { ayah: AyahData }) {
  return (
    <div id={`ayah-${ayah.verseNumber}`} className="group py-5 transition-colors duration-700 data-[last-read=true]:rounded-xl data-[last-read=true]:bg-primary/10 data-[last-read=true]:ring-2 data-[last-read=true]:ring-primary/30 data-[last-read=true]:px-2">
      <div className="flex gap-3">
        {/* Ayah number badge */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {ayah.verseNumber}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {/* Arabic text with tajweed — RTL, large */}
          <p
            className="text-right font-quran text-2xl leading-[2.2] sm:text-3xl"
            dir="rtl"
            dangerouslySetInnerHTML={{
              __html: stripAyahNumbers(ayah.textUthmaniTajweed),
            }}
          />

          {/* Latin transliteration — green accent */}
          <p className="text-sm leading-relaxed text-primary/80 italic">
            {stripHtmlTags(ayah.transliteration)}
          </p>

          {/* Indonesian translation — muted */}
          <p
            className="text-sm leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: ayah.translation,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ surah: string }>;
}) {
  const { surah: surahParam } = await params;
  const surahId = parseInt(surahParam, 10);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound();
  }

  const [surah, ayahs] = await Promise.all([
    fetchSurahDetail(surahId),
    fetchSurahAyahs(surahId),
  ]);

  const prevSurah = surahId > 1 ? surahId - 1 : null;
  const nextSurah = surahId < 114 ? surahId + 1 : null;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-4">
      <ReadingTracker surahId={surahId} />

      {/* Back button */}
      <Link
        href="/quran"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-4"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
            clipRule="evenodd"
          />
        </svg>
        Daftar Surah
      </Link>

      {/* Ornamental surah header */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="px-5 py-6 text-center">
          {/* Decorative top border */}
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <span className="text-primary/60">
              ﷽
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>

          <h1 className="font-quran text-4xl text-primary">
            {surah.name_arabic}
          </h1>
          <h2 className="mt-2 text-lg font-semibold">
            {surah.name_simple}
          </h2>
          <p className="text-sm text-muted-foreground">
            {surah.translated_name.name}
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
              {surah.revelation_place === "makkah" ? "Mekah" : "Madinah"}
            </span>
            <span>{surah.verses_count} Ayat</span>
          </div>

          {/* Decorative bottom border */}
          <div className="mx-auto mt-4 flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <div className="size-1.5 rounded-full bg-primary/30" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
        </div>
      </div>

      {/* Bismillah — except surah 9 (At-Tawbah) and surah 1 (Al-Fatihah, it's ayah 1) */}
      {surahId !== 9 && surahId !== 1 && (
        <div className="mb-6 text-center">
          <p className="font-quran text-2xl text-foreground/80" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="divide-y divide-border">
        {ayahs.map((ayah) => (
          <AyahCard key={ayah.verseKey} ayah={ayah} />
        ))}
      </div>

      {/* Prev/Next surah navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {prevSurah ? (
          <Link
            href={`/quran/${prevSurah}`}
            className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            Surah {prevSurah}
          </Link>
        ) : (
          <div />
        )}
        {nextSurah ? (
          <Link
            href={`/quran/${nextSurah}`}
            className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Surah {nextSurah}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}
