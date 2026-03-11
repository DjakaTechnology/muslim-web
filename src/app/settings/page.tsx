"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Languages, Type, Bell, Info } from "lucide-react";
import { ThemeToggle } from "~/components/theme-toggle";

export default function SettingsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      <div className="space-y-6 p-4">
        {/* Theme Section */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Appearance
          </h2>
          <ThemeToggle />
        </section>

        {/* Placeholder Sections */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Quran
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            <SettingsRow
              icon={<Type className="size-5" />}
              label="Font Size"
              value="Medium"
            />
            <SettingsRow
              icon={<Languages className="size-5" />}
              label="Translation"
              value="Indonesian"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Notifications
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            <SettingsRow
              icon={<Bell className="size-5" />}
              label="Prayer Reminders"
              value="Off"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            About
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            <SettingsRow
              icon={<Info className="size-5" />}
              label="Version"
              value="0.1.0"
              showArrow={false}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  showArrow = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  showArrow?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
      {showArrow && <ChevronRight className="size-4 text-muted-foreground/50" />}
    </div>
  );
}
