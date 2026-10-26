const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'data.sqlite3'));
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    daily_calorie_goal INTEGER NOT NULL DEFAULT 2000,
    notify_email TEXT,
    notifications_enabled INTEGER NOT NULL DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    barcode TEXT,
    calories REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    protein REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    meal_type TEXT DEFAULT 'breakfast',
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, created_at),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  db.run('ALTER TABLE logs ADD COLUMN fat REAL NOT NULL DEFAULT 0', () => {});
  db.run("ALTER TABLE logs ADD COLUMN meal_type TEXT DEFAULT 'breakfast'", () => {});
  db.run('CREATE INDEX IF NOT EXISTS idx_logs_user_created ON logs(user_id, created_at)');
});
module.exports = db;
