# Muslim Pro — Design Document

## Overview

A modern Muslim web app built with the T3 stack (Next.js, tRPC, Prisma, Tailwind). Three core pillars:

1. **Al-Quran** — Read, search, bookmark
2. **Prayer Times** — Location-based salat schedule
3. **Qibla** — Compass using device gyroscope + location

---

## Pillar 1: Al-Quran

### Data Strategy

- **Source:** [quran.com API v4](https://api.quran.com/api/v4) — fetched at build time only
- **Content:** 114 surahs, 6,236 ayahs
- **Translations:** Indonesian (primary), English (secondary)
- **Arabic script:** Uthmanic text
- **No Quran data in DB** — all surah/ayah content is statically generated at build time via `generateStaticParams`
- **DB is for user data only** — bookmarks, reading history, auth

### Build-Time Flow

```
Build → fetch 114 surahs from quran.com API
     → generateStaticParams pre-renders all /quran/[surah] pages
     → static HTML with Arabic text baked in
     → zero runtime API dependency
```

### Database Schema (user data only)

```
Bookmark
├── id              Int (auto)
├── userId          String (FK → User, via NextAuth)
├── surahId         Int
├── ayahNumber      Int
├── label           String? (e.g. "Last read")
├── createdAt       DateTime
└── updatedAt       DateTime

ReadingHistory
├── id              Int (auto)
├── userId          String (FK → User, via NextAuth)
├── surahId         Int
├── lastAyah        Int (last ayah reached in that session)
├── date            DateTime (date only, one entry per surah per day)
├── createdAt       DateTime
└── updatedAt       DateTime
│
│ @@unique([userId, surahId, date])  — one record per user/surah/day
```

### Pages & Routes

| Route | Description |
|---|---|
| `/quran` | Surah list — card grid with name, ayah count, revelation type |
| `/quran/[surah]` | Full surah view — Arabic + translation, ayah-by-ayah |
| `/quran/[surah]#ayah-[n]` | Deep link to specific ayah (anchor scroll) |
| `/quran/search` | Full-text search across translations |
| `/quran/bookmarks` | User's saved bookmarks (requires auth) |

### tRPC Routes

```
quran.listSurahs        → Surah[] (id, name, nameTranslit, ayahCount, revelationType)
quran.getSurah(id)      → Surah + Ayah[] (full content)
quran.getAyah(surah,num)→ Single Ayah with context
quran.search(query)     → Ayah[] matching translation text
bookmark.list           → Bookmark[] (authed)
bookmark.create(input)  → Bookmark (authed)
bookmark.delete(id)     → void (authed)
reading.track(surahId, lastAyah) → upsert today's entry (authed)
reading.history(surahId?)        → ReadingHistory[] (recent, optionally filtered by surah)
reading.lastRead                 → most recent ReadingHistory entry (for "Continue Reading")
```

### UI/UX

- **Mobile-first** — phone experience is primary, desktop secondary
- **Arabic typography:** Amiri Quran or KFGQPC Uthmanic Script font, RTL, large readable size
- **Continue Reading:** Banner on `/quran` showing last read surah + ayah, one tap to resume
- **Reading history:** Per-surah "Last read: today / 3 days ago" badge on surah list
- **Reading mode:** Clean, distraction-free, adjustable font size
- **Color scheme:**
  - **Light mode:** White (#FFFFFF) bg, Dark Green (#166534) headers/primary, Green (#22C55E) accents, gray text
  - **Dark mode:** Near-black (#0A0A0A) bg, Green (#22C55E) accents/primary, Dark Green (#166534) secondary, white text
  - System preference detection + manual toggle via `next-themes`

### Surah Reading View (Mobile)

Each ayah displays 3 layers:
1. **Arabic** — large Uthmanic font, right-aligned, ayah end marker ﴿١﴾
2. **Transliteration** — Latin pronunciation, green accent color
3. **Translation** — Indonesian (primary), smaller text, muted color

```
┌──────────────────────────────────┐
│ ←  Juz 1          [☰] [✓] [↓] [⚙]│
├──────────────────────────────────┤
│ ◄ 2. Al-Baqarah │ 1. Al-Fatihah ►│ ← swipeable surah tabs
├══════════════════════════════════┤
│  Mekah  │  Pembukaan  │  7 Ayat  │ ← ornamental surah header
├══════════════════════════════════┤
│                                   │
│ ①    بِسْمِ اللَّهِ الرَّحْمَٰنِ ﴿١﴾│
│   bismillaahir-rahmaanir-rahiim   │
│   Dengan menyebut nama Allah Yang │
│   Maha Pengasih lagi Maha         │
│   Penyayang.                      │
│                                   │
│ ②    الْحَمْدُ لِلَّهِ رَبِّ ﴿٢﴾  │
│   al-hamdu lillaahi robbil-...    │
│   Segala puji bagi Allah,         │
│   Tuhan seluruh alam.             │
│                                   │
└──────────────────────────────────┘
```

### Tajweed Color Rendering

Arabic text is fetched with tajweed markup from quran.com API at build time:

```
GET /api/v4/quran/verses/uthmani_tajweed?chapter_number=1
```

Returns pre-tagged HTML with CSS classes per tajweed rule. Rendered via `dangerouslySetInnerHTML` — zero runtime cost.

**Tajweed color map:**

| Rule | Color | CSS Class | Description |
|---|---|---|---|
| Ikhfa | Green (#169200) | `.tajweed-ikhfa` | Nun sakin before certain letters |
| Idgham | Purple (#A020F0) | `.tajweed-idgham` | Nun sakin merging |
| Iqlab | Blue (#26BFFD) | `.tajweed-iqlab` | Nun sakin before ba |
| Qalqalah | Red (#DD0008) | `.tajweed-qalqalah` | Bouncing letters (ق ط ب ج د) |
| Ghunnah | Orange (#FF7E1E) | `.tajweed-ghunnah` | Nasal sound |
| Madd | Pink (#D500B7) | `.tajweed-madd` | Elongation |

**User toggle:** Option to show/hide tajweed colors (some prefer plain text)

### Surah Header

- Decorative ornamental banner (Islamic geometric border)
- Shows: revelation type (Mekah/Madinah), surah meaning, ayah count
- Bismillah separator below (except At-Tawbah)

### Ayah Interaction

- **Tap ayah number** → action sheet (bookmark, share, tafsir, copy, play audio)
- **Long press** → text selection for copy
- **Scroll tracking** → silently updates reading history (lastAyah)

### Navigation

- **Top bar:** Back button, Juz label, toolbar icons (TOC, bookmarks, download, settings)
- **Surah tabs:** Horizontal swipeable tabs for adjacent surahs
- **Bottom nav:** Home | Quran | Prayer | Qibla | Settings

### Rendering Strategy

- **Surah list (`/quran`):** Static page, built at build time
- **Surah view (`/quran/[surah]`):** Static via `generateStaticParams` — all 114 pages pre-rendered
- **Search (`/quran/search`):** Client-side search over IndexedDB (offline) or API fallback (online)
- **No runtime API calls** for reading Quran — everything is in the static HTML
- **Offline:** Service worker caches static pages + IndexedDB stores data for client features

---

## Pillar 2: Prayer Times

### Data

- **Calculation:** [Aladhan API](https://aladhan.com/prayer-times-api) or local calculation via `adhan-js` library
- **Methods:** Support multiple calculation methods (MWL, ISNA, Kemenag Indonesia, etc.)
- **Location:** Browser Geolocation API → lat/lng

### Features

- Today's 5 prayer times + sunrise
- Monthly calendar view
- Countdown to next prayer
- Notification support (browser Push API — stretch goal)
- Location auto-detect + manual city search

### Pages

| Route | Description |
|---|---|
| `/prayer` | Today's schedule with countdown |
| `/prayer/monthly` | Full month table |
| `/prayer/settings` | Calculation method, adjustments |

### tRPC Routes

```
prayer.getToday(lat, lng, method)   → PrayerTime[]
prayer.getMonthly(lat, lng, month)  → PrayerTime[][]
```

---

## Pillar 3: Qibla Compass

### Tech

- **Direction calculation:** Spherical geometry from user lat/lng to Kaaba (21.4225°N, 39.8262°E)
- **Device compass:** `DeviceOrientationEvent` API (gyroscope/magnetometer)
- **Fallback:** Static arrow showing bearing + degrees if no gyroscope

### Features

- Real-time compass needle pointing to Qibla
- Bearing in degrees from North
- Distance to Mecca (informational)
- Calibration prompt if magnetometer unreliable
- Permission handling (iOS 13+ requires explicit motion permission)

### Pages

| Route | Description |
|---|---|
| `/qibla` | Full-screen compass with Qibla direction |

### Implementation Notes

- Use `window.DeviceOrientationEvent.requestPermission()` for iOS
- Canvas or CSS transform rotation for compass needle
- `navigator.geolocation.getCurrentPosition()` for coordinates
- Formula: `atan2(sin(ΔL) * cos(φ2), cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(ΔL))`

---

## Offline Support (PWA)

### Strategy

Full offline-first architecture — the app should work without internet after initial load.

### Service Worker

- **Framework:** `next-pwa` or `serwist` (next-pwa successor, better App Router support)
- **Precache:** App shell, fonts (Amiri Quran, Inter), static assets
- **Runtime cache:** tRPC responses cached in IndexedDB

### Quran Offline

- All 114 surahs stored in IndexedDB on first visit (or on-demand per surah)
- "Download All" button to prefetch entire Quran (~15MB Arabic + translations)
- Download progress indicator
- Once cached, surah reads are fully offline — zero network requests
- Bookmarks queue offline, sync when back online

### Prayer Times Offline

- Cache current week's prayer times in IndexedDB
- `adhan-js` for local calculation as primary (no API needed at all)
- Last known location stored locally for offline recalculation

### Qibla Offline

- Works fully offline — calculation is pure math from stored lat/lng
- Compass uses device sensors only, no network

### Storage Architecture

```
IndexedDB
├── quran-surahs      → Full surah + ayah data (cached on read or bulk download)
├── quran-bookmarks   → Offline bookmark queue (syncs on reconnect)
├── prayer-cache      → Cached prayer times
├── user-location     → Last known lat/lng
└── user-preferences  → Calculation method, font size, theme

Service Worker Cache
├── app-shell         → HTML, JS, CSS bundles
├── fonts             → Arabic + UI fonts
└── static            → Icons, images, compass assets
```

### Sync Strategy

- **Bookmarks:** Optimistic local-first, background sync via `SyncManager` API
- **Prayer times:** Recalculate locally, refresh from API when online
- **Conflict resolution:** Last-write-wins (simple, sufficient for bookmarks)

### Install Prompt

- PWA manifest with app name, icons, theme color
- "Add to Home Screen" prompt after 2nd visit
- Splash screen with Islamic geometric pattern

---

## Push Notifications

### Use Cases

- **Prayer time reminders** — notify X minutes before each salat (configurable)
- **Reading reminders** — "You haven't read Quran today" (daily, configurable time)
- **Bookmark reminders** — "Continue reading Surah Al-Baqarah" (optional)

### Tech

- **Web Push API** + service worker
- **Backend:** `web-push` library (Node.js) for sending notifications
- **Storage:** Push subscriptions stored in DB per user

### Platform Support

| Platform | Support |
|---|---|
| Chrome/Edge (desktop + Android) | Full |
| Firefox (desktop + Android) | Full |
| Safari (macOS) | Full |
| Safari (iOS 16.4+) | Only when installed as PWA |

### User Settings

- Enable/disable per notification type (prayer, reading, bookmark)
- Prayer reminder lead time: 5 / 10 / 15 / 30 min before
- Reading reminder time: user picks time of day
- Quiet hours: no notifications between X–Y

### Database Schema

```
PushSubscription
├── id              Int (auto)
├── userId          String (FK → User)
├── endpoint        String
├── p256dh          String
├── auth            String
├── createdAt       DateTime

NotificationPreference
├── id              Int (auto)
├── userId          String (FK → User)
├── prayerReminder  Boolean (default true)
├── prayerLeadMin   Int (default 10)
├── readingReminder Boolean (default false)
├── readingTime     String? (e.g. "20:00")
├── quietStart      String? (e.g. "23:00")
├── quietEnd        String? (e.g. "06:00")
```

### Implementation

- On first visit: prompt permission after user engages (not immediately)
- Prayer notifications scheduled via cron job or calculated client-side
- Service worker shows notification even when tab is closed
- Clicking notification opens relevant page (prayer → `/prayer`, reading → last surah)

---

## Shared Architecture

### Auth (NextAuth)

- Google OAuth provider (primary — most Indonesian users have Google)
- Guest mode for reading (no bookmark/settings sync)
- Auth required only for: bookmarks, preferences sync

### Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| API | tRPC |
| ORM | Prisma (SQLite → PostgreSQL for prod) |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js |
| Colors | See color scheme below |
| Fonts | Amiri Quran (Arabic), Inter (UI) |
| Offline | Serwist (service worker) + IndexedDB |
| Local calc | adhan-js (prayer times without API) |
| Deploy | Vercel (target) |

### Navigation

```
/              → Landing / dashboard (next prayer + last read + qibla shortcut)
/quran         → Al-Quran
/prayer        → Prayer Times
/qibla         → Qibla Compass
```

### Performance Targets

- Surah list: < 200ms TTFB (server-rendered, cached)
- Surah view: < 300ms (Arabic text preloaded in DB)
- Qibla: instant compass after permission grant
- Lighthouse: 90+ on all metrics

---

## Monetization

### Principles

- **Never gate Quran access** — all core Islamic content stays free
- **Never show ads during Quran reading** — respect the experience
- Donations-first approach, ads as supplement

### Revenue Streams

| Stream | Description | Priority |
|---|---|---|
| **Donations / Infaq** | "Support this project" button, recurring option via Saweria/Ko-fi | Phase 1 |
| **Google AdSense** | Banner ads on non-reading pages (surah list, home, prayer list) | Phase 2 |
| **Premium tier** | Ad-free, multiple reciters, tafsir, reading stats/streaks | Phase 3 |
| **Affiliate** | Islamic bookstores, Hajj/Umrah travel, halal products | Phase 3 |
| **Sponsored** | Islamic courses, educational content (vetted, non-spammy) | Later |
| **White-label** | Sell platform to mosques/organizations | Later |

### Ad Placement Rules

- No ads on `/quran/[surah]` (reading view)
- No ads on `/qibla` (compass view)
- Allowed: surah list, home/dashboard, prayer monthly view, settings
- Max 1 ad per page, non-intrusive placement

### Premium Features (not gating core content)

- Ad-free experience
- Multiple Quran reciters (audio)
- Tafsir (commentary/interpretation)
- Reading streaks & statistics
- Custom themes
- Offline audio downloads

---

## Phase Plan

| Phase | Scope | Priority |
|---|---|---|
| **1** | Quran — seed data, surah list, surah view, search | **NOW** |
| **2** | Quran — bookmarks, last read, audio playback | Next |
| **3** | Prayer times — today view, countdown | Next |
| **4** | Qibla compass | Next |
| **5** | Dashboard, PWA, push notifications | Later |
| **6** | PWA — service worker, offline caching, install prompt | Later |
| **7** | Polish, dark mode, i18n, deploy | Later |
