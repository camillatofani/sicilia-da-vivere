# Sicilia, da vivere

A technical demo of a tourist-experience booking flow: browse experiences, pick a departure, reserve seats and pay through Stripe Checkout. The site is available in Italian and English.

> **Payments run exclusively in Stripe Sandbox (test mode).** No real money is handled. Use Stripe test cards only, and never configure live keys for this project.

Live demo: `https://sicilia-da-vivere.vercel.app`.

## Stack

| Area | Package | Version installed |
|---|---|---|
| Framework | Nuxt | 4.6.0 |
| UI | Vue / Vue Router | 3.5.43 / 5.4.0 |
| Styling | Tailwind CSS (via `@tailwindcss/vite`) | 4.3.3 |
| i18n | `@nuxtjs/i18n` | 10.6.0 |
| Database | `@supabase/supabase-js` (Postgres) | 2.117.3 |
| Payments | `stripe` (Checkout, webhooks) | 23.0.0 |
| Language | TypeScript | |
| Runtime | Node.js | 24.21.0 (see `.nvmrc`) |

## Features

- **Catalog and departures from Supabase.** Experiences and departures are read through the Nuxt API. Availability is computed in the database.
- **Italian and English.** Routes are prefixed (`/it`, `/en`), the language switcher keeps the current page and query string, and experience titles and descriptions come from the `experience_translations` table.
- **Persistent cart with a single experience.** The cart lives in `localStorage` and is restored on load.
- **Selection editing.** "Change selection" in the cart reopens the experience with the saved departure and participants.
- **Atomic seat reservation, server-side price.** The `reserve_booking` database function locks the departure row, checks capacity and computes the total from the stored price. The browser never sends a price.
- **Stripe Checkout, verified webhook, confirmation and cancellation.** Seats are reserved when the user proceeds to payment. The `checkout.session.completed` and `checkout.session.expired` webhooks are signature-verified and check amount and currency. The confirmation page shows success only when the stored status is `paid`. Cancellation is a POST triggered by the user from the Checkout cancel URL.
- **Cart cleared for the paid session.** The cart is emptied only when the paid session matches the one saved before redirecting to Checkout.

## How it works

```
Browser (Nuxt/Vue)
   │  GET /api/experiences, /api/experiences/:id, /api/experiences/:id/departures
   │  POST /api/bookings            → Supabase rpc reserve_booking (seats + price)
   │                                → Stripe Checkout Session (metadata: bookingId)
   │  redirect to Stripe Checkout (hosted by Stripe)
   │
   ├─ success_url  /:locale/booking/success?session_id=…  → GET /api/bookings/status
   └─ cancel_url   /:locale/booking/cancel?token=…         → POST /api/bookings/cancel

Stripe ──webhook──► POST /api/stripe/webhook ──► Supabase (booking → paid / expired)
```

- Public catalog reads use the public Supabase key. Booking, availability and webhook handlers use the privileged server key and run only in Nitro server routes.
- Booking status is the source of truth in the `bookings` table, updated by the webhook.

## Local setup

```bash
nvm use            # Node version from .nvmrc
npm ci
npm run dev        # http://localhost:3000
```

### Environment variables

Create a local `.env` (it is git-ignored; there is no `.env.example`). Nuxt maps `runtimeConfig` keys to `NUXT_`-prefixed variables. Use placeholders only here and never commit real values.

```bash
# Supabase project URL
NUXT_SUPABASE_URL=https://<project-ref>.supabase.co
# Supabase public (anon/publishable) key, used for catalog reads
NUXT_SUPABASE_KEY=<supabase-public-key>
# Supabase privileged server key. Server only, never expose to the browser
NUXT_SUPABASE_SECRET_KEY=<supabase-service-role-or-secret-key>
# Stripe TEST secret key (sk_test_...)
NUXT_STRIPE_SECRET_KEY=<stripe-test-secret-key>
# Webhook signing secret printed by `stripe listen` (whsec_...)
NUXT_STRIPE_WEBHOOK_SECRET=<stripe-webhook-signing-secret>
# Base URL used in Checkout success/cancel URLs
NUXT_SITE_URL=http://localhost:3000
```

### Local webhooks

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed signing secret into `NUXT_STRIPE_WEBHOOK_SECRET` and restart the dev server.

## Build and checks

```bash
npm run build          # production build into .output/
npx nuxt typecheck     # TypeScript check (vue-tsc)
node .output/server/index.mjs   # run the production build
```

There are no automated tests in this repository.

## Limitations

- The cart holds a single experience.
- No Realtime: availability is read on page load or refresh and is not pushed to open pages.
- Stripe Checkout lasts about 30 minutes; the seat reservation lasts 35 minutes.
- Not production-ready: late confirmations (a payment completing after the booking expired) and recovery of failed or abandoned payment attempts need further work before real use.
- **The database is not reproducible from this repository.** SQL migrations and seed data are kept locally and excluded from git (`/supabase/` is in `.gitignore`). A fresh clone alone cannot recreate the database.
- `server/data/` contains static sample data that the API routes do not use.

## Security notes

`npm audit` currently reports advisories for transitive dependencies (Nuxt DevTools via `simple-git`, `braces` via the i18n build tooling, `node-forge` via Nitro/`listhen`). A local analysis found none of them in the production server output examined (`.output/`). This is not a guarantee: the project is not claimed to be free of risk, and the audit should be repeated as dependencies are updated. The proposed automatic fixes are major downgrades and were not applied.
