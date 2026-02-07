// In-memory store for demo (shared across route handlers)
export const documents = new Map<string, { id: string; title: string }>([
  ['doc-1', { id: 'doc-1', title: 'First' }],
  ['doc-2', { id: 'doc-2', title: 'Second' }],
]);
