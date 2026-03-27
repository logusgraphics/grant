import { relations } from 'drizzle-orm';

import { permissions } from './permissions.schema';
import { projectResources } from './project-resources.schema';
import { resourceTags } from './resource-tags.schema';
import { resourceAuditLogs, resources } from './resources.schema';

export const resourcesRelations = relations(resources, ({ many }) => ({
  auditLogs: many(resourceAuditLogs),
  projects: many(projectResources),
  tags: many(resourceTags),
  permissions: many(permissions),
}));
