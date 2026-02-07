import { GrantModule } from '@grantjs/server/nest';
import { Module } from '@nestjs/common';

import { DocumentsModule } from './documents/documents.module.js';

const apiUrl = process.env.GRANT_API_URL;
if (!apiUrl) {
  console.error('Missing GRANT_API_URL. Copy .env.example to .env and set it.');
  process.exit(1);
}

@Module({
  imports: [
    GrantModule.forRoot({
      apiUrl,
      getToken: (req: unknown) => {
        const r = req as { headers?: { authorization?: string } };
        const auth = r.headers?.authorization;
        if (auth?.startsWith('Bearer ')) return auth.slice(7);
        return process.env.GRANT_TOKEN ?? null;
      },
    }),
    DocumentsModule,
  ],
})
export class AppModule {}
