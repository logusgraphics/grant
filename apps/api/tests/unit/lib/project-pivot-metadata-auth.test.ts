import { describe, expect, it } from 'vitest';

import { AuthorizationError } from '@/lib/errors';
import { assertProjectPivotMetadataMutationAllowed } from '@/lib/project-pivot-metadata-auth.lib';

describe('assertProjectPivotMetadataMutationAllowed', () => {
  it('throws when a self-managed user edits their own pivot metadata', () => {
    expect(() => assertProjectPivotMetadataMutationAllowed('u1', 'u1', true)).toThrow(
      AuthorizationError
    );
  });

  it('allows an administrator to edit another self-managed user pivot metadata', () => {
    expect(() => assertProjectPivotMetadataMutationAllowed('admin', 'u1', true)).not.toThrow();
  });

  it('allows self-edit when the target has no authentication methods (admin-managed)', () => {
    expect(() => assertProjectPivotMetadataMutationAllowed('u1', 'u1', false)).not.toThrow();
  });
});
