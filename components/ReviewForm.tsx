"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ReviewForm({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      reviewer_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      rating,
      title: title.trim() || null,
      content: content.trim() || null,
      status: "published",
    });

    if (error) {
      setStatus("error");
      if (error.code === "23505") {
        setErrorMessage("You already left a review for this listing.");
      } else {
        setErrorMessage(error.message || "Failed to submit review.");
      }
      return;
    }

    setStatus("done");
    window.location.reload();
  }

  if (status === "done") {
    return (
      <div className="card p-4 text-sm text-[var(--color-muted)]">
        Thanks — your review was published.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <h3 className="font-semibold">Write a review</h3>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="review-rating">
          Rating
        </label>
        <select
          id="review-rating"
          className="input"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "star" : "stars"}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="review-title">
          Title (optional)
        </label>
        <input
          id="review-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={120}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="review-content">
          Review
        </label>
        <textarea
          id="review-content"
          className="input min-h-24"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share details that help others…"
          maxLength={2000}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Submitting…" : "Submit review"}
      </button>
      {status === "error" && errorMessage ? (
        <p className="text-sm text-[var(--color-danger)]">{errorMessage}</p>
      ) : null}
    </form>
  );
}
