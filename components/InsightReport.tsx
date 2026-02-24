"use client";

import Image from "next/image";
import { InsightData } from "@/types/insight";
import { ExportButtons } from "@/components/ExportButtons";
import { PrivacyNote } from "@/components/PrivacyBadge";
import { RotateCcw, BookOpen, MessageCircle } from "lucide-react";

interface Props {
  data: InsightData;
  onReset: () => void;
}

export function InsightReport({ data, onReset }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="Pause." width={32} height={32} className="rounded-lg" />
            <h2 className="text-2xl font-light text-warm-800">
              Pause<span className="text-sage-500">.</span>
            </h2>
          </div>
          <p className="text-xs text-warm-400 mt-0.5">
            Insight · {new Date().toLocaleDateString("ja-JP")}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-warm-500 hover:text-sage-600 border border-warm-200 hover:border-sage-300 rounded-xl transition-all duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          新しい分析
        </button>
      </div>

      <div id="insight-report" className="space-y-4">

        {/* Section 1: Understanding + Evidence */}
        <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-warm-400 shrink-0" />
            <span className="text-[11px] font-medium tracking-widest text-warm-400 uppercase">
              この言説を読み解く
            </span>
          </div>
          <div className="px-6 py-7 space-y-6">
            {data.understanding && (
              <p className="text-warm-700 text-sm leading-[1.95] whitespace-pre-wrap">
                {data.understanding}
              </p>
            )}
            {data.evidence && (
              <>
                <div className="border-t border-warm-100" />
                <p className="text-warm-700 text-sm leading-[1.95] whitespace-pre-wrap">
                  {data.evidence}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Section 2: Conversation guide */}
        <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2.5">
            <MessageCircle className="w-4 h-4 text-sage-500 shrink-0" />
            <span className="text-[11px] font-medium tracking-widest text-sage-500 uppercase">
              大切な人への伝え方
            </span>
          </div>
          <div className="px-6 py-7 space-y-6">
            {data.conversation && (
              <p className="text-warm-700 text-sm leading-[1.95] whitespace-pre-wrap">
                {data.conversation}
              </p>
            )}
            {data.question && (
              <div className="px-5 py-4 bg-sage-50 border-l-2 border-sage-400 rounded-r-2xl space-y-1">
                <p className="text-[10px] font-medium tracking-widest text-sage-500 uppercase mb-2.5">
                  問いかけの例
                </p>
                <p className="text-sage-700 text-sm leading-[1.9] whitespace-pre-wrap">
                  {data.question}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sources */}
        {data.sources.length > 0 && (
          <div className="bg-white rounded-3xl border border-warm-100 shadow-sm px-6 py-5">
            <p className="text-[10px] font-medium tracking-widest text-warm-300 uppercase mb-3">
              参照ソース
            </p>
            <div className="flex flex-wrap gap-2">
              {data.sources.map((src, i) => (
                <div
                  key={i}
                  className="px-3 py-2 bg-warm-50 rounded-xl border border-warm-100"
                >
                  <p className="text-xs text-warm-600 leading-snug">{src.label}</p>
                  <p className="text-[10px] text-warm-400 mt-0.5">
                    {src.institution} · {src.sourceType}
                    {src.year ? ` · ${src.year}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-warm-50 border border-warm-100 rounded-2xl">
          <p className="text-[10px] text-warm-300 leading-relaxed">
            このInsightはどこにも保存されていません。ソースはご自身でご確認ください。
          </p>
        </div>
      </div>

      <ExportButtons data={data} />
      <PrivacyNote />
    </div>
  );
}
