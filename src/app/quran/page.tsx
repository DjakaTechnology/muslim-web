import Link from "next/link";
import { fetchSurahList } from "~/lib/quran-api";
import { Badge } from "~/components/ui/badge";
import { ContinueReading, LastReadBadge } from "~/components/continue-reading";

export const revalidate = 86400; // revalidate daily

export default async function QuranPage() {
  const surahs = await fetchSurahList();

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Al-Quran</h1>
        <p className="text-sm text-muted-foreground">
          114 Surah — Baca dengan tajweed & terjemahan
        </p>
      </header>

      <ContinueReading
        surahs={surahs.map((s) => ({ id: s.id, name_simple: s.name_simple }))}
      />

      <div className="flex flex-col gap-2">
        {surahs.map((surah) => (
          <Link key={surah.id} href={`/quran/${surah.id}`}>
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary active:bg-secondary">
              {/* Surah number */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                {surah.id}
              </div>

              {/* Surah info */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {surah.name_simple}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {surah.revelation_place === "makkah"
                      ? "Mekah"
                      : "Madinah"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {surah.translated_name.name} — {surah.verses_count} Ayat
                  </span>
                  <LastReadBadge surahId={surah.id} />
                </div>
              </div>

              {/* Arabic name */}
              <span className="shrink-0 font-quran text-xl text-primary">
                {surah.name_arabic}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
