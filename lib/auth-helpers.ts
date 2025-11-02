import { auth } from './auth-server'

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id || null
}

export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}
