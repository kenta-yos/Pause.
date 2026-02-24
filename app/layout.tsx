import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pause. — 一歩立ち止まって、事実から考える",
  description:
    "気になった言説・主張を入力すると、事実と客観性に基づいた別の視点をお届けします。入力内容はどこにも保存されません。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
