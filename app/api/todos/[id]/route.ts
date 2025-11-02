import { NextResponse } from 'next/server'
import { updateTodo, deleteTodo } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth()
    const { completed } = await request.json()
    const { id } = await params

    const todo = await updateTodo(id, userId, completed)

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ todo })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error updating todo:', error)
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth()
    const { id } = await params

    const success = await deleteTodo(id, userId)

    if (!success) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error deleting todo:', error)
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}
