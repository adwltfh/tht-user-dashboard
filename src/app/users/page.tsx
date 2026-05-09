"use client";

import { User } from "@/lib/types";
import { fetchUsers } from "@/lib/api";

import { useQuery } from "@tanstack/react-query";

import Link from "next/link";

export default function UsersPage() {
    const { data: users, isLoading } = useQuery({
      queryKey: ["users"],
      queryFn: fetchUsers,
    });
  
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-medium mb-6">Users</h1>
  
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">
                Website
              </th>
            </tr>
          </thead>
  
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-16 text-gray-400">
                  Loading users…
                </td>
              </tr>
            ) : (
              users?.map((user: User) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/users/${user.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 focus-visible:outline-blue-500 focus-visible:outline-2 focus-visible:rounded"
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                    <a
                      href={`https://${user.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600"
                    >
                      {user.website}
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }