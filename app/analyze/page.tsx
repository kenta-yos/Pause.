"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, Leaf } from "lucide-react";
import { TargetSelector } from "@/components/TargetSelector";
import { PersonCentricReport } from "@/components/PersonCentricReport";
import { PersonCentricInsight } from "@/types/insight";

const LOADING_PHASES = [
  { time: 0, progress: 8, label: "言説を読み取り中…" },
  { time: 1500, progress: 25, label: "プロフィールを読み込み中…" },
  { time: 4000, progress: 48, label: "学術知見を参照中…" },
  { time: 9000, progress: 68, label: "対話パターンを検討中…" },
  { time: 16000, progress: 85, label: "台詞を構成中…" },
  { time: 25000, progress: 93, label: "もう少しお待ちください…" },
];

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const preselectedTargetId = searchParams.get("targetId");

  const [targetId, setTargetId] = useState<number | null>(
    preselectedTargetId ? parseInt(preselectedTargetId, 10) : null
  );
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState("");
  const [result, setResult] = useState<PersonCentricInsight | null>(null);
  const [supported, setSupported] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");

  const charCount = claim.length;
  const maxChars = 2000;

  // Fetch target nickname if preselected
  useEffect(() => {
    if (targetId) {
      fetch(`/api/targets/${targetId}`)
        .then((r) => r.json())
        .then((data) => setTargetNickname(data.target?.nickname || ""))
        .catch(() => {});
    }
  }, [targetId]);

  // Loading animation
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
    if (!claim.trim() || !targetId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: claim.trim(), targetId }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "エラーが発生しました。");
        return;
      }

      setProgress(100);
      setPhaseLabel("完了");
      await new Promise((r) => setTimeout(r, 300));

      if (json.supported || json.data?.supported) {
        setSupported(true);
      } else {
        setResult(json.data);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setSupported(false);
    setClaim("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (supported) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="bg-sage-50/60 rounded-3xl border border-sage-100 shadow-sm overflow-hidden">
          <div className="px-6 py-8 text-center space-y-4">
            <div className="inline-flex p-3 bg-sage-100 rounded-2xl">
              <Leaf className="w-6 h-6 text-sage-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-sage-800">
                この件では、Pause.の出番は少なそうです
              </h3>
              <p className="text-sm text-sage-600 leading-relaxed max-w-md mx-auto">
                {targetNickname
                  ? `${targetNickname}さんが気になる別の主張があれば、ぜひそちらでお試しください。`
                  : "別の主張で、もう一度お試しください。"}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-medium transition-all duration-200 text-sm"
            >
              別の言説を入力する
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <PersonCentricReport
        data={result}
        targetNickname={targetNickname}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TargetSelector selectedId={targetId} onChange={(id) => {
        setTargetId(id);
        fetch(`/api/targets/${id}`)
          .then((r) => r.json())
          .then((data) => setTargetNickname(data.target?.nickname || ""))
          .catch(() => {});
      }} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-700">
            {targetNickname
              ? `${targetNickname}さんが信じている言説・主張`
              : "大切な人が信じている言説・主張を入力してください"}
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

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

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

        <button
          type="submit"
          disabled={!claim.trim() || !targetId || loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-sage-500 hover:bg-sage-600 disabled:bg-warm-200 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? "考え中…" : "この人との話し方を考える"}</span>
        </button>
      </form>

      <p className="text-xs text-warm-300 text-center">
        回答は一次情報源および学術知見を参照。ソースは必ずご自身で確認ください。
      </p>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-[#FDFCF9] px-4 py-8 md:py-12">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 text-warm-400 hover:text-warm-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="Pause." width={24} height={24} className="rounded-md" />
            <span className="text-warm-600 font-light">
              Pause<span className="text-sage-500">.</span>
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-medium text-warm-800">話し方を考える</h2>
          <p className="text-sm text-warm-400">
            大切な人が信じている言説を入力すると、その人に合った対話のヒントを提案します
          </p>
        </div>

        <Suspense fallback={<p className="text-warm-400 text-sm">読み込み中…</p>}>
          <AnalyzeContent />
        </Suspense>
      </div>
    </main>
  );
}
