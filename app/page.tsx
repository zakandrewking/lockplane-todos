'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Project = {
  id: string
  name: string
  description: string | null
  created_at: string
}

type Todo = {
  id: string
  text: string
  completed: boolean
  project_id: string | null
  created_at: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch todos and projects on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTodos()
      fetchProjects()
    }
  }, [status])

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (response.status === 401) {
        router.push('/login')
        return
      }
      if (!response.ok) throw new Error('Failed to fetch todos')
      const data = await response.json()
      setTodos(data.todos || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.status === 401) {
        router.push('/login')
        return
      }
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
    router.refresh()
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() === '') return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputValue,
          project_id: selectedProjectId
        }),
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

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newProjectName.trim() === '') return

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName }),
      })

      if (!response.ok) throw new Error('Failed to add project')

      const data = await response.json()
      setProjects((current) => [...current, data.project])
      setNewProjectName('')
      setShowProjectForm(false)
    } catch (error) {
      console.error('Error adding project:', error)
      alert('Error adding project. Please try again.')
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project? Todos in this project will not be deleted.')) return

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete project')

      setProjects((current) => current.filter((project) => project.id !== id))
      if (selectedProjectId === id) {
        setSelectedProjectId(null)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const filteredTodos = todos.filter((todo) => {
    // Filter by completion status
    if (filter === 'active' && todo.completed) return false
    if (filter === 'completed' && !todo.completed) return false

    // Filter by selected project
    if (selectedProjectId !== null) {
      return todo.project_id === selectedProjectId
    }

    return true
  })

  const activeTodosCount = todos.filter((todo) => !todo.completed).length
  const completedTodosCount = todos.filter((todo) => todo.completed).length

  if (status === 'loading' || loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect via useEffect
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="app">
      <div className="app-layout">
        {/* Projects Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Projects</h2>
            <button
              className="add-project-btn"
              onClick={() => setShowProjectForm(!showProjectForm)}
              title="Add project"
            >
              +
            </button>
          </div>

          {showProjectForm && (
            <form onSubmit={addProject} className="project-form">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="project-input"
                autoFocus
              />
              <div className="project-form-buttons">
                <button type="submit" className="btn-primary">Add</button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowProjectForm(false)
                    setNewProjectName('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <ul className="project-list">
            <li
              className={selectedProjectId === null ? 'project-item active' : 'project-item'}
              onClick={() => setSelectedProjectId(null)}
            >
              <span className="project-name">All Todos</span>
              <span className="project-count">{todos.length}</span>
            </li>
            {projects.map((project) => {
              const projectTodoCount = todos.filter(t => t.project_id === project.id).length
              return (
                <li
                  key={project.id}
                  className={selectedProjectId === project.id ? 'project-item active' : 'project-item'}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <span className="project-name">{project.name}</span>
                  <div className="project-actions">
                    <span className="project-count">{projectTodoCount}</span>
                    <button
                      className="project-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                      title="Delete project"
                    >
                      ?
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="container">
            <header>
              <div className="header-content">
                <div>
                  <h1>
                    {selectedProject ? selectedProject.name : 'Lockplane Todos'}
                  </h1>
                  <p className="subtitle">
                    {selectedProject
                      ? selectedProject.description || 'Stay organized, get things done'
                      : 'Stay organized, get things done'}
                  </p>
                </div>
                <div className="user-section">
                  <span className="user-email">{session?.user?.email}</span>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
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
                All ({filteredTodos.length})
              </button>
              <button
                className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('active')}
              >
                Active ({filteredTodos.filter(t => !t.completed).length})
              </button>
              <button
                className={
                  filter === 'completed' ? 'filter-btn active' : 'filter-btn'
                }
                onClick={() => setFilter('completed')}
              >
                Completed ({filteredTodos.filter(t => t.completed).length})
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
                      ?
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
        </main>
      </div>
    </div>
  )
}
