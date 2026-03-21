---
name: mfa-recovery-disable-phase
overview: Define and implement next-phase MFA behavior for recovery-code lifecycle (including session elevation on challenge), self-service MFA disable/removal, and recovery status metadata—aligned with repo layering (core ports, GraphQL + REST/OpenAPI).
todos:
  - id: recovery-challenge-elevation
    content: Fix recovery-code challenge to elevate session like verifyMfa (tokens/cookies); move surface to auth if needed.
    status: completed
  - id: api-disable-invariants
    content: Implement backend invariants for remove/disable transitions and recovery-code revocation on full MFA disable (scoped to current single-primary model unless multi-device ships first).
    status: completed
  - id: recovery-status-contract
    content: Add recovery status via core ports, handler/service/repo, GraphQL query, REST + OpenAPI (metadata only).
    status: completed
  - id: web-mfa-ux-alignment
    content: Update settings UX for one-time recovery display, refresh-safe status, explicit disable confirmation; wire challenge page to new recovery verify response.
    status: completed
  - id: mfa-matrix-tests
    content: Tests including recovery verify => mfaVerified on token/session and guarded request succeeds; plus disable/revoke/status.
    status: completed
  - id: docs-rollout
    content: Document recovery lifecycle, challenge elevation, org MFA policy vs self-service disable tradeoff.
    status: completed
isProject: false
---

# MFA Recovery + Disable Phase Plan (revised)

## Review incorporated (2025-03)

The following gaps from code review are **explicitly in scope** for this phase:

1. **Recovery challenge must elevate the session** — not only consume a code and flip client `mfaVerified`. Guards use server-side `user.mfaVerified` from the JWT (`[mfa-graphql-guard.ts](apps/api/src/lib/authorization/mfa-graphql-guard.ts)`, REST equivalent). Today `verifyMyMfaRecoveryCode` on `[MeHandler](apps/api/src/handlers/me.handler.ts)` only returns boolean and does not call `markMfaVerified` / token refresh like `[AuthHandler.verifyMfa](apps/api/src/handlers/auth.handler.ts)`. The plan **must fix this**; it must **not** keep the challenge path “as-is.”
2. **Multi-device vs single-primary** — Enrollment still uses `upsertPrimaryFactor` and verification reads **primary only** (`[user-mfa.service.ts](apps/api/src/services/user-mfa.service.ts)`). Until true multi-factor rows exist, **do not** implement “remove primary → promote another device” as a separate code path; treat **this phase** as **at most one active TOTP factor** (remove last = disable MFA). Optional **follow-up epic**: real multi-device (insert factor, verify per factor, list/promote) before expanding the matrix.
3. **Recovery status contract** — Per [AGENTS.md](AGENTS.md), add **GraphQL + REST + OpenAPI** in sync, and extend `[@grantjs/core](packages/@grantjs/core)` ports (`IUserMfaService` / repository as needed) so resolvers/routes call **handlers → services → repos** only.
4. **Tests** — Add an integration (or e2e) assertion: **after recovery-code verify in challenge context, the next org-scoped guarded request succeeds** (token carries `mfaVerified` or equivalent), not only “hash marked used.”

## Product decisions captured

- **Self-service disable**: always allowed (user choice). **Tradeoff**: if `requireMfaForSensitiveActions` is true for an org, the user may disable MFA but **sensitive org actions remain blocked** until they complete MFA again — document in UI copy and docs.
- **Recovery codes**: **one-time plaintext display** at generate/regenerate; no later plaintext fetch. **OK** to expose **metadata** (counts, `lastGeneratedAt`, `hasActiveCodes`) via query/GET.

## Current state (facts)

- Recovery codes: hashed rows + generate/verify in `[user-mfa.service.ts](apps/api/src/services/user-mfa.service.ts)` / `[user-mfa-recovery-codes.repository.ts](apps/api/src/repositories/user-mfa-recovery-codes.repository.ts)`.
- Settings card holds plaintext only in React state (`[setting-mfa-recovery-codes-card.tsx](apps/web/components/features/settings/setting-mfa-recovery-codes-card.tsx)`).
- Challenge page calls `verifyMyMfaRecoveryCode` then `setMfaVerified(true)` locally (`[mfa/page.tsx](apps/web/app/[locale]/auth/mfa/page.tsx)`) — **insufficient** for server-enforced MFA.

## Behavior matrix (this phase — single-primary TOTP)

| Scenario                                                | Expected                                                                                                                                            |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last (only) factor removed                              | MFA disabled; recovery codes revoked (soft-delete all active).                                                                                      |
| Factor pending verification                             | User may remove to cancel enrollment.                                                                                                               |
| Recovery generate/regenerate                            | Plaintext shown once; DB stores hashes; previous active set invalidated on regenerate (existing `softDeleteAllCodes` behavior).                     |
| Recovery in **challenge** flow                          | Valid code → **same session elevation as TOTP verify** (e.g. `markMfaVerified`, access/refresh tokens + refresh cookie rotation as in `verifyMfa`). |
| Org `requireMfaForSensitiveActions` + user disabled MFA | Sensitive routes still require MFA server-side; user sees MFA_REQUIRED until re-enrollment + verify.                                                |

**Deferred (separate plan)** if product wants multiple TOTP devices: insert non-primary factors, verify against chosen factor, primary promotion rules — **after** schema/service supports multiple rows per user.

## Implementation plan

### 0) Recovery-code challenge — session elevation (blocking)

- **Recommendation**: Add `**verifyMfaRecoveryCode`** (or extend `verifyMfa` input union) on the **auth surface (GraphQL + REST), parallel to `verifyMfa`, implemented in `[AuthHandler](apps/api/src/handlers/auth.handler.ts)` using `UserMfaService.verifyRecoveryCode` + `UserSessionsService.markMfaVerified` / token minting + `setRefreshTokenCookie` — mirror TOTP path.
- Deprecate or thin **me** mutation for challenge-only use; keep **me** verify only if needed for non-session flows (prefer single auth entry for challenge).
- Update `[apps/web/app/[locale]/auth/mfa/page.tsx](apps/web/app/[locale]/auth/mfa/page.tsx)` to use the auth mutation, apply returned tokens like TOTP branch.

### 1) API invariants — disable / remove (single-primary scope)

- In `[UserMfaService.removeDevice](apps/api/src/services/user-mfa.service.ts)` (or dedicated `disableMfa`): removing the last factor → soft-delete factor + revoke all recovery codes.
- **No** primary promotion logic in this phase unless multi-device lands first.
- Audit events: MFA disabled, factor removed, recovery regenerated.

### 2) Recovery status — full stack

- **Core**: extend `[IUserMfaService](packages/@grantjs/core/src/ports/services/user.service.port.ts)` (and repository port if needed) with e.g. `getMyMfaRecoveryCodeStatus()` returning metadata only.
- **API**: `[MeHandler](apps/api/src/handlers/me.handler.ts)` + service + repo query (count non-deleted unused codes, max `createdAt`).
- **Contracts**: GraphQL query + REST GET + OpenAPI in `[apps/api/src/rest](apps/api/src/rest)` per [docs/contributing/rest-api.md](docs/contributing/rest-api.md).
- **Schema**: `pnpm --filter @grantjs/schema generate`.

### 3) Web UX

- Recovery card: warning + one-time list; on load fetch **status** only.
- Devices card: allow remove last with confirm copy including org-policy tradeoff.
- Challenge: wired to auth recovery verify + tokens.

### 4) Tests

- **Critical**: recovery verify (challenge) → subsequent guarded GraphQL/REST call succeeds with `mfaVerified` on auth context.
- Remove last factor → no active recovery codes (or count 0).
- Status endpoint/query shape and authz.
- Regenerate invalidates prior unused hashes (existing behavior regression guard).

### 5) Docs

- Recovery: one-time display, challenge uses auth endpoint, elevation semantics.
- Disable: self-service always; interaction with `requireMfaForSensitiveActions`.

## Resolved open questions (for implementers)

- **Disable when org requires MFA?** Yes (per product). Consequence: sensitive org actions blocked until MFA restored — surface in UI.
- **Recovery verify under `me` vs `auth`?** **Move to auth** (parallel to `verifyMfa`) for token/cookie rotation consistency.
