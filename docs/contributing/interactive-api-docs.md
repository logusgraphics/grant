---
title: Interactive API docs and code blocks
description: Options for runnable requests and collapsible curl blocks in VitePress
---

# Interactive API docs and code blocks

You can add Swagger-like “try it” behavior and collapsible code blocks to the docs using existing VitePress plugins and, optionally, a small custom component.

## 1. Collapsible code blocks (accordion)

**[vitepress-plugin-codeblocks-fold](https://github.com/T-miracle/vitepress-plugin-codeblocks-fold)** adds a fold/collapse control to fenced code blocks. Readers can collapse long `curl` examples and expand them when needed.

- **Install:** `pnpm add -D vitepress-plugin-codeblocks-fold` (in `docs/` or monorepo root).
- **Wire in:** `.vitepress/theme/index.js` — import the plugin and its CSS, call `codeblocksFold({ route, frontmatter })` in `setup()` (see plugin README).
- **Behavior:** All code blocks get a fold toggle. Use frontmatter `cbf: true` (collapse all on page) or `cbf: [1,2,3]` (collapse blocks 1–3 only).

This gives you the “optionally toggle the curl code block” behavior without custom components.

## 2. Execute requests with a button (Swagger-style)

Two approaches:

### A. OpenAPI-driven playground (API Reference)

**[vitepress-openapi](https://vitepress-openapi.vercel.app/)** integrates an OpenAPI 3 spec into VitePress and provides an interactive playground: users pick an operation, fill parameters (and optionally body), and execute the request from the docs.

- **Best for:** API Reference pages generated from or aligned with your OpenAPI spec.
- **How it works:** You pass the spec (e.g. from `public/openapi.json` or your API’s `/api-docs.json`) to the plugin; it renders operations with “Try it” UI and executes requests via `fetch`.
- **Install:** `pnpm add vitepress-openapi` in the docs package.
- **Setup:** In `.vitepress/theme/index.js`, import the theme and CSS from `vitepress-openapi`, call `useOpenapi({ spec })` and `theme.enhanceApp({ app })` in `enhanceApp`. See [Getting Started](https://vitepress-openapi.vercel.app/guide/getting-started.html).
- **Grant API:** The API serves OpenAPI at `/api-docs.json`; the docs site could load that URL (e.g. in dev) or use a built/copied spec so the playground runs against the same contract.

This does not add a “Run” button next to each manual `curl` block in the Integration Guide; it adds a separate, spec-driven try-it experience (similar to Swagger UI).

### B. “Run this request” next to a specific curl (custom component)

If you want a **button beside a given curl block** that runs that request and shows the response (e.g. on the Integration Guide), VitePress does not ship a plugin for that. You can add a small **Vue component** used in Markdown, for example:

- **Props:** `method`, `url`, optional `headers`, optional `body`, optional “show curl” toggle.
- **UI:** “Run” button; optional collapsible section showing the equivalent `curl`; area for response (status, body).
- **Logic:** On “Run”, `fetch(url, { method, headers, body })` (with CORS considerations if the docs and API are on different origins in production). You could allow an optional “base URL” input so users can point at their own Grant instance.

That component would be registered in `.vitepress/theme/index.js` and used in `.md` files like:

```md
<ApiTryIt method="POST" url="/api/organizations" :body='{"name":"Acme"}' />
```

Implementing this is optional; the OpenAPI playground (2A) plus collapsible blocks (1) already cover “execute with a button” (for the whole API) and “toggle the curl block”.

## Summary

| Need                                                        | Plugin / approach                      |
| ----------------------------------------------------------- | -------------------------------------- |
| Accordion / collapsible curl (or any code) blocks           | **vitepress-plugin-codeblocks-fold**   |
| Swagger-like “try it” for the whole API from OpenAPI        | **vitepress-openapi**                  |
| “Run” button next to a single curl in the Integration Guide | Custom Vue component (e.g. `ApiTryIt`) |

Recommendation: add **vitepress-plugin-codeblocks-fold** for the toggle behavior, and **vitepress-openapi** if you want in-docs execution driven by your existing OpenAPI spec (e.g. on the REST API reference). Add a custom “Run this curl” component only if you specifically want per-block execution on tutorial pages.
