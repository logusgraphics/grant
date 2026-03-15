'use client';

/**
 * Runtime config: demo mode, privacy retention, app version.
 * Client loads from GET /api/config; server fallback from env (SSR/build).
 */

export interface RuntimeConfig {
  demoModeEnabled: boolean;
  demoModeDbRefreshSchedule: string;
  accountDeletionRetentionDays: string;
  appVersion: string;
}

const DEFAULTS: RuntimeConfig = {
  demoModeEnabled: false,
  demoModeDbRefreshSchedule: '0 0 */2 * *',
  accountDeletionRetentionDays: '30',
  appVersion: 'dev',
};

let runtimeConfig: RuntimeConfig = DEFAULTS;

export function setRuntimeConfig(config: RuntimeConfig): void {
  runtimeConfig = config;
}

function getServerConfig(): RuntimeConfig {
  if (typeof process === 'undefined' || !process.env) return DEFAULTS;
  return {
    ...DEFAULTS,
    demoModeEnabled: process.env.DEMO_MODE_ENABLED === 'true',
    demoModeDbRefreshSchedule:
      process.env.DEMO_MODE_DB_REFRESH_SCHEDULE ?? DEFAULTS.demoModeDbRefreshSchedule,
    accountDeletionRetentionDays:
      process.env.PRIVACY_ACCOUNT_DELETION_RETENTION_DAYS ?? DEFAULTS.accountDeletionRetentionDays,
    appVersion:
      process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.APP_VERSION ?? DEFAULTS.appVersion,
  };
}

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === 'undefined') {
    return getServerConfig();
  }
  return runtimeConfig;
}
