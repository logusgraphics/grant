import { CreateRoleParams, CreateRoleResult } from '@/graphql/providers/roles/types';
import { createRole as createRoleInStore } from '@/graphql/providers/roles/faker/dataStore';

export async function createRole({ input }: CreateRoleParams): Promise<CreateRoleResult> {
  const roleData = createRoleInStore(input);
  return { ...roleData, groups: [] };
}
