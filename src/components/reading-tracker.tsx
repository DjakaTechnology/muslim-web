"use client";

import { useEffect, useRef, useCallback } from "react";
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

  const save = useCallback(() => {
    const ayah = getCurrentAyah();
    void saveReadingState(surahId, window.scrollY, ayah);
  }, [surahId]);

  useEffect(() => {
    // Restore scroll position on mount
    void getReadingState(surahId).then((state) => {
      if (state && !savedRef.current) {
        window.scrollTo(0, state.lastScrollY);
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

  return null;
}
