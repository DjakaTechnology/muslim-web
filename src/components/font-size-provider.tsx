"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type FontSize, loadFontSize, getFontSizeConfig } from "~/lib/font-size-store";
import { loadShowVerseNumbers } from "~/lib/reading-preferences-store";

const FontSizeContext = createContext<{
  fontSize: FontSize;
  arabicClass: string;
  latinClass: string;
  showVerseNumbers: boolean;
}>({
  fontSize: "medium",
  arabicClass: "text-2xl sm:text-3xl",
  latinClass: "text-sm",
  showVerseNumbers: false,
});

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [showVerseNumbers, setShowVerseNumbers] = useState<boolean>(false);

  useEffect(() => {
    setFontSize(loadFontSize());
    setShowVerseNumbers(loadShowVerseNumbers());

    const fontSizeHandler = (e: Event) => {
      setFontSize((e as CustomEvent<FontSize>).detail);
    };
    const verseNumbersHandler = (e: Event) => {
      setShowVerseNumbers((e as CustomEvent<boolean>).detail);
    };

    window.addEventListener("font-size-change", fontSizeHandler);
    window.addEventListener("show-verse-numbers-change", verseNumbersHandler);
    return () => {
      window.removeEventListener("font-size-change", fontSizeHandler);
      window.removeEventListener("show-verse-numbers-change", verseNumbersHandler);
    };
  }, []);

  const config = getFontSizeConfig(fontSize);

  return (
    <FontSizeContext.Provider
      value={{
        fontSize,
        arabicClass: config.arabic,
        latinClass: config.latin,
        showVerseNumbers,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
