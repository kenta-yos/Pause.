"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1 }), // Kenta user
      });
      if (res.ok) {
        router.push("/");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFCF9] flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Image src="/icon.png" alt="Pause." width={48} height={48} className="rounded-xl" />
            <h1 className="text-5xl font-light tracking-tight text-warm-800">
              Pause<span className="text-sage-500">.</span>
            </h1>
          </div>
          <p className="text-warm-500 text-sm">
            大切な人との対話を、一歩深める
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="px-8 py-4 bg-sage-500 hover:bg-sage-600 disabled:bg-warm-200 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md text-lg"
        >
          {loading ? "ログイン中…" : "Kenta としてはじめる"}
        </button>

        <p className="text-xs text-warm-400">
          パスワードなしの簡易ログインです
        </p>
      </div>
    </main>
  );
}
