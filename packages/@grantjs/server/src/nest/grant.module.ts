import { DynamicModule, Global, Module } from '@nestjs/common';

import { GrantClient } from '../grant-client';

import type { GrantServerConfig } from '../types';

export const GRANT_CLIENT = 'GrantClient';

/**
 * NestJS module that provides GrantClient for injection.
 *
 * @example
 * ```ts
 * // app.module.ts
 * import { GrantModule } from '@grantjs/server/nest';
 *
 * @Module({
 *   imports: [
 *     GrantModule.forRoot({
 *       apiUrl: process.env.GRANT_API_URL!,
 *       getToken: (req) => req.headers?.authorization?.replace?.('Bearer ', '') ?? null,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Then inject GrantClient in controllers and use with GrantGuard.
 */
@Global()
@Module({})
export class GrantModule {
  static forRoot(config: GrantServerConfig): DynamicModule {
    const client = new GrantClient(config);
    return {
      module: GrantModule,
      providers: [
        { provide: GrantClient, useValue: client },
        { provide: GRANT_CLIENT, useValue: client },
      ],
      exports: [GrantClient, GRANT_CLIENT],
    };
  }
}
