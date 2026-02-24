"use client";

import { useState } from "react";
import { Download, Copy, Image, Check } from "lucide-react";
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
  const [exporting, setExporting] = useState<"pdf" | "png" | null>(null);

  async function handleCopy() {
    const text = buildTextContent(data, mode);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePdf() {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const el = document.getElementById("insight-report");
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FDFCF9",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Pause_Insight_${Date.now()}.pdf`);
    } finally {
      setExporting(null);
    }
  }

  async function handlePng() {
    setExporting("png");
    try {
      const { default: html2canvas } = await import("html2canvas");
      const el = document.getElementById("insight-report");
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FDFCF9",
      });

      const link = document.createElement("a");
      link.download = `Pause_Insight_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(null);
    }
  }

  const buttons = [
    {
      label: "PDFで保存",
      icon: Download,
      onClick: handlePdf,
      loading: exporting === "pdf",
    },
    {
      label: copied ? "コピーしました" : "テキストをコピー",
      icon: copied ? Check : Copy,
      onClick: handleCopy,
      loading: false,
      success: copied,
    },
    {
      label: "画像で保存",
      icon: Image,
      onClick: handlePng,
      loading: exporting === "png",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {buttons.map(({ label, icon: Icon, onClick, loading, success }) => (
        <button
          key={label}
          onClick={onClick}
          disabled={!!exporting}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200",
            success
              ? "border-sage-400 bg-sage-50 text-sage-700"
              : "border-warm-200 bg-white text-warm-600 hover:border-sage-300 hover:bg-sage-50 hover:text-sage-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Icon className={cn("w-4 h-4", loading && "animate-pulse")} />
          {loading ? "処理中…" : label}
        </button>
      ))}
    </div>
  );
}
