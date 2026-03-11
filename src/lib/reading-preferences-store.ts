"use client";

const SHOW_VERSE_NUMBERS_KEY = "muslim-pro-show-verse-numbers";

export function loadShowVerseNumbers(): boolean {
  if (typeof window === "undefined") return false;
  return (localStorage.getItem(SHOW_VERSE_NUMBERS_KEY) ?? "false") === "true";
}

export function saveShowVerseNumbers(show: boolean) {
  localStorage.setItem(SHOW_VERSE_NUMBERS_KEY, String(show));
  window.dispatchEvent(new CustomEvent("show-verse-numbers-change", { detail: show }));
}
