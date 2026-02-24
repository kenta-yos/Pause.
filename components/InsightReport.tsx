"use client";

import { InsightData, Mode } from "@/types/insight";
import { ExportButtons } from "@/components/ExportButtons";
import { PrivacyNote } from "@/components/PrivacyBadge";
import {
  BookOpen,
  Brain,
  BarChart3,
  Compass,
  MessageCircle,
  Link2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface Props {
  data: InsightData;
  mode: Mode;
  onReset: () => void;
}

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-medium text-warm-700 text-sm">{title}</h3>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
}

export function InsightReport({ data, mode, onReset }: Props) {
  const tips =
    mode === "self"
      ? data.conversationTips.forSelf
      : data.conversationTips.forOthers;
  const modeLabel = mode === "self" ? "自分のために" : "大切な人のために";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-warm-800">
            Pause<span className="text-sage-500">.</span>
          </h2>
          <p className="text-xs text-warm-400 mt-0.5">
            Insight — {modeLabel} · {new Date().toLocaleDateString("ja-JP")}
          </p>
        </div>
        <button
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
        {/* Input summary */}
        <div className="px-6 py-5 bg-warm-50 border-b border-warm-100">
          <div className="flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-warm-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-warm-400 mb-1">言説の要約</p>
              <p className="text-warm-700 text-sm leading-relaxed">
                {data.inputSummary}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-7 divide-y divide-warm-50">
          {/* Background */}
          <Section
            icon={Brain}
            title="なぜこう感じる人がいるか"
            color="bg-amber-50 text-amber-600"
          >
            <p className="text-warm-600 text-sm leading-relaxed">
              {data.background}
            </p>
          </Section>

          {/* Facts */}
          <div className="pt-7">
            <Section
              icon={BarChart3}
              title="事実とデータ"
              color="bg-blue-50 text-blue-600"
            >
              {data.facts.length > 0 ? (
                <div className="space-y-4">
                  {data.facts.map((fact, i) => (
                    <div
                      key={i}
                      className="bg-warm-50 rounded-2xl px-4 py-3 space-y-2"
                    >
                      <p className="text-warm-700 text-sm leading-relaxed">
                        {fact.claim}
                      </p>
                      <div className="flex items-center gap-2">
                        {fact.source.verified ? (
                          <span className="flex items-center gap-1 text-xs text-sage-600 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            検証済み
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            要確認
                          </span>
                        )}
                        <a
                          href={fact.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          <Link2 className="w-3 h-3" />
                          {fact.source.institution}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-warm-400 text-sm italic">
                  今回の分析で確認できた検証済みの一次情報はありませんでした。
                </p>
              )}
            </Section>
          </div>

          {/* Perspectives */}
          <div className="pt-7">
            <Section
              icon={Compass}
              title="別の視点"
              color="bg-purple-50 text-purple-600"
            >
              <ul className="space-y-2">
                {data.perspectives.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-warm-600 leading-relaxed">
                    <span className="text-sage-400 shrink-0 mt-0.5">·</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Conversation tips */}
          <div className="pt-7">
            <Section
              icon={MessageCircle}
              title={`対話のヒント — ${modeLabel}`}
              color="bg-sage-50 text-sage-600"
            >
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-warm-600 leading-relaxed"
                  >
                    <span className="text-sage-400 shrink-0 font-medium mt-0.5">
                      {i + 1}.
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* References */}
          {data.references.length > 0 && (
            <div className="pt-7">
              <Section
                icon={Link2}
                title="参考資料"
                color="bg-warm-100 text-warm-500"
              >
                <ul className="space-y-2">
                  {data.references.map((ref, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {ref.verified ? (
                        <ShieldCheck className="w-3 h-3 text-sage-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline leading-relaxed"
                        >
                          {ref.title}
                        </a>
                        <p className="text-xs text-warm-400">{ref.institution}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="px-6 py-4 bg-warm-50 border-t border-warm-100">
          {data.hasUnverifiedSources && (
            <div className="flex items-start gap-2 mb-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              一部のソースリンクが確認できませんでした。「要確認」マークのついたソースは特にご自身でご確認ください。
            </div>
          )}
          <p className="text-xs text-warm-400 leading-relaxed">
            このInsightはAIが生成したものです。事実セクションは信頼できる一次情報源（政府統計・国際機関）のみを参照していますが、
            ソースは必ずご自身でご確認ください。分析セクション（別の視点・対話のヒント）はAIによる解釈です。
          </p>
        </div>
      </div>

      {/* Export */}
      <ExportButtons data={data} mode={mode} />
      <PrivacyNote />
    </div>
  );
}
