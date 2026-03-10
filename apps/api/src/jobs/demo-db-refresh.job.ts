import { runDemoRefresh } from '@grantjs/database';

import { config } from '@/config';
import { JobExecutionContext, JobResult, ScheduledJob } from '@/lib/jobs';
import { Job } from '@/lib/jobs/base/job';

export default class DemoDbRefreshJob extends Job {
  readonly config: ScheduledJob = {
    id: 'demo-db-refresh',
    schedule: config.demoMode.dbRefreshSchedule,
    enabled: config.demoMode.enabled,
  };

  async execute(_context: JobExecutionContext): Promise<JobResult> {
    if (!config.demoMode.enabled) {
      return {
        success: true,
        message: 'Demo mode is disabled; skipping demo DB refresh.',
      };
    }

    this.logger.info({ msg: 'Starting demo database refresh' });

    try {
      await runDemoRefresh(this.appContext.db, config.system.systemUserId);

      this.logger.info({ msg: 'Demo database refresh completed successfully' });

      return {
        success: true,
        message: 'Demo database refresh completed successfully',
      };
    } catch (error) {
      this.logger.error({ err: error, msg: 'Demo database refresh failed' });

      return {
        success: false,
        message: 'Demo database refresh failed',
        data: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }
}
