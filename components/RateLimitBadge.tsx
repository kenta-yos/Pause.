"use client";

import { useState, useEffect } from "react";

export function RateLimitBadge() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ratelimit")
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining))
      .catch(() => {});
  }, []);

  if (remaining === null) return null;

  return (
    <span className="text-xs text-warm-400 px-2 py-1 bg-warm-50 border border-warm-100 rounded-lg">
      残り {remaining} / 200
    </span>
  );
}
