# Plan: Separate B2C password reset mechanism

Mirror the existing B2B password reset flow for B2C customers so they no longer share Payload's default (admin-style) forgot-password email and endpoint.

## Scope
- Add a B2C-specific forgot-password email helper.
- Add a custom `/api/b2c/forgot-password` (or `/api/customer/forgot-password`) route that only issues reset tokens for `accountType === 'b2c'` users.
- Update the B2C `ForgotPasswordForm` to call the new endpoint.
- Keep reset completion on the standard `/api/users/reset-password` (token already proves ownership; portal handling already covers B2C).
- Leave admin password reset on Payload defaults.

## Tasks
1. Create `src/b2c/emails/sendB2CPasswordReset.ts` exporting `requestB2CPasswordResetToken` and `sendB2CPasswordResetEmail`, modeled on `src/b2b/emails/sendBusinessPasswordReset.ts`:
   - `requestB2CPasswordResetToken({ email, payload, req? })` calls `payload.forgotPassword({ collection: 'users', data: { email }, disableEmail: true, overrideAccess: true, ... })`.
   - `sendB2CPasswordResetEmail({ email, locale, payload, token })` builds a link to `/${locale}/reset-password?token=...` (reuse existing B2C reset page) and sends a branded B2C email via `payload.sendEmail`, skipping in test/vitest.
   - `sendB2CPasswordReset` orchestrates token + email, accepting a locale (default `de`).
2. Create `src/app/(app)/api/b2c/forgot-password/route.ts` modeled on `src/app/(app)/api/business/forgot-password/route.ts`:
   - Parse `{ email }`, normalize.
   - Generic success response to avoid enumeration.
   - Find user with `accountType: 'b2b'`? No — `accountType: 'b2c'`.
   - If found, issue token and send email (locale from request or default `de`; B2C has no preferredLocale field, so use the locale passed in body or default).
   - Wrap in try/catch, always return generic response.
3. Update `src/components/forms/ForgotPasswordForm/index.tsx` to POST to `/api/b2c/forgot-password` instead of `/api/users/forgot-password`.
4. (Optional) Add locale passthrough: form sends current `locale` in body; route reads it and validates `de|en`.

## Risks / notes
- Do not break admin reset: keep `/api/users/forgot-password` default for admin (and any legacy).
- B2C reset page already at `/[locale]/reset-password`; no new page needed.
- `enforceLoginPortal` already allows reset-password requests; no change.
- Tests: add integration coverage mirroring `b2b-auth.int.spec.ts` for B2C forgot-password + reset if desired.

## Decision update
- B2C eligibility should be `roles.includes('customer') && !roles.includes('admin')`. Do NOT exclude users who also have the `b2b` role; they may still use the B2C reset flow.
- Endpoint name: `/api/b2c/forgot-password` vs `/api/customer/forgot-password`. Recommend `/api/b2c/forgot-password` for consistency with `/api/business/forgot-password`.
- Email locale source: request locale vs a stored B2C locale field. Recommend request locale (no schema change).