# Plan: Post-approval business application email correction

## Goal
Allow an admin to correct the email (and contact name) on an already-approved business application, updating the linked user account and re-sending the password-reset/welcome email to the new address.

## Files to edit
- `src/collections/BusinessApplications/hooks/approveApplication.ts`
- `src/collections/BusinessApplications/hooks/sendApprovalEmail.ts`

## Changes to `approveApplication.ts` (beforeChange)

1. **Widen the guard** (line 41-47). Currently returns early when `previous?.status === 'approved'`. Change to also proceed when the email changed on an approved application:
   ```ts
   const emailChanged =
     typeof incoming.email === 'string' &&
     incoming.email.toLowerCase().trim() !== (previous?.email || '').toLowerCase().trim()

   if (
     operation !== 'update' ||
     incoming.status !== 'approved' ||
     (previous?.status === 'approved' && !emailChanged)
   ) {
     return data
   }
   ```

2. **Conflict guard for the new email** (after the existing admin check, line 85-90). If `emailChanged` and the new email already belongs to a different user, throw:
   ```ts
   if (emailChanged && existingUser && String(existingUser.id) !== String(application.user)) {
     throw new APIError('A user with this email already exists. Choose a different address.', 400)
   }
   ```
   (Reuse the existing admin throw if the existing user is an admin.)

3. **Update the linked user when email changed** (line 54). Replace the early return with a branch:
   - If `application.user` exists and `emailChanged`: update that user's `email`, `b2b.invoiceEmail` (and `name` if `contactName` changed), keep roles, set `req.context.b2bApproval = true` around it (as today), then continue to generate a new reset token.
   - If `application.user` exists and `!emailChanged`: return `data` (no-op, current behavior).
   - If no user: create as today.

   The update path mirrors the existing-user branch (lines 115-133) but targets `application.user` id and only changes email/name/invoiceEmail, preserving roles and b2b data.

4. **Generate a new reset token for the new email** — already happens unconditionally after the user block (line 157-161) via `requestBusinessPasswordResetToken({ email, ... })`. Ensure `email` reflects the new (corrected) address. It does, since `email` is derived from `application.email` (line 58).

## Changes to `sendApprovalEmail.ts` (afterChange)

Relax the guard (line 23-29) to also send when the email changed:
```ts
const emailChanged =
  typeof application.email === 'string' &&
  application.email.toLowerCase().trim() !==
    (previous?.email || '').toLowerCase().trim()

if (
  application.status !== 'approved' ||
  (previous?.status === 'approved' && !emailChanged) ||
  !application.user
) {
  return doc
}
```

The rest of the hook (token lookup in `req.context.b2bApprovalResetTokens`, send email) stays unchanged. Note: `application` type needs `email?: string` added.

## Edge cases / risks
- **Conflict**: handled by the guard in step 2 (throw before mutation).
- **Already-activated account**: if the user already set a password, a new reset token is issued and emailed; the old password still works until the token is consumed. Acceptable; session invalidation is out of scope.
- **Role preservation**: the update path must not downgrade roles — spread existing roles, only update email/name/invoiceEmail.
- **Transaction safety**: the user update and token request happen inside the beforeChange hook (same transaction as the application save), as today. The email send happens in afterChange (outside transaction), as today.
- **Pending applications**: unchanged — admin can already edit email freely; it's used at approval time.

## Validation
- Typecheck: `pnpm exec tsc --noEmit`.
- Lint: `pnpm exec eslint src/collections/BusinessApplications/hooks/approveApplication.ts src/collections/BusinessApplications/hooks/sendApprovalEmail.ts`.
- Manual test: approve an application with a wrong email → confirm user created + email sent. Then edit the application's email to a corrected address (status stays approved) → confirm the linked user's email updates, no duplicate user created, and a new reset email is sent to the corrected address. Test conflict case: set email to one belonging to an existing different user → expect 400 error.