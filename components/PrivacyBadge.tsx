"use client";

import { ShieldCheck } from "lucide-react";

export function PrivacyBadge() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-sage-50 border border-sage-200 rounded-full text-sm text-sage-700 w-fit mx-auto">
      <ShieldCheck className="w-4 h-4 shrink-0" />
      <span>データはあなたのアカウントにのみ保存されます</span>
    </div>
  );
}

export function PrivacyNote() {
  return (
    <p className="text-xs text-warm-400 text-center mt-4">
      対話データはあなたのアカウントに紐づいて安全に保存されます。
      テキストコピーで手元にも保存できます。
    </p>
  );
}
