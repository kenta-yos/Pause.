"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTargetRequest } from "@/types/insight";

interface Props {
  initialData?: CreateTargetRequest;
  targetId?: number;
  mode: "create" | "edit";
}

const FIELDS: { key: keyof CreateTargetRequest; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: "nickname", label: "ニックネーム", placeholder: "例：お父さん、田中さん" },
  { key: "relationship", label: "あなたとの関係", placeholder: "例：父、友人、同僚" },
  { key: "ageGroup", label: "年代", placeholder: "例：60代、40代後半" },
  { key: "lifeContext", label: "生活の背景", placeholder: "例：地方在住、定年退職後、自営業", multiline: true },
  { key: "values", label: "大切にしていること・価値観", placeholder: "例：家族を守ること、努力が報われること、伝統", multiline: true },
  { key: "infoSources", label: "主な情報源", placeholder: "例：テレビのニュース、YouTube、LINEで回ってくる記事", multiline: true },
  { key: "dialoguePattern", label: "これまでの対話パターン", placeholder: "例：政治の話になると怒り出す、こちらの話を聞いてくれない", multiline: true },
];

export function TargetForm({ initialData, targetId, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CreateTargetRequest>({
    nickname: initialData?.nickname || "",
    relationship: initialData?.relationship || "",
    ageGroup: initialData?.ageGroup || "",
    lifeContext: initialData?.lifeContext || "",
    values: initialData?.values || "",
    infoSources: initialData?.infoSources || "",
    dialoguePattern: initialData?.dialoguePattern || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: keyof CreateTargetRequest, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nickname.trim()) {
      setError("ニックネームを入力してください");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = mode === "create" ? "/api/targets" : `/api/targets/${targetId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "エラーが発生しました");
        return;
      }

      const newId = mode === "create" ? json.target.id : targetId;
      router.push(`/target/${newId}`);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELDS.map(({ key, label, placeholder, multiline }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-sm font-medium text-warm-700">
            {label}
            {key === "nickname" && <span className="text-red-400 ml-1">*</span>}
          </label>
          {multiline ? (
            <textarea
              value={form[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              rows={3}
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-800 placeholder:text-warm-300 resize-none focus:outline-none focus:border-sage-400 transition-colors leading-relaxed"
            />
          ) : (
            <input
              type="text"
              value={form[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-800 placeholder:text-warm-300 focus:outline-none focus:border-sage-400 transition-colors"
            />
          )}
        </div>
      ))}

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 text-warm-600 border border-warm-200 hover:border-warm-300 rounded-2xl font-medium transition-all duration-200"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-3 bg-sage-500 hover:bg-sage-600 disabled:bg-warm-200 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {saving ? "保存中…" : mode === "create" ? "登録する" : "更新する"}
        </button>
      </div>
    </form>
  );
}
