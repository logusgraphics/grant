import { NextResponse } from 'next/server';

import { GrantClient } from '@grantjs/server';
import { withGrant } from '@grantjs/server/next';

import { documents } from './data';

const apiUrl = process.env.GRANT_API_URL!;
const grantClient = new GrantClient({
  apiUrl,
  getToken: (request: unknown) => {
    const req = request as { headers?: { get: (name: string) => string | null } };
    const auth = req.headers?.get?.('authorization');
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return process.env.GRANT_TOKEN ?? null;
  },
});

// GET /api/documents — List (Document:Query)
export const GET = withGrant(grantClient, { resource: 'document', action: 'query' }, async () =>
  NextResponse.json({ data: Array.from(documents.values()) })
);

// POST /api/documents — Create (Document:Create)
export const POST = withGrant(
  grantClient,
  { resource: 'document', action: 'create' },
  async (request) => {
    const body = (await request.json().catch(() => ({}))) as { title?: string };
    const id = `doc-${Date.now()}`;
    const title = body?.title ?? 'Untitled';
    documents.set(id, { id, title });
    return NextResponse.json({ data: { id, title } }, { status: 201 });
  }
);
