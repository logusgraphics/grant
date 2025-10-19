# Advanced Topics

This section covers advanced technical topics for developers building with Grant Platform. These documents dive deep into specific features, patterns, and implementation details.

## Quick Navigation

### Infrastructure & Performance

- **[Caching System](./caching.md)** - Strategy-based caching with Redis and in-memory adapters
- **[Cache Setup Guide](./caching-setup.md)** - Step-by-step cache configuration
- **[Performance Optimization](./performance.md)** - Techniques for optimizing Grant Platform performance

### Communication & Integration

- **[Email Service & Adapters](./email-service.md)** - Flexible email delivery using the Adapter Pattern
  - Adapter implementations (Console, SMTP, Mailgun, Mailjet)
  - Configuration and environment variables
  - Email templates and rate limiting
  - Testing strategies

### Data Management

- **[Field Selection](./field-selection.md)** - GraphQL field selection optimization
- **[Transaction Management](./transactions.md)** - Database transaction handling and best practices
- **[Audit Logging](./audit-logging.md)** - Comprehensive audit trail for compliance

### Extensibility

- **[Custom Middleware](./middleware.md)** - Building custom GraphQL and REST middleware

## Featured: Email Service & Adapters

Grant Platform's **email service** follows the Adapter Pattern, allowing you to swap email providers without changing application code:

### Architecture

```
EmailService → Factory → Strategy
                          ├── ConsoleAdapter (Dev)
                          ├── SMTPAdapter (Generic)
                          ├── MailgunAdapter (Production)
                          └── MailjetAdapter (Production)
```

### Quick Example

```typescript
// Send invitation email
await emailService.sendInvitation({
  to: 'developer@example.com',
  organizationName: 'Acme Corp',
  inviterName: 'John Doe',
  invitationUrl: 'https://app.example.com/invite/abc123',
  roleName: 'Developer',
});
```

### Configuration

```bash
# Choose your adapter
EMAIL_STRATEGY=mailgun

# Configure provider
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
```

**Learn More:** [Email Service & Adapters Guide](./email-service.md)

## Design Patterns

Grant Platform leverages several design patterns for flexibility and maintainability:

### 1. **Adapter Pattern** (Email, Cache)

Provides a consistent interface while allowing swappable implementations:

- **Email Adapters**: Console, SMTP, Mailgun, Mailjet
- **Cache Adapters**: In-Memory, Redis

**Benefits:**

- Runtime strategy selection
- Easy testing with mocks
- No vendor lock-in

### 2. **Repository Pattern** (Data Access)

Abstracts database operations behind interfaces:

```typescript
class UserRepository extends EntityRepository<UserModel, User> {
  async query(params: QueryParams): Promise<User[]> { ... }
  async create(data: CreateUserInput): Promise<User> { ... }
}
```

**Benefits:**

- Separation of concerns
- Testable data layer
- Consistent API

### 3. **Service Layer** (Business Logic)

Encapsulates business rules and validation:

```typescript
class OrganizationInvitationService {
  async createInvitation(params): Promise<Invitation> {
    // Validation
    // Business logic
    // Audit logging
  }
}
```

**Benefits:**

- Reusable business logic
- Transaction management
- Audit logging

### 4. **Factory Pattern** (Object Creation)

Centralizes object instantiation:

```typescript
class EmailAdapterFactory {
  create(): IEmailAdapter {
    switch (this.config.strategy) {
      case 'mailgun':
        return new MailgunAdapter(config);
      case 'smtp':
        return new SMTPAdapter(config);
      // ...
    }
  }
}
```

**Benefits:**

- Single responsibility
- Runtime selection
- Easy to extend

## Performance Optimization Strategies

### 1. Caching

- **Query Result Caching**: Cache expensive database queries
- **Entity Caching**: Store frequently accessed entities
- **Distributed Caching**: Redis for multi-instance deployments

### 2. Field Selection

- **GraphQL Field Filtering**: Only load requested fields
- **Relationship Loading**: Conditional JOIN based on fields
- **N+1 Query Prevention**: DataLoader pattern

### 3. Database Optimization

- **Indexes**: Strategic indexing on frequently queried fields
- **Query Optimization**: Use field selection to reduce data transfer
- **Connection Pooling**: Reuse database connections

### 4. Transaction Management

- **Transaction Isolation**: Use transactions for consistency
- **Batch Operations**: Group related operations
- **Rollback Strategies**: Handle failures gracefully

## Security Best Practices

### 1. Email Security

- **Secure Tokens**: Cryptographically secure random tokens (256 bits)
- **Token Expiration**: Time-limited invitations (7 days)
- **Rate Limiting**: Prevent invitation spam
- **HTTPS Only**: All invitation links use HTTPS

### 2. Data Access

- **Scope Isolation**: Tenant-based data isolation
- **Soft Deletes**: Retain data for audit
- **Audit Logging**: Track all sensitive operations

### 3. Authentication

- **JWT Tokens**: Secure, stateless authentication
- **Token Refresh**: Automatic token renewal
- **Session Management**: Track active sessions

## Testing Strategies

### Unit Testing

```typescript
// Mock adapters for unit tests
const mockEmailAdapter = {
  send: vi.fn().mockResolvedValue(undefined),
};

const emailService = new EmailService(mockAdapterFactory);
await emailService.sendInvitation({ ... });
expect(mockEmailAdapter.send).toHaveBeenCalled();
```

### Integration Testing

```typescript
// Test with real adapters in staging
const emailService = new EmailService(
  new EmailAdapterFactory(productionConfig)
);
await emailService.sendInvitation({ ... });
// Verify email received
```

### End-to-End Testing

```typescript
// Test complete flows
await inviteMember({ organizationId, email, roleId });
const invitation = await getInvitationByToken(token);
await acceptInvitation({ token, userData });
// Verify user added to organization
```

## Common Use Cases

### 1. Adding Email to Existing Feature

```typescript
// Step 1: Define email type in IEmailService
interface IEmailService {
  sendWelcome(params: WelcomeParams): Promise<void>;
}

// Step 2: Implement in EmailService
async sendWelcome(params) {
  await this.adapter.send({
    to: params.to,
    subject: 'Welcome!',
    html: renderWelcomeTemplate(params),
  });
}

// Step 3: Use in handler
await context.services.email.sendWelcome({ to, name });
```

### 2. Implementing Custom Adapter

```typescript
// Step 1: Create adapter class
export class SendGridAdapter implements IEmailAdapter {
  async send(message: EmailMessage): Promise<void> {
    // SendGrid-specific implementation
  }
}

// Step 2: Register in factory
create(): IEmailAdapter {
  switch (strategy) {
    case 'sendgrid': return new SendGridAdapter(config);
    // ...
  }
}

// Step 3: Configure environment
EMAIL_STRATEGY=sendgrid
SENDGRID_API_KEY=your-key
```

### 3. Adding Audit Logging

```typescript
// Extend AuditService
export class MyService extends AuditService {
  async performAction(id: string): Promise<void> {
    const oldValues = await this.getEntity(id);
    // Perform action
    const newValues = await this.getEntity(id);
    await this.logUpdate(id, oldValues, newValues, { context: 'MyService.performAction' });
  }
}
```

## Monitoring & Observability

### Logging

```typescript
// Structured logging
logger.info('Email sent', {
  to: email,
  type: 'invitation',
  organizationId,
  duration: Date.now() - start,
});
```

### Metrics

- Email delivery rates
- Cache hit/miss ratios
- Query performance
- Transaction durations

### Alerts

- Failed email deliveries
- Cache connection failures
- Slow queries
- High error rates

## Related Documentation

- [Core Concepts](../core-concepts/) - User-facing feature documentation
- [Architecture](../architecture/) - System architecture and design
- [API Reference](../api-reference/) - GraphQL and REST API documentation
- [Development](../development/) - Development guides and best practices

## Contributing

Want to improve these advanced features? Check out:

- [Development Guide](../development/guide.md)
- [Contributing Guidelines](../development/contributing.md)
- [Testing Guide](../development/testing.md)

---

**Have questions?** Check the [FAQ](../troubleshooting/faq.md) or [file an issue](https://github.com/logusgraphics/grant-platform/issues).
