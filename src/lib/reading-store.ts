import { openDB, type DBSchema } from "idb";

interface ReadingState {
  surahId: number;
  lastScrollY: number;
  lastAyah: number;
  lastReadAt: Date;
}

interface MuslimProDB extends DBSchema {
  "reading-state": {
    key: number;
    value: ReadingState;
    indexes: { "by-last-read": Date };
  };
}

function getDB() {
  return openDB<MuslimProDB>("muslim-pro", 1, {
    upgrade(db) {
      const store = db.createObjectStore("reading-state", {
        keyPath: "surahId",
      });
      store.createIndex("by-last-read", "lastReadAt");
    },
  });
}

export async function saveReadingState(
  surahId: number,
  scrollY: number,
  lastAyah: number,
) {
  const db = await getDB();
  await db.put("reading-state", {
    surahId,
    lastScrollY: scrollY,
    lastAyah,
    lastReadAt: new Date(),
  });
}

export async function getReadingState(
  surahId: number,
): Promise<ReadingState | undefined> {
  const db = await getDB();
  return db.get("reading-state", surahId);
}

export async function getLastRead(): Promise<ReadingState | undefined> {
  const db = await getDB();
  const cursor = await db
    .transaction("reading-state")
    .store.index("by-last-read")
    .openCursor(null, "prev");
  return cursor?.value;
}

export async function getAllReadingStates(): Promise<ReadingState[]> {
  const db = await getDB();
  return db.getAll("reading-state");
}
