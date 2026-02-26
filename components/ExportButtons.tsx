"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { PersonCentricInsight } from "@/types/insight";
import { cn } from "@/lib/utils";

interface Props {
  data: PersonCentricInsight;
  targetNickname?: string;
}

function buildTextContent(data: PersonCentricInsight, targetNickname?: string): string {
  const name = targetNickname || "対話相手";

  const anglesText = data.resonantAngles
    .map((a, i) => `${i + 1}. ${a}`)
    .join("\n");

  const scriptsText = data.scripts
    .map(
      (s, i) =>
        `${i + 1}. [${s.situation}]\n${s.script}\n→ ${s.note}`
    )
    .join("\n\n");

  const avoidText = data.avoidWords.map((w) => `× ${w}`).join("\n");

  const booksText = "";

  return `Pause. — ${name}さんへの対話アドバイス
生成日時: ${new Date().toLocaleString("ja-JP")}

━━━ ${name}さんがこの言説を信じる理由 ━━━

${data.beliefReason}

━━━ 響く切り口 ━━━

${anglesText}

━━━ 今夜使える台詞 ━━━

${scriptsText}

━━━ 避けるべき言葉・態度 ━━━

${avoidText}

${booksText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠ AIが生成した対話のヒントです。あくまで参考としてお使いください。`;
}

export function ExportButtons({ data, targetNickname }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildTextContent(data, targetNickname);
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
