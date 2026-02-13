import crypto from 'node:crypto';

import { GrantAuth } from '@grantjs/core';
import { DbSchema, SigningKeyModel, signingKeyAuditLogs } from '@grantjs/database';
import { SigningKey, Tenant, type Scope } from '@grantjs/schema';

import { generateUUID } from '@/lib/token.lib';
import { Transaction } from '@/lib/transaction-manager.lib';
import { Repositories } from '@/repositories';

import { AuditService } from './common';

export interface SigningKeyResult {
  kid: string;
  privateKeyPem: string;
}

export class SigningKeyService extends AuditService {
  constructor(
    private readonly repositories: Repositories,
    readonly user: GrantAuth | null,
    readonly db: DbSchema
  ) {
    super(signingKeyAuditLogs, 'signingKeyId', user, db);
  }

  private kidPrefix(tenant: Tenant): string {
    switch (tenant) {
      case Tenant.AccountProject:
        return 'acc-prj-';
      case Tenant.OrganizationProject:
        return 'org-prj-';
      case Tenant.ProjectUser:
        return 'prj-usr-';
      case Tenant.System:
      default:
        return 'sys-';
    }
  }

  private auditSafeKeyFields(row: SigningKeyModel): Record<string, unknown> {
    return {
      kid: row.kid,
      scopeTenant: row.scopeTenant,
      scopeId: row.scopeId,
      active: row.active,
      algorithm: row.algorithm,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      rotatedAt: row.rotatedAt,
    };
  }

  async getOrCreateForScope(scope: Scope, transaction?: Transaction): Promise<SigningKeyResult> {
    const existing = await this.repositories.signingKeyRepository.getByScope(
      scope.tenant,
      scope.id,
      transaction
    );
    if (existing) {
      return { kid: existing.kid, privateKeyPem: existing.privateKeyPem };
    }

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const kid = `${this.kidPrefix(scope.tenant)}${generateUUID()}`;
    const newKey = await this.repositories.signingKeyRepository.createSigningKey(
      {
        scopeTenant: scope.tenant,
        scopeId: scope.id,
        kid,
        publicKeyPem: publicKey,
        privateKeyPem: privateKey,
        algorithm: 'RS256',
        active: true,
      },
      transaction
    );

    await this.logCreate(
      newKey.id,
      this.auditSafeKeyFields({
        ...newKey,
        createdAt: newKey.createdAt,
        rotatedAt: newKey.rotatedAt,
      }),
      { scopeTenant: scope.tenant, scopeId: scope.id },
      transaction
    );

    return { kid, privateKeyPem: privateKey };
  }

  async getPublicKeyPemByKid(kid: string, transaction?: Transaction): Promise<string | null> {
    return this.repositories.signingKeyRepository.getPublicKeyPemByKid(kid, transaction);
  }

  async getActivePublicKeys(
    transaction?: Transaction
  ): Promise<Array<{ kid: string; publicKeyPem: string }>> {
    return this.repositories.signingKeyRepository.getActivePublicKeys(transaction);
  }

  async getPublicKeysForJwks(
    retentionCutoff: Date,
    transaction?: Transaction
  ): Promise<Array<{ kid: string; publicKeyPem: string }>> {
    return this.repositories.signingKeyRepository.getPublicKeysForJwks(
      retentionCutoff,
      transaction
    );
  }

  async getPublicKeysForJwksByScope(
    scopeTenant: string,
    scopeId: string,
    retentionCutoff: Date,
    transaction?: Transaction
  ): Promise<Array<{ kid: string; publicKeyPem: string }>> {
    return this.repositories.signingKeyRepository.getPublicKeysForJwksByScope(
      scopeTenant,
      scopeId,
      retentionCutoff,
      transaction
    );
  }

  async listByScope(
    scope: Scope,
    options?: { limit?: number },
    transaction?: Transaction
  ): Promise<SigningKey[]> {
    return this.repositories.signingKeyRepository.listByScope(
      scope.tenant,
      scope.id,
      options,
      transaction
    );
  }

  async rotateForScope(scope: Scope, transaction?: Transaction): Promise<SigningKey> {
    const current = await this.repositories.signingKeyRepository.getByScope(
      scope.tenant,
      scope.id,
      transaction
    );

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const kid = `${this.kidPrefix(scope.tenant)}${generateUUID()}`;
    const now = new Date();

    const newKey = await this.repositories.signingKeyRepository.createSigningKey(
      {
        scopeTenant: scope.tenant,
        scopeId: scope.id,
        kid,
        publicKeyPem: publicKey,
        privateKeyPem: privateKey,
        algorithm: 'RS256',
        active: true,
      },
      transaction
    );

    await this.logCreate(
      newKey.id,
      this.auditSafeKeyFields({
        ...newKey,
        createdAt: newKey.createdAt,
        rotatedAt: newKey.rotatedAt,
      }),
      { scopeTenant: scope.tenant, scopeId: scope.id },
      transaction
    );

    if (current) {
      await this.repositories.signingKeyRepository.updateSigningKey(
        current.id,
        { active: false, rotatedAt: now },
        transaction
      );

      await this.logAction(
        {
          entityId: current.id,
          action: 'ROTATE',
          oldValues: this.auditSafeKeyFields({
            ...current,
            createdAt: current.createdAt,
            rotatedAt: current.rotatedAt,
          }),
          newValues: { active: false, rotatedAt: now },
          metadata: { scopeTenant: scope.tenant, scopeId: scope.id, replacedByKid: kid },
        },
        transaction
      );
    }

    const rows = await this.repositories.signingKeyRepository.listByScope(
      scope.tenant,
      scope.id,
      { limit: 1 },
      transaction
    );
    const key = rows[0];
    if (!key) {
      throw new Error('Failed to create new signing key during rotation');
    }

    return key;
  }
}
