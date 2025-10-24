import { NextResponse } from 'next/server'
import { getAllTodos, createTodo } from '@/lib/db'

export async function GET() {
  try {
    const todos = await getAllTodos()
    return NextResponse.json({ todos })
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { text, project_id } = await request.json()

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const todo = await createTodo(text, project_id || null)
    return NextResponse.json({ todo }, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}
