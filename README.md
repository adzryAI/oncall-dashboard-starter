# On‑Call Dashboard — React/Next.js Starter (Apple Minimalism)

Production-ready starter that includes:
- Apple-inspired white minimalist UI (TailwindCSS)
- Google Sheets on‑call table + filters + insights panel
- Chatbox “On‑Call Pilot” wired to your Apps Script backend (memory + self-upgrade)
- PWA manifest, SEO meta, clean structure

## Quick Start
```bash
npm install
cp .env.example .env.local
# edit .env.local
npm run dev
```

Open http://localhost:3000/dashboard

## Configure
- Put your Google Sheet ID and GID in `lib/config.ts`
- Set `CHAT_ENDPOINT` in `.env.local` (Apps Script Web App URL)

## Deploy
- Vercel (recommended): push to GitHub, import to Vercel
