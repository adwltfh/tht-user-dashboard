import { User, Post, Todo } from "./types";

const BASE_URL = "https://jsonplaceholder.typicode.com";

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function fetchAllPosts(): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/posts`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchAllTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export async function fetchUserPosts(userId: number): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/posts?userId=${userId}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch user posts");
  return res.json();
}

export async function fetchUserTodos(userId: number): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos?userId=${userId}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch user todos");
  return res.json();
}
