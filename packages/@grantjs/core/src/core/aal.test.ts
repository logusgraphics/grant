import { describe, expect, it } from 'vitest';

import { compareAal, downgradeAalIfMfaStale, getAalFromTokenClaims, satisfiesMinAal } from './aal';

describe('aal', () => {
  it('compareAal orders aal1 < aal2 < aal3', () => {
    expect(compareAal('aal1', 'aal2')).toBeLessThan(0);
    expect(compareAal('aal2', 'aal1')).toBeGreaterThan(0);
    expect(compareAal('aal2', 'aal3')).toBeLessThan(0);
    expect(compareAal('aal2', 'aal2')).toBe(0);
  });

  it('satisfiesMinAal', () => {
    expect(satisfiesMinAal('aal2', 'aal1')).toBe(true);
    expect(satisfiesMinAal('aal2', 'aal2')).toBe(true);
    expect(satisfiesMinAal('aal1', 'aal2')).toBe(false);
  });

  it('getAalFromTokenClaims uses acr when present', () => {
    expect(getAalFromTokenClaims({ acr: 'aal1', mfaVerified: true })).toBe('aal1');
    expect(getAalFromTokenClaims({ acr: 'aal2', mfaVerified: false })).toBe('aal2');
  });

  it('getAalFromTokenClaims falls back to mfaVerified when acr missing', () => {
    expect(getAalFromTokenClaims({ mfaVerified: true })).toBe('aal2');
    expect(getAalFromTokenClaims({ mfaVerified: false })).toBe('aal1');
  });

  it('downgradeAalIfMfaStale downgrades stale AAL2 when max age is set', () => {
    const now = 1_700_000_000;
    expect(downgradeAalIfMfaStale('aal2', { mfa_auth_time: now - 400 }, 300, now)).toBe('aal1');
    expect(downgradeAalIfMfaStale('aal2', { mfa_auth_time: now - 100 }, 300, now)).toBe('aal2');
  });

  it('downgradeAalIfMfaStale is a no-op when max age is 0 or claim missing', () => {
    const now = 1_700_000_000;
    expect(downgradeAalIfMfaStale('aal2', { mfa_auth_time: now - 9_999 }, 0, now)).toBe('aal2');
    expect(downgradeAalIfMfaStale('aal2', {}, 300, now)).toBe('aal2');
    expect(downgradeAalIfMfaStale('aal1', { mfa_auth_time: now - 9_999 }, 300, now)).toBe('aal1');
  });
});
