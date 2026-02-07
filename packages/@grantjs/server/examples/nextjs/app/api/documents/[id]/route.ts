import { NextRequest, NextResponse } from 'next/server';

import { GrantClient } from '@grantjs/server';
import { withGrant } from '@grantjs/server/next';

import { documents } from '../data';

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

// Resolve document by id from pathname for condition evaluation
async function documentResourceResolver({ request }: { resourceSlug: string; request: unknown }) {
  const req = request as NextRequest;
  const segments = req.nextUrl.pathname.split('/').filter(Boolean);
  const id = segments[segments.length - 1];
  if (!id) return null;
  const doc = documents.get(id);
  return doc ? { id: doc.id, title: doc.title } : null;
}

// PUT /api/documents/[id] — Update (Document:Update)
export const PUT = withGrant(
  grantClient,
  {
    resource: 'document',
    action: 'update',
    resourceResolver: documentResourceResolver,
  },
  async (request) => {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1]!;
    const doc = documents.get(id);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as { title?: string };
    doc.title = body?.title ?? doc.title;
    documents.set(id, doc);
    return NextResponse.json({ data: doc });
  }
);

// PATCH /api/documents/[id] — Update (Document:Update)
export const PATCH = withGrant(
  grantClient,
  {
    resource: 'document',
    action: 'update',
    resourceResolver: documentResourceResolver,
  },
  async (request) => {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1]!;
    const doc = documents.get(id);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as { title?: string };
    if (body?.title != null) doc.title = body.title;
    documents.set(id, doc);
    return NextResponse.json({ data: doc });
  }
);

// DELETE /api/documents/[id] — Delete (Document:Delete)
export const DELETE = withGrant(
  grantClient,
  {
    resource: 'document',
    action: 'delete',
    resourceResolver: documentResourceResolver,
  },
  async (request) => {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1]!;
    if (!documents.has(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    documents.delete(id);
    return new NextResponse(null, { status: 204 });
  }
);
