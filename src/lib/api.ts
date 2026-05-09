import { User } from "./types"

const BASE_URL = 'https://jsonplaceholder.typicode.com'

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}