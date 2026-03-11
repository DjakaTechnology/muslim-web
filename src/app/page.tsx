import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Islamic star ornament */}
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <svg
            viewBox="0 0 24 24"
            className="size-10 text-primary"
            fill="currentColor"
          >
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Muslim Pro
          </h1>
          <p className="mt-2 text-muted-foreground">
            Al-Quran, Jadwal Sholat & Kiblat
          </p>
        </div>

        <div className="grid w-full max-w-sm gap-3">
          <Link
            href="/quran"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="size-6 text-primary"
              >
                <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="text-left">
              <h2 className="font-semibold">Al-Quran</h2>
              <p className="text-sm text-muted-foreground">
                Baca dengan tajweed & terjemahan
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 opacity-50">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="size-6 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h2 className="font-semibold">Jadwal Sholat</h2>
              <p className="text-sm text-muted-foreground">Segera hadir</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 opacity-50">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="size-6 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h2 className="font-semibold">Kompas Kiblat</h2>
              <p className="text-sm text-muted-foreground">Segera hadir</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
