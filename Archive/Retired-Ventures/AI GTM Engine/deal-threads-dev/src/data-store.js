import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export function createDataStore(options = {}) {
  const mode = String(options.mode || "json").toLowerCase();
  if (mode === "sqlite") {
    return createSqliteStore(options.sqlitePath || options.filePath);
  }
  if (mode !== "json") {
    throw new Error(`Unsupported DEAL_THREADS_DATA_STORE mode: ${mode}`);
  }
  return createFileStore(options.filePath);
}

export function createFileStore(filePath) {
  let writeChain = Promise.resolve();

  async function load() {
    try {
      const raw = await readFile(filePath, "utf8");
      return JSON.parse(raw);
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }

  function save(snapshot) {
    writeChain = writeChain.then(async () => {
      await mkdir(path.dirname(filePath), { recursive: true });
      const tmpPath = `${filePath}.tmp`;
      await writeFile(tmpPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
      await rename(tmpPath, filePath);
    });

    return writeChain;
  }

  return { load, save };
}

export function createSqliteStore(filePath) {
  if (!filePath) throw new Error("SQLite store requires a file path.");

  let dbPromise = null;
  let writeChain = Promise.resolve();

  async function database() {
    if (!dbPromise) {
      dbPromise = (async () => {
        await mkdir(path.dirname(filePath), { recursive: true });
        const { DatabaseSync } = await import("node:sqlite");
        const db = new DatabaseSync(filePath);
        db.exec(`
          CREATE TABLE IF NOT EXISTS deal_threads_snapshots (
            key TEXT PRIMARY KEY,
            snapshot_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
        `);
        return db;
      })();
    }
    return dbPromise;
  }

  async function load() {
    const db = await database();
    const row = db.prepare("SELECT snapshot_json FROM deal_threads_snapshots WHERE key = ?").get("current");
    return row?.snapshot_json ? JSON.parse(row.snapshot_json) : null;
  }

  function save(snapshot) {
    writeChain = writeChain.then(async () => {
      const db = await database();
      db.prepare(
        `INSERT INTO deal_threads_snapshots (key, snapshot_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           snapshot_json = excluded.snapshot_json,
           updated_at = excluded.updated_at`
      ).run("current", JSON.stringify(snapshot), snapshot.savedAt || new Date().toISOString());
    });

    return writeChain;
  }

  return { load, save };
}
