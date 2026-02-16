import type { ITelemetryAdapter, TelemetryLogEntry } from '@grantjs/core';

/**
 * No-op telemetry adapter. Drops all log entries; used when provider is 'none' or disabled.
 */
export class NoopTelemetryAdapter implements ITelemetryAdapter {
  async sendLog(_entry: TelemetryLogEntry): Promise<void> {
    // no-op
  }
}
