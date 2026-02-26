"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Search,
  User,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { TargetData, TargetInsightData, DialogueHistoryEntry } from "@/types/insight";

const PROFILE_LABELS: { key: keyof TargetData; label: string }[] = [
  { key: "relationship", label: "関係性" },
  { key: "ageGroup", label: "年代" },
  { key: "lifeContext", label: "生活の背景" },
  { key: "values", label: "大切にしていること" },
  { key: "infoSources", label: "主な情報源" },
  { key: "dialoguePattern", label: "対話パターン" },
];

export default function TargetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const targetId = parseInt(id, 10);
  const router = useRouter();

  const [target, setTarget] = useState<TargetData | null>(null);
  const [portrait, setPortrait] = useState<TargetInsightData | null>(null);
  const [history, setHistory] = useState<DialogueHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/targets/${targetId}`)
      .then((r) => r.json())
      .then((data) => {
        setTarget(data.target);
        setPortrait(data.portrait);
        setHistory(data.history || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetId]);

  async function handleDelete() {
    if (!confirm(`${target?.nickname}さんを削除しますか？この操作は取り消せません。`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/targets/${targetId}`, { method: "DELETE" });
      router.push("/");
    } catch {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <p className="text-warm-400 text-sm">読み込み中…</p>
      </main>
    );
  }

  if (!target) {
    return (
      <main className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <p className="text-warm-500 text-sm">データが見つかりません</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCF9] px-4 py-8 md:py-12">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
        </div>

        {/* Target name + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sage-50 rounded-xl">
              <User className="w-6 h-6 text-sage-600" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-warm-800">{target.nickname}</h2>
              {target.relationship && (
                <p className="text-sm text-warm-400">{target.relationship}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/analyze?targetId=${targetId}`}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-sage-500 hover:bg-sage-600 text-white text-sm rounded-xl font-medium transition-all duration-200 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              分析する
            </Link>
            <Link
              href={`/target/${targetId}/edit`}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-warm-500 hover:text-warm-700 border border-warm-200 hover:border-warm-300 rounded-xl transition-all duration-200"
            >
              <Pencil className="w-3.5 h-3.5" />
              編集
            </Link>
          </div>
        </div>

        {/* Portrait */}
        {portrait && (
          <div className="bg-sage-50/60 rounded-3xl border border-sage-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-sage-100 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-sage-600 shrink-0" />
              <span className="text-sm font-medium text-sage-700">
                Pause.は{target.nickname}さんをこう理解しています
              </span>
            </div>
            <div className="px-6 py-5">
              <p className="text-sage-800 text-sm leading-[1.9] whitespace-pre-wrap">
                {portrait.summary}
              </p>
              <p className="text-xs text-sage-400 mt-3">
                最終更新: {new Date(portrait.updatedAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>
        )}

        {/* Profile */}
        <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-warm-100">
            <span className="text-sm font-medium text-warm-600">プロフィール</span>
          </div>
          <div className="px-6 py-5 space-y-3">
            {PROFILE_LABELS.map(({ key, label }) => {
              const value = target[key];
              if (!value) return null;
              return (
                <div key={key}>
                  <p className="text-xs text-warm-400 mb-0.5">{label}</p>
                  <p className="text-sm text-warm-700">{String(value)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dialogue history */}
        {history.length > 0 && (
          <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-warm-500 shrink-0" />
              <span className="text-sm font-medium text-warm-600">対話履歴</span>
            </div>
            <div className="divide-y divide-warm-50">
              {history.map((h) => (
                <div key={h.id} className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedHistory(expandedHistory === h.id ? null : h.id)
                    }
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="min-w-0 mr-3">
                      <p className="text-sm text-warm-700 truncate">{h.claim}</p>
                      <p className="text-xs text-warm-400 mt-0.5">
                        {new Date(h.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    {expandedHistory === h.id ? (
                      <ChevronUp className="w-4 h-4 text-warm-300 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-warm-300 shrink-0" />
                    )}
                  </button>
                  {expandedHistory === h.id && h.output && (
                    <div className="mt-3 pt-3 border-t border-warm-50 space-y-3">
                      <div>
                        <p className="text-xs text-warm-400 font-medium mb-1">
                          信じる理由
                        </p>
                        <p className="text-xs text-warm-600 leading-relaxed whitespace-pre-wrap">
                          {h.output.beliefReason}
                        </p>
                      </div>
                      {h.output.scripts?.length > 0 && (
                        <div>
                          <p className="text-xs text-warm-400 font-medium mb-1">
                            台詞例
                          </p>
                          {h.output.scripts.slice(0, 2).map((s, i) => (
                            <p
                              key={i}
                              className="text-xs text-warm-600 leading-relaxed mt-1"
                            >
                              {s.script}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-warm-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            {deleting ? "削除中…" : "この人を削除する"}
          </button>
        </div>
      </div>
    </main>
  );
}
