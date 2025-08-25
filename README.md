# Identity Central

A comprehensive identity and access management system built with Next.js, GraphQL, and PostgreSQL.

## Features

- **Multi-tenant Architecture**: Support for organizations, projects, and teams
- **Role-Based Access Control**: Flexible permission system with roles and groups
- **GraphQL API**: Modern, type-safe API with Apollo Server
- **PostgreSQL Backend**: Robust database with Drizzle ORM
- **Internationalization**: Multi-language support with next-intl
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS and Radix UI

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 16+

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd identity-central
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

4. **Start the database**:

   ```bash
   npm run docker:up
   ```

5. **Set up the database**:

   ```bash
   # Generate schema migrations
   npm run db:generate

   # Apply migrations
   npm run db:migrate

   # Seed with sample data
   npm run db:seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## Database Management

### Seeding System

The project includes a comprehensive seeding system for populating the database with sample data:

- **`npm run db:seed`** - Generate fake data using drizzle-seed
- **`npm run db:seed:json`** - Import data from existing JSON files
- **`npm run db:reset`** - Clear all data and reset tables

### Complete Database Workflow

```bash
# 1. Start database
npm run docker:up

# 2. Generate schema migrations
npm run db:generate

# 3. Apply migrations
npm run db:migrate

# 4. Seed with data (choose one)
npm run db:seed          # Generate fake data
npm run db:seed:json     # Import from JSON files
```

For detailed information about the seeding system and database management, see [docs/DRIZZLE_IMPLEMENTATION.md](docs/DRIZZLE_IMPLEMENTATION.md).

## 📚 Documentation

All project documentation is centralized in the `docs/` directory. Start with the **[Documentation Index](docs/README.md)** for a complete overview of all available documentation.

### Quick Links

- **[📖 Documentation Index](docs/README.md)** - Complete documentation overview and navigation
- **[🏗️ Architecture](docs/MULTI_TENANCY_SPECIFICATION.md)** - System architecture and design
- **[🗄️ Database](docs/DRIZZLE_IMPLEMENTATION.md)** - Database implementation and seeding
- **[🛠️ Development](docs/DEVELOPMENT_GUIDE.md)** - Development setup and workflows
- **[🧪 Testing](docs/TESTING.md)** - Testing framework and practices

## Development

### Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run start`** - Start production server
- **`npm run lint`** - Run ESLint
- **`npm run format`** - Format code with Prettier
- **`npm run test`** - Run tests with Vitest

### Database Scripts

- **`npm run db:generate`** - Generate Drizzle migrations
- **`npm run db:migrate`** - Apply database migrations
- **`npm run db:seed`** - Seed with fake data
- **`npm run db:seed:json`** - Import from JSON files
- **`npm run db:reset`** - Reset database

### Docker Commands

- **`npm run docker:up`** - Start database containers
- **`npm run docker:down`** - Stop database containers
- **`npm run docker:logs`** - View container logs

## Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand
- **Testing**: Vitest with Testing Library

### Project Structure

```
identity-central/
├── app/                    # Next.js app directory
├── components/            # React components
├── graphql/              # GraphQL schema and resolvers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── scripts/              # Database and utility scripts
├── data/                 # Sample data files
└── docs/                 # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
