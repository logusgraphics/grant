# @grantjs/client examples

Minimal apps showing how to integrate the Grant client SDK in a frontend. Each example uses `@grantjs/client` (and `@grantjs/client/react`) to perform permission checks against a Grant API.

## Prerequisites

- **Grant API**: A running Grant API (e.g. the main platform API or the `@grantjs/server` example). Set `NEXT_PUBLIC_GRANT_API_URL` in `.env`.
- **Auth**: Implement `getAccessToken` in your Grant config to return the access token from your secure auth store (e.g. server session, httpOnly cookie). Do not store tokens in env or localStorage.

## Running an example

Use **pnpm** (npm does not support `workspace:*` in this repo). From the **monorepo root**:

```bash
# Install all dependencies and build the client package
pnpm install
pnpm --filter @grantjs/client build

# Run the Next.js example (uses port 3004 to avoid conflicting with main app on 3000 and server example on 3003)
cd packages/@grantjs/client/examples/nextjs
cp .env.example .env
# Edit .env: set NEXT_PUBLIC_GRANT_API_URL and NEXT_PUBLIC_GRANT_FRONTEND_URL (required).
pnpm dev
```

Then open http://localhost:3004. Implement `getAccessToken` in the example's Grant config to return the token from your secure auth store so permission checks work.

### Project OAuth (redirect flow)

Add your app's callback URL (e.g. `http://localhost:3004/callback`) to the project app's **allowed redirect URIs** in the Grant dashboard. After sign-in and consent, the user is redirected back with the token in the URL fragment; your backend should establish a secure session (e.g. httpOnly cookie) and redirect the user.

## Examples

| Folder   | Framework | Description                                                      |
| -------- | --------- | ---------------------------------------------------------------- |
| `nextjs` | Next.js   | App Router app with `GrantProvider`, `useGrant`, and `GrantGate` |

## Ports

Examples use distinct ports so they can run alongside the main platform and other examples:

- Main web app: `3000`
- Server Next.js example: `3003`
- **Client Next.js example: `3004`** (set in `nextjs/.env.development`)
