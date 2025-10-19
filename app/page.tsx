'use client'

import { useState, useEffect } from 'react'

type Todo = {
  id: string
  text: string
  completed: boolean
  created_at: string
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (!response.ok) throw new Error('Failed to fetch todos')
      const data = await response.json()
      setTodos(data.todos || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() === '') return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue }),
      })

      if (!response.ok) throw new Error('Failed to add todo')

      const data = await response.json()
      setTodos((current) => [...current, data.todo])
      setInputValue('')
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Error adding todo. Please try again.')
    }
  }

  const toggleTodo = async (id: string, currentCompleted: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      })

      if (!response.ok) throw new Error('Failed to update todo')

      const data = await response.json()
      setTodos((current) =>
        current.map((todo) => (todo.id === id ? data.todo : todo))
      )
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete todo')

      setTodos((current) => current.filter((todo) => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const clearCompleted = async () => {
    const completedIds = todos.filter((todo) => todo.completed).map((todo) => todo.id)

    try {
      await Promise.all(
        completedIds.map((id) =>
          fetch(`/api/todos/${id}`, { method: 'DELETE' })
        )
      )

      setTodos((current) => current.filter((todo) => !todo.completed))
    } catch (error) {
      console.error('Error clearing completed todos:', error)
    }
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeTodosCount = todos.filter((todo) => !todo.completed).length
  const completedTodosCount = todos.filter((todo) => todo.completed).length

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <div className="header-content">
            <div>
              <h1>Lockplane Todos</h1>
              <p className="subtitle">Stay organized, get things done</p>
            </div>
          </div>
        </header>

        <form onSubmit={addTodo} className="add-todo-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          <button type="submit" className="add-button">
            Add
          </button>
        </form>

        <div className="filters">
          <button
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button
            className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('active')}
          >
            Active ({activeTodosCount})
          </button>
          <button
            className={
              filter === 'completed' ? 'filter-btn active' : 'filter-btn'
            }
            onClick={() => setFilter('completed')}
          >
            Completed ({completedTodosCount})
          </button>
        </div>

        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">
              {filter === 'all' && 'No todos yet. Add one above!'}
              {filter === 'active' && 'No active todos. Great job!'}
              {filter === 'completed' && 'No completed todos yet.'}
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="todo-checkbox"
                />
                <span className="todo-text">{todo.text}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                  aria-label="Delete todo"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>

        {completedTodosCount > 0 && (
          <div className="footer">
            <button onClick={clearCompleted} className="clear-completed">
              Clear completed ({completedTodosCount})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
