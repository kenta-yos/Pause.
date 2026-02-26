"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TargetCard } from "@/components/TargetCard";
import { UserPlus, Heart } from "lucide-react";

interface TargetSummary {
  id: number;
  nickname: string;
  relationship: string | null;
  lastAnalyzedAt: string | null;
}

export default function Home() {
  const [userName, setUserName] = useState("");
  const [targets, setTargets] = useState<TargetSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/targets").then((r) => r.json()),
    ])
      .then(([meData, targetsData]) => {
        setUserName(meData.user?.name || "");
        setTargets(targetsData.targets || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFCF9] px-4 py-8 md:py-12">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <Header userName={userName} />

        {loading ? (
          <div className="text-center py-16">
            <p className="text-warm-400 text-sm">読み込み中…</p>
          </div>
        ) : targets.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 space-y-6">
            <div className="inline-flex p-4 bg-sage-50 rounded-2xl">
              <Heart className="w-8 h-8 text-sage-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-warm-700">
                大切な人を登録しましょう
              </h2>
              <p className="text-sm text-warm-400 max-w-sm mx-auto">
                対話したい相手を登録すると、その人に合わせた具体的な対話アドバイスを生成できます
              </p>
            </div>
            <Link
              href="/target/new"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-sage-500 hover:bg-sage-600 text-white rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              大切な人を登録する
            </Link>
          </div>
        ) : (
          /* Target list */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-warm-600">あなたの大切な人</h2>
              <Link
                href="/target/new"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-sage-600 hover:text-sage-700 border border-sage-200 hover:border-sage-300 rounded-xl transition-all duration-200"
              >
                <UserPlus className="w-3.5 h-3.5" />
                登録する
              </Link>
            </div>
            <div className="grid gap-3">
              {targets.map((t) => (
                <TargetCard
                  key={t.id}
                  id={t.id}
                  nickname={t.nickname}
                  relationship={t.relationship}
                  lastAnalyzedAt={t.lastAnalyzedAt}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
