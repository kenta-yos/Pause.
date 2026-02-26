"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TargetForm } from "@/components/TargetForm";

export default function NewTargetPage() {
  return (
    <main className="min-h-screen bg-[#FDFCF9] px-4 py-8 md:py-12">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 text-warm-400 hover:text-warm-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="Pause." width={24} height={24} className="rounded-md" />
            <span className="text-warm-600 font-light">
              Pause<span className="text-sage-500">.</span>
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-medium text-warm-800">大切な人を登録する</h2>
          <p className="text-sm text-warm-400">
            情報が多いほど、より具体的な対話アドバイスが得られます
          </p>
        </div>

        <TargetForm mode="create" />
      </div>
    </main>
  );
}
