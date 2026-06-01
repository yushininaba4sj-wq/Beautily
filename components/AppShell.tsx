"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/app", label: "ホーム", icon: "⌂" },
  { href: "/app/scan", label: "診断", icon: "◎" },
  { href: "/app/chart", label: "カルテ", icon: "☰" },
  { href: "/app/proposals", label: "提案", icon: "✦" },
  { href: "/app/menu", label: "メニュー", icon: "⋯" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-40 glass border-b border-[var(--rose-light)]/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/app" className="font-display text-xl font-semibold text-[var(--ink)]">
            Beautily
          </Link>
          <span className="rounded-full bg-[var(--rose-light)]/40 px-2.5 py-0.5 text-[10px] font-bold text-[var(--rose-dark)]">
            AI美容プロデューサー
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <nav
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-[var(--rose-light)]/40 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
        aria-label="メインナビ"
      >
        <div className="flex justify-around py-2">
          {tabs.map((t) => {
            const on =
              t.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition ${
                  on ? "text-[var(--rose-dark)]" : "text-[var(--muted)]"
                }`}
              >
                <span className="text-lg leading-none">{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
