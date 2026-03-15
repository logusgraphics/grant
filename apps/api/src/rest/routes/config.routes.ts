import { Request, Response, Router } from 'express';

import { config } from '@/config';

const router = Router();

/**
 * GET /api/config — Public runtime config for frontends (no auth).
 * Returns only non-URL values so CSR apps can load them at runtime without baking env into images.
 * URLs are never returned; frontends use relative paths only.
 */
router.get('/', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    demoModeEnabled: config.demoMode.enabled,
    demoModeDbRefreshSchedule: config.demoMode.dbRefreshSchedule,
    accountDeletionRetentionDays: String(config.privacy.accountDeletionRetentionDays),
    appVersion: config.app.version,
  });
});

export function createConfigRoutes(): Router {
  return router;
}
