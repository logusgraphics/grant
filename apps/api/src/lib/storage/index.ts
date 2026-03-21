// Re-export from @grantjs/storage — canonical implementations live there
export type { LocalConfig, S3Config } from '@grantjs/storage';
export { LocalStorageAdapter, S3StorageAdapter, StorageFactory } from '@grantjs/storage';

// Re-export types from @grantjs/core
export type { IFileStorageService, UploadOptions, UploadResult } from '@grantjs/core';
