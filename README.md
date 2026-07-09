# Smart Quote Assistant

A config-driven local service marketplace, in the style of Thumbtack / Angi / Bark.
HVAC is the first enabled industry — adding a new industry or city is done by
adding a JSON file, not by writing new components.

## Architecture at a glance

- **React + Vite + Tailwind**, deployed on **Netlify** with **Netlify Functions**.
- **One landing page component** (`src/pages/LandingPage.jsx`) renders every
  `city + industry` combination, e.g. `/folsom-hvac`, `/sacramento-hvac`.
- **One quote engine component** (`src/components/QuoteEngine.jsx`) renders
  both the lead intake form and the feedback form from config — it supports
  radio, checkbox, multi-select, dropdown, text, textarea, phone, email,
  number, date, boolean, and rating fields, plus conditional questions and a
  progress bar.
- **Industry configs** live in `src/config/industries/*.json`. Each file
  defines the industry's hero copy, questions, FAQs, trust badges, SEO
  templates, lead scoring rules, feedback questions, follow-up message
  template, email templates, and business onboarding fields.
- **City configs** live in `src/config/cities/*.json`.
- **Themes** (`src/config/themes.js`) are switchable per industry via a
  `theme` field in the industry config (`modern`, `minimal`, `professional`,
  `dark`, `blue`, `green`).
- **Storage** uses one Google Sheet with a `Leads` tab and a `Businesses` tab.
  Both are intentionally generic/industry-agnostic: a lead's specific answers
  are stored as a JSON blob (`answersJson`) rather than fixed columns, which
  is what lets a brand-new industry work without any spreadsheet migration.
- **Admin settings** (enable/disable industries or cities, reorder the
  homepage, edit hero copy/CTA/FAQs) are stored as a small JSON "overrides"
  document in a `Settings` tab and merged over the static JSON config at
  request time — so those changes take effect without a redeploy.

### Adding a new industry

1. Copy `src/config/industries/hvac.json` to e.g. `plumbing.json`.
2. Update every field (id, slug, hero, questions, FAQs, etc).
3. Deploy. The landing page engine, quote engine, admin dashboard, and
   Netlify functions all pick it up automatically — no component changes.

### Adding a new city

1. Copy `src/config/cities/folsom.json` to e.g. `davis.json` and fill it in.
2. Deploy. `/davis-hvac` (and any other enabled industry) now works.

## Project structure

```
src/
  components/     Header, Footer, QuoteEngine, StatusBadge, AdminNav
  config/
    industries/   One JSON file per industry + a registry (index.js)
    cities/       One JSON file per city + a registry (index.js)
    themes.js     Theme presets (static Tailwind class tokens)
  hooks/          useOverrides (fetches runtime admin overrides)
  lib/            api client, validators, SEO helper, site-config merge logic
  pages/          Public pages + admin/ subfolder for the admin dashboard
netlify/
  functions/      One file per HTTP endpoint (see below)
  lib/            Shared server-side helpers (auth, sheets, email, rate limiting)
scripts/
  generate-sitemap.mjs   Build-time sitemap.xml + robots.txt generator
```

## Netlify Functions

| Function | Method | Purpose |
|---|---|---|
| `submit-lead` | POST | Public. Validates + scores + stores a lead, sends notification email. |
| `feedback-context` | GET | Public. Validates a feedback link and returns only the minimal info needed to render the right form (no full lead data). |
| `submit-feedback` | POST | Public. Validates a feedback link + stores the response. |
| `admin-login` | POST | Returns a signed, expiring admin session token. |
| `admin-leads` | GET | Lists/filters leads, or fetches one by `leadId`. |
| `update-lead-status` | POST | Updates status, assigned business, and internal notes. |
| `create-feedback-token` | POST | Generates a secure feedback link for a lead. |
| `export-leads` | GET | Returns a CSV of all leads. |
| `admin-businesses` | GET/POST | Lists and creates/updates businesses (partners). |
| `site-config` | GET | Public. Returns the current admin overrides (toggles, hero edits). |
| `admin-site-config` | GET/POST | Reads/writes the admin overrides document. |

All admin endpoints require `Authorization: Bearer <token>` from `admin-login`.

## Security

- No API keys or secrets in frontend code — all Sheets/email calls happen in
  Netlify Functions.
- Server-side validation and sanitization of every field (`src/lib/validators.js`),
  shared by both the public lead form and the feedback form.
- Honeypot field (`website`) on the public lead form.
- Best-effort in-memory rate limiting and duplicate-submission blocking per
  Netlify function instance (see the note in `netlify/lib/rateLimit.js` — for
  a strict cross-instance limit, back this with a persistent store such as
  Upstash Redis).
- Admin session tokens are HMAC-signed and expire after 8 hours; the secret is
  derived from `ADMIN_PASSWORD` so no separate secret needs to be managed.
- Feedback links use a cryptographically random token tied to a specific
  `leadId`, expire after 14 days, and only ever return the minimal fields
  needed to render the feedback form.
- Security headers and a Content-Security-Policy are set in `netlify.toml`.
- Only `POST` is accepted on write endpoints; all others return 405.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` (see below), then:

```bash
npm run dev          # frontend only, http://localhost:5173
npm run functions:dev  # frontend + functions via Netlify CLI, http://localhost:8888
```

### Environment variables

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Password for `/admin/login`. Also used to derive the token-signing secret. |
| `GOOGLE_SHEET_ID` | The spreadsheet ID (from its URL). |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email with Editor access to the sheet. |
| `GOOGLE_PRIVATE_KEY` | Service account private key. Keep the `\n` escapes as-is; the app un-escapes them. |
| `RESEND_API_KEY` | API key from resend.com. Optional — lead capture still works without it. |
| `LEAD_NOTIFY_EMAIL` | Where new-lead notifications are sent. |
| `FROM_EMAIL` | Verified sender address in Resend. |
| `ALLOWED_ORIGIN` | Your deployed site origin, for CORS on the functions. |

### Google Sheets setup

1. Create a Google Cloud project, enable the Google Sheets API.
2. Create a service account, generate a JSON key.
3. Create a blank Google Sheet, share it with the service account email
   (Editor access).
4. Copy the Sheet ID from its URL into `GOOGLE_SHEET_ID`.
5. Copy the service account's `client_email` and `private_key` into
   `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`.
6. The `Leads`, `Businesses`, and `Settings` tabs (with headers) are created
   automatically on first use — no manual setup needed.

## Deployment (Netlify)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project**.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Add all environment variables from `.env.example` under
   **Site settings → Environment variables**.
5. Deploy. Netlify Functions are picked up automatically from
   `netlify/functions`.

## Testing the flows

**Lead submission:** visit `/sacramento-hvac`, fill out the form, submit. You
should land on `/thank-you/HVAC-XXXXXX` and see a new row in the `Leads` tab
of your Google Sheet.

**Admin:** visit `/admin/login`, sign in with `ADMIN_PASSWORD`. From
`/admin` you can open a lead, generate a feedback link, and copy the
follow-up message.

**Feedback:** open the generated feedback link
(`/feedback/<leadId>/<token>`), submit a rating. The lead's status should
move to "Feedback Received" and the response appears on the lead detail page.

**Settings:** from `/admin/settings`, try disabling a city or reordering
industries, then reload the homepage to confirm it reflects immediately.

## What's intentionally not built yet

Per the brief, these are prepared for architecturally but not implemented:
SMS, Stripe/billing, pay-per-lead, automated lead routing, appointment
booking, AI summaries/scoring, CRM integrations, voice AI. The generic
`Leads`/`Businesses` schema and the config-driven industry model are designed
so none of these require a schema rewrite when they're built.

## Known limitations (MVP scope)

- Rate limiting and duplicate-submission blocking are per-instance
  (in-memory), not global — fine for launch traffic, worth upgrading to a
  shared store before high volume.
- This is a client-rendered SPA; the sitemap is generated at build time
  from the same config files, but pages are not server-rendered, so
  schema.org structured data and pre-rendered meta tags for crawlers that
  don't execute JavaScript are a good next step (e.g. via prerendering or
  a small SSR layer) if organic SEO becomes a priority.
