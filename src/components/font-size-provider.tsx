"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type FontSize, loadFontSize, getFontSizeConfig } from "~/lib/font-size-store";

const FontSizeContext = createContext<{
  fontSize: FontSize;
  arabicClass: string;
  latinClass: string;
}>({
  fontSize: "medium",
  arabicClass: "text-2xl sm:text-3xl",
  latinClass: "text-sm",
});

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  useEffect(() => {
    setFontSize(loadFontSize());

    const handler = (e: Event) => {
      setFontSize((e as CustomEvent<FontSize>).detail);
    };
    window.addEventListener("font-size-change", handler);
    return () => window.removeEventListener("font-size-change", handler);
  }, []);

  const config = getFontSizeConfig(fontSize);

  return (
    <FontSizeContext.Provider
      value={{
        fontSize,
        arabicClass: config.arabic,
        latinClass: config.latin,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
