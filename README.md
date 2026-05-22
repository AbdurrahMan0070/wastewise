# WasteWise — Dispose Smarter
> Built for ALGOfest 2026 · Sustainable Technology Track

A community-powered waste disposal guide. Scan any item, learn exactly how to dispose of it, find the nearest recycling facility, earn points, and track your environmental impact — all in real time.

---

## No API Keys. No Limits. Free Forever.

- **Supabase** — free tier, 500MB database, real-time updates, unlimited requests
- **OpenStreetMap + Leaflet** — free maps, no key needed
- **Netlify** — free hosting, instant deploy
- **Zero backend** — Supabase handles everything

---

## Features

- **Smart Search** — search any item by name or barcode
- **Disposal Guide** — exact instructions per item (bin color, facility type, tips)
- **Community Tagging** — item not found? Tag it and earn 5 points
- **Live Map** — nearest recycling, e-waste, hazardous, compost facilities
- **Leaderboard** — real-time global rankings
- **Personal Dashboard** — points, CO₂ saved, badges, progress
- **No login** — username stored locally, works instantly
- **Works offline** — demo items load without internet

---

## Setup in 10 Minutes

### Step 1 — Create free Supabase project
1. Go to **supabase.com** → New Project
2. Note your **Project URL** and **anon/public key** from Settings → API

### Step 2 — Create database tables
Go to Supabase → **SQL Editor** → paste and run the SQL from `src/lib/supabase.js` (the big comment block at the top)

### Step 3 — Set environment variables
```bash
cp .env.example .env
```
Fill in your Supabase URL and anon key.

### Step 4 — Run locally
```bash
npm install
npm run dev
```
Open **http://localhost:5173**

---

## Deploy on Netlify (Free, 2 minutes)

1. Push to GitHub
2. Go to **netlify.com** → Add new site → Import from GitHub
3. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy** — done!

---

## Hackathon Demo Script

**Open with:**
> *"Every year, 2 billion tonnes of waste is mismanaged globally — not because people don't care, but because they don't know. Which bin does a battery go in? Where's the nearest e-waste facility? WasteWise answers that in one search."*

1. Open the site — judges see the onboarding (takes 10 seconds)
2. Type "battery" in the search bar — result appears instantly
3. Show the disposal guide — plain English, no jargon
4. Open the Map tab — facilities pinned on a live map
5. Go to Leaderboard — real people, real scores, live data
6. Dashboard — show CO₂ saved, badges, personal impact

**Close with:**
> *"The more people use WasteWise, the smarter it gets. Every tag, every scan, every correct disposal — it all compounds. This is what community-powered sustainability looks like."*

---

## Tech Stack
- React 18 + Vite
- Supabase (real-time database, free)
- Leaflet + OpenStreetMap (free maps)
- Lucide React (icons)
- Netlify (free hosting)
- Pure CSS with custom properties
