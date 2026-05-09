"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UsersPage() {
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
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

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            Failed to load users. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!isError && (
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
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                    </TableRow>
                  ))
                : users?.map((user: User) => {
                    return (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer"
                        onClick={() => toggleRow(user.id)}
                      >
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
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
                  })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
