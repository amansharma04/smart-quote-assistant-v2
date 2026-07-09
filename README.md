# Smart Quote Assistant

A multi-tenant SaaS quote assistant for local service businesses. Each business
gets its own dedicated quote page (e.g. `/calpro`, `/abc-heating`) where their
customers request service directly from them — this is not a marketplace;
there's no routing, matching, or "network" of businesses. One codebase serves
unlimited business clients, and adding a new one requires no code change or
redeploy — it's done entirely through `/admin/clients`.

## Architecture at a glance

- **React + Vite + Tailwind**, deployed on **Netlify** with **Netlify Functions**.
- **One quote-page component** (`src/pages/ClientPage.jsx`) renders every
  business's dedicated page at `/:clientSlug`, branded with that business's
  own name, logo, and color.
- **One quote engine component** (`src/components/QuoteEngine.jsx`) renders
  the question flow from config — radio, checkbox, multi-select, dropdown,
  text, textarea, phone, email, number, date, boolean, and rating fields,
  conditional questions, and a progress bar.
- **Industry templates** (`src/config/industries/*.json`) define a reusable
  question set, FAQs, lead-scoring rules, feedback questions, and email copy
  for a vertical (HVAC to start). A client picks one template and can layer
  their own custom questions on top.
- **Clients are data, not code.** Every business client (name, logo, brand
  color, services, custom questions, notification email, phone, website,
  service area, headline/CTA overrides, live/disabled) lives in a `Clients`
  tab in Google Sheets, managed entirely from `/admin/clients`. The one
  exception is the `demo-hvac` client, kept as a static config file so
  "View Live Demo" always works even on a brand-new deployment with an empty
  sheet.
- **Leads are generic.** A lead's specific answers are stored as a JSON blob
  (`answersJson`) rather than fixed columns, so a client's custom questions
  or a brand-new industry template both work without any spreadsheet
  migration.
- **Source tracking.** Every quote link can carry a `?source=` parameter
  (`website`, `instagram`, `facebook`, `google-business`, `qr`, `email`,
  `sms`), which is stored on the lead. `/admin/clients/:id/links` generates
  all of these per client, plus a QR code and an embeddable `<iframe>` snippet.

### Adding a new business client

No code, no deploy — go to `/admin/clients` → **Add client** → fill in the
business name, pick an industry template, set a slug, and save. Their page is
live immediately at `/that-slug`.

### Adding a new industry template

1. Copy `src/config/industries/hvac.json` to e.g. `plumbing.json`.
2. Update its `id`, question set, FAQs, scoring rules, and email copy.
3. Deploy. It's now selectable as a template for any client — no other code
   changes needed.

## Project structure

```
src/
  components/       Header, Footer, QuoteEngine, StatusBadge, AdminNav
  config/
    industries/     One JSON file per industry template + a registry (index.js)
    clients/        Only the static demo client(s) — real clients live in Sheets
  lib/               api client, validators, client+template merge logic, SEO helper
  pages/             Public pages (Home, ClientPage, ThankYou, Feedback, ...)
                     + admin/ subfolder for the admin dashboard
netlify/
  functions/         One file per HTTP endpoint (see below)
  lib/               Shared server-side helpers (auth, sheets, email, rate limiting)
scripts/
  generate-sitemap.mjs   Build-time sitemap.xml + robots.txt generator
```

## Netlify Functions

| Function | Method | Purpose |
|---|---|---|
| `get-client` | GET | Public. Resolves a client + its industry template into the page config the quote form renders from. |
| `submit-lead` | POST | Public. Validates + scores + stores a lead against a specific client, sends them a notification email. |
| `feedback-context` | GET | Public. Validates a feedback link and returns only the minimal info needed to render the right form. |
| `submit-feedback` | POST | Public. Validates a feedback link + stores the response. |
| `admin-login` | POST | Returns a signed, expiring admin session token. |
| `admin-leads` | GET | Lists/filters leads (by client, status), or fetches one by `leadId`. |
| `update-lead-status` | POST | Updates status and internal notes. |
| `create-feedback-token` | POST | Generates a secure feedback link for a lead. |
| `export-leads` | GET | Returns a CSV of all leads. |
| `admin-clients` | GET/POST | Lists and creates/updates business clients. |

All admin endpoints require `Authorization: Bearer <token>` from `admin-login`.

## Security

- No API keys or secrets in frontend code — all Sheets/email calls happen in
  Netlify Functions.
- Server-side validation and sanitization of every field (`src/lib/validators.js`),
  shared by the public lead form and the feedback form.
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
- Client slugs are restricted to lowercase letters, numbers, and hyphens, and
  checked for uniqueness on every create/update.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` (see below), then:

```bash
npm run dev            # frontend only, http://localhost:5173
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
| `FROM_EMAIL` | Verified sender address in Resend. |
| `ALLOWED_ORIGIN` | Your deployed site origin, for CORS on the functions. |

Each client's own notification email is set per-client in `/admin/clients`,
not as an environment variable — every business gets their leads emailed to
their own address.

### Google Sheets setup

1. Create a Google Cloud project, enable the Google Sheets API.
2. Create a service account, generate a JSON key.
3. Create a blank Google Sheet, share it with the service account email
   (Editor access).
4. Copy the Sheet ID from its URL into `GOOGLE_SHEET_ID`.
5. Copy the service account's `client_email` and `private_key` into
   `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`.
6. The `Clients` and `Leads` tabs (with headers) are created automatically on
   first use — no manual setup needed.

## Deployment (Netlify)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project**.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Add all environment variables from `.env.example` under
   **Site settings → Environment variables**.
5. Deploy. Netlify Functions are picked up automatically from
   `netlify/functions`.

## Testing the flows

**Live demo:** visit `/demo-hvac` — a fully working example client
("Premier Heating & Air") that always works, even before you've created any
real clients.

**Add a real client:** `/admin/login` → `/admin/clients` → **Add client**.
Fill in the business name, slug, industry template, and notification email,
save, then visit `/that-slug`.

**Lead submission:** fill out a client's form and submit. You should land on
`/thank-you/HVAC-XXXXXX` and see a new row in the `Leads` tab, with the
correct `clientSlug` and `source`.

**Source-tracked links + QR:** from `/admin/clients`, click **Links & QR
code** on any client to get their per-source links, a downloadable QR code,
and an embeddable `<iframe>` snippet.

**Feedback:** from a lead's detail page, generate a feedback link and open
it — submitting moves the lead's status to "Feedback Received."

## What's intentionally not built yet

Per the brief, these are prepared for architecturally but not implemented:
SMS, Stripe/billing, pay-per-lead, appointment booking, AI summaries/scoring,
CRM integrations, voice AI. The generic `Leads`/`Clients` schema is designed
so none of these require a schema rewrite when they're built.

## Known limitations (MVP scope)

- Rate limiting and duplicate-submission blocking are per-instance
  (in-memory), not global — fine for launch traffic, worth upgrading to a
  shared store before high volume.
- This is a client-rendered SPA. The build-time sitemap only includes static
  pages and any demo clients, since real clients are created at runtime and
  aren't known at build time. If organic SEO for individual client pages
  matters, consider a small script that pulls live client slugs from the
  sheet and regenerates the sitemap on a schedule, or move to prerendering/SSR.
- The custom-questions builder in `/admin/clients` supports common field
  types (text, textarea, dropdown, phone, email, number, date) but not
  conditional logic between a client's own custom questions — conditional
  questions are supported by the underlying engine, just not exposed in that
  builder UI yet.
