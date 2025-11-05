## Purpose

Brief, actionable guidance for AI coding agents working on this repo: a minimal Express-based OTP service implemented in `app.js`.

## Big picture (what this app does)
- Single-file Node.js service (`app.js`) that exposes two endpoints:
  - POST /api/requestotp — generate a 4-digit OTP and email it to a user
  - POST /api/verifyotp — verify the OTP and remove it from server memory
- Flow: request -> generate (randomstring numeric, length 4) -> store in in-memory object `otpCashe` -> send email via Nodemailer (Gmail SMTP) -> cookie set -> verification checks and deletion.

## Key files
- `app.js` — entire application logic and the authoritative place to look for behavior.
- `package.json` — scripts and dependencies. Note `type: "module"` (ESM imports) and scripts: `npm run dev` (nodemon) and `npm start`.

## Environment & secrets
- Uses `dotenv`. Required environment variables (not present in repo):
  - `EMAIL_USER` — Gmail address used to send OTPs
  - `APP_PASSWORD` — Gmail app password (not the account password)
  - `PORT` (optional) — fallback 3001
- Do NOT commit `.env` or secret values. Add/update `.env.example` when changing env requirements.

## Project-specific patterns & conventions
- ESM modules: files use `import` syntax; preserve `type: "module"` in `package.json` when adding files.
- OTP generation: `randomstring.generate({ length: 4, charset: "numeric" })` — keep 4-digit numeric OTPs unless changing spec.
- In-memory state: OTPs are stored in a plain object named `otpCashe` (note spelling). This is a single-node, ephemeral cache — changes here affect only this process.

## Integration points & important behaviors
- Nodemailer configuration in `sendMail()` uses Gmail SMTP (`smtp.gmail.com`, port 587) and expects an app-specific password in `APP_PASSWORD`.
- Cookie usage: `res.cookie("otpCache", otpCashe, { httpOnly: true, maxAge: 30000 })` — currently attempts to set the whole in-memory object as a cookie value. Expect serialization issues and privacy/security concerns.

## Gotchas discovered (explicit, actionable)
- The in-memory cache variable is misspelled as `otpCashe`. Consider renaming to `otpCache` for clarity and searchability.
- Storing the full cache in a cookie is incorrect: cookies must be string values and exposing server-side cache to clients is a security bug. Prefer per-email ephemeral token or server-side session store (Redis) and set only a minimal identifier in the cookie.
- No rate limiting, validation, or brute-force protection exist. Add rate-limiting or request throttling for production.
- Emails require Gmail app passwords (not normal account password). Document this in `.env.example`.

## How to run and debug locally
- Install deps: `npm install`
- Dev (auto-reload): `npm run dev` (nodemon)
- Production/test run: `npm start`
- Start without email creds to test routing/port behavior; but email-sending will error at runtime if creds are missing.

## Quick examples (use these exact endpoints)
- Request OTP

  POST /api/requestotp
  JSON body: { "email": "user@example.com" }

- Verify OTP

  POST /api/verifyotp
  JSON body: { "email": "user@example.com", "otp": "1234" }

## Small PR checklist for contributors
- Do not commit secrets; add/update `.env.example` when env variables change.
- Rename `otpCashe` -> `otpCache` and remove writing the entire cache to cookies in a dedicated PR.
- If adding persistence or scaling, prefer Redis for OTP storage and document failover/migration steps.

## When an AI agent should ask for clarification
- Any change that affects security/auth (OTP TTL, where OTPs are stored, or which data goes into cookies).
- When adding external services (e.g., switching SMTP provider) — request credentials and test accounts.

If anything above is unclear or you want the file to include extra examples (tests, Redis snippet, or a `.env.example`), tell me and I will iterate.
