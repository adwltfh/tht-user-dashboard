"use client";

import { useState } from "react";

import { Todo } from "@/lib/types";

import { Badge } from "@/components/ui/badge";

import { CheckSquare, Square, ChevronDown, ChevronRight } from "lucide-react";

const TodosList = ({ todos }: { todos: Todo[] }) => {
  const [completedOpen, setCompletedOpen] = useState(false);

  if (todos.length === 0) {
    return <p className="text-sm text-muted-foreground">No todos yet.</p>;
  }

  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  return (
    <div className="space-y-4">
      {pending.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Pending ({pending.length})
          </p>
          <ul className="space-y-1.5">
            {pending.map((todo) => (
              <li
                key={todo.id}
                className="flex items-start gap-2 text-sm rounded-md px-2 py-1 -mx-2 hover:bg-muted/50 transition-colors"
              >
                <Square className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span className="capitalize">{todo.title}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No pending todos.</p>
      )}

      {completed.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setCompletedOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            {completedOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            Completed
            <Badge
              variant="secondary"
              className="ml-1 normal-case tracking-normal"
            >
              {completed.length}
            </Badge>
          </button>

          {completedOpen && (
            <ul className="space-y-1.5">
              {completed.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-start gap-2 text-sm rounded-md px-2 py-1 -mx-2 hover:bg-muted/50 transition-colors"
                >
                  <CheckSquare className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                  <span className="line-through text-muted-foreground capitalize">
                    {todo.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TodosList;
