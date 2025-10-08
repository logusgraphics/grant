---
title: Tags & Relationships
description: Generic tag relationship implementation for flexible entity tagging
---

# Tags & Relationships

This document describes the generic tag relationship implementation that allows any entity repository to automatically support tag filtering and relationship loading without code duplication.

## Overview

This document describes the generic tag relationship implementation that allows any entity repository to automatically support tag filtering and relationship loading without code duplication.

## Architecture

### Core Components

1. **EntityRepository Base Class** - Enhanced with generic tag relationship support
2. **TagRelationshipConfig Interface** - Defines the structure for tag relationships
3. **createTagRelationship Utility** - Helper function to create tag configurations
4. **Automatic Query Routing** - Smart detection of when to load tags

### How It Works

The system automatically detects when tag relationships are requested and routes queries through the appropriate path:

1. **Field Detection**: Checks if `requestedFields` includes `'tags'`
2. **Relationship Check**: Verifies if the entity has a `tagRelationship` configured
3. **Query Routing**:
   - If tags are requested → Uses `queryWithTags()` with JOINs
   - If no tags requested → Uses regular `query()` without JOINs
4. **Automatic Tag Filtering**: Applies `tagIds` filtering when provided

## Implementation Examples

### 1. Project Repository (Already Implemented)

```typescript
import { createTagRelationship } from '@/graphql/repositories/common/utils';
import { projectTags } from '../project-tags/schema';
import { tags } from '../tags/schema';

export class ProjectRepository extends EntityRepository<ProjectModel, Project> {
  protected table = projects;
  protected searchFields: Array<keyof ProjectModel> = ['name', 'slug', 'description'];
  protected defaultSortField: keyof ProjectModel = 'createdAt';

  // Configure tag relationship for this entity
  protected tagRelationship = createTagRelationship(
    projectTags, // Pivot table
    tags, // Tags table
    'projectId', // Field in pivot table referencing project
    'tagId' // Field in pivot table referencing tag
  );

  // ... rest of implementation
}
```

### 2. User Repository (Example)

```typescript
export class UserRepository extends EntityRepository<UserModel, User> {
  protected table = users;
  protected searchFields: Array<keyof UserModel> = ['name', 'email'];
  protected defaultSortField: keyof UserModel = 'createdAt';

  // Configure tag relationship for users
  protected tagRelationship = createTagRelationship(
    userTags, // Pivot table
    tags, // Tags table
    'userId', // Field in pivot table referencing user
    'tagId' // Field in pivot table referencing tag
  );
}
```

### 3. Role Repository (Example)

```typescript
export class RoleRepository extends EntityRepository<RoleModel, Role> {
  protected table = roles;
  protected searchFields: Array<keyof RoleModel> = ['name', 'description'];
  protected defaultSortField: keyof RoleModel = 'createdAt';

  // Configure tag relationship for roles
  protected tagRelationship = createTagRelationship(
    roleTags, // Pivot table
    tags, // Tags table
    'roleId', // Field in pivot table referencing role
    'tagId' // Field in pivot table referencing tag
  );
}
```

## Tag Relationship Configuration

### createTagRelationship Utility

```typescript
export function createTagRelationship<T extends Table>(
  pivotTable: T,
  tagsTable: Table,
  entityField: string,
  tagField: string
): TagRelationshipConfig {
  return {
    pivotTable,
    tagsTable,
    entityField,
    tagField,
  };
}
```

### TagRelationshipConfig Interface

```typescript
export interface TagRelationshipConfig {
  pivotTable: Table;
  tagsTable: Table;
  entityField: string; // Field in pivot table that references the entity
  tagField: string; // Field in pivot table that references the tag
}
```

## Automatic Query Routing

### Base EntityRepository Enhancement

```typescript
export abstract class EntityRepository<TModel, TEntity> {
  protected tagRelationship?: TagRelationshipConfig;

  async query(params: QueryParams & { requestedFields?: string[] }): Promise<TEntity[]> {
    const { requestedFields, ...queryParams } = params;

    // Check if tags are requested and entity has tag relationship
    if (requestedFields?.includes('tags') && this.tagRelationship) {
      return this.queryWithTags(queryParams);
    }

    // Regular query without tags
    return this.queryWithoutTags(queryParams);
  }

  private async queryWithTags(params: QueryParams): Promise<TEntity[]> {
    const { tagIds, ...otherParams } = params;

    // Build query with JOINs for tags
    let query = this.db
      .select({
        ...this.getEntityFields(),
        tags: sql<Tag[]>`COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${this.tagRelationship!.tagsTable.id},
              'name', ${this.tagRelationship!.tagsTable.name},
              'color', ${this.tagRelationship!.tagsTable.color}
            )
          ) FILTER (WHERE ${this.tagRelationship!.tagsTable.id} IS NOT NULL),
          '[]'::json
        )`,
      })
      .from(this.table)
      .leftJoin(
        this.tagRelationship!.pivotTable,
        eq(this.table.id, this.tagRelationship!.pivotTable[this.tagRelationship!.entityField])
      )
      .leftJoin(
        this.tagRelationship!.tagsTable,
        eq(
          this.tagRelationship!.pivotTable[this.tagRelationship!.tagField],
          this.tagRelationship!.tagsTable.id
        )
      )
      .groupBy(this.table.id);

    // Apply tag filtering if tagIds provided
    if (tagIds && tagIds.length > 0) {
      query = query.having(
        sql`COUNT(DISTINCT ${this.tagRelationship!.pivotTable[this.tagRelationship!.tagField]}) = ${tagIds.length}`
      );
    }

    // Apply other filters
    query = this.applyFilters(query, otherParams);

    return query;
  }

  private async queryWithoutTags(params: QueryParams): Promise<TEntity[]> {
    // Regular query without tag JOINs
    let query = this.db.select().from(this.table);
    query = this.applyFilters(query, params);
    return query;
  }
}
```

## GraphQL Integration

### Schema Definition

```graphql
type Project {
  id: ID!
  name: String!
  slug: String!
  description: String
  tags: [Tag!] # Automatically loaded when requested
  createdAt: String!
  updatedAt: String!
}

type Tag {
  id: ID!
  name: String!
  color: String
  createdAt: String!
  updatedAt: String!
}
```

### Query Examples

```graphql
# Query projects with tags
query GetProjectsWithTags {
  projects {
    id
    name
    tags {
      id
      name
      color
    }
  }
}

# Query projects filtered by tags
query GetProjectsByTags($tagIds: [ID!]) {
  projects(tagIds: $tagIds) {
    id
    name
    tags {
      id
      name
      color
    }
  }
}

# Query projects without tags (more efficient)
query GetProjectsWithoutTags {
  projects {
    id
    name
    slug
  }
}
```

## Performance Considerations

### Query Optimization

1. **Conditional JOINs**: Tags are only joined when explicitly requested
2. **Field Selection**: Only loads tag fields when needed
3. **Efficient Aggregation**: Uses PostgreSQL's JSON_AGG for tag collection
4. **Index Optimization**: Proper indexes on pivot table fields

### Indexing Strategy

```sql
-- Pivot table indexes
CREATE INDEX project_tags_project_id_idx ON project_tags(project_id);
CREATE INDEX project_tags_tag_id_idx ON project_tags(tag_id);
CREATE INDEX project_tags_composite_idx ON project_tags(project_id, tag_id);

-- Tags table indexes
CREATE INDEX tags_name_idx ON tags(name);
CREATE INDEX tags_color_idx ON tags(color);
```

## Usage Patterns

### 1. Basic Tagging

```typescript
// Create a project with tags
const project = await projectRepository.create(
  {
    name: 'My Project',
    slug: 'my-project',
    description: 'A sample project',
  },
  performedBy
);

// Add tags to the project
await projectRepository.addTags(project.id, ['frontend', 'react', 'typescript'], performedBy);
```

### 2. Tag Filtering

```typescript
// Find projects with specific tags
const frontendProjects = await projectRepository.query({
  tagIds: ['frontend-tag-id'],
  requestedFields: ['id', 'name', 'tags'],
});
```

### 3. Tag Management

```typescript
// Get all tags
const allTags = await tagRepository.query({});

// Create new tag
const newTag = await tagRepository.create(
  {
    name: 'backend',
    color: '#ff6b6b',
  },
  performedBy
);

// Update tag
await tagRepository.update(
  tagId,
  {
    name: 'Backend Development',
    color: '#4ecdc4',
  },
  performedBy
);
```

## Advanced Features

### 1. Tag Suggestions

```typescript
// Get tag suggestions based on existing tags
async getTagSuggestions(entityId: string, limit: number = 5): Promise<Tag[]> {
  const entityTags = await this.getEntityTags(entityId);
  const tagIds = entityTags.map(tag => tag.id);

  return this.db
    .select()
    .from(tags)
    .where(
      and(
        notInArray(tags.id, tagIds),
        // Add logic to find related tags based on usage patterns
      )
    )
    .limit(limit);
}
```

### 2. Tag Analytics

```typescript
// Get tag usage statistics
async getTagUsageStats(): Promise<TagUsageStats[]> {
  return this.db
    .select({
      tagId: this.tagRelationship!.pivotTable[this.tagRelationship!.tagField],
      tagName: this.tagRelationship!.tagsTable.name,
      usageCount: sql<number>`COUNT(*)`,
    })
    .from(this.tagRelationship!.pivotTable)
    .innerJoin(
      this.tagRelationship!.tagsTable,
      eq(
        this.tagRelationship!.pivotTable[this.tagRelationship!.tagField],
        this.tagRelationship!.tagsTable.id
      )
    )
    .groupBy(
      this.tagRelationship!.pivotTable[this.tagRelationship!.tagField],
      this.tagRelationship!.tagsTable.name
    )
    .orderBy(desc(sql`COUNT(*)`));
}
```

### 3. Bulk Tag Operations

```typescript
// Bulk add tags to multiple entities
async bulkAddTags(entityIds: string[], tagIds: string[], performedBy: string): Promise<void> {
  const tagAssignments = entityIds.flatMap(entityId =>
    tagIds.map(tagId => ({
      [this.tagRelationship!.entityField]: entityId,
      [this.tagRelationship!.tagField]: tagId,
      performedBy,
    }))
  );

  await this.db.insert(this.tagRelationship!.pivotTable).values(tagAssignments);
}
```

## Testing

### Unit Tests

```typescript
describe('Tag Relationship', () => {
  it('should load tags when requested', async () => {
    const projects = await projectRepository.query({
      requestedFields: ['id', 'name', 'tags'],
    });

    expect(projects[0]).toHaveProperty('tags');
    expect(Array.isArray(projects[0].tags)).toBe(true);
  });

  it('should not load tags when not requested', async () => {
    const projects = await projectRepository.query({
      requestedFields: ['id', 'name'],
    });

    expect(projects[0]).not.toHaveProperty('tags');
  });

  it('should filter by tags', async () => {
    const projects = await projectRepository.query({
      tagIds: ['frontend-tag-id'],
      requestedFields: ['id', 'name', 'tags'],
    });

    expect(projects).toHaveLength(1);
    expect(projects[0].tags.some((tag) => tag.id === 'frontend-tag-id')).toBe(true);
  });
});
```

## Migration Guide

### Adding Tags to Existing Entities

1. **Create Pivot Table**:

   ```sql
   CREATE TABLE entity_tags (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     entity_id UUID NOT NULL REFERENCES entities(id),
     tag_id UUID NOT NULL REFERENCES tags(id),
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(entity_id, tag_id)
   );
   ```

2. **Update Repository**:

   ```typescript
   export class EntityRepository extends EntityRepository<EntityModel, Entity> {
     protected tagRelationship = createTagRelationship(entityTags, tags, 'entityId', 'tagId');
   }
   ```

3. **Update GraphQL Schema**:
   ```graphql
   type Entity {
     # ... existing fields
     tags: [Tag!]
   }
   ```

## Best Practices

### 1. Tag Naming

- Use lowercase, hyphenated names: `frontend`, `react`, `api-development`
- Keep names descriptive but concise
- Avoid special characters and spaces

### 2. Tag Colors

- Use consistent color palette
- Consider accessibility (contrast ratios)
- Use colors to group related tags

### 3. Performance

- Limit the number of tags per entity (recommended: < 10)
- Use indexes on frequently queried tag combinations
- Consider tag caching for high-traffic applications

### 4. User Experience

- Provide tag suggestions based on existing tags
- Allow users to create new tags when needed
- Show tag usage statistics to help users choose relevant tags

---

**Next:** Learn about [Groups & Permissions](/core-concepts/groups-permissions) to understand the permission system.
