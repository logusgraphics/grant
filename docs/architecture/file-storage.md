# File Storage Architecture

## Overview

The file storage system follows the same adapter pattern as the email service, providing a flexible, provider-agnostic interface for file operations. This allows seamless switching between different storage backends without changing application code.

## Architecture

### Components

1. **Interface** (`IFileStorageService`) - Defines the contract for all storage adapters
2. **Factory** (`StorageFactory`) - Creates adapter instances based on configuration
3. **Adapters** - Provider-specific implementations:
   - `LocalStorageAdapter` - Filesystem storage (works for bare metal, Docker volumes, or any mounted filesystem)
   - `S3StorageAdapter` - AWS S3 (or S3-compatible services)
4. **Service** (`FileStorageService`) - Wrapper service for application use
5. **Configuration** - Environment-based configuration in `env.config.ts`

## Storage Providers

### 1. Local Storage (`local`)

**Use Case**: Development, single-server deployments, Docker volumes, or any filesystem mount

**Configuration**:

```bash
STORAGE_PROVIDER=local
STORAGE_LOCAL_BASE_PATH=./storage
```

**Characteristics**:

- Files stored on filesystem (works for bare metal, Docker volumes, or any mounted filesystem)
- Simple setup, no external dependencies
- Not suitable for multi-server deployments (unless using shared filesystem)
- Files persist across application restarts
- The `basePath` can be configured to any filesystem location:
  - Local directory: `./storage`
  - Docker volume mount: `/app/storage`
  - NFS mount: `/mnt/nfs/storage`
  - Any other mounted filesystem

**Docker Setup Example**:

```yaml
volumes:
  - ./storage:/app/storage
```

Then set `STORAGE_LOCAL_BASE_PATH=/app/storage`

### 2. S3 Storage (`s3`)

**Use Case**: Production, multi-server deployments, cloud-native

**Configuration**:

```bash
STORAGE_PROVIDER=s3
STORAGE_S3_BUCKET=my-bucket-name
STORAGE_S3_REGION=us-east-1
STORAGE_S3_ACCESS_KEY_ID=your-access-key
STORAGE_S3_SECRET_ACCESS_KEY=your-secret-key
STORAGE_S3_PUBLIC_URL=https://cdn.example.com  # Optional: CloudFront URL
STORAGE_S3_ENDPOINT=https://s3.amazonaws.com    # Optional: Custom endpoint (e.g., MinIO)
```

**Characteristics**:

- Scalable, cloud-native storage
- Supports CDN integration (CloudFront)
- Works with S3-compatible services (MinIO, DigitalOcean Spaces, etc.)
- Requires AWS SDK dependencies

## Interface Methods

```typescript
interface IFileStorageService {
  upload(file: Buffer, path: string, options?: UploadOptions): Promise<UploadResult>;
  delete(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
  copy(sourcePath: string, destinationPath: string): Promise<void>;
}
```

## Usage

### In Services

```typescript
import { Services } from '@/services';

export class UserService {
  constructor(
    private readonly repositories: Repositories,
    private readonly services: Services
  ) {}

  async uploadProfilePicture(userId: string, file: Buffer): Promise<string> {
    const path = `users/${userId}/profile.jpg`;
    const result = await this.services.fileStorage.upload(file, path, {
      contentType: 'image/jpeg',
      public: true,
    });
    return result.url;
  }
}
```

### In Handlers

```typescript
import { GraphqlContext } from '@/graphql/types';

export async function uploadUserPicture(
  _parent: unknown,
  args: { file: File },
  context: GraphqlContext
): Promise<string> {
  const fileBuffer = await args.file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  const path = `users/${context.user.id}/picture.jpg`;
  const result = await context.services.fileStorage.upload(buffer, path, {
    contentType: 'image/jpeg',
  });

  return result.url;
}
```

## File Path Conventions

Recommended path structure:

```
users/{userId}/profile.jpg
users/{userId}/avatar.png
accounts/{accountId}/logo.svg
projects/{projectId}/attachments/{filename}
```

## Security Considerations

1. **File Validation**: Always validate file types, sizes, and content
2. **Path Sanitization**: Prevent directory traversal attacks
3. **Access Control**: Implement authorization checks before file operations
4. **Public vs Private**: Use `public: true` option only for public assets
5. **Signed URLs**: S3 adapter generates signed URLs for private files

## Dependencies

### Required for S3 Adapter

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Note**: The `local` adapter works for all filesystem-based storage, including Docker volumes. There's no need for a separate Docker volume adapter since a Docker volume is just a mounted filesystem path.

### Optional Dependencies

- Image processing libraries (sharp, jimp) for resizing/optimization
- File type validation libraries (file-type)

## Migration Between Providers

Switching providers is as simple as changing environment variables:

```bash
# From local to S3
STORAGE_PROVIDER=s3
STORAGE_S3_BUCKET=my-bucket
# ... other S3 config
```

**Note**: Existing files must be migrated manually using the `copy` method or external migration scripts.

## Future Enhancements

- Image optimization/resizing
- File type validation
- Virus scanning integration
- CDN cache invalidation
- Multi-part uploads for large files
- Streaming uploads/downloads
