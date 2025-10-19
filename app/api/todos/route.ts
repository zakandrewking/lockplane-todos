import { NextResponse } from 'next/server'
import { getAllTodos, createTodo } from '@/lib/db'

export async function GET() {
  try {
    const todos = getAllTodos()
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
    const { text } = await request.json()

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const todo = createTodo(text)
    return NextResponse.json({ todo }, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}
