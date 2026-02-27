"use client";

import { useMemo, useState } from "react";

import type { ImpressionType, PostStats } from "@/types/blog";

interface HelpfulFeedbackProps {
  postId: string;
  initialStats: Pick<PostStats, "like_count" | "dislike_count">;
}

export function HelpfulFeedback({ postId, initialStats }: HelpfulFeedbackProps) {
  const [stats, setStats] = useState(initialStats);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const buttons = useMemo(
    () => [
      { type: "like" as const, label: "Helpful", icon: "??", count: stats.like_count },
      {
        type: "dislike" as const,
        label: "Not helpful",
        icon: "??",
        count: stats.dislike_count,
      },
    ],
    [stats.dislike_count, stats.like_count],
  );

  async function submit(type: ImpressionType) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/impression", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ post_id: postId, type }),
      });

      const payload = (await response.json()) as {
        message?: string;
        counts?: { like_count: number; dislike_count: number };
      };

      if (!response.ok) {
        setMessage(payload.message || "Could not save feedback. Try again later.");
        return;
      }

      if (payload.counts) {
        setStats({
          like_count: payload.counts.like_count,
          dislike_count: payload.counts.dislike_count,
        });
      }

      setMessage(payload.message || "Thanks for the feedback.");
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/80">
      <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">Was this helpful?</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {buttons.map((button) => (
          <button
            key={button.type}
            type="button"
            onClick={() => submit(button.type)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-slate-700 transition hover:border-sky-500 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300"
          >
            <span aria-hidden="true">{button.icon}</span>
            <span>{button.label}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{button.count}</span>
          </button>
        ))}
      </div>

      {message ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}
    </section>
  );
}
