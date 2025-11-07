-- Declarative Lockplane schema for the todos table.
-- Users table for authentication
CREATE TABLE users(
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at text NOT NULL
);

-- Sessions table for managing user sessions
CREATE TABLE sessions(
  id text PRIMARY KEY,
  user_id text NOT NULL,
  expires_at text NOT NULL,
  created_at text NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Login tokens table for passwordless magic link authentication
CREATE TABLE login_tokens(
  token text PRIMARY KEY,
  user_id text,
  email text NOT NULL,
  expires_at text NOT NULL,
  used_at text,
  created_at text NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Projects table to organize todos
CREATE TABLE projects(
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  user_id text NOT NULL,
  created_at text NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Todos table with optional project relationship
CREATE TABLE todos(
  id text PRIMARY KEY,
  text text NOT NULL,
  completed integer NOT NULL DEFAULT 0,
  project_id text,
  user_id text NOT NULL,
  created_at text NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index on sessions for faster lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Index on login_tokens for cleanup queries
CREATE INDEX idx_login_tokens_expires_at ON login_tokens(expires_at);

-- Index on todos for user queries
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- Index on projects for user queries
CREATE INDEX idx_projects_user_id ON projects(user_id);

