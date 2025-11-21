import { config } from '@/config';
import { IFileStorageService, StorageFactory, UploadOptions, UploadResult } from '@/lib/storage';

/**
 * File Storage Service
 * Provides a centralized file storage service instance for the application
 */
export class FileStorageService {
  private storageAdapter: IFileStorageService;

  constructor() {
    this.storageAdapter = StorageFactory.createStorageService({
      provider: config.storage.provider,
      local:
        config.storage.provider === 'local'
          ? {
              basePath: config.storage.local.basePath,
            }
          : undefined,
      s3:
        config.storage.provider === 's3'
          ? {
              bucket: config.storage.s3.bucket,
              region: config.storage.s3.region,
              accessKeyId: config.storage.s3.accessKeyId,
              secretAccessKey: config.storage.s3.secretAccessKey,
              endpoint: config.storage.s3.endpoint,
              publicUrl: config.storage.s3.publicUrl,
            }
          : undefined,
    });
  }

  /**
   * Get the storage adapter instance
   */
  public getAdapter(): IFileStorageService {
    return this.storageAdapter;
  }

  /**
   * Upload a file to storage
   */
  public async upload(file: Buffer, path: string, options?: UploadOptions): Promise<UploadResult> {
    return this.storageAdapter.upload(file, path, options);
  }

  /**
   * Delete a file from storage
   */
  public async delete(path: string): Promise<void> {
    return this.storageAdapter.delete(path);
  }

  /**
   * Get public URL for a file
   */
  public async getUrl(path: string): Promise<string> {
    return this.storageAdapter.getUrl(path);
  }

  /**
   * Check if a file exists
   */
  public async exists(path: string): Promise<boolean> {
    return this.storageAdapter.exists(path);
  }

  /**
   * Copy a file to a new location
   */
  public async copy(sourcePath: string, destinationPath: string): Promise<void> {
    return this.storageAdapter.copy(sourcePath, destinationPath);
  }
}
