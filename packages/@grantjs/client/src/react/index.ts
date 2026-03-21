// Context and Provider
export type { GrantProviderProps } from './context';
export { GrantProvider, useGrantClient, useGrantClientOptional } from './context';

// Permission hooks
export type { UseGrantOptions, UseGrantResult } from './hooks/useGrant';
export { useGrant } from './hooks/useGrant';

// Components
export type { GrantGateProps } from './components/GrantGate';
export { GrantGate } from './components/GrantGate';

// Re-export core types for convenience
export type {
  AuthorizationResult,
  AuthTokens,
  GrantClientConfig,
  Permission,
  Scope,
} from '../types';

// Re-export GrantClient for advanced use cases
export { GrantClient } from '../grant-client';
