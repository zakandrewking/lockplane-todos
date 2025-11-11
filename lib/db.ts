import { randomUUID } from 'crypto';

import { type Client, createClient } from '@libsql/client';

let db: Client | null = null;
let initPromise: Promise<void> | null = null;

function getClient(): Client {
  if (!db) {
    // Support SQLITE_DB_PATH (plain file path) or DATABASE_URL (full URL)
    let url: string;
    if (process.env.SQLITE_DB_PATH) {
      // Plain file path - prepend file: scheme
      url = `file:${process.env.SQLITE_DB_PATH}`;
    } else if (process.env.DATABASE_URL) {
      // Full URL (libsql:, http:, etc.)
      url = process.env.DATABASE_URL;
    } else {
      throw new Error('Either SQLITE_DB_PATH or DATABASE_URL must be set');
    }

    db = createClient({
      url,
      authToken: process.env.LIBSQL_DB_TOKEN,
    });
  }
  return db;
}

export async function ensureInitialized() {
  // Schema is managed by Lockplane - no manual initialization needed
  // This function is kept for backwards compatibility with existing code
  // In production, ensure `lockplane apply` has been run before deploying
  if (!initPromise) {
    initPromise = Promise.resolve();
  }
  return initPromise;
}

export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  project_id: string | null;
  created_at: string;
};

// Convert SQLite row to Project
function rowToProject(row: any): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | null,
    created_at: row.created_at as string,
  };
}

// Convert SQLite row to Todo (INTEGER to boolean)
function rowToTodo(row: any): Todo {
  return {
    id: row.id as string,
    text: row.text as string,
    completed: Boolean(row.completed),
    project_id: row.project_id as string | null,
    created_at: row.created_at as string,
  };
}

export async function getAllTodos(): Promise<Todo[]> {
  await ensureInitialized();
  const client = getClient();
  const result = await client.execute(
    "SELECT * FROM todos ORDER BY created_at ASC"
  );
  return result.rows.map(rowToTodo);
}

export async function createTodo(
  text: string,
  project_id: string | null = null
): Promise<Todo> {
  await ensureInitialized();
  const client = getClient();
  const id = randomUUID();
  const result = await client.execute({
    sql: "INSERT INTO todos (id, text, completed, project_id) VALUES (?, ?, 0, ?) RETURNING *",
    args: [id, text, project_id],
  });
  return rowToTodo(result.rows[0]);
}

export async function updateTodo(
  id: string,
  completed: boolean
): Promise<Todo | null> {
  await ensureInitialized();
  const client = getClient();
  const result = await client.execute({
    sql: "UPDATE todos SET completed = ? WHERE id = ? RETURNING *",
    args: [completed ? 1 : 0, id],
  });
  return result.rows.length > 0 ? rowToTodo(result.rows[0]) : null;
}

export async function deleteTodo(id: string): Promise<boolean> {
  await ensureInitialized();
  const client = getClient();
  const result = await client.execute({
    sql: "DELETE FROM todos WHERE id = ?",
    args: [id],
  });
  return result.rowsAffected > 0;
}

// ========== Project CRUD Functions ==========

export async function getAllProjects(): Promise<Project[]> {
  await ensureInitialized();
  const client = getClient();
  const result = await client.execute(
    "SELECT * FROM projects ORDER BY created_at ASC"
  );
  return result.rows.map(rowToProject);
}

export async function createProject(
  name: string,
  description: string | null = null
): Promise<Project> {
  await ensureInitialized();
  const client = getClient();
  const id = randomUUID();
  const result = await client.execute({
    sql: "INSERT INTO projects (id, name, description) VALUES (?, ?, ?) RETURNING *",
    args: [id, name, description],
  });
  return rowToProject(result.rows[0]);
}

export async function updateProject(
  id: string,
  name: string,
  description: string | null = null
): Promise<Project | null> {
  await ensureInitialized();
  const client = getClient();
  const result = await client.execute({
    sql: "UPDATE projects SET name = ?, description = ? WHERE id = ? RETURNING *",
    args: [name, description, id],
  });
  return result.rows.length > 0 ? rowToProject(result.rows[0]) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  await ensureInitialized();
  const client = getClient();
  const result = await client.execute({
    sql: "DELETE FROM projects WHERE id = ?",
    args: [id],
  });
  return result.rowsAffected > 0;
}

export async function getTodosByProject(project_id: string): Promise<Todo[]> {
  await ensureInitialized();
  const client = getClient();
  const result = await client.execute({
    sql: "SELECT * FROM todos WHERE project_id = ? ORDER BY created_at ASC",
    args: [project_id],
  });
  return result.rows.map(rowToTodo);
}
