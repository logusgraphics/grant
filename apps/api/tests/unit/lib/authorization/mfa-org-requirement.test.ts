import { Tenant } from '@grantjs/schema';
import { describe, expect, it, vi } from 'vitest';

import { resolveOrgRequiresMfaForSensitiveActions } from '@/lib/authorization/mfa-org-requirement';

describe('resolveOrgRequiresMfaForSensitiveActions', () => {
  it('returns org flag for Tenant.Organization', async () => {
    const getOrganizations = vi.fn().mockResolvedValue({
      organizations: [{ requireMfaForSensitiveActions: true }],
    });
    const result = await resolveOrgRequiresMfaForSensitiveActions(
      { tenant: Tenant.Organization, id: 'org-1' },
      getOrganizations
    );
    expect(result).toBe(true);
    expect(getOrganizations).toHaveBeenCalledWith({
      ids: ['org-1'],
      limit: 1,
      requestedFields: ['requireMfaForSensitiveActions'],
    });
  });

  it('uses first segment of scope id for OrganizationProject', async () => {
    const getOrganizations = vi.fn().mockResolvedValue({
      organizations: [{ requireMfaForSensitiveActions: false }],
    });
    const result = await resolveOrgRequiresMfaForSensitiveActions(
      { tenant: Tenant.OrganizationProject, id: 'org-uuid:project-uuid' },
      getOrganizations
    );
    expect(result).toBe(false);
    expect(getOrganizations).toHaveBeenCalledWith({
      ids: ['org-uuid'],
      limit: 1,
      requestedFields: ['requireMfaForSensitiveActions'],
    });
  });

  it('returns false for Account tenant (not org-governed)', async () => {
    const getOrganizations = vi.fn();
    const result = await resolveOrgRequiresMfaForSensitiveActions(
      { tenant: Tenant.Account, id: 'acc-1' },
      getOrganizations
    );
    expect(result).toBe(false);
    expect(getOrganizations).not.toHaveBeenCalled();
  });
});
