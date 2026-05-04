# InterviewReady

Free comprehensive practice resources for couples preparing for marriage-based immigration interviews.

---

## What It Does

- **28 practice topics** with PDF question sets (kitchen, bedroom, daily routine, finances, etc.)
- **Study progress tracking** — mark topics as reviewed, check off items, see your completion %
- **Timeline builder** — drag-and-drop milestones for your relationship history
- **Printable checklist** — 25+ preparation items with checkboxes
- **User accounts** — register, login, progress saved to the cloud
- **Password reset** — via email (Resend)
- **Admin panel** — manage ads, users, site settings (Ctrl+Shift+A)
- **Interstitial ads** — configurable per-network (Google AdSense, Media.net, Amazon, PropellerAds, Ezoic, custom)
- **Cookie consent** — GDPR-compliant banner with 4 categories
- **PWA installable** — works offline, installable on phones

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Node.js, Express 5, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (Bearer tokens) |
| Email | Resend (password reset) |
| Deployment | Docker + Coolify (or bare-metal) |
| Control Panel | Python/Tkinter GUI |

---

## Project Structure

```
interviewready/
├── app/                          # React frontend
│   ├── src/
│   │   ├── components/           # 14 React components
│   │   ├── context/              # AuthContext, ProgressContext
│   │   ├── data/                 # 28 topics, categories, testimonials
│   │   ├── pages/                # Login, Register, Forgot/Reset Password, Privacy, Terms, Contact
│   │   ├── hooks/                # useLocalStorage
│   │   └── lib/                  # Icon mapping, utilities
│   ├── public/                   # PDFs, PWA icons, manifest, service worker
│   └── package.json
│
├── server/                       # Node.js backend
│   ├── src/
│   │   ├── routes/               # auth, progress, admin, download
│   │   ├── middleware/            # JWT auth, admin guard
│   │   ├── db.ts                 # Prisma client
│   │   └── index.ts              # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma         # 6 models: User, UserProgress, PasswordReset, AdminSettings, AdNetwork, Downloads
│   │   └── seed.ts               # Seeds admin user, settings, 6 ad networks
│   ├── scripts/                  # setup-server.sh, deploy-update.sh, upload-to-server.sh
│   └── package.json
│
├── docker/                       # Docker config files
│   ├── nginx.conf                # Nginx (serves frontend, proxies /api/)
│   ├── supervisord.conf          # Runs Nginx + Node.js in one container
│   └── docker-entrypoint.sh      # Auto-migrates + seeds on startup
│
├── Dockerfile                    # All-in-one build (frontend + backend + Nginx)
├── docker-compose.yml            # PostgreSQL + App
├── .env.example                  # Environment variables (with explanations)
├── .dockerignore
├── control_panel.py              # Python GUI control panel
└── README.md
```

---

## Quick Start

### Option 1: Coolify (Recommended — Easiest)

Coolify handles **everything** — Docker, PostgreSQL, Nginx, SSL, auto-deploy.

1. Push this project to a Git repository (GitHub/GitLab)
2. Open your Coolify dashboard → **Add New Resource** → **Docker Compose**
3. Connect your Git repo
4. Set environment variables in Coolify UI (see `.env.example`)
5. Set your domain → Coolify auto-configures HTTPS
6. Click **Deploy**

That's it. Every future `git push` auto-deploys.

The Docker image builds the frontend, compiles the backend, runs migrations, seeds the admin account, and starts Nginx + Node.js — all automatically.

### Option 2: Local Development

**Frontend:**
```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

**Backend:**
```bash
cd server
npm install
npx prisma generate
npm run dev        # http://localhost:3001
```

**Or use the GUI control panel:**
```bash
python control_panel.py
```

### Option 3: Docker (Local Testing)

```bash
# Copy env file and edit values
cp .env.example .env

# Build and start everything
docker compose up --build -d

# Open http://localhost
```

### Option 4: Bare-Metal Server (No Docker)

See `server/scripts/setup-server.sh` — installs PostgreSQL, Node.js, Nginx, configures SSL, creates systemd services, sets up daily backups.

> **Warning:** Do NOT use this if Coolify is installed — it will conflict.

---

## Environment Variables

Set these in `.env` (local) or the **Coolify UI → Environment tab** (production).

| Variable | What It Is | Default |
|----------|-----------|---------|
| `DB_USER` | PostgreSQL username | `irapp` |
| `DB_PASS` | PostgreSQL password | `irlocaldev123` |
| `DB_NAME` | PostgreSQL database name | `interviewready` |
| `APP_PORT` | External port | `80` |
| `JWT_SECRET` | Encrypts login tokens — **change in production!** | (placeholder) |
| `RESEND_API_KEY` | For password reset emails — get from [resend.com](https://resend.com) | (placeholder) |
| `EMAIL_FROM` | Sender email address | `noreply@interviewready.app` |
| `FRONTEND_URL` | Your site URL (for CORS + reset links) | `http://localhost` |
| `ADMIN_EMAIL` | Admin account email | `admin@interviewready.app` |
| `ADMIN_PASSWORD` | Admin account password — **change in production!** | `ChangeMe123!` |

---

## Admin Panel

1. Login with your admin credentials
2. Press **Ctrl+Shift+A** to open the admin panel
3. Tabs: **Settings** | **Ad Networks** | **Users** | **Stats**

### Supported Ad Networks

- Google AdSense
- Media.net
- Amazon Associates
- PropellerAds
- Ezoic
- Custom HTML/JS

### Admin Settings

- Enable/disable ads globally
- Interstitial ad before PDF downloads (configurable countdown)
- Cookie consent banner on/off
- Maintenance mode
- Site verification snippets (Google, Bing, Amazon, Ezoic, PropellerAds, custom)

---

## Python Control Panel

```bash
python control_panel.py
```

A desktop GUI with 7 tabs:

| Tab | What It Does |
|-----|-------------|
| **Coolify Deploy** | Step-by-step guide to deploy on Coolify |
| **Local Dev** | One-click build/dev/test commands |
| **Docker** | Docker Compose commands + Coolify reference |
| **Database** | Prisma commands (migrate, seed, studio) |
| **.env Config** | Edit server/.env with Save/Reload |
| **Logs** | Live output from any command |
| **Credentials** | View .env values (masked), URLs, deployment info |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Login |
| `POST` | `/api/auth/forgot-password` | No | Request reset email |
| `POST` | `/api/auth/reset-password` | No | Reset with token |
| `GET` | `/api/auth/me` | Yes | Current user info |
| `GET` | `/api/progress` | Yes | User progress |
| `PUT` | `/api/progress` | Yes | Update progress |
| `POST` | `/api/download` | Yes | Track PDF download |
| `GET` | `/api/download/settings` | No | Ad settings for interstitial |
| `GET` | `/api/admin/settings` | Admin | Site settings |
| `PUT` | `/api/admin/settings` | Admin | Update settings |
| `GET` | `/api/admin/ad-networks` | Admin | List ad networks |
| `POST` | `/api/admin/ad-networks` | Admin | Create ad network |
| `PUT` | `/api/admin/ad-networks/:id` | Admin | Update ad network |
| `DELETE` | `/api/admin/ad-networks/:id` | Admin | Delete ad network |
| `GET` | `/api/admin/users` | Admin | List all users |
| `PUT` | `/api/admin/users/:id` | Admin | Toggle user active/role |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user |
| `GET` | `/api/admin/stats` | Admin | Dashboard stats |
| `GET` | `/api/health` | No | Health check |

---

## Database Schema

6 Prisma models:

- **User** — email, password hash, name, role, active status
- **UserProgress** — reviewed topics, checked items, timeline data
- **PasswordReset** — reset tokens with expiry
- **AdminSettings** — ads enabled, interstitial config, cookie consent, maintenance mode, site verification
- **AdNetwork** — name, label, ad code, active, priority
- **Downloads** — tracking (user, topic, IP, timestamp)

---

## License

All rights reserved.
