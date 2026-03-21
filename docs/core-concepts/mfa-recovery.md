---
title: MFA recovery codes and self-service disable
description: Recovery code lifecycle, MFA challenge elevation, and how org MFA policy interacts with user-controlled MFA.
---

# MFA recovery codes and self-service disable

## Recovery codes

- Recovery codes are stored as **hashes**; **plaintext is shown only once** when the user generates or regenerates codes. There is **no API** to retrieve plaintext later.
- **Metadata** (how many unused codes exist, when the current set was last generated) is available via:
  - GraphQL: `myMfaRecoveryCodeStatus`
  - REST: `GET /api/me/mfa/recovery-codes/status`
- Regenerating invalidates previous unused codes (soft-delete + new set), consistent with a single active batch per user.

## MFA challenge: TOTP vs recovery

- Server-side guards rely on **`mfaVerified` on the JWT** (see MFA GraphQL/REST guards), not on client-only state.
- Completing a challenge with a **recovery code** must use the **auth** surface—same **session elevation** as TOTP verification:
  - GraphQL: `verifyMfaRecoveryCode`
  - REST: `POST /api/auth/mfa/recovery/verify`
- That path verifies the code, marks the session MFA-verified, and returns **rotated access/refresh tokens** (and refresh cookie where applicable), mirroring `verifyMfa`.

## Self-service disable (single-primary TOTP model)

- The product allows users to **turn off MFA** by removing their **last** registered factor.
- When no active factors remain, the platform **revokes all recovery codes** (soft-delete active rows) and records an audit action such as `MFA_DISABLED` with `reason: last_factor_removed`.
- **Multi-device promotion** (remove primary → promote another device) is **out of scope** until the data model supports multiple active factors beyond the current primary-only enrollment path.

## Organization policy vs user choice

- If `requireMfaForSensitiveActions` is enabled for an organization, **sensitive org actions** may still **require MFA server-side** even if the user has disabled MFA on their account. The user will see MFA-required flows until they enroll and verify again; this is intentional: self-service disable does not weaken server enforcement for those routes.

## References

- Handlers: `AuthHandler.verifyMfa`, `AuthHandler.verifyMfaRecoveryCode`
- Service: `UserMfaService` (verify recovery, remove last factor + revoke codes)
- Web: settings recovery card (one-time display + metadata), MFA challenge page (auth recovery mutation + tokens)
