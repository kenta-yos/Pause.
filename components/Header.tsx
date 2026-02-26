"use client";

import Image from "next/image";
import { RateLimitBadge } from "@/components/RateLimitBadge";

interface Props {
  userName: string;
}

export function Header({ userName }: Props) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Image src="/icon.png" alt="Pause." width={32} height={32} className="rounded-lg" />
        <h1 className="text-2xl font-light text-warm-800">
          Pause<span className="text-sage-500">.</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <RateLimitBadge />
        <span className="text-sm text-warm-500">{userName}</span>
      </div>
    </header>
  );
}
