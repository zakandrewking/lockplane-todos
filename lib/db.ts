import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import path from 'path'

const dbPath = path.join(process.cwd(), 'todos.db')
const db = new Database(dbPath)

// Initialize the database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

export type Todo = {
  id: string
  text: string
  completed: boolean
  created_at: string
}

// Convert SQLite row to Todo (INTEGER to boolean)
function rowToTodo(row: any): Todo {
  return {
    ...row,
    completed: Boolean(row.completed),
  }
}

export function getAllTodos(): Todo[] {
  const stmt = db.prepare('SELECT * FROM todos ORDER BY created_at ASC')
  const rows = stmt.all()
  return rows.map(rowToTodo)
}

export function createTodo(text: string): Todo {
  const id = randomUUID()
  const stmt = db.prepare(
    'INSERT INTO todos (id, text, completed) VALUES (?, ?, 0) RETURNING *'
  )
  const row = stmt.get(id, text)
  return rowToTodo(row)
}

export function updateTodo(id: string, completed: boolean): Todo | null {
  const stmt = db.prepare(
    'UPDATE todos SET completed = ? WHERE id = ? RETURNING *'
  )
  const row = stmt.get(completed ? 1 : 0, id)
  return row ? rowToTodo(row) : null
}

export function deleteTodo(id: string): boolean {
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export default db
