"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TargetForm } from "@/components/TargetForm";
import { CreateTargetRequest } from "@/types/insight";

export default function EditTargetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const targetId = parseInt(id, 10);
  const [initialData, setInitialData] = useState<CreateTargetRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/targets/${targetId}`)
      .then((r) => r.json())
      .then((data) => {
        const t = data.target;
        setInitialData({
          nickname: t.nickname || "",
          ageGroup: t.ageGroup || "",
          lifeContext: t.lifeContext || "",
          values: t.values || "",
          infoSources: t.infoSources || "",
          relationship: t.relationship || "",
          dialoguePattern: t.dialoguePattern || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetId]);

  return (
    <main className="min-h-screen bg-[#FDFCF9] px-4 py-8 md:py-12">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/target/${targetId}`}
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
          <h2 className="text-xl font-medium text-warm-800">プロフィールを編集</h2>
          <p className="text-sm text-warm-400">
            情報が多いほど、より具体的な対話アドバイスが得られます
          </p>
        </div>

        {loading ? (
          <p className="text-warm-400 text-sm text-center py-8">読み込み中…</p>
        ) : initialData ? (
          <TargetForm mode="edit" targetId={targetId} initialData={initialData} />
        ) : (
          <p className="text-red-500 text-sm text-center py-8">データの読み込みに失敗しました</p>
        )}
      </div>
    </main>
  );
}
