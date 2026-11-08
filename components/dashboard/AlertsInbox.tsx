"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityNotification } from "@/lib/types/database";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AlertsInbox({
  initialItems,
}: {
  initialItems: ActivityNotification[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function markRead(ids: string[]) {
    if (!ids.length) return;
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", ids);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setItems((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
    );
    startTransition(() => router.refresh());
  }

  const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);

  if (!items.length) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No activity alerts yet. Follow clubs, trainers, events, or courses — when they publish a
        Journal update, it shows up here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-muted)]">
          {unreadIds.length
            ? `${unreadIds.length} unread`
            : "All caught up"}
        </p>
        {unreadIds.length ? (
          <button
            type="button"
            className="btn btn-secondary px-3 py-1.5 text-sm"
            disabled={pending}
            onClick={() => void markRead(unreadIds)}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-2">
        {items.map((n) => {
          const inner = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[var(--color-text)]">{n.title}</p>
                  {n.body ? (
                    <p className="mt-0.5 text-sm text-[var(--color-muted)]">{n.body}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {formatWhen(n.created_at)}
                    {n.entity_type ? ` · ${n.entity_type}` : ""}
                  </p>
                </div>
                {!n.is_read ? (
                  <button
                    type="button"
                    className="shrink-0 text-xs font-medium text-[var(--color-primary)] hover:underline"
                    disabled={pending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void markRead([n.id]);
                    }}
                  >
                    Mark read
                  </button>
                ) : (
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">Read</span>
                )}
              </div>
            </>
          );

          return (
            <li
              key={n.id}
              className={`card p-4 ${n.is_read ? "opacity-70" : "border-[var(--color-primary)]/30"}`}
            >
              {n.href ? (
                <Link
                  href={n.href}
                  className="block no-underline"
                  onClick={() => {
                    if (!n.is_read) void markRead([n.id]);
                  }}
                >
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
