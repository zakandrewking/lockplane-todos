# Lockplane Todos

A modern, beautiful todo list application built with Next.js, TypeScript, and Turso.

**Live Demo:** <https://lockplane-todos.vercel.app/>

## Features

- **Projects**: Organize todos into projects with a beautiful sidebar
- **Todo Management**: Add, complete, and delete todos
- **Smart Filtering**: Filter todos by project, all, active, or completed
- **Project Filtering**: View todos by specific project or all todos
- **Bulk Actions**: Clear all completed todos at once
- **Persistent Storage**: Turso (SQLite) database with Lockplane schema management
- **Modern UI**: Beautiful gradient design with smooth animations
- **Responsive**: Works seamlessly on mobile, tablet, and desktop
- **Serverless**: Edge-compatible, deploys to Vercel
- **Fast & Lightweight**: Optimized Next.js 15 with App Router

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Turso (libSQL/SQLite)
- **Schema Management**: Lockplane
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

5. **Install Lockplane CLI**
   ```bash
   npm install -g lockplane
   ```

6. **Apply database schema**
   ```bash
   npm run schema:apply
   ```

   Or use Lockplane directly:
   ```bash
   lockplane apply --auto-approve --from $TURSO_DATABASE_URL --to schema/
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**

   Navigate to http://localhost:3000

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

### Todos
- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a new todo (accepts `text` and optional `project_id`)
- `PUT /api/todos/[id]` - Update a todo (toggle completed)
- `DELETE /api/todos/[id]` - Delete a todo

### Projects
- `GET /api/projects` - Fetch all projects
- `POST /api/projects` - Create a new project (accepts `name` and optional `description`)
- `PUT /api/projects/[id]` - Update a project (accepts `name` and optional `description`)
- `DELETE /api/projects/[id]` - Delete a project (todos remain, their `project_id` set to null)

## Database Schema

The application uses two tables:

### Projects Table
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Todos Table
```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  project_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);
```

**Database Functions Available** (in `lib/db.ts`):
- Projects: `getAllProjects()`, `createProject()`, `updateProject()`, `deleteProject()`, `getTodosByProject()`
- Todos: `getAllTodos()`, `createTodo()`, `updateTodo()`, `deleteTodo()`

The UI includes a projects sidebar for easy project management and todo organization.

## Future Enhancements

- [x] Migrate to hosted SQLite (Turso) for production ✅
- [x] Add projects schema and database layer ✅
- [x] Add projects API routes and UI ✅
- [x] Integrate Lockplane for schema management ✅
- [ ] Add user authentication
- [ ] Add due dates and reminders
- [ ] Add priority levels
- [ ] Add search functionality
- [ ] Add drag-and-drop for todos
- [ ] Add project descriptions/notes editing
- [ ] Add realtime collaboration

## Lockplane Schema Management

This project uses [Lockplane](https://lockplane.com) for safe database schema management. The schema is defined in `schema/todos.lp.sql` and applied using the Lockplane CLI.

### Making Schema Changes

1. Edit `schema/todos.lp.sql` with your changes
2. Validate the schema:
   ```bash
   npm run schema:validate
   ```
3. Apply changes to your database:
   ```bash
   npm run schema:apply
   ```

Lockplane tests all migrations on a shadow database before applying them to production, ensuring safety.

### Schema File Requirements

Declarative `.lp.sql` files must follow these rules:

- ✅ Use standard DDL: `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE ADD COLUMN`
- ❌ No `CREATE OR REPLACE` statements
- ❌ No `DROP` statements or `ALTER TABLE ... DROP COLUMN`
- ❌ No conditional clauses like `IF (NOT) EXISTS`
- ❌ No transaction control (`BEGIN`, `COMMIT`, `ROLLBACK`)

Lockplane automatically validates these rules when you run `npm run schema:validate`.

## License

Apache 2.0
