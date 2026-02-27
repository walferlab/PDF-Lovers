"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  postId: string;
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) {
      return;
    }

    sentRef.current = true;

    fetch("/api/view", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ post_id: postId }),
      keepalive: true,
    }).catch(() => {
      // Ignore tracking failures.
    });
  }, [postId]);

  return null;
}
