# KIMUNA — QUALITY WELDING AND METAL SERVICES

Modern, fully responsive company website for **KIMUNA** (Diika Road, Bweyale Town Council,
Kiryandongo District, Uganda) — blue + white "peace" theme, EN | SW language toggle, furniture
catalogue and a full admin dashboard.

---

## 1 · Stack

| Layer     | Tech |
|-----------|------|
| App       | React 19 + Vite 7 + TypeScript |
| Routing   | React Router (HashRouter — works on any static host; swap to `BrowserRouter` if your host has SPA fallback) |
| Styling   | Tailwind CSS v4 (`src/index.css` design tokens) |
| Motion    | Framer Motion |
| i18n      | react-i18next (`src/locales/en.json`, `src/locales/sw.json`) |
| Icons     | lucide-react |
| Backend   | Node + Express + Supabase (PostgreSQL) + JWT + bcrypt — **`/server`** |

---

## 2 · Project structure

```
.
├── index.html                 SEO meta, Open Graph, hreflang, LocalBusiness JSON-LD, fonts
├── public/images/*.jpg        Generated placeholder photography (replace with your own)
├── src/
│   ├── App.tsx                Router, page transitions, FABs, theme/lang bootstrap
│   ├── i18n.ts                react-i18next setup, localStorage + <html lang>
│   ├── index.css              Design tokens (colors, type, glass, blueprint, grain)
│   ├── locales/en.json | sw.json
│   ├── lib/
│   │   ├── db.ts              Data layer (mirrors the REST API 1:1) + types + CSV helpers
│   │   └── hooks.ts           theme, scroll, media query, reduced motion, count-up
│   ├── components/            Navbar, Hero, About, Services, WhyUs, Gallery,
│   │                          Training, Testimonials, Contact, Footer, ui.tsx
│   ├── pages/Home.tsx         Full landing page (all sections)
│   ├── pages/Catalogue.tsx    Public furniture catalogue (Order via WhatsApp)
│   └── admin/                 AdminApp (login + shell), Panels, Managers, ui
└── server/                    Express API + schema.sql + .env.example
```

**Reusable components:** `Navbar`, `Hero`, `ServiceCard` (in `Services`), `ProjectCard` (exported
from `Gallery`), `Counter`, `Testimonial` carousel, `ContactForm` (in `Contact`), `Footer`,
plus primitives in `components/ui.tsx` (`Btn`, `Reveal`, `SectionHead`, `Logo`, `SparkCanvas`).

---

## 3 · Setup

```bash
# frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # → dist/
npm run preview

# backend (separate terminal)
cd server
npm install
cp .env.example .env     # fill in Supabase + SMTP + JWT values
# run server/schema.sql in the Supabase SQL editor
npm run dev              # http://localhost:4000
```

### Admin login (demo build)
`admin@kimuna.ug` · `kimuna@2026` — session lasts 30 minutes with an on-screen expiry bar and
automatic logout; 5 failed attempts lock the form for 30 seconds (rate limiting mirrors
`express-rate-limit` in `server/index.js`).

### Connecting the frontend to the API
Create `.env` in the project root:

```
VITE_API_URL=http://localhost:4000
```

`Contact.tsx` then POSTs to `${VITE_API_URL}/api/quotes` (the server saves to Supabase **and**
emails `kqualityw@gmail.com`). Public reads map to `GET /api/projects`, `/api/products`,
`/api/testimonials`, `/api/settings` — replace the corresponding functions in `src/lib/db.ts`
with `fetch` calls; every function already has the same shape as its endpoint.

---

## 4 · Design system (ui-ux-pro-max-skill approach)

* **Tokens** in `src/index.css` `@theme`: `blue #1E5AA8`, `sky #4DA3FF`, `ice #F2F7FD`,
  `ink #0B2545`, `spark #FF8A1F` (CTA + welding-spark detail only), `deep #071A33` (dark mode).
* **Type scale** — Poppins (display) / Inter (body) / JetBrains Mono (`.spec-label` tracked
  small-caps), ratio ≈ 1.25 via `clamp()`.
* **Spacing rhythm** — 8px base; sections `py-24 → sm:py-32`; container `max-w-[1400px]`,
  gutters `px-5 → sm:px-8`.
* **Hierarchy device** — every section opens with `NN — LABEL` + hairline rule (spec-sheet
  header) on an asymmetric 5/7 or 4/8 split; the Why-Us rail is sticky.
* **Accessibility** — WCAG AA contrast, visible `:focus-visible` ring, skip link, ARIA labels on
  every icon button, keyboard-closable modals (Esc) and lightbox (←/→), `prefers-reduced-motion`
  disables the spark canvas and counters.
* **Motion** — Framer Motion scroll reveals (once), spring nav underline, modal/list springs,
  `scale-x` accent rules on hover.

---

## 5 · Deployment

**Frontend — Netlify or Vercel**
* Build command `npm run build`, publish directory `dist`.
* Netlify: add a redirect so deep links resolve — `public/_redirects` → `/*  /index.html  200`
  (not needed with HashRouter).
* Set `VITE_API_URL` in the host env vars, then redeploy.

**Backend — Render or Railway**
* New → Web Service → root `server/` → build `npm install` → start `npm start`.
* Add every key from `server/.env.example`; set `CLIENT_ORIGIN` to the deployed site URL.
* Supabase: run `server/schema.sql`, create the public `kimuna-media` bucket for uploads.
* Health check path: `/health`.

---

## 6 · Notes

* **Images:** placeholder photography lives in `public/images/` and is referenced with relative
  paths — swap the files (same names) to rebrand instantly.
* **Language:** the slogan `QUALITY WELDING AND METAL SERVICES` stays in capitals in both
  languages; company name, phone numbers and email are never translated.
* `hreflang` for `en`/`sw` plus Open Graph/Twitter cards are in `index.html`.
