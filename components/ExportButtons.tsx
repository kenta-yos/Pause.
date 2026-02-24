"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { InsightData, Mode } from "@/types/insight";
import { cn } from "@/lib/utils";

interface Props {
  data: InsightData;
  mode: Mode;
}

function buildTextContent(data: InsightData, mode: Mode): string {
  const modeLabel = mode === "self" ? "自分のために" : "大切な人のために";

  const sourcesText =
    data.sources.length > 0
      ? data.sources
          .map((s) => `- ${s.label}（${s.institution} · ${s.sourceType}）\n  ${s.url}`)
          .join("\n")
      : "なし";

  const readsText =
    data.recommendedReads.length > 0
      ? data.recommendedReads
          .map((r) => `- ${r.author}『${r.title}』(${r.year})\n  ${r.reason}`)
          .join("\n")
      : "なし";

  return `Pause. — Insight
生成日時: ${new Date().toLocaleString("ja-JP")}
モード: ${modeLabel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【受け止める】
${data.receive}

【文脈を広げる】
${data.context}

【事実と知見】
${data.evidence}

【視野を一段上げる】
${data.elevation}

【着地】
${data.landing}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【参照ソース】
${sourcesText}

【もっと知りたい方へ】
${readsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠ AIが生成したInsightです。ソースおよび推薦書籍はご自身でご確認ください。
※ このInsightはPause.のサーバーおよびデータベースに保存されていません。`;
}

export function ExportButtons({ data, mode }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildTextContent(data, mode);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex justify-center">
      <button
        onClick={handleCopy}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200",
          copied
            ? "border-sage-400 bg-sage-50 text-sage-700"
            : "border-warm-200 bg-white text-warm-600 hover:border-sage-300 hover:bg-sage-50 hover:text-sage-700"
        )}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "コピーしました" : "テキストをコピー"}
      </button>
    </div>
  );
}
