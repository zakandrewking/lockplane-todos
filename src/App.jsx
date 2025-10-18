import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'

function App() {
  const [session, setSession] = useState(null)
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Check for active session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch todos when session is available
  useEffect(() => {
    if (session) {
      fetchTodos()
    }
  }, [session])

  // Set up real-time subscription for todos
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel('todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos((current) => [...current, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setTodos((current) =>
              current.map((todo) =>
                todo.id === payload.new.id ? payload.new : todo
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setTodos((current) =>
              current.filter((todo) => todo.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data || [])
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (inputValue.trim() === '') return

    const { error } = await supabase.from('todos').insert([
      {
        text: inputValue,
        completed: false,
        user_id: session.user.id,
      },
    ])

    if (error) {
      console.error('Error adding todo:', error)
      alert('Error adding todo. Please try again.')
    } else {
      setInputValue('')
    }
  }

  const toggleTodo = async (id, currentCompleted) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !currentCompleted })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const clearCompleted = async () => {
    const completedIds = todos.filter((todo) => todo.completed).map((todo) => todo.id)

    const { error } = await supabase
      .from('todos')
      .delete()
      .in('id', completedIds)

    if (error) {
      console.error('Error clearing completed todos:', error)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
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

  if (!session) {
    return <Auth />
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
            <div className="user-info">
              <img
                src={session.user.user_metadata.avatar_url}
                alt="Avatar"
                className="user-avatar"
              />
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

export default App
