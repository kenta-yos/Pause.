"use client";

import { useState, useEffect } from "react";
import { InputSection } from "@/components/InputSection";
import { InsightReport } from "@/components/InsightReport";
import { InsightData } from "@/types/insight";

export default function Home() {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  // Fetch remaining count on mount
  useEffect(() => {
    fetch("/api/ratelimit")
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining))
      .catch(() => {});
  }, []);

  function handleResult(data: InsightData, newRemaining: number | null) {
    setInsight(data);
    if (newRemaining !== null) setRemaining(newRemaining);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setInsight(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#FDFCF9] px-4 py-12 md:py-16">
      {insight ? (
        <InsightReport data={insight} onReset={handleReset} />
      ) : (
        <InputSection onResult={handleResult} remaining={remaining} />
      )}
    </main>
  );
}
