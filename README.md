# On-Call Dashboard Starter

[![Deploy to Vercel](https://github.com/adzryAI/oncall-dashboard-starter/actions/workflows/deploy.yml/badge.svg)](https://github.com/adzryAI/oncall-dashboard-starter/actions)
[![Vercel Status](https://img.shields.io/badge/Vercel-Deployed-brightgreen?logo=vercel)](https://oncall-dashboard-starter.vercel.app)

---

## ⚙️ CI/CD: Next.js + Vercel

This project is set up with **GitHub Actions** and **Vercel** for continuous deployment.

### 🔑 Secrets & Environment Variables
- **GitHub Secret**  
  - `VERCEL_TOKEN` → Required. Generate from [Vercel Tokens](https://vercel.com/account/tokens) and add in GitHub → Settings → Secrets → Actions.  
- **Vercel Environment Variables**  
  - `CHAT_ENDPOINT` → URL of the deployed Google Apps Script chat backend.  
  - `SHEET_ID` → Google Sheet ID for on-call schedule data.  
  - `GID` → Tab GID inside the sheet.  
  Configure these under Vercel Project → Settings → Environment Variables.

### 🔄 Workflow Behavior
- **Push to `main`** → Automatically builds and deploys to **production** at
