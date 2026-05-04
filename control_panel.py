#!/usr/bin/env python3
"""
InterviewReady — Control Panel GUI
====================================
A single-window app to manage everything from one place:
  - Build & test locally
  - Deploy to Coolify (step-by-step guide)
  - Docker management
  - Database tools (migrate, seed, backup)
  - Edit .env configuration
  - View command logs
  - Credentials & quick reference

Requirements: Python 3.8+ with tkinter (included by default)
Usage:  python control_panel.py
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import subprocess
import threading
import os
import sys
import webbrowser
from pathlib import Path
from datetime import datetime

# ─── Configuration ───────────────────────────────────────────────────────────
PROJECT_DIR = Path(__file__).parent.resolve()
APP_DIR = PROJECT_DIR / "app"
SERVER_DIR = PROJECT_DIR / "server"
SCRIPTS_DIR = SERVER_DIR / "scripts"
SERVER_ENV_FILE = SERVER_DIR / ".env"
ROOT_ENV_FILE = PROJECT_DIR / ".env.example"
DOCKER_DIR = PROJECT_DIR / "docker"

# Colors (Catppuccin Mocha palette)
BG_DARK = "#1e1e2e"
BG_MED = "#2d2d44"
BG_LIGHT = "#3d3d5c"
BG_INPUT = "#11111b"
FG_PRIMARY = "#cdd6f4"
FG_ACCENT = "#89b4fa"
FG_GREEN = "#a6e3a1"
FG_RED = "#f38ba8"
FG_YELLOW = "#f9e2af"
FG_ORANGE = "#fab387"
FG_TEAL = "#89dceb"
FONT_MONO = ("Consolas", 10)
FONT_UI = ("Segoe UI", 10)
FONT_TITLE = ("Segoe UI", 13, "bold")
FONT_HEADER = ("Segoe UI", 11, "bold")
FONT_SMALL = ("Segoe UI", 9)


class ControlPanel(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("InterviewReady — Control Panel")
        self.geometry("1100x780")
        self.minsize(900, 600)
        self.configure(bg=BG_DARK)

        self._build_ui()
        self._load_env_preview()

    def _build_ui(self):
        # Title bar
        title_frame = tk.Frame(self, bg=BG_MED, height=48)
        title_frame.pack(fill="x")
        title_frame.pack_propagate(False)
        tk.Label(title_frame, text="  InterviewReady Control Panel", font=FONT_TITLE,
                 bg=BG_MED, fg=FG_ACCENT, anchor="w").pack(side="left", padx=10, fill="y")
        tk.Label(title_frame, text=str(PROJECT_DIR), font=FONT_SMALL,
                 bg=BG_MED, fg="#666", anchor="e").pack(side="right", padx=10, fill="y")

        # Main area
        main = tk.Frame(self, bg=BG_DARK)
        main.pack(fill="both", expand=True)

        # Sidebar
        sidebar = tk.Frame(main, bg=BG_MED, width=195)
        sidebar.pack(side="left", fill="y")
        sidebar.pack_propagate(False)
        self._build_sidebar(sidebar)

        # Content (notebook)
        self.content = tk.Frame(main, bg=BG_DARK)
        self.content.pack(side="left", fill="both", expand=True, padx=8, pady=8)

        self._setup_styles()
        self.notebook = ttk.Notebook(self.content)
        self.notebook.pack(fill="both", expand=True)

        # Tabs
        self._tab_coolify_deploy()
        self._tab_local_dev()
        self._tab_docker()
        self._tab_database()
        self._tab_env()
        self._tab_logs()
        self._tab_credentials()

        # Status bar
        status = tk.Frame(self, bg=BG_INPUT, height=26)
        status.pack(fill="x", side="bottom")
        status.pack_propagate(False)
        self.status_label = tk.Label(status, text="  Ready", font=FONT_SMALL,
                                     bg=BG_INPUT, fg=FG_GREEN, anchor="w")
        self.status_label.pack(side="left", padx=8, fill="y")
        self.time_label = tk.Label(status, text="", font=FONT_SMALL,
                                   bg=BG_INPUT, fg="#666", anchor="e")
        self.time_label.pack(side="right", padx=8, fill="y")
        self._update_clock()

    def _setup_styles(self):
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure("TNotebook", background=BG_DARK, borderwidth=0)
        style.configure("TNotebook.Tab", background=BG_MED, foreground=FG_PRIMARY,
                         padding=[14, 6], font=FONT_UI)
        style.map("TNotebook.Tab", background=[("selected", BG_LIGHT)],
                  foreground=[("selected", FG_ACCENT)])
        style.configure("TFrame", background=BG_DARK)

    def _build_sidebar(self, parent):
        tk.Label(parent, text="Quick Actions", font=FONT_HEADER,
                 bg=BG_MED, fg=FG_PRIMARY).pack(pady=(15, 8), padx=10, anchor="w")
        buttons = [
            ("Build Frontend", self._cmd_build_frontend, FG_ACCENT),
            ("Build Backend", self._cmd_build_backend, FG_ACCENT),
            ("Start Dev Server", self._cmd_dev_server, FG_GREEN),
            ("Docker Up", self._cmd_docker_up, FG_ORANGE),
            ("Docker Down", self._cmd_docker_down, FG_RED),
            ("Open Coolify", self._open_coolify, FG_YELLOW),
            ("Open Browser", self._open_browser, FG_GREEN),
        ]
        for text, cmd, color in buttons:
            tk.Button(parent, text=text, command=cmd, font=FONT_UI, bg=BG_LIGHT,
                      fg=color, activebackground="#4d4d6c", activeforeground="white",
                      relief="flat", anchor="w", padx=12, pady=6,
                      cursor="hand2").pack(fill="x", padx=8, pady=2)

    # ═══════════════════════════════════════════════════════════════════════
    # Tab 1: Coolify Deploy (Step-by-Step)
    # ═══════════════════════════════════════════════════════════════════════
    def _tab_coolify_deploy(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="  Coolify Deploy  ")

        canvas = tk.Canvas(frame, bg=BG_DARK, highlightthickness=0)
        canvas.pack(fill="both", expand=True)
        inner = tk.Frame(canvas, bg=BG_DARK)
        canvas.create_window((0, 0), window=inner, anchor="nw")

        self._section(inner, "Deploy to Coolify — Step by Step")
        self._section_desc(inner,
            "Coolify handles EVERYTHING: Docker, PostgreSQL, Nginx, SSL, auto-deploy.\n"
            "Just follow these steps once. After that, every git push auto-deploys.")

        steps = [
            ("Step 1: Push to Git",
             "Push this entire project folder to a GitHub or GitLab repository.\n"
             "  - If you don't have a repo yet, create one on github.com/new\n"
             "  - Then run:  git init && git add -A && git commit -m \"first\"\n"
             "               git remote add origin https://github.com/YOU/repo.git\n"
             "               git push -u origin main",
             FG_ACCENT),
            ("Step 2: Open Coolify",
             "Go to your Coolify dashboard (usually http://YOUR_SERVER_IP:8000)\n"
             "Log in with the admin account you created when setting up Coolify.",
             FG_TEAL),
            ("Step 3: Add New Resource",
             "Click 'Add New Resource' → select your server → choose 'Docker Compose'\n"
             "This tells Coolify to use our docker-compose.yml file.",
             FG_ACCENT),
            ("Step 4: Connect Git Repo",
             "Choose 'Public Repository' or connect your GitHub/GitLab account.\n"
             "Paste the URL of your repository.\n"
             "Coolify will read docker-compose.yml and the Dockerfile automatically.",
             FG_ACCENT),
            ("Step 5: Set Environment Variables",
             "In the Coolify UI, go to the 'Environment' tab.\n"
             "Click 'Add Variables' and enter ALL variables from .env.example:\n"
             "  DB_USER, DB_PASS, DB_NAME, JWT_SECRET, RESEND_API_KEY,\n"
             "  EMAIL_FROM, FRONTEND_URL, ADMIN_EMAIL, ADMIN_PASSWORD\n\n"
             "IMPORTANT ones to change:\n"
             "  DB_PASS       = a strong password (anything you want)\n"
             "  JWT_SECRET    = a long random string (60+ characters)\n"
             "  ADMIN_PASSWORD = your desired admin login password\n"
             "  FRONTEND_URL  = https://your-domain.com\n"
             "  RESEND_API_KEY = your key from resend.com (optional for now)",
             FG_YELLOW),
            ("Step 6: Set Domain",
             "In the Coolify UI, go to the 'Domains' tab.\n"
             "Enter your domain name (e.g. interviewready.app)\n"
             "Make sure your domain's DNS A-record points to your server IP.\n"
             "Coolify will auto-configure Let's Encrypt SSL (HTTPS).",
             FG_TEAL),
            ("Step 7: Click Deploy!",
             "Click the 'Deploy' button in Coolify.\n"
             "Coolify will:\n"
             "  - Build the frontend (React) inside Docker\n"
             "  - Build the backend (Node.js/TypeScript) inside Docker\n"
             "  - Start PostgreSQL database\n"
             "  - Run database migrations automatically\n"
             "  - Seed the admin account automatically\n"
             "  - Start Nginx to serve the app\n"
             "  - Configure SSL (HTTPS)\n"
             "Wait 2-5 minutes for the first build. That's it!",
             FG_GREEN),
            ("Step 8: Login as Admin",
             "Visit your site: https://your-domain.com\n"
             "Click 'Sign In' and login with:\n"
             "  Email:    whatever you set as ADMIN_EMAIL\n"
             "  Password: whatever you set as ADMIN_PASSWORD\n"
             "Press Ctrl+Shift+A to open the Admin Panel.",
             FG_GREEN),
            ("Future Updates: Just Push to Git!",
             "Any time you change code and push to Git, Coolify auto-deploys.\n"
             "No manual steps needed. Just:\n"
             "  git add -A\n"
             "  git commit -m \"your change description\"\n"
             "  git push\n"
             "Coolify detects the push, rebuilds, and redeploys automatically.",
             FG_ORANGE),
        ]

        for title, desc, color in steps:
            sf = tk.Frame(inner, bg=BG_MED, padx=12, pady=8)
            sf.pack(fill="x", padx=20, pady=3)
            tk.Label(sf, text=title, font=FONT_HEADER, bg=BG_MED, fg=color,
                     anchor="w").pack(anchor="w")
            tk.Label(sf, text=desc, font=FONT_SMALL, bg=BG_MED, fg="#bbb",
                     justify="left", anchor="w").pack(anchor="w", pady=(2, 0))

    # ═══════════════════════════════════════════════════════════════════════
    # Tab 2: Local Development
    # ═══════════════════════════════════════════════════════════════════════
    def _tab_local_dev(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="  Local Dev  ")

        canvas = tk.Canvas(frame, bg=BG_DARK, highlightthickness=0)
        canvas.pack(fill="both", expand=True)
        inner = tk.Frame(canvas, bg=BG_DARK)
        canvas.create_window((0, 0), window=inner, anchor="nw")

        self._section(inner, "Frontend (React)")
        for label, cmd in [
            ("Install Dependencies", "npm install"),
            ("Start Dev Server (hot reload)", "npm run dev"),
            ("Build for Production", "npm run build"),
            ("TypeScript Check", "npx tsc -b"),
            ("Lint", "npm run lint"),
        ]:
            self._cmd_button(inner, label, cmd, str(APP_DIR))

        self._section(inner, "Backend (Node.js)")
        for label, cmd in [
            ("Install Dependencies", "npm install"),
            ("Start Dev Server (hot reload)", "npm run dev"),
            ("Compile TypeScript", "npx tsc"),
            ("TypeScript Check (no emit)", "npx tsc --noEmit"),
        ]:
            self._cmd_button(inner, label, cmd, str(SERVER_DIR))

        self._section(inner, "Full Build (both)")
        btn = tk.Button(inner, text="  Build Frontend + Backend",
                        command=self._cmd_full_build, font=FONT_UI, bg=BG_LIGHT,
                        fg=FG_ACCENT, activebackground="#4d4d6c", relief="flat",
                        anchor="w", padx=8, pady=4, cursor="hand2")
        btn.pack(fill="x", padx=20, pady=2)

    # ═══════════════════════════════════════════════════════════════════════
    # Tab 3: Docker
    # ═══════════════════════════════════════════════════════════════════════
    def _tab_docker(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="  Docker  ")

        canvas = tk.Canvas(frame, bg=BG_DARK, highlightthickness=0)
        canvas.pack(fill="both", expand=True)
        inner = tk.Frame(canvas, bg=BG_DARK)
        canvas.create_window((0, 0), window=inner, anchor="nw")

        self._section(inner, "Docker Compose (All-in-One)")
        self._section_desc(inner,
            "These commands build and run the entire app stack locally.\n"
            "Includes: PostgreSQL + App (frontend + backend + Nginx).\n"
            "With Coolify, you don't need these — Coolify handles it all.")

        for label, cmd in [
            ("Build & Start Everything", "docker compose up --build -d"),
            ("Start (already built)", "docker compose up -d"),
            ("Stop All", "docker compose down"),
            ("Stop + Delete Database Data", "docker compose down -v"),
            ("Rebuild App Only", "docker compose up --build -d app"),
            ("View Logs", "docker compose logs -f --tail=100"),
            ("Restart App", "docker compose restart app"),
            ("App Status", "docker compose ps"),
        ]:
            self._cmd_button(inner, label, cmd, str(PROJECT_DIR))

        self._section(inner, "Coolify Reference")
        for label, value in [
            ("Coolify URL", "http://YOUR_SERVER_IP:8000"),
            ("Resource Type", "Docker Compose"),
            ("Env Vars", "Coolify UI -> Environment tab"),
            ("Domain/SSL", "Coolify UI -> Domains tab"),
            ("Auto-deploy", "Connect Git repo -> enable auto-deploy"),
        ]:
            rf = tk.Frame(inner, bg=BG_MED, padx=10, pady=3)
            rf.pack(fill="x", padx=20, pady=1)
            tk.Label(rf, text=label, font=FONT_UI, bg=BG_MED, fg=FG_ACCENT,
                     width=16, anchor="w").pack(side="left")
            tk.Label(rf, text=value, font=FONT_MONO, bg=BG_MED, fg=FG_PRIMARY,
                     anchor="w").pack(side="left", fill="x", expand=True)

    # ═══════════════════════════════════════════════════════════════════════
    # Tab 4: Database
    # ═══════════════════════════════════════════════════════════════════════
    def _tab_database(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="  Database  ")

        canvas = tk.Canvas(frame, bg=BG_DARK, highlightthickness=0)
        canvas.pack(fill="both", expand=True)
        inner = tk.Frame(canvas, bg=BG_DARK)
        canvas.create_window((0, 0), window=inner, anchor="nw")

        self._section(inner, "Prisma (Local)")
        for label, cmd in [
            ("Generate Client", "npx prisma generate"),
            ("Create Migration", "npx prisma migrate dev --name init"),
            ("Deploy Migrations (prod)", "npx prisma migrate deploy"),
            ("Push Schema (no migration)", "npx prisma db push"),
            ("Seed Database", "npx tsx prisma/seed.ts"),
            ("Open Prisma Studio (GUI)", "npx prisma studio"),
            ("Reset Database (DESTROYS DATA)", "npx prisma migrate reset"),
        ]:
            self._cmd_button(inner, label, cmd, str(SERVER_DIR))

        self._section(inner, "Prisma (Docker / Coolify)")
        self._section_desc(inner, "Run these inside the running Docker container.")
        for label, cmd in [
            ("Migrate", "docker compose exec app npx prisma migrate deploy"),
            ("Seed", "docker compose exec app npx tsx prisma/seed.ts"),
            ("Prisma Studio", "docker compose exec app npx prisma studio"),
            ("PostgreSQL Shell", "docker compose exec db psql -U irapp -d interviewready"),
            ("Backup DB", "docker compose exec db pg_dump -U irapp interviewready > backup.sql"),
        ]:
            self._cmd_button(inner, label, cmd, str(PROJECT_DIR))

    # ═══════════════════════════════════════════════════════════════════════
    # Tab 5: .env Configuration
    # ═══════════════════════════════════════════════════════════════════════
    def _tab_env(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="  .env Config  ")

        top_bar = tk.Frame(frame, bg=BG_MED, padx=10, pady=6)
        top_bar.pack(fill="x")
        tk.Label(top_bar, text=f"Server .env: {SERVER_ENV_FILE}", font=FONT_MONO,
                 bg=BG_MED, fg=FG_ACCENT).pack(side="left")

        btn_frame = tk.Frame(top_bar, bg=BG_MED)
        btn_frame.pack(side="right")
        tk.Button(btn_frame, text="Open Root .env.example", font=FONT_SMALL,
                  bg=BG_LIGHT, fg=FG_TEAL, relief="flat", padx=8, cursor="hand2",
                  command=lambda: self._view_file(str(ROOT_ENV_FILE))).pack(side="right", padx=4)
        tk.Button(btn_frame, text="Save", font=FONT_UI, bg=FG_GREEN, fg=BG_DARK,
                  relief="flat", padx=12, cursor="hand2",
                  command=self._save_env).pack(side="right", padx=4)
        tk.Button(btn_frame, text="Reload", font=FONT_UI, bg=BG_LIGHT, fg=FG_PRIMARY,
                  relief="flat", padx=12, cursor="hand2",
                  command=self._load_env_preview).pack(side="right", padx=4)

        self.env_text = scrolledtext.ScrolledText(
            frame, font=FONT_MONO, bg=BG_INPUT, fg=FG_PRIMARY,
            insertbackground=FG_PRIMARY, selectbackground=FG_ACCENT,
            relief="flat", padx=10, pady=10)
        self.env_text.pack(fill="both", expand=True, padx=8, pady=(0, 4))

        hint = tk.Label(frame, font=FONT_SMALL, bg=BG_DARK, fg="#888", anchor="w",
                        text="  For Coolify: set these in the Coolify UI Environment tab instead of editing this file.")
        hint.pack(fill="x", padx=8, pady=(0, 8))

    # ═══════════════════════════════════════════════════════════════════════
    # Tab 6: Logs
    # ═══════════════════════════════════════════════════════════════════════
    def _tab_logs(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="  Logs  ")

        top_bar = tk.Frame(frame, bg=BG_MED, padx=10, pady=6)
        top_bar.pack(fill="x")
        tk.Label(top_bar, text="Command Output", font=FONT_UI, bg=BG_MED,
                 fg=FG_ACCENT).pack(side="left")
        tk.Button(top_bar, text="Clear", font=FONT_UI, bg=BG_LIGHT, fg=FG_PRIMARY,
                  relief="flat", padx=12, cursor="hand2",
                  command=lambda: self.log_output.delete("1.0", "end")).pack(side="right", padx=4)

        self.log_output = scrolledtext.ScrolledText(
            frame, font=FONT_MONO, bg=BG_INPUT, fg=FG_GREEN,
            insertbackground=FG_GREEN, relief="flat", padx=10, pady=10)
        self.log_output.pack(fill="both", expand=True, padx=8, pady=(0, 8))

    # ═══════════════════════════════════════════════════════════════════════
    # Tab 7: Credentials & Reference
    # ═══════════════════════════════════════════════════════════════════════
    def _tab_credentials(self):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text="  Credentials  ")

        canvas = tk.Canvas(frame, bg=BG_DARK, highlightthickness=0)
        canvas.pack(fill="both", expand=True)
        inner = tk.Frame(canvas, bg=BG_DARK)
        canvas.create_window((0, 0), window=inner, anchor="nw")

        # Current .env values
        self._section(inner, "Current Server .env Values")
        self._section_desc(inner, "Loaded from server/.env — sensitive values are masked.")

        if SERVER_ENV_FILE.exists():
            try:
                content = SERVER_ENV_FILE.read_text(encoding="utf-8", errors="replace")
                for line in content.strip().split("\n"):
                    if line.strip() and not line.startswith("#"):
                        parts = line.split("=", 1)
                        if len(parts) == 2:
                            key, val = parts[0].strip(), parts[1].strip()
                            sensitive = any(s in key.upper() for s in ["PASSWORD", "SECRET", "KEY", "PASS"])
                            display = "........" if sensitive and val else val
                            rf = tk.Frame(inner, bg=BG_MED, padx=10, pady=3)
                            rf.pack(fill="x", padx=20, pady=1)
                            tk.Label(rf, text=key, font=FONT_MONO, bg=BG_MED,
                                     fg=FG_ACCENT, width=28, anchor="w").pack(side="left")
                            tk.Label(rf, text=display, font=FONT_MONO, bg=BG_MED,
                                     fg=FG_PRIMARY, anchor="w").pack(side="left", fill="x", expand=True)
            except Exception:
                tk.Label(inner, text="Could not read .env", font=FONT_UI,
                         bg=BG_DARK, fg=FG_RED).pack(padx=20, pady=10)
        else:
            tk.Label(inner, text="No server/.env file found", font=FONT_UI,
                     bg=BG_DARK, fg=FG_YELLOW).pack(padx=20, pady=10)

        # Important URLs
        self._section(inner, "Important URLs")
        for label, url in [
            ("Coolify Dashboard", "http://YOUR_SERVER_IP:8000"),
            ("Resend (email API)", "https://resend.com"),
            ("Prisma Studio", "http://localhost:5555"),
            ("Frontend (local dev)", "http://localhost:5173"),
            ("API health (local dev)", "http://localhost:3001/api/health"),
            ("Your Site (production)", "https://your-domain.com"),
        ]:
            rf = tk.Frame(inner, bg=BG_MED, padx=10, pady=3)
            rf.pack(fill="x", padx=20, pady=1)
            tk.Label(rf, text=label, font=FONT_UI, bg=BG_MED, fg=FG_ACCENT,
                     width=22, anchor="w").pack(side="left")
            lbl = tk.Label(rf, text=url, font=FONT_MONO, bg=BG_MED, fg=FG_TEAL,
                           anchor="w", cursor="hand2")
            lbl.pack(side="left", fill="x", expand=True)
            lbl.bind("<Button-1>", lambda e, u=url: webbrowser.open(u))

        # File structure
        self._section(inner, "What Gets Built Inside Docker")
        self._section_desc(inner,
            "You don't need to build anything locally.\n"
            "The Dockerfile does it all automatically when Coolify deploys:")
        for line in [
            "Stage 1: npm install + npm run build  ->  React frontend (HTML/CSS/JS)",
            "Stage 2: npm install + npx tsc         ->  Node.js backend (JavaScript)",
            "Stage 3: Nginx + Node.js + frontend    ->  One container, port 80",
            "On startup: prisma migrate deploy      ->  Database tables created",
            "On startup: prisma/seed.ts             ->  Admin account created",
            "Result: https://your-domain.com just works",
        ]:
            tk.Label(inner, text=f"  {line}", font=FONT_SMALL, bg=BG_DARK,
                     fg=FG_PRIMARY, anchor="w").pack(fill="x", padx=20, pady=1)

    # ═══════════════════════════════════════════════════════════════════════
    # UI Helpers
    # ═══════════════════════════════════════════════════════════════════════
    def _section(self, parent, title):
        tk.Label(parent, text=f"  {title}", font=FONT_HEADER, bg=BG_DARK,
                 fg=FG_ACCENT, anchor="w").pack(fill="x", padx=12, pady=(12, 2))

    def _section_desc(self, parent, text):
        tk.Label(parent, text=text, font=FONT_SMALL, bg=BG_DARK, fg="#888",
                 justify="left", anchor="w").pack(fill="x", padx=20, pady=(0, 6))

    def _cmd_button(self, parent, label, cmd, workdir):
        tk.Button(parent, text=f"  {label}",
                  command=lambda c=cmd, w=workdir: self._run_cmd(c, w),
                  font=FONT_UI, bg=BG_LIGHT, fg=FG_PRIMARY,
                  activebackground="#4d4d6c", activeforeground="white",
                  relief="flat", anchor="w", padx=8, pady=4,
                  cursor="hand2").pack(fill="x", padx=20, pady=2)

    # ═══════════════════════════════════════════════════════════════════════
    # Command Execution
    # ═══════════════════════════════════════════════════════════════════════
    def _run_cmd(self, cmd, workdir):
        self.notebook.select(5)  # Switch to Logs tab
        self._log(f"\n{'='*60}")
        self._log(f"$ {cmd}")
        self._log(f"  (dir: {workdir})")
        self._log(f"{'='*60}\n")
        self.status_label.config(text=f"  Running: {cmd[:50]}...", fg=FG_YELLOW)

        def execute():
            try:
                is_windows = sys.platform == "win32"
                result = subprocess.run(
                    cmd if is_windows else ["bash", "-c", cmd],
                    shell=is_windows, capture_output=True, text=True,
                    cwd=workdir, timeout=300,
                    env={**os.environ, "FORCE_COLOR": "0", "NO_COLOR": "1"})
                if result.stdout:
                    self._log(result.stdout)
                if result.stderr:
                    self._log(result.stderr, error=True)
                if result.returncode == 0:
                    self._log("\n  Done.\n")
                    self.status_label.config(text="  Ready", fg=FG_GREEN)
                else:
                    self._log(f"\n  Exit code: {result.returncode}\n", error=True)
                    self.status_label.config(text=f"  Failed (exit {result.returncode})", fg=FG_RED)
            except subprocess.TimeoutExpired:
                self._log("\n  Command timed out (5 min)\n", error=True)
                self.status_label.config(text="  Timeout", fg=FG_RED)
            except Exception as e:
                self._log(f"\n  Error: {e}\n", error=True)
                self.status_label.config(text=f"  Error: {str(e)[:40]}", fg=FG_RED)

        threading.Thread(target=execute, daemon=True).start()

    def _log(self, text, error=False):
        self.log_output.config(state="normal")
        self.log_output.insert("end", text)
        self.log_output.see("end")

    # ═══════════════════════════════════════════════════════════════════════
    # Quick Actions
    # ═══════════════════════════════════════════════════════════════════════
    def _cmd_build_frontend(self):
        self._run_cmd("npm run build", str(APP_DIR))

    def _cmd_build_backend(self):
        self._run_cmd("npx tsc", str(SERVER_DIR))

    def _cmd_dev_server(self):
        self._run_cmd("npm run dev", str(APP_DIR))

    def _cmd_docker_up(self):
        self._run_cmd("docker compose up --build -d", str(PROJECT_DIR))

    def _cmd_docker_down(self):
        self._run_cmd("docker compose down", str(PROJECT_DIR))

    def _cmd_full_build(self):
        self._run_cmd("npm run build", str(APP_DIR))
        self._run_cmd("npx tsc", str(SERVER_DIR))

    def _open_coolify(self):
        webbrowser.open("http://localhost:8000")

    def _open_browser(self):
        webbrowser.open("http://localhost:5173")

    # ═══════════════════════════════════════════════════════════════════════
    # .env Management
    # ═══════════════════════════════════════════════════════════════════════
    def _load_env_preview(self):
        if not hasattr(self, "env_text"):
            return
        if SERVER_ENV_FILE.exists():
            try:
                content = SERVER_ENV_FILE.read_text(encoding="utf-8", errors="replace")
                self.env_text.delete("1.0", "end")
                self.env_text.insert("1.0", content)
            except Exception as e:
                self.env_text.delete("1.0", "end")
                self.env_text.insert("1.0", f"Error reading .env: {e}")
        else:
            self.env_text.delete("1.0", "end")
            self.env_text.insert("1.0", "# No server/.env found.\n# For Coolify: set env vars in the Coolify UI instead.")

    def _save_env(self):
        content = self.env_text.get("1.0", "end")
        try:
            SERVER_ENV_FILE.write_text(content, encoding="utf-8")
            self.status_label.config(text="  .env saved!", fg=FG_GREEN)
            messagebox.showinfo("Saved", f"Saved to:\n{SERVER_ENV_FILE}")
        except Exception as e:
            messagebox.showerror("Error", f"Could not save:\n{e}")

    # ═══════════════════════════════════════════════════════════════════════
    # File Viewer
    # ═══════════════════════════════════════════════════════════════════════
    def _view_file(self, path):
        try:
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            win = tk.Toplevel(self)
            win.title(os.path.basename(path))
            win.geometry("800x600")
            win.configure(bg=BG_DARK)
            txt = scrolledtext.ScrolledText(win, font=FONT_MONO, bg=BG_INPUT,
                                            fg=FG_PRIMARY, insertbackground=FG_PRIMARY,
                                            relief="flat", padx=10, pady=10)
            txt.pack(fill="both", expand=True)
            txt.insert("1.0", content)
            txt.config(state="disabled")
        except Exception as e:
            messagebox.showerror("Error", f"Could not open file:\n{e}")

    def _copy_to_clipboard(self, text):
        self.clipboard_clear()
        self.clipboard_append(text)
        self.status_label.config(text="  Copied to clipboard!", fg=FG_GREEN)

    def _update_clock(self):
        self.time_label.config(text=datetime.now().strftime("  %H:%M:%S"))
        self.after(1000, self._update_clock)


if __name__ == "__main__":
    app = ControlPanel()
    app.mainloop()
