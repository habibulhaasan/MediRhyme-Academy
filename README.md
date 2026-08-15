# Medi Rhyme Academy — Next.js + Firestore rebuild

This is a Next.js 15 (App Router, TypeScript, Tailwind, Framer Motion) rebuild
of your original HTML/CSS/JS + Google Apps Script site, with the same theme
(navy `#003366` / gold `#ffd700`, Bangla + English fonts) and the same
features:

- Home page — hero, course timeline, fees cards, registration form
- Seminar registration page
- Free model test registration page
- MCQ exam page (Google Form embed + 60‑min countdown timer, gated open/closed)
- Admin login (Firebase Auth) + admin dashboard (students / seminar / MCQ
  registrations, approve/reject, CSV export, editable fees & exam settings)
- PipraPay payment integration (see note below)

## 1. Install

```bash
npm install
cp .env.example .env.local
```

## 2. Firebase setup

1. Create a Firebase project → enable **Firestore** and **Authentication
   (Email/Password)**.
2. Web app → copy the config into `NEXT_PUBLIC_FIREBASE_*` vars in `.env.local`.
3. Project settings → Service accounts → Generate new private key → put
   `project_id` / `client_email` / `private_key` into the `FIREBASE_ADMIN_*`
   vars (keep the `\n` line breaks in the private key, quoted).
4. Deploy `firestore.rules` (or paste it into the Firestore Rules tab).
5. Authentication → Users → manually add your admin email/password (there's
   no public sign-up page by design).
6. In Firestore, create these documents once (or use the admin dashboard,
   which writes them for you):
   - `settings/fees` — course fee card fields (courseFee, deadline,
     discountPercent, offeredAmount, paymentNo, mcq* equivalents)
   - `settings/seminar` — `{ topic, date, time }`
   - `settings/mcqExam` — `{ formUrl, isOpen, durationMinutes }`

## 3. PipraPay setup — please double check this part

PipraPay (piprapay.com) is a **self-hosted** bKash/Nagad/Rocket payment
verification gateway — you run your own instance and it gives you an API key
+ base URL. I don't have live web access from inside this tool, so I built
`lib/piprapay.ts` against PipraPay's commonly documented
`create-charge` / `verify-payments` REST pattern, but I could **not confirm
your exact instance's current endpoint/field names**. Before going live:

1. Open your PipraPay panel → Developer/API tab (or `{your-instance}/docs`)
   and compare the request/response fields with `lib/piprapay.ts` and
   `app/api/payment/webhook/route.ts`.
2. Fix any field name mismatches (e.g. `pp_id` vs `invoice_id`, the webhook
   payload shape, the header name for the API key).
3. Set `PIPRAPAY_BASE_URL`, `PIPRAPAY_API_KEY`, and (if your instance signs
   webhooks) `PIPRAPAY_WEBHOOK_SECRET` in `.env.local`.

If PipraPay isn't configured, the registration form still works exactly like
the original site: the student pastes their bKash/Nagad transaction ID
manually and an admin approves it from the dashboard.

## 4. Run

```bash
npm run dev
```

## 5. Deploy

Works on Vercel out of the box — set the same env vars in the Vercel project
settings. Firestore/Auth need no extra server since Firebase handles that.

## Notes / what changed vs the original

- Google Sheets → **Firestore** (`students`, `seminar_registrations`,
  `mcq_registrations` collections).
- Google Apps Script `doPost` endpoints → Next.js API routes under `app/api/*`.
- Manual bKash/Nagad Trxn ID entry still works; PipraPay is layered on top as
  an optional automatic payment + verification path.
- Admin login moved from a shared password in `login.js` to real Firebase
  Auth accounts.
- The MCQ "engine" is still a Google Form embed (as in the original) wrapped
  in a countdown timer that now reads its open/closed state and duration
  live from Firestore instead of a spreadsheet cell.
