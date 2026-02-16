import { TelemetryFactory } from '@grantjs/telemetry';

import { config } from '@/config';
import { loggerFactory } from '@/lib/logger';

import type { ITelemetryAdapter } from '@grantjs/core';

let adapter: ITelemetryAdapter | null = null;

/**
 * Returns the singleton telemetry adapter (noop or CloudWatch) from config.
 * Handlers and middleware should use this instead of importing @grantjs/telemetry directly.
 */
export function getTelemetryAdapter(): ITelemetryAdapter {
  if (!adapter) {
    adapter = TelemetryFactory.create(
      {
        provider: config.telemetry.provider,
        cloudwatch:
          config.telemetry.provider === 'cloudwatch'
            ? {
                region: config.telemetry.cloudwatch.region,
                logGroupName: config.telemetry.cloudwatch.logGroupName,
                logStreamPrefix: config.telemetry.cloudwatch.logStreamPrefix,
              }
            : undefined,
      },
      loggerFactory
    );
  }
  return adapter;
}
