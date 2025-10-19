import { createClient, type Client } from '@libsql/client'
import { randomUUID } from 'crypto'

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
  if (!initPromise) {
    const client = getClient()
    initPromise = client.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `).then(() => undefined)
  }
  return initPromise
}

export type Todo = {
  id: string
  text: string
  completed: boolean
  created_at: string
}

// Convert SQLite row to Todo (INTEGER to boolean)
function rowToTodo(row: any): Todo {
  return {
    id: row.id as string,
    text: row.text as string,
    completed: Boolean(row.completed),
    created_at: row.created_at as string,
  }
}

export async function getAllTodos(): Promise<Todo[]> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute('SELECT * FROM todos ORDER BY created_at ASC')
  return result.rows.map(rowToTodo)
}

export async function createTodo(text: string): Promise<Todo> {
  await ensureInitialized()
  const client = getClient()
  const id = randomUUID()
  const result = await client.execute({
    sql: 'INSERT INTO todos (id, text, completed) VALUES (?, ?, 0) RETURNING *',
    args: [id, text],
  })
  return rowToTodo(result.rows[0])
}

export async function updateTodo(
  id: string,
  completed: boolean
): Promise<Todo | null> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'UPDATE todos SET completed = ? WHERE id = ? RETURNING *',
    args: [completed ? 1 : 0, id],
  })
  return result.rows.length > 0 ? rowToTodo(result.rows[0]) : null
}

export async function deleteTodo(id: string): Promise<boolean> {
  await ensureInitialized()
  const client = getClient()
  const result = await client.execute({
    sql: 'DELETE FROM todos WHERE id = ?',
    args: [id],
  })
  return result.rowsAffected > 0
}
