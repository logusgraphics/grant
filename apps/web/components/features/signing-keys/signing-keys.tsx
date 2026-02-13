'use client';

import { Scope } from '@grantjs/schema';

import { SigningKeyViewer } from './signing-key-viewer';

export interface SigningKeysProps {
  /** When not provided, scope is derived from URL params (project signing keys page). */
  scope?: Scope | null;
}

/**
 * Signing keys (JWKS) block. Renders the viewer only; use SigningKeyToolbar in layout actions
 * and SigningKeyViewer (or this component) as layout children to match other project pages.
 */
export function SigningKeys({ scope }: SigningKeysProps) {
  return <SigningKeyViewer scope={scope} />;
}
