"use client";

import { useState } from "react";
import { InputSection } from "@/components/InputSection";
import { InsightReport } from "@/components/InsightReport";
import { InsightData, Mode } from "@/types/insight";

export default function Home() {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [mode, setMode] = useState<Mode>("self");

  function handleResult(data: InsightData, selectedMode: Mode) {
    setMode(selectedMode);
    setInsight(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setInsight(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#FDFCF9] px-4 py-12 md:py-16">
      {insight ? (
        <InsightReport data={insight} mode={mode} onReset={handleReset} />
      ) : (
        <InputSection onResult={handleResult} />
      )}
    </main>
  );
}
