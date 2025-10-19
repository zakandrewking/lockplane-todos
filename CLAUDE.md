# Claude Code Instructions for Lockplane Todos

This file contains project-specific instructions for AI assistants working on Lockplane Todos.

## Project Overview

Lockplane Todos is a modern todo list application built with:
- **Frontend**: React, Vite, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Schema Management**: Lockplane
- **Authentication**: GitHub OAuth

## 🚨 COMPLETE WORKFLOW CHECKLIST 🚨

**WHENEVER YOU MAKE CODE CHANGES, FOLLOW THIS CHECKLIST EXACTLY:**

### Phase 1: Planning & Implementation
- [ ] Understand the requirement fully
- [ ] Identify which files need to be modified
- [ ] Make code changes

### Phase 2: Testing & Building (CRITICAL - ALWAYS TEST AND BUILD)
- [ ] Build the project: `npm run build`
- [ ] Verify build succeeds with no errors
- [ ] Test in dev mode if needed: `npm run dev`
- [ ] Run linter (if configured): `npm run lint`
- [ ] Run tests (when implemented): `npm test`

### Phase 3: Schema Changes (If Applicable)
- [ ] Edit schema file in `schema/` directory
- [ ] Run `lockplane migrate` to generate and apply migrations
- [ ] Verify migration succeeded
- [ ] Stage migration files: `git add schema/ migrations/`

### Phase 4: Documentation (CRITICAL - DO NOT SKIP)
- [ ] Update `README.md` with usage changes or new features
- [ ] Update `CLAUDE.md` if workflow changes
- [ ] Add inline code comments for complex logic
- [ ] Update component JSDoc if applicable

### Phase 5: Git (CRITICAL - ALWAYS COMMIT AND PUSH)
- [ ] Check git status: `git status`
- [ ] Review changes: `git diff`
- [ ] Stage all changes: `git add .`
- [ ] Create descriptive commit message following this format:
  ```
  <short description>

  <longer description if needed>
  - Detail 1
  - Detail 2

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- [ ] Commit changes: `git commit -m "message"`
- [ ] Push to remote: `git push`

### Phase 6: Verification
- [ ] Verify commit was successful: `git log -1`
- [ ] Verify push was successful: `git status` should show "up to date"
- [ ] Summarize what was done for the user

**REMEMBER: Code changes without builds, documentation updates, and git commits are incomplete work!**

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

**ALWAYS FOLLOW THE CHECKLIST ABOVE - NO EXCEPTIONS**

The checklist ensures:
1. Code quality through builds and testing
2. User experience through documentation
3. Version control through git commits
4. Team collaboration through git push

**Common mistake:** Making code changes and forgetting to build, update docs, or commit. This leaves the repository in an inconsistent state.

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

### Testing & Building

```bash
# Build for production (ALWAYS run before committing)
npm run build

# Run tests (when implemented)
npm test

# Lint code (if configured)
npm run lint
```

### Before Committing

**ALWAYS run these commands before pushing:**

```bash
# Build the app (catches TypeScript and build errors)
npm run build

# Run tests (when implemented)
npm test

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

- Work on `main` branch (small project, no PR workflow yet)
- Always run builds before pushing
- Use descriptive commit messages (see Phase 5 of checklist)
- Always push after committing
- Include `🤖 Generated with [Claude Code](https://claude.com/claude-code)` footer

## Code Organization

- `src/` - React application source code
  - `src/components/` - React components
  - `src/lib/` - Utility libraries (Supabase client, etc.)
  - `src/App.tsx` - Main application component
  - `src/main.tsx` - Application entry point
- `schema/` - Database schema definitions (Lockplane)
- `migrations/` - Generated SQL migrations (Lockplane)
- `public/` - Static assets
- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration

## Common Tasks

### Adding a New Feature

1. Identify which components/files need changes
2. Make code changes
3. Test in dev mode: `npm run dev`
4. Build for production: `npm run build`
5. Update README.md if user-facing
6. **Follow the complete checklist above**

### Adding a New Database Column

1. Edit `schema/todos.json` (or relevant schema file)
2. Run `lockplane migrate`
3. Update TypeScript types if needed
4. Update React components using that data
5. Build and test: `npm run build`
6. **Follow the complete checklist above**

### Fixing a Bug

1. Identify the root cause
2. Make the fix
3. Test the fix in dev mode
4. Build for production: `npm run build`
5. Document the fix in commit message
6. **Follow the complete checklist above**

## Common Pitfalls

1. **Forgetting to run `npm run build`** - This is the most common issue. Always build!
2. **Manually creating database tables** - Use Lockplane instead!
3. **Forgetting to set environment variables** - App won't connect to Supabase
4. **Not testing the build** - Errors might only show in production
5. **Committing `.env` file** - Keep credentials secret (use `.env.example` for templates)
6. **Forgetting to update docs** - Documentation must match code
7. **Not committing or pushing** - Work isn't complete until it's pushed
8. **Breaking TypeScript types** - Always fix type errors before committing

## Remember

**THE COMPLETE WORKFLOW CHECKLIST AT THE TOP IS MANDATORY**

This is not optional. The checklist ensures:

1. **Documentation stays in sync** - Users can trust the docs match the code
2. **Builds prevent errors** - Changes compile and work correctly
3. **Git history is complete** - All work is tracked and shareable
4. **Remote stays updated** - Team members can see the latest changes

**Incomplete work is:**
- ❌ Code changes without running `npm run build`
- ❌ Code changes without documentation updates
- ❌ Code changes without git commit
- ❌ Git commits without git push
- ❌ Skipping any step in the checklist
- ❌ TypeScript errors in the build

**Complete work is:**
- ✅ All checklist items completed
- ✅ Build succeeds with no errors
- ✅ Tests pass (when implemented)
- ✅ Documentation updated
- ✅ Changes committed and pushed
- ✅ User informed of what was done

## Questions?

See:
- `README.md` - Setup and deployment instructions
- `schema/` - Database schema definitions
- [Lockplane Docs](https://lockplane.com/docs) - Schema management guide
