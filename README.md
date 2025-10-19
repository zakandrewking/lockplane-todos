# Lockplane Todos

A modern, beautiful todo list application built with React, Vite, and Supabase.

## Features

- GitHub OAuth authentication
- Add, complete, and delete todos
- Filter todos by all, active, or completed
- Clear all completed todos at once
- Real-time syncing across devices
- Supabase backend for persistent storage
- Responsive design that works on mobile and desktop
- Beautiful gradient UI with smooth animations

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to finish setting up

### 2. Create the Todos Table

This project uses [Lockplane](https://lockplane.com) for schema management. Lockplane automatically generates and applies migrations from JSON schema files.

1. Install Lockplane CLI:
   ```bash
   npm install -g lockplane
   ```

2. The schema is defined in `schema/todos.json`. To apply it to your Supabase database:
   ```bash
   lockplane migrate
   ```

This will automatically create the todos table with RLS policies and enable realtime.

### 3. Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name:** Lockplane Todos
   - **Homepage URL:** Your Vercel URL (e.g., `https://lockplane-todos-xxx.vercel.app`)
   - **Authorization callback URL:** `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**
6. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable GitHub
   - Paste your Client ID and Client Secret
   - Save

### 4. Set Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these in: Supabase Dashboard > Settings > API

3. For Vercel deployment, add these as environment variables in your project settings

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see above)

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to http://localhost:5173

## Deploy to Vercel

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Supabase backend"
   ```

2. Deploy to production:
   ```bash
   vercel --prod
   ```

3. Add environment variables in Vercel:
   - Go to your project settings
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Redeploy

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
