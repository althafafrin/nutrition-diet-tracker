PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
 daily_calorie_goal INTEGER NOT NULL DEFAULT 2000, notify_email TEXT,
 notifications_enabled INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS logs (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL, food_name TEXT NOT NULL,
 barcode TEXT, calories REAL NOT NULL DEFAULT 0, carbs REAL NOT NULL DEFAULT 0,
 protein REAL NOT NULL DEFAULT 0, created_at INTEGER NOT NULL,
 UNIQUE(user_id, created_at), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_logs_user_created ON logs(user_id, created_at);
