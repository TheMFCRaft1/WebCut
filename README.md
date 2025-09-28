# WebCut - Minimal MVP

Dieses Repository enthält einen einfachen Fullstack‑Prototyp für "WebCut":

- Backend: Node.js + Express + SQLite (better-sqlite3), JWT Auth, Admin User Management, File Upload, FFmpeg-Render-Endpoint
- Frontend: React + TypeScript + Vite — Login, Dashboard, Admin Panel (User management)

Schnellstart (Backend):
1. cd backend
2. npm install
3. cp .env.example .env  # anpassen: JWT_SECRET, etc.
4. npm start
   - Erststart erzeugt einen Admin-Benutzer (username: admin, password: admin). Sofort ändern!

Schnellstart (Frontend):
1. cd frontend
2. npm install
3. npm run dev
4. Open http://localhost:5173

Hinweise:
- ffmpeg muss auf dem Server installiert sein (z.B. `sudo apt install ffmpeg`).
- Uploads werden in `backend/uploads` gespeichert.
- SQLite DB: `backend/data.db`

Copilot Hinweis: Dies ist ein Beispiel-MVP — bitte Sicherheitseinstellungen (CORS, HTTPS, sichere Passwörter) für Produktion ergänzen.