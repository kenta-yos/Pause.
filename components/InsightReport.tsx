"use client";

import Image from "next/image";
import { InsightData, ApproachKey } from "@/types/insight";
import { ExportButtons } from "@/components/ExportButtons";
import { PrivacyNote } from "@/components/PrivacyBadge";
import {
  RotateCcw,
  BookOpen,
  MessageCircle,
  Lightbulb,
  ArrowLeftRight,
  Search,
  User,
  Scale,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface Props {
  data: InsightData;
  onReset: () => void;
}

interface ApproachMeta {
  key: ApproachKey;
  label: string;
  icon: LucideIcon;
  hint: string;
}

const APPROACHES: ApproachMeta[] = [
  {
    key: "contradiction",
    label: "矛盾に気づいてもらう",
    icon: Lightbulb,
    hint: "質問によって、本人に発見させる",
  },
  {
    key: "perspective",
    label: "立場を入れ替えてみる",
    icon: ArrowLeftRight,
    hint: "感情的にリアルな自分ごとのシナリオ",
  },
  {
    key: "prebunking",
    label: "なぜ広まるかを先に話す",
    icon: Search,
    hint: "言説の製造構造を先に見せる",
  },
  {
    key: "narrative",
    label: "一人の人間の話をする",
    icon: User,
    hint: "統計より名前と顔を持ったストーリー",
  },
  {
    key: "analogy",
    label: "相手の価値観から入る",
    icon: Scale,
    hint: "すでに持っている原則を当てはめる",
  },
];

export function InsightReport({ data, onReset }: Props) {
  const recommended = data.approaches?.recommended;

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
            <BookOpen className="w-4 h-4 text-warm-500 shrink-0" />
            <span className="text-sm font-medium text-warm-600">この言説を読み解く</span>
          </div>
          <div className="px-6 py-7 space-y-6">
            {data.understanding && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-warm-600">なぜ信じてしまうのか</h4>
                <p className="text-warm-700 text-sm leading-[1.95] whitespace-pre-wrap">
                  {data.understanding}
                </p>
              </div>
            )}
            {data.evidence && (
              <>
                <div className="border-t border-warm-100" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-warm-600">事実とデータ</h4>
                  <p className="text-warm-700 text-sm leading-[1.95] whitespace-pre-wrap">
                    {data.evidence}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: 5 Approaches */}
        <div className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2.5">
            <MessageCircle className="w-4 h-4 text-sage-600 shrink-0" />
            <span className="text-sm font-medium text-sage-700">大切な人への伝え方</span>
          </div>

          <div className="divide-y divide-warm-100">
            {APPROACHES.map(({ key, label, icon: Icon, hint }) => {
              const text = data.approaches?.[key] as string | undefined;
              const isRecommended = key === recommended;

              return (
                <div
                  key={key}
                  className={`px-6 py-6 ${isRecommended ? "bg-sage-50/60" : ""}`}
                >
                  {/* Approach header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isRecommended ? "bg-sage-200" : "bg-warm-100"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isRecommended ? "text-sage-700" : "text-warm-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-medium ${
                            isRecommended ? "text-sage-800" : "text-warm-700"
                          }`}
                        >
                          {label}
                        </h4>
                        {isRecommended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sage-500 text-white text-[10px] font-medium rounded-full shrink-0">
                            <Sparkles className="w-2.5 h-2.5" />
                            この言説に特に有効
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-warm-400 mt-0.5">{hint}</p>
                      {isRecommended && data.approaches?.recommendedReason && (
                        <p className="text-xs text-sage-600 mt-2 leading-relaxed border-l-2 border-sage-300 pl-2.5">
                          {data.approaches.recommendedReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Approach body */}
                  {text && (
                    <p
                      className={`text-sm leading-[1.9] whitespace-pre-wrap pl-9 ${
                        isRecommended ? "text-sage-900" : "text-warm-700"
                      }`}
                    >
                      {text}
                    </p>
                  )}
                </div>
              );
            })}
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
                <div key={i} className="px-3 py-2 bg-warm-50 rounded-xl border border-warm-100">
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
      </div>

      <ExportButtons data={data} />
      <PrivacyNote />
    </div>
  );
}
