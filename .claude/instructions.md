# Lockplane Todos Development Instructions

This file contains project-specific instructions for AI assistants working on Lockplane Todos.

## Project Overview

Lockplane Todos is a modern todo list application built with:
- **Frontend**: React, Vite, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Schema Management**: Lockplane
- **Authentication**: GitHub OAuth

## Schema Management with Lockplane

**IMPORTANT**: This project uses [Lockplane](https://lockplane.com) for database schema management.

### Never Manually Create Tables

- **DO NOT** write raw SQL migrations
- **DO NOT** manually create tables in Supabase SQL Editor
- **DO** define schema changes in `schema/*.json` files
- **DO** use `lockplane migrate` to apply changes

### Making Schema Changes

1. Edit or create a JSON schema file in `schema/`
2. Run `lockplane migrate` to generate and apply migrations
3. Commit both the schema JSON and generated migration files

Example:
```bash
# Edit schema
vim schema/todos.json

# Apply changes
lockplane migrate

# Commit everything
git add schema/ migrations/
git commit -m "Update todos schema"
```

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Build for production
npm run build
```

### Before Committing

**ALWAYS check these before pushing:**

```bash
# Ensure the app builds without errors
npm run build

# Format code (if using Prettier)
npm run format

# Lint code (if using ESLint)
npm run lint
```

## Supabase Setup

This app requires:
- A Supabase project with GitHub OAuth configured
- Environment variables set in `.env`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Schema is managed via Lockplane - see `schema/todos.json`

## Git Workflow

- Work on `main` branch or feature branches
- Use descriptive commit messages
- Include `🤖 Generated with [Claude Code](https://claude.com/claude-code)` footer
- Run builds before pushing

## Common Pitfalls

1. **Manually creating database tables** - Use Lockplane instead!
2. **Forgetting to set environment variables** - App won't connect to Supabase
3. **Not testing the build** - Errors might only show in production
4. **Committing `.env` file** - Keep credentials secret

## Questions?

See:
- `README.md` - Setup and deployment instructions
- `schema/` - Database schema definitions
- [Lockplane Docs](https://lockplane.com/docs) - Schema management guide
