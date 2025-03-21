# Customer Portal

A modern, full-stack customer portal built with Next.js, featuring a beautiful UI, internationalization, and GraphQL API.

## Features

### 1. Internationalization (i18n)

- Built with `next-intl` for seamless internationalization
- Supports multiple languages (English and German)
- Automatic locale detection and routing
- Language switcher component with dropdown menu
- All UI text is internationalized and easily extensible
- Locale-specific routing with `[locale]` dynamic segments

### 2. Modern UI Components

- Built on top of Radix UI primitives for accessibility
- Custom component library using shadcn/ui
- Beautiful, responsive design with Tailwind CSS
- Dark mode support with next-themes
- Custom SVG favicon with gradient background
- Components include:
  - Buttons with multiple variants
  - Forms with validation
  - Dialogs and modals
  - Dropdown menus
  - Tooltips
  - Toast notifications
  - Avatar components
  - Alert dialogs

### 3. Full-Stack Framework

- Built with Next.js 15.2.3
- App Router architecture
- Server and client components
- Type-safe routing with TypeScript
- Custom middleware for authentication
- Environment variable support
- Path aliases for clean imports

### 4. GraphQL API

- Apollo Server integration
- Type-safe GraphQL schema
- Query and mutation support
- JWT-based authentication
- In-memory cache management
- Error handling and validation
- Demo data generation with Faker.js

### 5. Authentication & Authorization

- JWT-based authentication system
- Secure token storage
- Protected routes
- Login/Register functionality
- Password validation
- Token expiration handling

### 6. Form Handling & Validation

- React Hook Form integration
- Zod schema validation
- Custom form components
- Error message handling
- Type-safe form values

### 7. State Management

- Apollo Client for GraphQL state
- React Context for theme and messages
- Local state with React hooks
- Form state management

### 8. Developer Experience

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Husky for git hooks
- Lint-staged for pre-commit checks
- Path aliases for clean imports
- Comprehensive error handling

## Tech Stack

- **Framework**: Next.js 15.2.3
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui + Radix UI
- **API**: GraphQL with Apollo Server
- **State Management**: Apollo Client
- **Form Handling**: React Hook Form + Zod
- **Internationalization**: next-intl
- **Authentication**: JWT
- **Development Tools**:
  - ESLint
  - Prettier
  - Husky
  - TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── providers/        # Context providers
│   └── ui/              # UI components
├── graphql/              # GraphQL schema and resolvers
├── i18n/                 # Internationalization
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Collaboration Guide

### Setting Up New Features

#### 1. Internationalization (i18n)

1. Add new locale files in `i18n/locales/`
2. Update `i18n/routing.ts` with new locale
3. Add translations using the `useTranslations` hook
4. Use the `LanguageSwitcher` component for locale switching

#### 2. UI Components

1. Install new Radix UI primitives:
   ```bash
   npm install @radix-ui/react-[component-name]
   ```
2. Add shadcn/ui components:
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```
3. Customize components in `components/ui/`
4. Use the `cn` utility for class name merging

#### 3. GraphQL API

1. Define types in `graphql/schema.ts`
2. Add resolvers in the same file
3. Create queries/mutations in `graphql/queries.tsx`
4. Use Apollo Client hooks in components:
   ```typescript
   const { data, loading, error } = useQuery(GET_DATA);
   ```

#### 4. Authentication

1. Add new auth routes in `app/[locale]/auth/`
2. Update middleware.ts for protected routes
3. Use `setStoredToken` and `getStoredToken` utilities
4. Implement JWT validation in API routes

#### 5. Forms

1. Create Zod schema for validation
2. Use React Hook Form with Zod resolver
3. Implement form components using shadcn/ui
4. Add error handling and success messages

#### 6. State Management

1. Create new Apollo queries/mutations
2. Add React Context providers if needed
3. Use React hooks for local state
4. Implement optimistic updates

### Best Practices

#### Code Organization

- Keep components small and focused
- Use TypeScript for all new code
- Follow the established folder structure
- Use path aliases for imports

#### Styling

- Use Tailwind CSS classes
- Follow the design system
- Maintain dark mode compatibility
- Use CSS variables for theming

#### Testing

- Write unit tests for utilities
- Add integration tests for components
- Test API endpoints
- Validate form submissions

#### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets
- Use proper caching strategies

#### Security

- Validate all user inputs
- Sanitize API responses
- Use environment variables for secrets
- Implement proper CORS policies

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
