import { createClient, type Client } from '@libsql/client'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

let db: Client | null = null
let initPromise: Promise<void> | null = null

function getClient(): Client {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return db
}

export async function ensureInitialized() {
  // Schema is managed by Lockplane - no manual initialization needed
  // This function is kept for backwards compatibility with existing code
  // In production, ensure `lockplane apply` has been run before deploying
  if (!initPromise) {
    initPromise = Promise.resolve()
  }
  return initPromise
}

export type Project = {
  id: string
  name: string
  description: string | null
  user_id: string
  created_at: string
}

export type Todo = {
  id: string
  text: string
  completed: boolean
  project_id: string | null
  user_id: string
  created_at: string
}

export type User = {
  id: string
  email: string
  password_hash: string
  name: string | null
  created_at: string
}

// Convert SQLite row to Project
function rowToProject(row: any): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | null,
    user_id: row.user_id as string,
    created_at: row.created_at as string,
  }
}

// Convert SQLite row to Todo (INTEGER to boolean)
function rowToTodo(row: any): Todo {
  return {
    id: row.id as string,
    text: row.text as string,
    completed: Boolean(row.completed),
    project_id: row.project_id as string | null,
    user_id: row.user_id as string,
    created_at: row.created_at as string,
  }
}

// Convert SQLite row to User
function rowToUser(row: any): User {
  return {
    id: row.id as string,
    email: row.email as string,
    password_hash: row.password_hash as string,
    name: row.name as string | null,
    created_at: row.created_at as string,
  }
}

// ========== User Authentication Functions ==========

export async function createUser(
  email: string,
  password: string,
  name: string | null = null
): Promise<User> {
  await ensureInitialized()
  const client = getClient()
  const id = randomUUID()
  const password_hash = await bcrypt.hash(password, 10)
  
  const result = await client.execute({
    sql: 'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?) RETURNING *',
    args: [id, email, password_hash, name],
  })
  return rowToUser(result.rows[0])
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  })
  return result.rows.length > 0 ? rowToUser(result.rows[0]) : null
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  })
  return result.rows.length > 0 ? rowToUser(result.rows[0]) : null
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ========== Todo CRUD Functions ==========

export async function getAllTodos(userId: string): Promise<Todo[]> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at ASC',
    args: [userId],
  })
  return result.rows.map(rowToTodo)
}

export async function createTodo(
  text: string,
  userId: string,
  project_id: string | null = null
): Promise<Todo> {
  await ensureInitialized()
  const client = getClient()
  const id = randomUUID()
  const result = await client.execute({
    sql: 'INSERT INTO todos (id, text, completed, project_id, user_id) VALUES (?, ?, 0, ?, ?) RETURNING *',
    args: [id, text, project_id, userId],
  })
  return rowToTodo(result.rows[0])
}

export async function updateTodo(
  id: string,
  userId: string,
  completed: boolean
): Promise<Todo | null> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'UPDATE todos SET completed = ? WHERE id = ? AND user_id = ? RETURNING *',
    args: [completed ? 1 : 0, id, userId],
  })
  return result.rows.length > 0 ? rowToTodo(result.rows[0]) : null
}

export async function deleteTodo(id: string, userId: string): Promise<boolean> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'DELETE FROM todos WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rowsAffected > 0
}

// ========== Project CRUD Functions ==========

export async function getAllProjects(userId: string): Promise<Project[]> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at ASC',
    args: [userId],
  })
  return result.rows.map(rowToProject)
}

export async function createProject(
  name: string,
  userId: string,
  description: string | null = null
): Promise<Project> {
  await ensureInitialized()
  const client = getClient()
  const id = randomUUID()
  const result = await client.execute({
    sql: 'INSERT INTO projects (id, name, description, user_id) VALUES (?, ?, ?, ?) RETURNING *',
    args: [id, name, description, userId],
  })
  return rowToProject(result.rows[0])
}

export async function updateProject(
  id: string,
  userId: string,
  name: string,
  description: string | null = null
): Promise<Project | null> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'UPDATE projects SET name = ?, description = ? WHERE id = ? AND user_id = ? RETURNING *',
    args: [name, description, id, userId],
  })
  return result.rows.length > 0 ? rowToProject(result.rows[0]) : null
}

export async function deleteProject(id: string, userId: string): Promise<boolean> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'DELETE FROM projects WHERE id = ? AND user_id = ?',
    args: [id, userId],
  })
  return result.rowsAffected > 0
}

export async function getTodosByProject(project_id: string, userId: string): Promise<Todo[]> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'SELECT * FROM todos WHERE project_id = ? AND user_id = ? ORDER BY created_at ASC',
    args: [project_id, userId],
  })
  return result.rows.map(rowToTodo)
}
