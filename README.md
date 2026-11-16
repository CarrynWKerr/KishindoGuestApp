# Kishindo Conservation Reserve — Guest Concierge App

Custom guest information and pre-arrival concierge web app built specifically for **Kishindo Conservation Reserve** (Free State, South Africa).

Faithfully styled after the official **Kishindo 2026–2027 Rack Rate Card** and **kishindowild.com**:
- **Palette**: Clean gallery white (`#FAF9F6`), Rate Card table header sand/taupe (`#E6E1D8`), sunset ochre sun disc (`#D37233`), African slate text (`#1F2421`), and Karoo sage (`#6E7860`).
- **Typography**: Refined Cormorant Garamond editorial serif italics paired with modern geometric Montserrat.
- **Suites**:
  - **Tibo (Suite 1)** — Wrap-around sun deck, daybed & private lounge.
  - **Ussuri (Suite 2)** — Canyon overhanging balcony, outdoor & indoor shower, daybed lounge.
  - **Zaria (Suite 3)** — Most secluded suite, private rockery, canyon overhang, outdoor & indoor shower.
- **Database**: Zero-dependency Firebase Firestore client SDK with instant offline/local fallback.
- **Exports & Downloads**:
  - **Download CSV**: Instant Excel/CSV export of all bookings and guest submissions.
  - **Download JSON**: Full data backup.
  - **Print / Save as PDF**: Beautiful print media stylesheet matching the Rate Card.
  - **1-Click Copy Operations Summary**: Formatted exactly for WhatsApp and lodge handover.
  - **1-Click Copy Outlook Email**: Pre-deposit & Post-deposit templates (auto-adjusts between Agent and Direct).

---

## 🚀 Free Deployment Guide (Cloudflare Pages or Firebase)

### Option 1: Cloudflare Pages (Recommended — Drag & Drop, 100% Free)

No command line, no Git required, and zero hosting costs.

1. Sign up / Log in to [Cloudflare](https://pages.cloudflare.com) (free account).
2. Go to **Workers & Pages** → **Create application** → **Pages** → **Upload assets**.
3. Project name: `kishindo-guests` (or your choice).
4. Drag and drop the `kishindo-guest-app` folder directly into the browser.
5. Click **Deploy site**.
6. **Done!** Cloudflare provides a free, instant SSL link:
   👉 `https://kishindo-guests.pages.dev`

---

### Option 2: Firebase Hosting (100% Free)

1. Sign up / Log in to [Firebase Console](https://console.firebase.google.com).
2. Click **Create a project** → Name: `kishindo-reserve`.
3. In the project dashboard, click **Build** → **Firestore Database** → **Create database** (Start in Test mode or production mode).
4. Click **Project Settings** (gear icon) → **Add App** (select Web `</>`).
5. Copy the configuration object and paste it into `firebase-config.js`.
6. To deploy via terminal:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only hosting
   ```
7. Firebase provides a free URL:
   👉 `https://kishindo-reserve.web.app`

---

## 🔑 Default Access Details

- **Guest Access**:
  - Try demo PIN: `4821` (Suite Ussuri, Booking NBID `116057573`)
- **Lodge Staff Access**:
  - Switch tab to **Lodge Anchor**
  - Staff PIN: `1234`
