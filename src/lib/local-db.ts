// DoNext local database: SQLite (sql.js, runs in the browser) + bcrypt password hashing.
// The whole .db file is saved in this browser's IndexedDB. No server, no external API.
import initSqlJs, { type Database } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import bcrypt from "bcryptjs";
import type { Expense, MoodEntry, Task } from "./donext-store";

export type LocalUser = { id: string; email: string };
export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  monthly_budget: number;
  focus_sessions: number;
};
export type UserData = { profile: Profile; tasks: Task[]; expenses: Expense[]; moods: MoodEntry[] };

export const AUTH_EVENT = "donext-auth";
const CURRENT_KEY = "donext:current";
const IDB_NAME = "donext";
const IDB_STORE = "sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL, avatar_url TEXT,
  monthly_budget REAL NOT NULL DEFAULT 8000, focus_sessions INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, due_in_days INTEGER NOT NULL, priority INTEGER NOT NULL,
  done INTEGER NOT NULL DEFAULT 0, pos INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL, amount REAL NOT NULL, category TEXT NOT NULL, pos INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS mood_entries (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL, mood INTEGER NOT NULL, note TEXT NOT NULL DEFAULT '', pos INTEGER NOT NULL DEFAULT 0);
PRAGMA foreign_keys = ON;`;

/* ---------- IndexedDB persistence of the .db file ---------- */
function idb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(IDB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(IDB_STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function loadBytes(): Promise<Uint8Array | null> {
  const d = await idb();
  return new Promise((res, rej) => {
    const r = d.transaction(IDB_STORE).objectStore(IDB_STORE).get("db");
    r.onsuccess = () => res((r.result as Uint8Array) ?? null);
    r.onerror = () => rej(r.error);
  });
}
async function saveBytes(bytes: Uint8Array) {
  const d = await idb();
  await new Promise<void>((res, rej) => {
    const t = d.transaction(IDB_STORE, "readwrite");
    t.objectStore(IDB_STORE).put(bytes, "db");
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

let dbPromise: Promise<Database> | null = null;
export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await initSqlJs({ locateFile: () => wasmUrl });
      const bytes = await loadBytes();
      const db = bytes ? new SQL.Database(bytes) : new SQL.Database();
      db.exec(SCHEMA);
      return db;
    })();
  }
  return dbPromise;
}
const persist = async (db: Database) => saveBytes(db.export());

function rows<T>(db: Database, sql: string, params: (string | number | null)[] = []): T[] {
  const st = db.prepare(sql);
  st.bind(params);
  const out: T[] = [];
  while (st.step()) out.push(st.getAsObject() as T);
  st.free();
  return out;
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/* ---------- Auth ---------- */
const emit = () => window.dispatchEvent(new Event(AUTH_EVENT));

export async function getCurrentUser(): Promise<LocalUser | null> {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(CURRENT_KEY);
  if (!id) return null;
  const db = await getDb();
  return rows<LocalUser>(db, "SELECT id, email FROM users WHERE id = ?", [id])[0] ?? null;
}

export async function signUp(email: string, password: string, name: string) {
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@")) throw new Error("Enter a valid email.");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  const db = await getDb();
  if (rows(db, "SELECT 1 FROM users WHERE email = ?", [clean]).length)
    throw new Error("An account with this email already exists.");
  const id = newId();
  const hash = await bcrypt.hash(password, 10);
  db.run("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", [id, clean, hash]);
  db.run("INSERT INTO profiles (id, display_name) VALUES (?, ?)", [
    id,
    name || clean.split("@")[0] || "Student",
  ]);
  await persist(db);
  localStorage.setItem(CURRENT_KEY, id);
  emit();
}

export async function signIn(email: string, password: string) {
  const clean = email.trim().toLowerCase();
  const db = await getDb();
  const u = rows<{ id: string; password_hash: string }>(
    db,
    "SELECT id, password_hash FROM users WHERE email = ?",
    [clean],
  )[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash)))
    throw new Error("Wrong email or password.");
  localStorage.setItem(CURRENT_KEY, u.id);
  emit();
}

export function signOut() {
  localStorage.removeItem(CURRENT_KEY);
  emit();
}

/* ---------- Data ---------- */
export async function loadData(userId: string): Promise<UserData> {
  const db = await getDb();
  const profile = rows<Profile>(
    db,
    "SELECT id, display_name, avatar_url, monthly_budget, focus_sessions FROM profiles WHERE id = ?",
    [userId],
  )[0] ?? { id: userId, display_name: "Student", avatar_url: null, monthly_budget: 8000, focus_sessions: 0 };
  const tasks = rows<{ id: string; title: string; due_in_days: number; priority: number; done: number }>(
    db,
    "SELECT id, title, due_in_days, priority, done FROM tasks WHERE user_id = ? ORDER BY pos",
    [userId],
  ).map((t) => ({ id: t.id, title: t.title, dueInDays: t.due_in_days, priority: t.priority, done: !!t.done }));
  const expenses = rows<Expense>(
    db,
    "SELECT id, label, amount, category FROM expenses WHERE user_id = ? ORDER BY pos",
    [userId],
  );
  const moods = rows<MoodEntry>(
    db,
    "SELECT id, day, mood, note FROM mood_entries WHERE user_id = ? ORDER BY pos",
    [userId],
  );
  return { profile, tasks, expenses, moods };
}

/** Apply a change and write the user's rows back to SQLite in one transaction. */
export async function updateData(userId: string, fn: (d: UserData) => UserData) {
  const db = await getDb();
  const next = fn(await loadData(userId));
  db.exec("BEGIN");
  try {
    const p = next.profile;
    db.run(
      `INSERT INTO profiles (id, display_name, avatar_url, monthly_budget, focus_sessions)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name, avatar_url=excluded.avatar_url,
       monthly_budget=excluded.monthly_budget, focus_sessions=excluded.focus_sessions`,
      [userId, p.display_name, p.avatar_url, p.monthly_budget, p.focus_sessions],
    );
    for (const t of ["tasks", "expenses", "mood_entries"]) db.run(`DELETE FROM ${t} WHERE user_id = ?`, [userId]);
    next.tasks.forEach((t, i) =>
      db.run("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?)", [
        t.id, userId, t.title, t.dueInDays, t.priority, t.done ? 1 : 0, i,
      ]),
    );
    next.expenses.forEach((e, i) =>
      db.run("INSERT INTO expenses VALUES (?, ?, ?, ?, ?, ?)", [e.id, userId, e.label, e.amount, e.category, i]),
    );
    next.moods.forEach((m, i) =>
      db.run("INSERT INTO mood_entries VALUES (?, ?, ?, ?, ?, ?)", [m.id, userId, m.day, m.mood, m.note, i]),
    );
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  await persist(db);
}

/** Download the raw SQLite file (open it with any SQLite viewer). */
export async function downloadDbFile() {
  const db = await getDb();
  const blob = new Blob([db.export() as BlobPart], { type: "application/x-sqlite3" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "donext.db";
  a.click();
  URL.revokeObjectURL(a.href);
}
