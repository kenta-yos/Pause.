"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface TargetOption {
  id: number;
  nickname: string;
  relationship: string | null;
}

interface Props {
  selectedId: number | null;
  onChange: (id: number) => void;
}

export function TargetSelector({ selectedId, onChange }: Props) {
  const [targets, setTargets] = useState<TargetOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/targets")
      .then((r) => r.json())
      .then((data) => setTargets(data.targets || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-warm-400">読み込み中…</p>;
  }

  if (targets.length === 0) {
    return (
      <p className="text-sm text-warm-400">
        まだ大切な人が登録されていません。先にホーム画面から登録してください。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-warm-700">対話する相手を選ぶ</label>
      <div className="grid gap-2">
        {targets.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
              selectedId === t.id
                ? "border-sage-400 bg-sage-50 text-sage-800"
                : "border-warm-200 bg-white text-warm-600 hover:border-sage-200"
            }`}
          >
            <User className={`w-4 h-4 shrink-0 ${selectedId === t.id ? "text-sage-600" : "text-warm-400"}`} />
            <div>
              <span className="text-sm font-medium">{t.nickname}</span>
              {t.relationship && (
                <span className="text-xs text-warm-400 ml-2">{t.relationship}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
