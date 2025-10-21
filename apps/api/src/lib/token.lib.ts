import { randomBytes } from 'crypto';

export interface Token {
  token: string;
  validUntil: number;
}

export type { Token as SecureToken };

export function generateSecureToken(validityMinutes: number = 60, tokenLength: number = 32): Token {
  const token = randomBytes(tokenLength).toString('hex');
  const validUntil = Date.now() + validityMinutes * 60 * 1000;
  return { token, validUntil };
}

export function generateSecureTokenMs(validityMs: number, tokenLength: number = 32): Token {
  const token = randomBytes(tokenLength).toString('hex');
  const validUntil = Date.now() + validityMs;
  return { token, validUntil };
}

export function isTokenValid(token: Token): boolean {
  return Date.now() < token.validUntil;
}

export function getTokenRemainingTime(token: Token): number {
  return token.validUntil - Date.now();
}
