"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { saveReadingState, getReadingState } from "~/lib/reading-store";

function getCurrentAyah(): number {
  const ayahElements = document.querySelectorAll<HTMLElement>("[id^='ayah-']");
  let current = 1;
  for (const el of ayahElements) {
    const rect = el.getBoundingClientRect();
    if (rect.top <= 150) {
      current = parseInt(el.id.replace("ayah-", ""), 10);
    } else {
      break;
    }
  }
  return current;
}

export function ReadingTracker({ surahId }: { surahId: number }) {
  const savedRef = useRef(false);
  const [lastAyah, setLastAyah] = useState<number | null>(null);

  const save = useCallback(() => {
    const ayah = getCurrentAyah();
    void saveReadingState(surahId, window.scrollY, ayah);
  }, [surahId]);

  useEffect(() => {
    // Restore scroll position and highlight last read ayah
    void getReadingState(surahId).then((state) => {
      if (state && !savedRef.current) {
        setLastAyah(state.lastAyah);
        // Scroll to last ayah element instead of raw scrollY for reliability
        const el = document.getElementById(`ayah-${state.lastAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: "instant", block: "center" });
        } else {
          window.scrollTo(0, state.lastScrollY);
        }
        // Clear highlight after 3 seconds
        setTimeout(() => setLastAyah(null), 3000);
      }
    });

    // Debounced scroll handler
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      savedRef.current = true;
      clearTimeout(timer);
      timer = setTimeout(save, 500);
    };

    // Save on page leave
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") save();
    };
    const onBeforeUnload = () => save();

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [surahId, save]);

  // Inject highlight styles for last-read ayah
  useEffect(() => {
    if (lastAyah === null) {
      document.querySelectorAll("[data-last-read]").forEach((el) => {
        el.removeAttribute("data-last-read");
      });
      return;
    }
    const el = document.getElementById(`ayah-${lastAyah}`);
    if (el) {
      el.setAttribute("data-last-read", "true");
    }
  }, [lastAyah]);

  return null;
}
