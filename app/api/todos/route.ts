import { NextResponse } from 'next/server'
import { getAllTodos, createTodo } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const userId = await requireAuth()
    const todos = await getAllTodos(userId)
    return NextResponse.json({ todos })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireAuth()
    const { text, project_id } = await request.json()

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const todo = await createTodo(text, userId, project_id || null)
    return NextResponse.json({ todo }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error creating todo:', error)
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}
