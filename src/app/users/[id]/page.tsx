import { fetchUser } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
}

export default async function UserDetailPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (isNaN(id)) notFound();

  let user;
  try {
    user = await fetchUser(id);
  } catch {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to list
      </Link>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">{user.name}</CardTitle>
          <CardDescription>@{user.username}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-0">
          {/* Contact */}
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

          {/* Company */}
          <Section title="Company">
            <Field label="Name" value={user.company.name} />
            <Field
              label="Catchphrase"
              value={`"${user.company.catchPhrase}"`}
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
        </CardContent>
      </Card>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-5">
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h2>
      <dl className="space-y-2">{children}</dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
