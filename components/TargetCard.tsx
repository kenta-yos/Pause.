"use client";

import Link from "next/link";
import { User, MessageCircle, ChevronRight } from "lucide-react";

interface Props {
  id: number;
  nickname: string;
  relationship: string | null;
  lastAnalyzedAt: string | null;
}

export function TargetCard({ id, nickname, relationship, lastAnalyzedAt }: Props) {
  return (
    <Link
      href={`/target/${id}`}
      className="block bg-white rounded-2xl border border-warm-100 shadow-sm hover:shadow-md hover:border-sage-200 transition-all duration-200 p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2.5 bg-sage-50 rounded-xl shrink-0">
            <User className="w-5 h-5 text-sage-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-warm-800 font-medium truncate">{nickname}</h3>
            {relationship && (
              <p className="text-xs text-warm-400 mt-0.5">{relationship}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-warm-300 shrink-0" />
      </div>
      {lastAnalyzedAt && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-warm-50">
          <MessageCircle className="w-3 h-3 text-warm-300" />
          <span className="text-xs text-warm-400">
            最終分析: {new Date(lastAnalyzedAt).toLocaleDateString("ja-JP")}
          </span>
        </div>
      )}
    </Link>
  );
}
