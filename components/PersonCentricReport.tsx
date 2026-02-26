"use client";

import Image from "next/image";
import { PersonCentricInsight } from "@/types/insight";
import { ExportButtons } from "@/components/ExportButtons";
import {
  RotateCcw,
  Brain,
  Lightbulb,
  MessageSquare,
  ShieldAlert,
  BookOpen,
} from "lucide-react";

interface Props {
  data: PersonCentricInsight;
  targetNickname: string;
  onReset: () => void;
}

export function PersonCentricReport({ data, targetNickname, onReset }: Props) {
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
            {targetNickname}さんへの対話アドバイス · {new Date().toLocaleDateString("ja-JP")}
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

      {/* Card 1: Why they believe this */}
      <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2.5">
          <Brain className="w-4 h-4 text-warm-500 shrink-0" />
          <span className="text-sm font-medium text-warm-600">
            {targetNickname}さんがこの言説を信じる理由
          </span>
        </div>
        <div className="px-6 py-6">
          <p className="text-warm-700 text-sm leading-[1.95] whitespace-pre-wrap">
            {data.beliefReason}
          </p>
        </div>
      </div>

      {/* Card 2: Resonant angles */}
      {data.resonantAngles.length > 0 && (
        <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2.5">
            <Lightbulb className="w-4 h-4 text-sage-600 shrink-0" />
            <span className="text-sm font-medium text-sage-700">
              {targetNickname}さんに響く切り口
            </span>
          </div>
          <div className="px-6 py-5 space-y-3">
            {data.resonantAngles.map((angle, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-sage-500 text-sm font-medium shrink-0 mt-0.5">
                  {i + 1}.
                </span>
                <p className="text-warm-700 text-sm leading-relaxed">{angle}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card 3: Scripts */}
      {data.scripts.length > 0 && (
        <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-sage-600 shrink-0" />
            <span className="text-sm font-medium text-sage-700">今夜使える台詞</span>
          </div>
          <div className="divide-y divide-warm-100">
            {data.scripts.map((s, i) => (
              <div key={i} className="px-6 py-5 space-y-2.5">
                <p className="text-xs text-warm-400 font-medium">{s.situation}</p>
                <p className="text-warm-800 text-sm leading-[1.9] bg-sage-50/60 rounded-xl px-4 py-3 whitespace-pre-wrap">
                  {s.script}
                </p>
                {s.note && (
                  <p className="text-xs text-warm-500 leading-relaxed pl-1">
                    💡 {s.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card 4: Avoid words */}
      {data.avoidWords.length > 0 && (
        <div className="bg-red-50/50 rounded-3xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm font-medium text-red-600">避けるべき言葉・態度</span>
          </div>
          <div className="px-6 py-5 space-y-2.5">
            {data.avoidWords.map((word, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-red-300 shrink-0">×</span>
                <p className="text-red-700 text-sm leading-relaxed">{word}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card 5: Sources */}
      {data.sources.length > 0 && (
        <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-warm-400 shrink-0" />
            <span className="text-sm font-medium text-warm-500">参照知見</span>
          </div>
          <div className="px-6 py-4">
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
        </div>
      )}

      <ExportButtons data={data} targetNickname={targetNickname} />

      <p className="text-xs text-warm-400 text-center mt-4">
        AIが生成した対話アドバイスです。ソースはご自身でご確認ください。
      </p>
    </div>
  );
}
