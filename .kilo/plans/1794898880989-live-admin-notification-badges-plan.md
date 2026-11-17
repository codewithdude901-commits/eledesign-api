# Live Admin Notification Badges Plan

## Goal
Connect `src/components/admin/NotificationBadges.tsx` to the existing backend so real counts replace mock data in both Payload sidebar and dashboard collection cards, with polling and per-collection acknowledgement, while preserving the approved badge appearance and Payload behavior.

## Scope / constraints
- **In scope:** `src/components/admin/NotificationBadges.tsx` (primary). Only touch `src/app/(payload)/custom.scss` if inspection during implementation proves strictly necessary to preserve existing appearance/positioning; prefer no style changes.
- **Out of scope:** backend endpoints/logic (`/api/admin-notifications*`, collections, hooks), unrelated Payload config, ecommerce/cart/order/payment/B2B logic, `src/payload.config.ts` registration (already wired via `admin.components.afterNavLinks`).
- **Must preserve:** red circular badges, white text, existing dimensions/classes (`.notification-badge`, `--sidebar`, `--card`), sidebar/card positioning, existing nav/card links and plus icons, DOM-enhancement approach.

## Confirmed context
- Component: `'use client'`, injected as `afterNavLinks` (`src/payload.config.ts:44-46`), currently uses `MOCK_NOTIFICATIONS` and `MutationObserver` over `document.body` to append `<span data-notification-badge="...">` into matching `<a href>` elements (`endsWith /collections/<slug>`), classed by `link.closest('nav') ? sidebar : card`. Styling in `src/app/(payload)/custom.scss` (20px, #dc3545, absolute card badge).
- Backend (read-only integration): `GET /api/admin-notifications` → `{ orders: number, businessApplications: number }`, `POST /api/admin-notifications/acknowledge` with `{ collection: 'orders' | 'business-applications' }`; uses Payload session auth (`payload.auth` via headers/cookies), `Cache-Control: no-store`.

## Implementation steps (ordered)

1. **Replace mock config with typed API integration (no visual changes).**
   - Define types: `type NotificationCounts = { orders: number; businessApplications: number }`; `type AcknowledgeCollection = 'orders' | 'business-applications'`.
   - Keep a static item map: `[{ id: 'orders', slug: 'orders', key: 'orders' }, { id: 'business-applications', slug: 'business-applications', key: 'businessApplications' }]` so DOM `data-notification-badge` ids and slug-to-count mapping remain stable.
   - Store latest counts in a `useRef<NotificationCounts>` (and/or state only if needed) so the observer/DOM updater always reads current values without recreating observers/effects or causing render loops. Initialize safely (e.g. `{ orders: 0, businessApplications: 0 }`) so badges stay hidden until first successful fetch.

2. **Fetch counts (mount + 30s polling) using existing session.**
   - `fetchCounts` async: `fetch('/api/admin-notifications', { credentials: 'include', cache: 'no-store' })`; on non-OK or invalid shape, treat as error (do not throw UI), keep previous counts (or hide conservatively) and log/debug silently as appropriate; no page reload.
   - On mount: run initial fetch, then `setInterval(fetchCounts, 30000)`. Guard against overlapping fetches with an in-flight ref/boolean so slow responses don’t race.
   - Cleanup: `clearInterval`; abort in-flight request on unmount via `AbortController` if wired; ignore late responses after unmount (`mounted` ref). No full admin reload.

3. **DOM enhancement: inject/update badges into sidebar and dashboard separately, dedupe, hide on zero.**
   - Preserve `MutationObserver(document.body, { childList: true, subtree: true })` but **do not trigger redundant DOM writes**: update text/class/location only when changed; skip if `count <= 0` by removing existing badge for that link/id (ensures hidden when zero) instead of leaving stale nodes.
   - Targeting (no guessed selectors; rely on actual href/path + existing logic): iterate anchors and resolve `pathname = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, '')` (use base for relative safety). **Exact collection match only:** accept only paths that end with `/admin/collections/${slug}` or `/collections/${slug}` segment-equivalently **and** have no further segments (i.e. pathname equals the collection root). Explicitly reject `/create`, `/<id>`, query-only differences irrelevant, and any nested route — never match by substring beyond exact end-of-collection-root.
   - Separate sidebar vs card: `const isSidebar = Boolean(link.closest('nav'))`; keep `notification-badge--sidebar` / `--card` as today. This naturally targets dashboard cards outside nav.
   - **Never attach to plus/create buttons:** skip links whose `href` contains `/create` (already excluded by exact match) and defensively skip anchors inside obvious create/action controls if encountered (e.g. has create intent) — but primary guarantee is exact path match to collection root.
   - **One badge per collection link:** for each matching link, query `link.querySelector('[data-notification-badge="${id}"]')` (scoped to link) and reuse it; before appending, remove any other badges with same id not owned correctly if duplicates somehow exist (defensive). Do not append a second span if one exists. Remove badge element when count is 0.
   - **Avoid MutationObserver infinite loops:** the observer callback must be cheap and idempotent — only mutate DOM when a badge must be added/removed/text-changed; because it no longer writes when state/DOM already consistent, observations settle. Do not observe attributes unnecessarily; keep `childList+subtree`. Consider disconnecting/reconnecting only if needed (likely unnecessary if idempotent).
   - Re-run badge application after each successful counts update (call updater) and on relevant navigation/DOM changes (observer). Ensure sidebar and dashboard update simultaneously from same counts ref.

4. **Acknowledgement detection (entering collection area, not dashboard/create).**
   - Acknowledge **Orders** only when admin is inside the Orders collection area; **Business Applications** only inside its collection area. **Not** on dashboard, not on create, and not cross-collection.
   - Route detection: compute current `pathname` (normalized, no trailing slash). Treat “entered collection area” as `pathname === <adminBase>/collections/<slug>` OR `pathname` starts with `<adminBase>/collections/<slug>/` **but exclude** create routes: do not acknowledge when path is `.../collections/<slug>/create` or includes `/create` as that action segment for new-doc (match exact create segment) — e.g. acknowledge on list and on viewing/editing existing records `.../collections/<slug>/<id...>` as entering the collection, but **never** on `.../create`.
   - Implementation: listen for SPA navigation via `popstate` and by hooking History API (`pushState`/`replaceState`) wrappers installed once (restored on unmount) plus initial check on mount; also piggyback on MutationObserver tick to detect pathname changes (compare lastPath ref) so Payload client-side transitions are caught reliably.
   - **No repeated ack per render/navigation:** track per-collection ack state refs, e.g. `lastAcknowledgedPathKey` or `ackedForPath` + in-flight flags per collection. Fire `POST /api/admin-notifications/acknowledge` with `{ collection }` (`credentials: 'include'`, JSON body, appropriate headers) only on transition into that collection area (or first detection of being in it) when not already acked/in-flight for that visit context; debounce/dedupe so re-renders/observer churn don’t resend. Reset allowance when leaving the collection area so re-entering later can acknowledge again if new items exist.
   - **After successful acknowledgement:** immediately `fetchCounts()` to refresh both badges (and hide cleared one). Handle errors gracefully (do not loop retries aggressively; allow retry on next enter/poll if desired, but avoid render/request storms).

5. **Resilience, typing, cleanup.**
   - Strong TS types for responses/requests; validate parsed JSON shape (`orders`/`businessApplications` numbers) before applying.
   - Handle loading implicitly (hidden/previous state until data) and API/network errors without breaking admin panel or freezing; all async paths guarded with try/catch and unmount checks.
   - Cleanup on unmount: disconnect observer, clear interval, abort fetch, remove history hooks/listeners, clear any pending flags — prevent leaks and duplicate observers across remounts.

## Affected files (expected)
- **Modify:** `src/components/admin/NotificationBadges.tsx`
- **Maybe (only if required to preserve exact approved look/position):** `src/app/(payload)/custom.scss` (default: no change)
- **No changes:** `src/payload.config.ts`, backend routes/collections, tests, unrelated app code.

## Polling design
- Single `setInterval` every **30s** started on mount + immediate initial fetch.
- In-flight guard prevents overlap; `AbortController` + mounted flag prevent stale updates.
- Manual refresh after successful acknowledge via immediate `fetchCounts()`; shared counts ref drives one DOM updater so sidebar/dashboard stay identical.

## Acknowledgement detection design
- Pathname-normalized collection-area detection: inside `/admin/collections/{slug}` list or record views counts as entered; dashboard excluded; `/.../{slug}/create` excluded (and create actions never matched for badges). SPA transitions detected via history patch + `popstate` + pathname-diff on observer ticks. Per-collection in-flight/once-per-entry dedupe avoids repeated POSTs.

## Duplicate-badge prevention
- Exact href/path match to collection root for badge placement (no `/create`, no nested/id routes as targets).
- One badge node per `(link, collection id)` via scoped `querySelector` reuse; remove-on-zero; idempotent observer updates (write only on diff) to avoid mutation loops.
- Single observer/interval/hook set with full cleanup.

## Risks & mitigations
- **Payload admin route base differs from `/admin`:** derive matching flexibly by exact suffix `/collections/${slug}` at collection root (and prefix-agnostic startsWith for “inside collection” detection) while still requiring exact collection boundary and excluding `/create`.
- **DOM structure varies between Payload versions:** keep logic anchored to actual link `href` pathname semantics already used, not brittle class selectors; verify against rendered admin during implementation.
- **Session/cookie auth:** use same-origin relative URLs with `credentials: 'include'`; no separate auth.
- **Observer loops/perf:** idempotent updates and minimal writes.

## Validation plan (for implementation agent)
- **Static:** `pnpm exec tsc --noEmit` (expect pre-existing unrelated failures only; no new errors in modified badge files) and lint if feasible in env.
- **Manual/integration in admin UI:** verify sidebar+dashboard badges show real counts, same values; hide at 0; no duplicates; plus/create icons untouched; nav works; poll refresh ≤30s; opening Orders list/record (not create, not dashboard) acknowledges Orders only then immediate refresh; opening Business Applications acknowledges only it; new B2C/B2B orders and new applications increment correctly; records created after ack reappear; unmount/navigation leaves no leaks/freeze/blank screen.
- Report: files modified, polling mechanism, acknowledgement detection, duplicate-badge prevention, test results (note env constraints if live admin not exercised here).
