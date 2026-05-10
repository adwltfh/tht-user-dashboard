import { User, Post, Todo } from "./types";

const BASE_URL = "https://jsonplaceholder.typicode.com";

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch users");

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Failed to parse users");

  return data;
}

export async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch user");

  const data = await res.json();
  if (!data || !data.id) throw new Error("User not found");

  return data;
}

export async function fetchAllPosts(): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/posts`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error("Failed to fetch posts");

  const data = await res.json();
  if (!data) throw new Error("Posts not found");

  return data;
}

export async function fetchAllTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error("Failed to fetch todos");

  const data = await res.json();
  if (!data) throw new Error("Todos not found");

  return data;
}

export async function fetchUserPosts(userId: number): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/posts?userId=${userId}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error("Failed to fetch user posts");

  const data = await res.json();
  if (!data) throw new Error("User posts not found");

  return data;
}

export async function fetchUserTodos(userId: number): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos?userId=${userId}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error("Failed to fetch user todos");

  const data = await res.json();
  if (!data) throw new Error("User todos not found");

  return data;
}
