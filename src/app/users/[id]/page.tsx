import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Post, Todo } from "@/lib/types";
import { fetchUser, fetchUserPosts, fetchUserTodos } from "@/lib/api";

import { AlertCircle } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import PostsList from "./_components/PostsList";
import TodosList from "./_components/TodosList";

interface Props {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  try {
    const { id } = await params;
    const user = await fetchUser(Number(id));
    return {
      title: `${user.name} — User Dashboard`,
      description: `Profile of ${user.name}, ${user.company.name}`,
    };
  } catch {
    return { title: "User not found" };
  }
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="py-5">
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => {
  return (
    <div className="flex justify-between gap-4 text-sm mb-2">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right break-all">{value}</dd>
    </div>
  );
};

const UserDetailPage = async ({ params }: Props) => {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (isNaN(id)) notFound();

  const [userResult, postsResult, todosResult] = await Promise.allSettled([
    fetchUser(id),
    fetchUserPosts(id),
    fetchUserTodos(id),
  ]);

  if (userResult.status === "rejected") notFound();

  const user = userResult.value;
  const posts: Post[] =
    postsResult.status === "fulfilled" ? postsResult.value : [];
  const todos: Todo[] =
    todosResult.status === "fulfilled" ? todosResult.value : [];
  const postsError = postsResult.status === "rejected";
  const todosError = todosResult.status === "rejected";

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to list
      </Link>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl truncate">{user.name}</CardTitle>
          <CardDescription>@{user.username}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-0">
          {/* contact */}
          <Section title="Contact">
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={user.phone} />
            <Field
              label="Website"
              value={
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {user.website}
                </a>
              }
            />
          </Section>

          <Separator />

          {/* company */}
          <Section title="Company">
            <Field label="Name" value={user.company.name} />
            <Field
              label="Catchphrase"
              value={<span className="italic">{user.company.catchPhrase}</span>}
            />
          </Section>

          <Separator />

          {/* Address */}
          <Section title="Address">
            <Field
              label="Street"
              value={`${user.address.street}, ${user.address.suite}`}
            />
            <Field label="City" value={user.address.city} />
            <Field label="Zipcode" value={user.address.zipcode} />
          </Section>

          <Separator />

          {/* post */}
          <Section title="Posts">
            {postsError ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Could not load posts.</AlertDescription>
              </Alert>
            ) : (
              <PostsList posts={posts} />
            )}
          </Section>

          <Separator />

          {/* todo */}
          <Section title="Todos">
            {todosError ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Could not load todos.</AlertDescription>
              </Alert>
            ) : (
              <TodosList todos={todos} />
            )}
          </Section>
        </CardContent>
      </Card>
    </main>
  );
};

export default UserDetailPage;
