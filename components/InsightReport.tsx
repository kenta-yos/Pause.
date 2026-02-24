"use client";

import Image from "next/image";
import { InsightData, Mode, ClaimType } from "@/types/insight";
import { ExportButtons } from "@/components/ExportButtons";
import { PrivacyNote } from "@/components/PrivacyBadge";
import { Link2, AlertTriangle, ShieldCheck, RotateCcw, BookOpen } from "lucide-react";

interface Props {
  data: InsightData;
  mode: Mode;
  onReset: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  receive:   "受け止める",
  context:   "文脈を広げる",
  evidence:  "事実と知見",
  elevation: "視野を一段上げる",
  landing:   "着地",
};

const TYPE_BADGE: Record<ClaimType, { label: string; color: string }> = {
  type1: { label: "別の視点を添えて",   color: "bg-amber-50 text-amber-700 border-amber-200" },
  type2: { label: "この視点を深めて",   color: "bg-sage-50 text-sage-700 border-sage-200" },
  type3: { label: "整理しながら",       color: "bg-warm-100 text-warm-600 border-warm-200" },
};

export function InsightReport({ data, mode, onReset }: Props) {
  const modeLabel = mode === "self" ? "自分のために" : "大切な人のために";
  const badge = TYPE_BADGE[data.claimType] ?? TYPE_BADGE.type3;

  const sections = [
    { key: "receive",   text: data.receive },
    { key: "context",   text: data.context },
    { key: "evidence",  text: data.evidence },
    { key: "elevation", text: data.elevation },
    { key: "landing",   text: data.landing },
  ];

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
        {/* Type badge */}
        <div className="px-6 pt-5 pb-4">
          <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full border font-medium ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Narrative sections */}
        <div className="px-6 pb-6 space-y-6">
          {sections.map(({ key, text }) =>
            text ? (
              <div key={key} className="space-y-1.5">
                <p className="text-[10px] font-medium tracking-widest text-warm-300 uppercase">
                  {SECTION_LABELS[key]}
                </p>
                <p className="text-warm-700 text-sm leading-[1.85] whitespace-pre-wrap">
                  {text}
                </p>
              </div>
            ) : null
          )}
        </div>

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

        {/* Recommended reads */}
        {data.recommendedReads.length > 0 && (
          <div className="px-6 py-4 border-t border-warm-100 space-y-2">
            <p className="text-[10px] font-medium tracking-widest text-warm-300 uppercase">
              もっと知りたい方へ
            </p>
            <ul className="space-y-3">
              {data.recommendedReads.map((read, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-warm-700">
                      {read.author}『{read.title}』({read.year})
                    </p>
                    <p className="text-xs text-warm-400 mt-0.5 leading-relaxed">
                      {read.reason}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-warm-300 pt-1">
              AIによる推薦です。出版・掲載状況はご自身でご確認ください。
            </p>
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
