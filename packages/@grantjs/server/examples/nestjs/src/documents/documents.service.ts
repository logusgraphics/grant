import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentsService {
  private readonly store = new Map<string, { id: string; title: string }>([
    ['doc-1', { id: 'doc-1', title: 'First' }],
    ['doc-2', { id: 'doc-2', title: 'Second' }],
  ]);

  findAll(): { id: string; title: string }[] {
    return Array.from(this.store.values());
  }

  findOne(id: string): { id: string; title: string } | undefined {
    return this.store.get(id);
  }

  create(title: string): { id: string; title: string } {
    const id = `doc-${Date.now()}`;
    const doc = { id, title };
    this.store.set(id, doc);
    return doc;
  }

  update(id: string, title: string): { id: string; title: string } | undefined {
    const doc = this.store.get(id);
    if (!doc) return undefined;
    doc.title = title;
    this.store.set(id, doc);
    return doc;
  }

  patch(id: string, updates: { title?: string }): { id: string; title: string } | undefined {
    const doc = this.store.get(id);
    if (!doc) return undefined;
    if (updates.title != null) doc.title = updates.title;
    this.store.set(id, doc);
    return doc;
  }

  remove(id: string): boolean {
    return this.store.delete(id);
  }
}
