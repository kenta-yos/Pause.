"use client";

import { Mode } from "@/types/insight";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: Mode;
  onChange: (mode: Mode) => void;
}

const modes = [
  {
    id: "self" as Mode,
    icon: User,
    label: "自分のために",
    desc: "自分の考えを整理したい",
  },
  {
    id: "others" as Mode,
    icon: Users,
    label: "大切な人のために",
    desc: "家族や友人への接し方を考えたい",
  },
];

export function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {modes.map(({ id, icon: Icon, label, desc }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex flex-col items-start gap-1 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200",
            value === id
              ? "border-sage-400 bg-sage-50 shadow-sm"
              : "border-warm-200 bg-white hover:border-sage-300 hover:bg-sage-50/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                "w-4 h-4",
                value === id ? "text-sage-600" : "text-warm-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                value === id ? "text-sage-700" : "text-warm-600"
              )}
            >
              {label}
            </span>
          </div>
          <p className="text-xs text-warm-400 pl-6">{desc}</p>
        </button>
      ))}
    </div>
  );
}
