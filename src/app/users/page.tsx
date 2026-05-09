"use client";

import { useQuery } from "@tanstack/react-query";

import { User } from "@/lib/types";
import { fetchUsers } from "@/lib/api";

import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  const router = useRouter();

  function toggleRow(id: number) {
    router.push(`/users/${id}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium text-gray-900 mb-6">Users</h1>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden sm:table-cell">Website</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <span className="w-full space-y-2">Loading...</span>
            ) : (
              users?.map((user: User) => {
                return (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => toggleRow(user.id)}
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      <a
                        href={`https://${user.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.website}
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
