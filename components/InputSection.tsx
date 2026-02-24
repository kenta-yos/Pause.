"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ModeSelector } from "@/components/ModeSelector";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { Mode, InsightData } from "@/types/insight";
import { Search } from "lucide-react";

interface Props {
  onResult: (data: InsightData, mode: Mode, remaining: number | null) => void;
  remaining: number | null;
}

const LOADING_PHASES = [
  { time: 0,     progress: 8,  label: "言説を読み取り中…" },
  { time: 1500,  progress: 25, label: "情報を検索中…" },
  { time: 4000,  progress: 48, label: "学術知見を参照中…" },
  { time: 9000,  progress: 68, label: "知識を整理中…" },
  { time: 16000, progress: 85, label: "Insightを構成中…" },
  { time: 25000, progress: 93, label: "もう少しお待ちください…" },
];

export function InputSection({ onResult, remaining }: Props) {
  const [claim, setClaim] = useState("");
  const [mode, setMode] = useState<Mode>("self");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState("");

  const charCount = claim.length;
  const maxChars = 2000;

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setPhaseLabel("");
      return;
    }
    const timers = LOADING_PHASES.map(({ time, progress: p, label }) =>
      setTimeout(() => {
        setProgress(p);
        setPhaseLabel(label);
      }, time)
    );
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!claim.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: claim.trim(), mode }),
      });

      const json = await res.json();
      const rem = res.headers.get("X-RateLimit-Remaining");
      const newRemaining = rem !== null ? Number(rem) : null;

      if (!res.ok || !json.success) {
        setError(json.error || "エラーが発生しました。");
        return;
      }

      setProgress(100);
      setPhaseLabel("完了");
      await new Promise((r) => setTimeout(r, 300));
      onResult(json.data, mode, newRemaining);
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Image src="/icon.png" alt="Pause." width={40} height={40} className="rounded-xl" />
          <h1 className="text-4xl font-light tracking-tight text-warm-800">
            Pause<span className="text-sage-500">.</span>
          </h1>
        </div>
        <p className="text-warm-500 text-sm">
          一歩立ち止まって、事実から考える
        </p>
      </div>

      <PrivacyBadge />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Claim input — font-size 16px to prevent iOS auto-zoom */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-700">
            気になった言説・主張を入力してください
          </label>
          <div className="relative">
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="例：外国人が増えると治安が悪化する、〇〇は歴史を捏造している…"
              maxLength={maxChars}
              rows={5}
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3 rounded-2xl border-2 border-warm-200 bg-white text-warm-800 placeholder:text-warm-300 resize-none focus:outline-none focus:border-sage-400 transition-colors leading-relaxed"
            />
            <span
              className={`absolute bottom-3 right-3 text-xs ${
                charCount > maxChars * 0.9 ? "text-amber-500" : "text-warm-300"
              }`}
            >
              {charCount}/{maxChars}
            </span>
          </div>
        </div>

        {/* Mode selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-700">
            このInsightは誰のために？
          </label>
          <ModeSelector value={mode} onChange={setMode} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading progress */}
        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-warm-500">
              <span>{phaseLabel}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!claim.trim() || loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-sage-500 hover:bg-sage-600 disabled:bg-warm-200 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? "分析中…" : "Insightを生成する"}</span>
        </button>
      </form>

      {/* Footer: note + remaining count */}
      <div className="flex items-center justify-between text-xs text-warm-300">
        <p>回答は一次情報源および学術知見を参照。ソースは必ずご自身で確認ください。</p>
        {remaining !== null && (
          <p className="shrink-0 ml-4">残り {remaining} / 400</p>
        )}
      </div>
    </div>
  );
}
