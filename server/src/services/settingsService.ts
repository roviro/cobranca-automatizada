import { db } from "../db/database";

export const settingsService = {
  getAll(): Record<string, string> {
    const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  },

  get(key: string, defaultValue = ""): string {
    const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
    return row ? row.value : (process.env[key.toUpperCase()] || defaultValue);
  },

  set(key: string, value: string): void {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
  },

  setMany(entries: Record<string, string>): void {
    const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    const transaction = db.transaction((data: Record<string, string>) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run(key, value);
      }
    });
    transaction(entries);
  }
};
