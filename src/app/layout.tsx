import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist, Amiri_Quran } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { BottomNav } from "~/components/bottom-nav";
import { FontSizeProvider } from "~/components/font-size-provider";

export const metadata: Metadata = {
  title: "Muslim Pro — Al-Quran, Jadwal Sholat, Kiblat",
  description:
    "Baca Al-Quran dengan tajweed, jadwal sholat, dan kompas kiblat. Gratis dan offline.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#166534" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-amiri-quran",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${geist.variable} ${amiriQuran.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen pb-16">
        <ThemeProvider>
          <TRPCReactProvider>
            <FontSizeProvider>
              {children}
              <BottomNav />
            </FontSizeProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
