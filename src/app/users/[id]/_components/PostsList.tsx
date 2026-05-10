"use client";

import { useState } from "react";

import { Post } from "@/lib/types";

import { Button } from "@/components/ui/button";

const INITIAL_COUNT = 3;

const PostsList = ({ posts }: { posts: Post[] }) => {
  const [expanded, setExpanded] = useState(false);

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No posts yet.</p>;
  }

  const visible = expanded ? posts : posts.slice(0, INITIAL_COUNT);
  const remaining = posts.length - INITIAL_COUNT;

  return (
    <div className="space-y-4">
      {visible.map((post) => (
        <div
          key={post.id}
          className="rounded-lg border bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
        >
          <p className="text-sm font-medium leading-snug line-clamp-1 capitalize">
            {post.title}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {post.body}
          </p>
        </div>
      ))}

      {posts.length > INITIAL_COUNT && (
        <Button
          variant="ghost"
          size="sm"
          className="px-0 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : `Show ${remaining} more`}
        </Button>
      )}
    </div>
  );
};

export default PostsList;
