# Lockplane Todos

A modern, beautiful todo list application built with Next.js, TypeScript, and SQLite.

**Live Demo:** https://lockplane-todos-6momp9b6g-zakandrewkings-projects.vercel.app

## Features

- Add, complete, and delete todos
- Filter todos by all, active, or completed
- Clear all completed todos at once
- SQLite database for persistent storage
- Responsive design that works on mobile and desktop
- Beautiful gradient UI with smooth animations
- Fast and lightweight

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to http://localhost:3000

The SQLite database (`todos.db`) will be created automatically on first run.

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

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

**Note**: The current version uses local SQLite, which works great for local development. For production deployment on Vercel (which is serverless), you'll need to migrate to a hosted database solution like:

- **Turso** (SQLite-compatible, serverless)
- **Vercel Postgres** (PostgreSQL)
- **Neon** (PostgreSQL)
- **PlanetScale** (MySQL)

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
│   └── db.ts              # SQLite database functions
├── schema/                # Database schema definitions
│   └── todos.json         # Todos table schema (Lockplane)
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

- [ ] Migrate to hosted SQLite (Turso) for production
- [ ] Add user authentication
- [ ] Add todo categories/tags
- [ ] Add due dates
- [ ] Add priority levels
- [ ] Add search functionality

## License

Apache 2.0
