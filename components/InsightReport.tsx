"use client";

import Image from "next/image";
import { InsightData, Mode } from "@/types/insight";
import { ExportButtons } from "@/components/ExportButtons";
import { PrivacyNote } from "@/components/PrivacyBadge";
import { Link2, AlertTriangle, ShieldCheck, RotateCcw } from "lucide-react";

interface Props {
  data: InsightData;
  mode: Mode;
  onReset: () => void;
}

export function InsightReport({ data, mode, onReset }: Props) {
  const modeLabel = mode === "self" ? "自分のために" : "大切な人のために";

  const narrative = [
    data.receive,
    data.context,
    data.evidence,
    data.elevation,
  ].filter(Boolean);

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
            Insight — {modeLabel} · {new Date().toLocaleDateString("ja-JP")}
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

      {/* Report card */}
      <div
        id="insight-report"
        className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden"
      >
        {/* Narrative — no labels, flows as one piece */}
        <div className="px-6 py-7 space-y-5">
          {narrative.map((text, i) => (
            <p key={i} className="text-warm-700 text-sm leading-[1.9] whitespace-pre-wrap">
              {text}
            </p>
          ))}
        </div>

        {/* Question — visually distinct */}
        {data.question && (
          <div className="mx-6 mb-6 px-5 py-4 bg-sage-50 border-l-2 border-sage-400 rounded-r-2xl">
            <p className="text-sage-800 text-sm leading-[1.85] italic">
              {data.question}
            </p>
          </div>
        )}

        {/* Sources */}
        {data.sources.length > 0 && (
          <div className="px-6 py-4 border-t border-warm-100 space-y-2">
            <p className="text-[10px] font-medium tracking-widest text-warm-300 uppercase">
              参照ソース
            </p>
            <ul className="space-y-1.5">
              {data.sources.map((src, i) => (
                <li key={i} className="flex items-start gap-2">
                  {src.verified ? (
                    <ShieldCheck className="w-3 h-3 text-sage-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline leading-relaxed"
                    >
                      {src.label}
                    </a>
                    <span className="text-xs text-warm-300 ml-1.5">
                      {src.institution} · {src.sourceType}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-warm-50 border-t border-warm-100">
          {data.hasUnverifiedSources && (
            <div className="flex items-start gap-2 mb-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              一部のソースリンクが確認できませんでした。
            </div>
          )}
          <p className="text-[10px] text-warm-300 leading-relaxed flex items-center gap-1">
            <Link2 className="w-3 h-3 shrink-0" />
            このInsightはどこにも保存されていません。ソースは必ずご自身でご確認ください。
          </p>
        </div>
      </div>

      <ExportButtons data={data} mode={mode} />
      <PrivacyNote />
    </div>
  );
}
