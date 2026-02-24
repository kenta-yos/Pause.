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
  const tips =
    mode === "self" ? data.conversationTips.forSelf : data.conversationTips.forOthers;
  const modeLabel = mode === "self" ? "自分のために" : "大切な人のために";

  const academicSection =
    data.academicInsights.length > 0
      ? data.academicInsights
          .map(
            (a, i) =>
              `${i + 1}. ${a.argument}\n   ${a.author}「${a.work}」(${a.year || "年不明"}) — ${a.field}`
          )
          .join("\n\n")
      : "なし";

  return `Pause. — Insight レポート
生成日時: ${new Date().toLocaleString("ja-JP")}
モード: ${modeLabel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【言説の要約】
${data.inputSummary}

【なぜこう感じる人がいるか】
${data.background}

【事実とデータ】
${
  data.facts.length > 0
    ? data.facts
        .map(
          (f, i) =>
            `${i + 1}. ${f.claim}\n   出典: ${f.source.institution} — ${f.source.url}`
        )
        .join("\n\n")
    : "今回の分析で確認できた検証済みの一次情報はありませんでした。"
}

【学術的知見】
${academicSection}

【別の視点】
${data.perspectives.map((p, i) => `${i + 1}. ${p}`).join("\n")}

【対話のヒント（${modeLabel}）】
${tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}

【参考資料】
${
  data.references.length > 0
    ? data.references.map((r) => `- ${r.institution}: ${r.title}\n  ${r.url}`).join("\n")
    : "なし"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠ このレポートはAIが生成したものです。ソースは必ずご自身で確認してください。
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
