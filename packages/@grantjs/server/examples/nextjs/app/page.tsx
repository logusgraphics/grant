export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Grant Next.js Example</h1>
      <p>
        API routes are protected with <code>@grantjs/server/next</code>.
      </p>
      <ul>
        <li>
          <code>GET /api/documents</code> — Document:Query
        </li>
        <li>
          <code>POST /api/documents</code> — Document:Create
        </li>
        <li>
          <code>PUT /api/documents/[id]</code> — Document:Update
        </li>
        <li>
          <code>PATCH /api/documents/[id]</code> — Document:Update
        </li>
        <li>
          <code>DELETE /api/documents/[id]</code> — Document:Delete
        </li>
      </ul>
      <p>
        Use <code>Authorization: Bearer &lt;token&gt;</code> or set GRANT_TOKEN in .env.
      </p>
    </main>
  );
}
