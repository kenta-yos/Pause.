"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { InsightData } from "@/types/insight";
import { cn } from "@/lib/utils";

interface Props {
  data: InsightData;
}

function buildTextContent(data: InsightData): string {
  const sourcesText =
    data.sources.length > 0
      ? data.sources
          .map((s) => `- ${s.label}（${s.institution} · ${s.sourceType}${s.year ? ` · ${s.year}` : ""}）`)
          .join("\n")
      : "なし";

  return `Pause. — Insight
生成日時: ${new Date().toLocaleString("ja-JP")}

━━━ この言説を読み解く ━━━

${data.understanding}

${data.evidence}

━━━ 大切な人への伝え方 ━━━

${data.conversation}

【問いかけの例】
${data.question}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【参照ソース】
${sourcesText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠ AIが生成したInsightです。ソースはご自身でご確認ください。
※ このInsightはPause.のサーバーおよびデータベースに保存されていません。`;
}

export function ExportButtons({ data }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildTextContent(data);
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
