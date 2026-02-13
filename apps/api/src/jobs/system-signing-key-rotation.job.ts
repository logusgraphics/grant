import { config } from '@/config';
import { JobExecutionContext, JobResult, ScheduledJob } from '@/lib/jobs';
import { Job } from '@/lib/jobs/base/job';
import { TransactionManager } from '@/lib/transaction-manager.lib';

/**
 * Rotates the system (platform) signing key used for session tokens.
 * Uses grant.rotateSystemSigningKey(tx) and grant.invalidateSessionSigningKeyCache().
 */
export default class SystemSigningKeyRotationJob extends Job {
  readonly config: ScheduledJob = {
    id: 'system-signing-key-rotation',
    schedule: config.jobs.systemSigningKeyRotation.schedule,
    enabled: config.jobs.systemSigningKeyRotation.enabled,
  };

  async execute(_context: JobExecutionContext): Promise<JobResult> {
    const newKey = await TransactionManager.withTransaction(this.appContext.db, async (tx) => {
      this.logger.info('Starting system signing key rotation');
      const rotated = await this.appContext.grant.rotateSystemSigningKey(tx);
      if (!rotated) {
        throw new Error('rotateSystemSigningKey not implemented');
      }
      this.logger.info({ kid: rotated.kid }, 'System signing key rotated successfully');
      return rotated;
    });

    await this.appContext.grant.invalidateSessionSigningKeyCache();
    this.logger.info('Session signing key cache invalidated');

    return {
      success: true,
      data: {
        kid: newKey.kid,
        createdAt: newKey.createdAt,
      },
    };
  }
}
