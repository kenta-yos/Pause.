"use client";

import { useState } from "react";
import { ModeSelector } from "@/components/ModeSelector";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { Mode, InsightData } from "@/types/insight";
import { Loader2, Search } from "lucide-react";

interface Props {
  onResult: (data: InsightData, mode: Mode) => void;
}

export function InputSection({ onResult }: Props) {
  const [claim, setClaim] = useState("");
  const [mode, setMode] = useState<Mode>("self");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = claim.length;
  const maxChars = 2000;

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

      if (!res.ok || !json.success) {
        setError(json.error || "エラーが発生しました。");
        return;
      }

      onResult(json.data, mode);
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
        <h1 className="text-4xl font-light tracking-tight text-warm-800">
          Pause<span className="text-sage-500">.</span>
        </h1>
        <p className="text-warm-500 text-sm">
          一歩立ち止まって、事実から考える
        </p>
      </div>

      <PrivacyBadge />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Claim input */}
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
              className="w-full px-4 py-3 rounded-2xl border-2 border-warm-200 bg-white text-warm-800 placeholder:text-warm-300 resize-none focus:outline-none focus:border-sage-400 transition-colors text-sm leading-relaxed"
            />
            <span
              className={`absolute bottom-3 right-3 text-xs ${
                charCount > maxChars * 0.9
                  ? "text-amber-500"
                  : "text-warm-300"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={!claim.trim() || loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-sage-500 hover:bg-sage-600 disabled:bg-warm-200 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>分析中…少々お待ちください</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Insightを生成する</span>
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-warm-400 text-center">
        回答は信頼できる一次情報源（政府統計・国際機関・学術機関）のみを参照しています。
        <br />
        ソースは必ずご自身で確認してください。
      </p>
    </div>
  );
}
