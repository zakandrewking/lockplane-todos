# Lockplane Todos

A modern, beautiful todo list application built with Next.js, TypeScript, and Turso.

**Live Demo:** https://lockplane-todos-exm708la9-zakandrewkings-projects.vercel.app

## Features

- Add, complete, and delete todos
- Filter todos by all, active, or completed
- Clear all completed todos at once
- Turso (SQLite) database for persistent storage
- Serverless and edge-compatible
- Responsive design that works on mobile and desktop
- Beautiful gradient UI with smooth animations
- Fast and lightweight

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Turso (libSQL/SQLite)
- **Styling**: CSS
- **Deployment**: Vercel

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/zakandrewking/lockplane-todos.git
   cd lockplane-todos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Turso database**

   a. Install Turso CLI:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

   b. Log in to Turso:
   ```bash
   turso auth login
   ```

   c. Create a database:
   ```bash
   turso db create lockplane-todos
   ```

   d. Get your database credentials:
   ```bash
   turso db show lockplane-todos
   ```

4. **Configure environment variables**

   Create a `.env.local` file:
   ```bash
   TURSO_DATABASE_URL=your_database_url_here
   TURSO_AUTH_TOKEN=your_auth_token_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to http://localhost:3000

The database schema will be created automatically on first API request.

## Build for Production

```bash
npm run build
```

The built files will be in the `.next` directory.

To test the production build locally:

```bash
npm run build
npm start
```

## Deploy to Vercel

### Initial Setup

1. **Connect GitHub repository to Vercel**
   - Go to https://vercel.com/dashboard
   - Import your GitHub repository: `zakandrewking/lockplane-todos`
   - Vercel will install the GitHub app and configure webhooks

2. **Add Turso environment variables to Vercel**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
   - Or use the CLI:
   ```bash
   echo "your_database_url" | vercel env add TURSO_DATABASE_URL production
   echo "your_auth_token" | vercel env add TURSO_AUTH_TOKEN production
   ```

3. **Trigger initial deployment**
   ```bash
   git push
   ```

The app is now deployed with Turso as the database backend!

### Automatic Deployments

Once connected to GitHub, Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

Just commit and push your changes:
```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically build and deploy your changes. Check deployment status at https://vercel.com/dashboard

## Project Structure

```
lockplane-todos/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── todos/         # Todos CRUD endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── lib/                   # Utility libraries
│   └── db.ts              # Turso database client and functions
├── schema/                # Database schema definitions
│   ├── todos.lp.sql       # Preferred declarative schema (Lockplane)
│   └── todos.json         # Legacy JSON schema reference
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## API Routes

- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/[id]` - Update a todo (toggle completed)
- `DELETE /api/todos/[id]` - Delete a todo

## Future Enhancements

- [x] Migrate to hosted SQLite (Turso) for production ✅
- [ ] Add user authentication
- [ ] Add todo categories/tags
- [ ] Add due dates
- [ ] Add priority levels
- [ ] Add search functionality
- [ ] Add realtime collaboration

## Claude Code Skills

This project includes the [Playwright Skill](https://github.com/lackeyjb/playwright-skill) for browser automation and testing.

### Installed Skills

**Playwright Skill** - General-purpose browser automation for testing and end-to-end workflows
- Location: `.claude/skills/playwright-skill/`
- Usage: Ask Claude to perform browser automation tasks (e.g., "Test if the homepage loads", "Take a screenshot of the todo list")
- Note: Chromium browser installation may require Docker or local setup depending on environment

## Lockplane Schema Files

Lockplane supports both JSON and SQL descriptions of a schema, but `.lp.sql` files are now the preferred format. The repository includes `schema/todos.lp.sql` as the source of truth, and `schema/todos.json` is kept only for backward compatibility with older tooling.

Declarative `.lp.sql` files should avoid procedural or imperative statements. In particular:

- Do **not** use `CREATE OR REPLACE` statements—split destructive changes into migrations
- Avoid `DROP` statements or `ALTER TABLE ... DROP COLUMN`
- Skip conditional clauses such as `IF (NOT) EXISTS`
- Omit explicit transaction control (`BEGIN`, `COMMIT`, `ROLLBACK`)

Run `npm test` to execute validator test cases that cover these pitfalls and ensure new schema files follow the declarative style.

## License

Apache 2.0
