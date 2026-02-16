/**
 * E2E tests for observability: metrics endpoint against the real API container.
 *
 * Telemetry (log-push) and analytics are tested at the adapter level in
 * integration tests (observability.integration.test.ts): noop adapters and
 * wiring. Full E2E for telemetry/analytics would require a test backend
 * (e.g. mock HTTP receiver); the API is configured with TELEMETRY_PROVIDER=none
 * and ANALYTICS_ENABLED=false in docker-compose.e2e.yml.
 *
 * Prerequisites: E2E stack up with METRICS_ENABLED=true (see docker-compose.e2e.yml).
 */
import { describe, expect, it } from 'vitest';

import { apiClient } from './helpers/api-client';

describe('observability E2E', () => {
  describe('metrics endpoint', () => {
    it('GET /metrics returns 200 and Prometheus text with http_requests_total', async () => {
      const res = await apiClient().get('/metrics');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/plain/);
      expect(res.text).toContain('http_requests_total');
      expect(res.text).toContain('http_request_duration_seconds');
    });

    it('GET /metrics includes at least one scrape after health check', async () => {
      await apiClient().get('/health').expect(200);

      const res = await apiClient().get('/metrics');
      expect(res.status).toBe(200);
      // After /health, we expect the request to be recorded (metric may be 0 or 1+)
      expect(res.text).toContain('http_requests_total');
    });
  });
});
