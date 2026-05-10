import Link from "next/link";

import { ChevronLeft, UserX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted">
        <UserX className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          User not found
        </h1>
        <p className="text-muted-foreground text-sm">
          The user you`re looking for doesn`t exist or may have been
          removed.
        </p>
      </div>

      <Link href="/users" className="inline-flex items-center gap-1.5">
        <ChevronLeft className="h-4 w-4" />
        Back to list
      </Link>
    </main>
  );
}
