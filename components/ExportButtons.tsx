"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { InsightData, ApproachKey } from "@/types/insight";
import { cn } from "@/lib/utils";

interface Props {
  data: InsightData;
}

const APPROACH_LABELS: Record<ApproachKey, string> = {
  contradiction: "矛盾に気づいてもらう",
  perspective:   "立場を入れ替えてみる",
  prebunking:    "なぜ広まるかを先に話す",
  narrative:     "一人の人間の話をする",
  analogy:       "相手の価値観から入る",
};

const APPROACH_ORDER: ApproachKey[] = [
  "contradiction",
  "perspective",
  "prebunking",
  "narrative",
  "analogy",
];

function buildTextContent(data: InsightData): string {
  const sourcesText =
    data.sources.length > 0
      ? data.sources
          .map(
            (s) =>
              `- ${s.label}（${s.institution} · ${s.sourceType}${s.year ? ` · ${s.year}` : ""}）`
          )
          .join("\n")
      : "なし";

  const approachesText = APPROACH_ORDER.map((key) => {
    const text = data.approaches?.[key] as string | undefined;
    const isRec = key === data.approaches?.recommended;
    return `【${APPROACH_LABELS[key]}${isRec ? "　★特に有効" : ""}】\n${text || ""}`;
  }).join("\n\n");

  return `Pause. — Insight
生成日時: ${new Date().toLocaleString("ja-JP")}

━━━ この言説を読み解く ━━━

【なぜ信じてしまうのか】
${data.understanding}

【事実とデータ】
${data.evidence}

━━━ 大切な人への伝え方 ━━━

${approachesText}

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
