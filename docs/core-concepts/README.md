# Core Concepts

This section covers the fundamental concepts and features of Grant Platform. These documents explain how the system works from a user and developer perspective.

## Quick Navigation

### Multi-Tenancy & Accounts

- **[Accounts & Organizations](./accounts-organizations.md)** - Understanding the account system and multi-tenancy model

### Resource Scoping

- **[Projects & Scoping](./projects-scoping.md)** - How projects work and scope isolation

### Access Control

- **[Users & Roles](./users-roles.md)** - User management and role-based access control (RBAC)
- **[Groups & Permissions](./groups-permissions.md)** - Group-based access control and fine-grained permissions

### Member Management

- **[Organization Members & Invitations](./organization-invitations.md)** - Email-based invitation system for adding members to organizations
  - Invitation flow and acceptance
  - Organization role seeding (owner, admin, dev, viewer)
  - Security and audit logging

### Organization & Categorization

- **[Tags & Relationships](./tags-relationships.md)** - Generic tag system for flexible entity categorization

## Key Features

### 🎯 Organization Invitations (New!)

Grant Platform now supports **email-based invitations** for organization members:

- **Secure Token-Based Flow**: 256-bit cryptographically secure tokens
- **Role Pre-Assignment**: Assign roles during invitation
- **Flexible User Creation**: Supports both new and existing users
- **Audit Trail**: Complete logging for compliance
- **Automatic Role Seeding**: Standard roles (owner, admin, dev, viewer) created automatically

**Quick Example:**

```graphql
# Invite a member
mutation InviteMember {
  inviteMember(
    input: { organizationId: "org-123", email: "developer@example.com", roleId: "role-dev" }
  ) {
    id
    email
    status
    expiresAt
  }
}
```

**Learn More:**

- [Organization Members & Invitations Guide](./organization-invitations.md) - Complete user guide
- [Email Service & Adapters](../advanced-topics/email-service.md) - Technical implementation

### 🏢 Multi-Tenancy

Grant supports two account types:

1. **Personal Accounts** - Individual user accounts
2. **Organization Accounts** - Shared team accounts with member management

**Features:**

- Tenant isolation at database level
- Scope-based queries (organization, project, user)
- Cross-tenant user membership

### 🔐 Role-Based Access Control

- Hierarchical role system
- Organization-scoped roles (unique per organization)
- Project-scoped roles
- Permission inheritance

### 🏷️ Flexible Tagging

- Generic tag system for all entities
- Color-coded tags
- Tag filtering and relationships
- Primary tag support

## Getting Started

1. **New to Grant?** Start with [Introduction](../getting-started/introduction.md)
2. **Setting up?** Check [Configuration](../getting-started/configuration.md)
3. **Developing?** See [Development Guide](../development/guide.md)

## Related Documentation

- [Architecture Overview](../architecture/overview.md) - System architecture and design
- [Advanced Topics](../advanced-topics/) - Deep dives into specific features
- [API Reference](../api-reference/) - GraphQL and REST API documentation
- [Deployment](../deployment/) - Deployment guides and infrastructure

---

**Have questions?** Check the [FAQ](../troubleshooting/faq.md) or [file an issue](https://github.com/logusgraphics/grant-platform/issues).
