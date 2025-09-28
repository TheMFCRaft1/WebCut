require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require('cors');

const db = require('./db');
const { signToken, authMiddleware, adminMiddleware } = require('./auth');

const app = express();
app.use(express.json());
// Simple CORS for local dev; tighten in production
app.use(cors());

const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, name);
  }
});
const upload = multer({ storage });

// --- Auth ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { id: user.id, username: user.username, isAdmin: !!user.isAdmin } });
});

// --- User Management (Admin only) ---
app.get('/api/users', authMiddleware, adminMiddleware, (req, res) => {
  const rows = db.prepare('SELECT id, username, isAdmin FROM users').all();
  res.json(rows);
});

app.post('/api/users', authMiddleware, adminMiddleware, (req, res) => {
  const { username, password, isAdmin } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (username, passwordHash, isAdmin) VALUES (?, ?, ?)').run(username, hash, isAdmin ? 1 : 0);
    res.json({ id: info.lastInsertRowid, username, isAdmin: !!isAdmin });
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ error: 'username already exists' });
    res.status(500).json({ error: 'DB error' });
  }
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});

// --- Projects & Assets ---
app.get('/api/projects', authMiddleware, (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
  res.json(projects);
});

app.post('/api/projects', authMiddleware, (req, res) => {
  const { title, description } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const info = db.prepare('INSERT INTO projects (title, description) VALUES (?, ?)').run(title, description || '');
  res.json({ id: info.lastInsertRowid, title, description });
});

app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  const file = req.file;
  const projectId = req.body.projectId ? parseInt(req.body.projectId, 10) : null;
  if (!file) return res.status(400).json({ error: 'file missing' });
  db.prepare('INSERT INTO assets (projectId, filename, originalName) VALUES (?, ?, ?)').run(projectId, file.filename, file.originalname);
  res.json({ filename: file.filename, originalName: file.originalname, projectId });
});

app.get('/api/assets', authMiddleware, (req, res) => {
  const assets = db.prepare('SELECT * FROM assets ORDER BY createdAt DESC').all();
  res.json(assets);
});

app.get('/uploads/:file', (req, res) => {
  const p = path.join(UPLOAD_DIR, req.params.file);
  res.sendFile(p);
});

// --- Simple render endpoint using ffmpeg (must be installed on server) ---
app.post('/api/render', authMiddleware, (req, res) => {
  // body: { inputFilename, outputFilename }
  const { inputFilename, outputFilename } = req.body || {};
  if (!inputFilename || !outputFilename) return res.status(400).json({ error: 'inputFilename and outputFilename required' });
  const inputPath = path.join(UPLOAD_DIR, inputFilename);
  const outputPath = path.join(UPLOAD_DIR, outputFilename);
  if (!fs.existsSync(inputPath)) return res.status(400).json({ error: 'input file not found' });

  // Basic transcode example
  const ffmpegArgs = ['-y', '-i', inputPath, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', outputPath];
  const job = spawn('ffmpeg', ffmpegArgs);

  job.stderr.on('data', d => console.log('[ffmpeg]', d.toString()));
  job.on('close', code => {
    if (code === 0) {
      res.json({ ok: true, output: `/uploads/${path.basename(outputPath)}` });
    } else {
      res.status(500).json({ error: 'ffmpeg failed', code });
    }
  });
});

// --- Serve uploads statically for convenience
app.use('/uploads', express.static(UPLOAD_DIR));

// --- Start
app.listen(PORT, () => {
  console.log(`WebCut backend running on http://0.0.0.0:${PORT}`);
});