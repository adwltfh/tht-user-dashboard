"use client";

import { Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";

import { User } from "@/lib/types";
import { fetchAllPosts, fetchAllTodos, fetchUsers } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortKey = "name-asc" | "name-desc" | "pending-desc" | null;
type ActivityFilter = "all" | "has-pending" | "no-completed";

interface UserStats {
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
}

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const SortIcon = ({
  active,
  dir,
}: {
  active: boolean;
  dir?: "asc" | "desc";
}) => {
  if (!active)
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />;
  return dir === "asc" ? (
    <ArrowUp className="ml-1 h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="ml-1 h-3.5 w-3.5" />
  );
};

const UsersContent = () => {
  const router = useRouter();
  const params = useSearchParams();

  const search = params.get("q") ?? "";
  const activityFilter = (params.get("filter") ?? "all") as ActivityFilter;
  const sortKey = (params.get("sort") ?? null) as SortKey;
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const PAGE_SIZE = 5;

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all" || value === "1") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    router.replace(`/users?${next.toString()}`, { scroll: false });
  };

  const setSearch = (val: string) => {
    updateParams({ q: val, page: null });
  };
  const setFilter = (val: ActivityFilter) => {
    updateParams({ filter: val === "all" ? null : val, page: null });
  };
  const setPage = (val: number) => {
    updateParams({ page: String(val) });
  };
  const setSort = (val: SortKey) => {
    updateParams({ sort: val, page: null });
  };

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: allPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchAllPosts,
  });

  const { data: allTodos, isLoading: todosLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchAllTodos,
  });

  const statsLoading = postsLoading || todosLoading;

  const userStats = useMemo<Map<number, UserStats>>(() => {
    const map = new Map<number, UserStats>();
    if (!users) return map;
    for (const u of users) {
      const posts = allPosts?.filter((p) => p.userId === u.id) ?? [];
      const todos = allTodos?.filter((t) => t.userId === u.id) ?? [];
      map.set(u.id, {
        totalPosts: posts.length,
        completedTodos: todos.filter((t) => t.completed).length,
        pendingTodos: todos.filter((t) => !t.completed).length,
      });
    }
    return map;
  }, [users, allPosts, allTodos]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    let result = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
    if (activityFilter === "has-pending") {
      result = result.filter(
        (u) => (userStats.get(u.id)?.pendingTodos ?? 0) > 0,
      );
    } else if (activityFilter === "no-completed") {
      result = result.filter(
        (u) => (userStats.get(u.id)?.completedTodos ?? 0) === 0,
      );
    }
    if (sortKey === "name-asc")
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    if (sortKey === "name-desc")
      return [...result].sort((a, b) => b.name.localeCompare(a.name));
    if (sortKey === "pending-desc")
      return [...result].sort(
        (a, b) =>
          (userStats.get(b.id)?.pendingTodos ?? 0) -
          (userStats.get(a.id)?.pendingTodos ?? 0),
      );
    return result;
  }, [users, search, activityFilter, sortKey, userStats]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const cycleNameSort = () => {
    if (sortKey === "name-asc") setSort("name-desc");
    else if (sortKey === "name-desc") setSort(null);
    else setSort("name-asc");
  };
  const cyclePendingSort = () => {
    setSort(sortKey === "pending-desc" ? null : "pending-desc");
  };
  const goToUser = (id: number) => {
    router.push(`/users/${id}`);
  };

  const StatBadge = ({
    userId,
    field,
  }: {
    userId: number;
    field: keyof UserStats;
  }) => {
    if (statsLoading) return <Skeleton className="h-4 w-8 inline-block" />;
    const val = userStats.get(userId)?.[field] ?? 0;
    const variant =
      field === "pendingTodos" && val > 0
        ? "destructive"
        : field === "completedTodos"
          ? "secondary"
          : "outline";
    return <Badge variant={variant}>{val}</Badge>;
  };

  const emptyMessage =
    search || activityFilter !== "all"
      ? "No users match your search or filter."
      : "No users found.";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Browse and manage your user base
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-2">
        <Input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
          aria-label="Search users"
        />
        <select
          value={activityFilter}
          onChange={(e) => setFilter(e.target.value as ActivityFilter)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter by activity"
        >
          <option value="all">All users</option>
          <option value="has-pending">Has pending todos</option>
          <option value="no-completed">No completed todos</option>
        </select>
      </div>

      {users && !usersError && (
        <p className="text-xs text-muted-foreground text-right mb-4">
          {filtered.length} {filtered.length === 1 ? "user" : "users"}
        </p>
      )}

      {usersError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            Failed to load users. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!usersError && (
        <>
          <div className="hidden sm:block rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cycleNameSort}
                      className="flex items-center gap-0 px-0 font-medium hover:bg-transparent"
                    >
                      Name
                      <SortIcon
                        active={
                          sortKey === "name-asc" || sortKey === "name-desc"
                        }
                        dir={sortKey === "name-asc" ? "asc" : "desc"}
                      />
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Website
                  </TableHead>
                  <TableHead className="text-center">Posts</TableHead>
                  <TableHead className="text-center">Done</TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cyclePendingSort}
                      className="flex items-center gap-0 px-0 font-medium hover:bg-transparent mx-auto"
                    >
                      Pending
                      <SortIcon
                        active={sortKey === "pending-desc"}
                        dir="desc"
                      />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>

              {filtered.length === 0 && !usersLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-10"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {usersLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Skeleton className="h-4 w-36" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-8 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-8 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-8 mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    : paginated.map((user: User) => (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer"
                          onClick={() => goToUser(user.id)}
                        >
                          <TableCell className="font-medium max-w-45">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                                  getAvatarColor(user.id),
                                )}
                              >
                                {getInitials(user.name)}
                              </div>
                              <span className="truncate">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-50 truncate">
                            {user.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
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
                          <TableCell className="text-center">
                            <StatBadge userId={user.id} field="totalPosts" />
                          </TableCell>
                          <TableCell className="text-center">
                            <StatBadge
                              userId={user.id}
                              field="completedTodos"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <StatBadge userId={user.id} field="pendingTodos" />
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              )}
            </Table>
          </div>

          <div className="block sm:hidden space-y-3">
            {usersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} size="sm">
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">
                {emptyMessage}
              </p>
            ) : (
              paginated.map((user: User) => (
                <Card
                  key={user.id}
                  size="sm"
                  className="cursor-pointer hover:shadow-sm transition-all"
                  onClick={() => goToUser(user.id)}
                >
                  <CardContent className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 mt-0.5",
                        getAvatarColor(user.id),
                      )}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div>
                        <p className="font-medium truncate leading-tight">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.company.name}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {statsLoading ? (
                          <>
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                          </>
                        ) : (
                          <>
                            <Badge variant="outline">
                              {userStats.get(user.id)?.totalPosts ?? 0} posts
                            </Badge>
                            <Badge variant="secondary">
                              {userStats.get(user.id)?.completedTodos ?? 0} done
                            </Badge>
                            <Badge
                              variant={
                                (userStats.get(user.id)?.pendingTodos ?? 0) > 0
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {userStats.get(user.id)?.pendingTodos ?? 0}{" "}
                              pending
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {!usersLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {safePage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const UsersPage = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
};

export default UsersPage;
