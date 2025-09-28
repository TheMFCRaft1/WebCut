const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const dbFile = process.env.DB_FILE || './data.db';
const db = new Database(dbFile);

// Create tables if not exist
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  isAdmin INTEGER DEFAULT 0
);
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectId INTEGER,
  filename TEXT NOT NULL,
  originalName TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(projectId) REFERENCES projects(id)
);
`).run();

// Ensure an admin user exists (username: admin, password: admin)
const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminUser) {
  const hash = bcrypt.hashSync('admin', 10);
  db.prepare('INSERT INTO users (username, passwordHash, isAdmin) VALUES (?, ?, 1)')
    .run('admin', hash);
  console.log('Initial admin user created: username=admin password=admin — please change!');
}

module.exports = db;