# Claude Code Instructions for Lockplane Todos

This file contains project-specific instructions for AI assistants working on Lockplane Todos.

## Project Overview

Lockplane Todos is a modern todo list application built with:
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Turso (libSQL/SQLite)
- **Deployment**: Vercel with serverless functions

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
- [ ] Update schema file in `schema/todos.lp.sql`
- [ ] Use the Lockplane skill to validate and apply changes
- [ ] Verify migration succeeded
- [ ] Stage schema changes: `git add schema/`

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

## Database Schema

Schema is managed using Lockplane in `schema/todos.lp.sql`. Use the Lockplane skill for schema operations.

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

# Start dev server (SQLite database will be created automatically)
npm run dev
```

The application will be available at http://localhost:3000

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

## Database

This app uses Turso (libSQL/SQLite) for both local and production:
- **Client**: @libsql/client (async)
- **Schema**: Auto-initialized on first request in `lib/db.ts`
- **Lazy Loading**: Database client is created on-demand to support serverless
- **Environment Variable**:
  - `DATABASE_URL` - Database connection URL (can include authToken as query parameter)

### Setting up Turso

1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Login: `turso auth login`
3. Create database: `turso db create your-db-name`
4. Get credentials: `turso db show your-db-name`
5. Add to `.env.local` for local development
6. Add to Vercel environment variables for production

## Git Workflow

- Work on `main` branch (small project, no PR workflow yet)
- Always run builds before pushing
- Use descriptive commit messages (see Phase 5 of checklist)
- Always push after committing
- Include `🤖 Generated with [Claude Code](https://claude.com/claude-code)` footer

## Code Organization

- `app/` - Next.js app directory (App Router)
  - `app/api/todos/` - API routes for CRUD operations
  - `app/globals.css` - Global styles
  - `app/layout.tsx` - Root layout
  - `app/page.tsx` - Homepage (client component)
- `lib/` - Utility libraries
  - `lib/db.ts` - Turso/libSQL database client and functions
- `schema/` - Database schema definitions
- `public/` - Static assets
- `next.config.js` - Next.js configuration
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

1. Update the CREATE TABLE statement in `schema/todos.lp.sql`
2. Use Lockplane skill to validate and apply changes
3. Update TypeScript types if needed
4. Update API routes to handle the new column
5. Update React components using that data
6. Build and test: `npm run build`
7. **Follow the complete checklist above**

### Fixing a Bug

1. Identify the root cause
2. Make the fix
3. Test the fix in dev mode
4. Build for production: `npm run build`
5. Document the fix in commit message
6. **Follow the complete checklist above**

## Common Pitfalls

1. **Forgetting to run `npm run build`** - This is the most common issue. Always build!
2. **Not testing the build** - Errors might only show in production
3. **Forgetting database environment variable** - Must set DATABASE_URL
4. **Forgetting to update docs** - Documentation must match code
5. **Not committing or pushing** - Work isn't complete until it's pushed
6. **Breaking TypeScript types** - Always fix type errors before committing
7. **Not awaiting async database calls** - Turso uses @libsql/client which is async
8. **Committing `.env.local`** - Keep credentials secret, it's in .gitignore

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
- `schema/todos.lp.sql` - Database schema
- Lockplane skill - Schema management
