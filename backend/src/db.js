// db.js
// Sets up a SQLite database with a well-structured relational schema for
// users and tasks. Using a real embedded SQL database (instead of a flat
// JSON file) gives us referential integrity, indexes, and atomic writes,
// which matters once concurrent status updates happen.
//
// We use Node's built-in `node:sqlite` module (DatabaseSync) rather than
// the third-party `better-sqlite3` package. Both expose the same
// synchronous prepare/run/get/all API, but node:sqlite ships inside the
// Node.js runtime itself, so there is no native module to compile with
// node-gyp on install. That matters a lot in practice: better-sqlite3
// needs a prebuilt binary for your exact Node version/OS/architecture, and
// brand-new or unusual Node versions often don't have one yet, which is
// exactly the "gyp ERR!" failure this avoids.
//
// Requires Node.js 22.13+ (node:sqlite ships without a flag from that
// version onward). Node 24/25 report it as a stable Release Candidate.

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'committee.db');

// Ensure the data directory exists before opening the DB file.
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('tech_head', 'co_committee')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL,
    description  TEXT DEFAULT '',
    assignee_id  INTEGER NOT NULL,
    created_by   INTEGER NOT NULL,
    status       TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    priority     TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    deadline     TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
`);

module.exports = db;
