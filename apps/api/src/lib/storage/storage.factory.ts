import { BadRequestError } from '@/lib/errors';

import { LocalConfig, LocalStorageAdapter } from './adapters/local.adapter';
import { S3Config, S3StorageAdapter } from './adapters/s3.adapter';
import { IFileStorageService } from './storage.interface';

export type StorageProvider = 'local' | 's3';

export interface StorageFactoryConfig {
  provider: StorageProvider;
  local?: LocalConfig;
  s3?: S3Config;
}

/**
 * Factory for creating file storage service instances based on configuration
 */
export class StorageFactory {
  static createStorageService(config: StorageFactoryConfig): IFileStorageService {
    switch (config.provider) {
      case 'local':
        if (!config.local) {
          throw new BadRequestError(
            'Local storage configuration is required when using local adapter',
            'errors:validation.required',
            { field: 'local' }
          );
        }
        return new LocalStorageAdapter(config.local);

      case 's3':
        if (!config.s3) {
          throw new BadRequestError(
            'S3 configuration is required when using s3 adapter',
            'errors:validation.required',
            { field: 's3' }
          );
        }
        return new S3StorageAdapter(config.s3);

      default:
        throw new BadRequestError(
          `Unknown storage provider: ${config.provider}`,
          'errors:validation.invalid',
          { field: 'provider' }
        );
    }
  }
}
