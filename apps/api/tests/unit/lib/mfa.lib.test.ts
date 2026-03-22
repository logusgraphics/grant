import { describe, expect, it } from 'vitest';

import {
  decryptMfaSecret,
  encryptMfaSecret,
  generateTotpSecret,
  verifyTotpCode,
} from '@/lib/mfa.lib';

describe('mfa.lib', () => {
  it('encrypts and decrypts MFA secret', () => {
    const key = 'test-mfa-encryption-key';
    const secret = generateTotpSecret();
    const encrypted = encryptMfaSecret(secret, key);
    const decrypted = decryptMfaSecret({ ...encrypted, key });
    expect(decrypted).toBe(secret);
  });

  it('rejects invalid TOTP code format', () => {
    const secret = generateTotpSecret();
    const isValid = verifyTotpCode({
      secret,
      code: 'abc123',
      periodSeconds: 30,
      window: 1,
      now: Date.now(),
    });
    expect(isValid).toBe(false);
  });
});
