"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "~/lib/utils";

const themes = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => (
          <div
            key={t.value}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4"
          >
            <t.icon className="size-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((t) => {
        const isActive = theme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50",
            )}
          >
            <t.icon className="size-6" />
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycle = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  if (!mounted) {
    return (
      <button className="rounded-lg p-2 text-muted-foreground">
        <Sun className="size-5" />
      </button>
    );
  }

  return (
    <button
      onClick={cycle}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      {theme === "dark" ? (
        <Moon className="size-5" />
      ) : theme === "light" ? (
        <Sun className="size-5" />
      ) : (
        <Monitor className="size-5" />
      )}
    </button>
  );
}
