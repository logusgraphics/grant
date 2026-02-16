---
layout: home

hero:
  name: 'Modern'
  text: 'Authorization Platform'
  tagline: 'Open-source, self-hosted, ready to deploy'
  actions:
    - theme: brand
      text: What is Grant?
      link: /getting-started/introduction
    - theme: alt
      text: Quick Start
      link: /getting-started/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/logusgraphics/grant

features:
  - icon: 🔐
    title: Multi-Tenant RBAC
    details: Account-based multi-tenancy with organization and project isolation, flexible permission system with action-based scoping.
  - icon: 🏢
    title: Account Workspaces
    details: Flexible workspace model supporting both personal accounts for individual users and organization accounts for teams, with seamless switching and role-based access.
  - icon: 🏗️
    title: Modern Architecture
    details: Monorepo structure with shared packages, GraphQL API with type-safe operations, PostgreSQL with Drizzle ORM.
  - icon: 🚀
    title: Developer Experience
    details: TypeScript-first with full type safety, comprehensive SDK for Node.js, Express, Next.js, and more.
  - icon: 🌍
    title: Internationalization
    details: Built-in i18n/l10n support with automatic error message translation in multiple languages (English, German).
  - icon: 🌐
    title: Self-Hosted Deployment
    details: Deploy on your own infrastructure with Docker Compose, AWS CloudFormation templates, or any container platform.
  - icon: 🛡️
    title: Privacy Compliance
    details: GDPR-compliant data export and account deletion with configurable retention periods, ensuring user privacy rights and regulatory compliance.
---

# Documentation

Welcome to the Grant documentation. Grant is an open-source, multi-tenant RBAC platform that you self-host on your own infrastructure.

## Quick Start

Get up and running with Grant in minutes:

- **[Quick Start Guide](/getting-started/quick-start)** - From `git clone` to running in under 10 minutes
- **[Self-Hosting](/deployment/self-hosting)** - Production deployment on your infrastructure
- **[Local Development](/contributing/guide)** - Set up your development environment

## What You'll Find Here

<div class="what-youll-find">

<div class="audience-card">
<div class="audience-header">
<h3>For Developers</h3>
</div>
<ul class="feature-list">
<li><strong>API Reference</strong><br>Complete REST and GraphQL API documentation</li>
<li><strong>SDKs</strong><br>Server SDK (Express, Fastify, NestJS, Next.js) and Client SDK (React)</li>
<li><strong>CLI</strong><br>Setup, authentication, and TypeScript type generation</li>
</ul>
</div>

<div class="audience-card">
<div class="audience-header">
<h3>For DevOps</h3>
</div>
<ul class="feature-list">
<li><strong>Deployment Guides</strong><br>Docker Compose, AWS CloudFormation</li>
<li><strong>Configuration</strong><br>Environment setup and optimization</li>
<li><strong>Observability</strong><br>Structured logging, tracing, and metrics</li>
</ul>
</div>

<div class="audience-card">
<div class="audience-header">
<h3>For Architects</h3>
</div>
<ul class="feature-list">
<li><strong>Architecture Overview</strong><br>System design and components</li>
<li><strong>Multi-Tenancy</strong><br>Account-based design and isolation</li>
<li><strong>Security</strong><br>Authentication, authorization, and compliance</li>
</ul>
</div>

</div>

## Popular Topics

- **[RBAC System](/architecture/rbac)** - Understanding the permission model
- **[API Keys](/core-concepts/api-keys)** - User-scoped and project-level API keys, scopes, exchange
- **[Server SDK](/integration/server-sdk)** - Protect routes with @grantjs/server (Express, Fastify)
- **[Client SDK](/integration/client-sdk)** - Permission-based UI with @grantjs/client (React hooks, GrantGate)
- **[Grant CLI](/integration/cli)** - Setup, authentication, and typings generation
- **[Multi-Tenancy](/architecture/multi-tenancy)** - Account and organization isolation
- **[Self-Hosting](/deployment/self-hosting)** - Deploy on your infrastructure
- **[REST API](/api-reference/rest-api)** - Complete REST API documentation

## Community & Support

- **GitHub** - [Source code and issues](https://github.com/logusgraphics/grant)
- **Discord** - [Community discussions](https://discord.gg/grant)
- **Email** - [Support and inquiries](mailto:support@grant.logus.graphics)

---

**Ready to get started?** Check out the [Quick Start Guide](/getting-started/quick-start) or explore the [Architecture Overview](/architecture/overview) to understand how Grant works.
