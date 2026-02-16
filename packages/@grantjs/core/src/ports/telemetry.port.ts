/**
 * Port for telemetry (log shipping, optional future span/trace export).
 * Core defines the contract; implementations (e.g. CloudWatch, noop) live in
 * infrastructure packages (@grantjs/telemetry).
 */

export interface TelemetryLogEntry {
  message: string;
  level: string;
  timestamp: string;
  requestId?: string;
  fields?: Record<string, unknown>;
}

export interface ITelemetryAdapter {
  /**
   * Send a log entry to the configured backend (e.g. CloudWatch Logs).
   * Implementations should not throw; log and absorb errors.
   */
  sendLog(entry: TelemetryLogEntry): Promise<void>;
}
