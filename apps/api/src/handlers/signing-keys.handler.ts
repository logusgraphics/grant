import { DbSchema } from '@grantjs/database';
import { Scope, SigningKey, Tenant } from '@grantjs/schema';

import { IEntityCacheAdapter } from '@/lib/cache';
import { BadRequestError } from '@/lib/errors';
import { TransactionManager } from '@/lib/transaction-manager.lib';
import { Services } from '@/services';

import { CacheHandler } from './base/cache-handler';

const ALLOWED_TENANTS: readonly string[] = [Tenant.AccountProject, Tenant.OrganizationProject];

function assertProjectScope(scope: Scope): void {
  if (!ALLOWED_TENANTS.includes(scope.tenant)) {
    throw new BadRequestError(
      `Signing keys are only available for project scopes (accountProject, organizationProject), got: ${scope.tenant}`,
      'errors:validation.invalid',
      { field: 'scope.tenant' }
    );
  }
}

export class SigningKeysHandler extends CacheHandler {
  constructor(
    protected override readonly cache: IEntityCacheAdapter,
    protected override readonly services: Services,
    private readonly db: DbSchema
  ) {
    super(cache, services);
  }

  async getSigningKeys(scope: Scope, options?: { limit?: number }): Promise<SigningKey[]> {
    assertProjectScope(scope);
    const limit = options?.limit ?? 20;
    const cacheKey = `${scope.tenant}:${scope.id}:${limit}`;

    const cached = await this.cache.signingKeys.get<SigningKey[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.services.signingKeys.listByScope(scope, { limit });
    await this.cache.signingKeys.set(cacheKey, result);
    return result;
  }

  async rotateSigningKey(scope: Scope): Promise<SigningKey> {
    assertProjectScope(scope);
    const newKey = await TransactionManager.withTransaction(this.db, (tx) =>
      this.services.signingKeys.rotateForScope(scope, tx)
    );
    await this.invalidateSigningKeysCacheForScope(scope);
    return newKey;
  }
}
