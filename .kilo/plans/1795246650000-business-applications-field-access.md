# Plan: BusinessApplications field access restrictions

## Goal
Make `message` and `termsAccepted` read-only for non-admin users (settable at application time, changeable only by admins afterwards), and restrict the `reviewedBy` relationship picker to admin users only.

## File to edit
`src/collections/BusinessApplications/index.ts`

## Changes

1. `message` field (index.ts:79-81): add field-level access
   ```ts
   access: {
     create: publicAccess,
     read: publicAccess,
     update: adminOnlyFieldAccess,
   },
   ```
   Rationale: applicants set it when applying; afterwards only admins may change it. Create stays `publicAccess` so applications can be submitted. Collection-level `read: adminOnly` still gates actual reads via the collection API; field-level `read` documents intent.

2. `termsAccepted` field (index.ts:83-88): add the same access block
   ```ts
   access: {
     create: publicAccess,
     read: publicAccess,
     update: adminOnlyFieldAccess,
   },
   ```
   `required: true` and its validator are unchanged — they apply at create time.

3. `reviewedBy` field (index.ts:131-139): add `admin.filterOptions` so the admin picker lists only users with the `admin` role
   ```ts
   admin: {
     filterOptions: {
       roles: { equals: 'admin' },
     },
   },
   ```
   Follows the object-shorthand convention used in `src/collections/Products/index.ts:454-456`. Payload v3 (3.88.0) treats `equals` on the `roles: string[]` array field as element-match, so this shows admin users only. Non-admin roles (`customer`, `b2b`) are excluded.

## Decisions
- Read-only interpreted as: create + read open, update admin-only. Collection-level access (`create: publicAccess`, `read: adminOnly`, `update: adminOnly`) is intentionally left unchanged — these are field-level restrictions layered on top.
- `user` ("Linked user account") is left untouched: it is written by `approveApplication` on approval and is already `readOnly: true` in the admin UI.
- No changes to hooks (`approveApplication`, `sendApprovalEmail`) or the `beforeValidate` status-defaulting hook.

## Verification
- Run typecheck: `pnpm exec tsc --noEmit` (payload-types will regenerate; confirm no type errors in index.ts).
- Run lint: `pnpm exec lint`.
- Functional check (by the implementing agent, if a dev server is available): create an application as a non-admin, then attempt to PATCH `message`/`termsAccepted` as that user (expect 403), and as admin (expect 200); open the `reviewedBy` picker as admin and confirm only admin users appear.

## Open questions (none blocking)
None — all design decisions resolved.