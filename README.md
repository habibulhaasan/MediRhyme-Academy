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

## Troubleshooting "সার্ভার সমস্যা হচ্ছে" / data not saving

This almost always means the **Firebase Admin** env vars (`FIREBASE_ADMIN_PROJECT_ID`,
`FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`) aren't set or aren't
being read correctly — these are what the server uses to write to Firestore
(different from the `NEXT_PUBLIC_FIREBASE_*` client keys, which only cover
reading + admin login).

1. Deploy, then open **`/api/health`** in your browser. It reports, without
   leaking secrets:
   - which env vars are present (client + admin)
   - whether Firebase Admin actually initialized
   - whether a real Firestore write+read round-trip succeeded, and the exact
     error if not
2. Common causes it will point you to:
   - `FIREBASE_ADMIN_PRIVATE_KEY` missing, or pasted without the surrounding
     quotes (needs to be one string with `\n` for line breaks — copy it
     exactly as `firebase-admin` expects, quotes included, e.g.
     `FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`).
   - Env vars added on your host (Vercel etc.) but the app not redeployed
     since — env var changes need a redeploy to take effect.
   - Local dev: env vars added to `.env.local` but the dev server wasn't
     restarted (`npm run dev` only reads `.env.local` at startup).
   - Firestore database not created yet in the Firebase console (Firestore
     Database → Create database), or created in "Datastore mode" instead of
     "Native mode".
   - Wrong project: `FIREBASE_ADMIN_PROJECT_ID` pointing at a different
     Firebase project than `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
3. If registrations save but the **admin dashboard** (approve/reject, fees
   settings) fails silently: make sure `firestore.rules` from this repo is
   actually deployed in the Firebase console (Firestore → Rules tab) —
   without it, the default rules block all client reads/writes even for a
   logged-in admin.

## What's new in this update

- **Bangladesh location dropdowns** (Division → District → Upazila, Bangla
  labels) on the registration and seminar forms, powered by
  [habibulhaasan/Location-JSON](https://github.com/habibulhaasan/Location-JSON)
  (`lib/location/`) — replaces the old free-text address field. The stored
  record keeps both the readable address and the raw `divisionId` /
  `districtId` / `upazilaId` for filtering later.
- **আই.এইচ.টির নাম** is now a dropdown of government IHTs
  (`lib/ihtList.ts`) with a "বেসরকারি/অন্যান্য" option that reveals a manual
  text field. I don't have live web access from this tool, so I couldn't
  freshly verify DGHS's current official IHT list — please check
  `lib/ihtList.ts` and add/rename/remove entries if needed; every form reads
  from that one file.
- **বিভাগ → ডিপার্টমেন্ট**: the academic department field (Pharmacy, Lab,
  Radiology, etc.) is now labeled "ডিপার্টমেন্ট" so it isn't confused with
  the address "বিভাগ" (administrative Division) dropdown that sits right
  above it.
- **Mobile admin navigation**: the admin dashboard now has a slide-in drawer
  menu on phones (previously the sidebar was desktop-only, with no way to
  switch between Students/Seminar/MCQ tabs on mobile).
- **Settings-editor bug fix**: the admin "Fees Settings" / "MCQ Exam
  Settings" forms used to start blank and silently overwrite Firestore with
  empty values on save. They now load existing values first. Also added a
  Seminar Info editor (topic/date/time) that was missing.
- **Better error diagnostics**: see the troubleshooting section above —
  `/api/health` plus clearer server error messages.

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
