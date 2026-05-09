"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type SortDir = "asc" | "desc" | null;

const SortIcon = ({ sortDir }: { sortDir: SortDir }) => {
  if (sortDir === "asc") return <ArrowUp className="ml-1 h-3.5 w-3.5" />;
  if (sortDir === "desc") return <ArrowDown className="ml-1 h-3.5 w-3.5" />;
  return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />;
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    const result = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
    if (sortDir === "asc")
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    if (sortDir === "desc")
      return [...result].sort((a, b) => b.name.localeCompare(a.name));
    return result;
  }, [users, search, sortDir]);

  const toggleRow = (id: number) => {
    router.push(`/users/${id}`);
  };

  const cycleSortDir = () => {
    setSortDir((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium text-gray-900 mb-6">Users</h1>

      <div className="flex gap-3 items-center mb-6">
        <Input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72"
          aria-label="Search users"
        />
      </div>

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
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cycleSortDir}
                    className="flex items-center gap-0 px-0 font-medium hover:bg-transparent"
                    aria-label={`Sort by name ${sortDir === "asc" ? "descending" : "ascending"}`}
                  >
                    Name
                    <SortIcon sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Website</TableHead>
              </TableRow>
            </TableHeader>

            {filtered.length === 0 && !isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
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
                  : filtered?.map((user: User) => {
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
                          <TableCell className="hidden sm:table-cell">
                            <a
                              href={`https://${user.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-muted-foreground hover:text-blue-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {user.website}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            )}
          </Table>
        </div>
      )}
    </div>
  );
}
