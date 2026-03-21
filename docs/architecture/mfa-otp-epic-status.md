# MFA / OTP epic — implementation status (vs `.cursor/plans`)

Use this to sync **GitHub Project** / issue **Epic: MFA/OTP** with delivered work. Plans: `mfa-otp`, `composable_mfa_guards`, `require_full_auth_at_login`, `mfa-device-ux`, `mfa-recovery-disable-phase`.

## Delivered (platform)

| Area                                                           | Status  | Notes                                                                                   |
| -------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| TOTP MFA (enrollment, verify, recovery codes)                  | Done    | Per `mfa-otp` plan                                                                      |
| JWT: `mfaVerified`, `amr`, `acr`, `auth_time`, `mfa_auth_time` | Done    | Core + `UserSessionService.signSession`                                                 |
| `GrantAuth` (AAL + assurance fields)                           | Done    | `getAalFromTokenClaims`, `compareAal`, `downgradeAalIfMfaStale`                         |
| Min AAL at login (`AUTH_MIN_AAL_AT_LOGIN`)                     | Done    | GraphQL + REST middleware; safe AAL1 allowlists                                         |
| Step-up max age (`AUTH_MFA_STEP_UP_MAX_AGE_SECONDS`)           | Done    | Stale AAL2 → effective AAL1 for policy when configured                                  |
| Composable MFA vs email guards                                 | Done    | Per `composable_mfa_guards`                                                             |
| OAuth / refresh parity                                         | Done    | Branch B / login handlers                                                               |
| Config app (`apps/config`)                                     | Done    | `AUTH_MIN_AAL_AT_LOGIN` dropdown (`aal1` \| `aal2`); step-up max age field + validation |
| PR hardening                                                   | Done    | Local QR (`qrcode`), `removeFactor` → `NotFoundError`, TOTP label = email               |
| Legacy env                                                     | Removed | `AUTH_REQUIRE_FULL_AUTH_AT_LOGIN` removed; use `AUTH_MIN_AAL_AT_LOGIN` only             |

## Follow-ups (non-blocking / tracked elsewhere)

- Per-user MFA verify rate limits (`verifyMaxAttempts` / window) wired in verify path
- REST parity for all self-service MFA mutations (document if GraphQL-only is intentional)
- Apollo `MFA_REQUIRED` redirect safeguards on MFA operations; `returnTo` validation on challenge page
- Expanded automated tests for min-AAL / MFA guards

## Related docs

- `docs/getting-started/configuration.md` — AAL / step-up env vars
- `.cursor/plans/mfa-otp_a01bb5ed.plan.md`
- `.cursor/plans/composable_mfa_guards_a95bf4d9.plan.md`
- `.cursor/plans/require_full_auth_at_login_8c551333.plan.md`
