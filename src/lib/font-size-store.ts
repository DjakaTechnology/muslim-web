"use client";

export type FontSize = "small" | "medium" | "large" | "xlarge";

const STORAGE_KEY = "muslim-pro-font-size";

const FONT_SIZE_MAP: Record<FontSize, { arabic: string; latin: string; label: string }> = {
  small: { arabic: "text-xl sm:text-2xl", latin: "text-xs", label: "Small" },
  medium: { arabic: "text-2xl sm:text-3xl", latin: "text-sm", label: "Medium" },
  large: { arabic: "text-3xl sm:text-4xl", latin: "text-base", label: "Large" },
  xlarge: { arabic: "text-4xl sm:text-5xl", latin: "text-lg", label: "Extra Large" },
};

export function getFontSizeConfig(size: FontSize) {
  return FONT_SIZE_MAP[size];
}

export function getAllFontSizes() {
  return Object.entries(FONT_SIZE_MAP).map(([key, val]) => ({
    key: key as FontSize,
    ...val,
  }));
}

export function loadFontSize(): FontSize {
  if (typeof window === "undefined") return "medium";
  return (localStorage.getItem(STORAGE_KEY) as FontSize) ?? "medium";
}

export function saveFontSize(size: FontSize) {
  localStorage.setItem(STORAGE_KEY, size);
  window.dispatchEvent(new CustomEvent("font-size-change", { detail: size }));
}
