const BASE_URL = "https://api.quran.com/api/v4";

// --- Types (matching quran.com API v4 snake_case) ---

export interface Surah {
  id: number;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani_tajweed: string;
}

export interface TranslationItem {
  resource_id: number;
  text: string;
}

export interface AyahData {
  verseNumber: number;
  verseKey: string;
  textUthmaniTajweed: string;
  transliteration: string;
  translation: string;
}

// --- API Fetchers ---

export async function fetchSurahList(): Promise<Surah[]> {
  const res = await fetch(`${BASE_URL}/chapters?language=id`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch surah list: ${res.status}`);
  const data = (await res.json()) as { chapters: Surah[] };
  return data.chapters;
}

export async function fetchSurahDetail(id: number): Promise<Surah> {
  const res = await fetch(`${BASE_URL}/chapters/${id}?language=id`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch surah ${id}: ${res.status}`);
  const data = (await res.json()) as { chapter: Surah };
  return data.chapter;
}

async function fetchVersesTajweed(chapterNumber: number): Promise<Verse[]> {
  const res = await fetch(
    `${BASE_URL}/quran/verses/uthmani_tajweed?chapter_number=${chapterNumber}`,
    { next: { revalidate: 86400 } },
  );
  if (!res.ok)
    throw new Error(`Failed to fetch tajweed for surah ${chapterNumber}`);
  const data = (await res.json()) as { verses: Verse[] };
  return data.verses;
}

async function fetchTranslation(
  chapterNumber: number,
  resourceId = 33,
): Promise<TranslationItem[]> {
  const res = await fetch(
    `${BASE_URL}/quran/translations/${resourceId}?chapter_number=${chapterNumber}`,
    { next: { revalidate: 86400 } },
  );
  if (!res.ok)
    throw new Error(
      `Failed to fetch translation for surah ${chapterNumber}`,
    );
  const data = (await res.json()) as { translations: TranslationItem[] };
  return data.translations;
}

async function fetchTransliteration(
  chapterNumber: number,
): Promise<TranslationItem[]> {
  const res = await fetch(
    `${BASE_URL}/quran/translations/57?chapter_number=${chapterNumber}`,
    { next: { revalidate: 86400 } },
  );
  if (!res.ok)
    throw new Error(
      `Failed to fetch transliteration for surah ${chapterNumber}`,
    );
  const data = (await res.json()) as { translations: TranslationItem[] };
  return data.translations;
}

export async function fetchSurahAyahs(
  chapterNumber: number,
): Promise<AyahData[]> {
  const [verses, translations, transliterations] = await Promise.all([
    fetchVersesTajweed(chapterNumber),
    fetchTranslation(chapterNumber),
    fetchTransliteration(chapterNumber),
  ]);

  return verses.map((verse, i) => {
    const verseKey = verse.verse_key;
    const verseNumber = parseInt(verseKey.split(":")[1] ?? "0", 10);

    return {
      verseNumber,
      verseKey,
      textUthmaniTajweed: verse.text_uthmani_tajweed,
      transliteration: transliterations[i]?.text ?? "",
      translation: translations[i]?.text ?? "",
    };
  });
}
