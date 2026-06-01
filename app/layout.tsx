import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Beautily — AI美容プロデューサー",
  description:
    "顔写真1枚から診断・提案・シミュレーション・買い物相談まで。あなた専属のAI美容コンサルタントが、一番似合う完成形まで導きます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
