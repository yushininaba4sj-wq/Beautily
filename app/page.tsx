import Link from "next/link";

const features = [
  {
    title: "自動分析",
    desc: "パーソナルカラー・骨格・顔タイプ・動物顔・魅力・垢抜けポイントを一括診断。",
  },
  {
    title: "美容タイムライン",
    desc: "要素ごとに絞って調べられる。診断履歴も時系列で確認。",
  },
  {
    title: "美容カルテ",
    desc: "診断結果を保存。いつでも自分のタイプと似合う系統を確認。",
  },
  {
    title: "美容提案",
    desc: "メイク・髪型・髪色・ファッション・小物まで、あなた専用に提案。",
  },
  {
    title: "シミュレーション",
    desc: "髪型・髪色・メイク・完成形・理想像まで、変更後の自分をプレビュー。",
  },
  {
    title: "美容秘書",
    desc: "24時間質問OK。服・コスメ・前髪・デートコーデまで相談。",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-50 w-full glass">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl font-semibold text-[var(--ink)]">
            Beautily
          </span>
          <Link
            href="/app"
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            アプリを開く
          </Link>
        </nav>
      </header>

      <section className="gradient-hero px-6 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--rose-dark)]">
            Beauty Producer
          </p>
          <h1 className="font-display mt-4 text-4xl leading-tight font-medium text-[var(--ink)] md:text-6xl">
            美容のことなら、
            <br />
            <span className="italic text-[var(--rose-dark)]">全部このアプリで完結。</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)]">
            顔写真1枚から、魅力・似合うもの・垢抜ける方法・買うべきもの・理想像への近づき方まで。
            診断で終わらず、あなた専属の美容プロデューサーが
            <strong className="text-[var(--ink)]">「一番似合う完成形」</strong>
            まで導きます。
          </p>
          <Link
            href="/app/scan"
            className="mt-10 inline-block rounded-full bg-[var(--rose-dark)] px-10 py-4 text-sm font-bold text-white shadow-lg"
          >
            無料で診断スタート
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-center text-3xl font-medium md:text-4xl">
          あなた専属の美容コンサルタント
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-sm text-[var(--muted)]">
          分析 · タイムライン · 提案 · シミュレーション · 買い物相談 · コーデ · 美容相談 · 垢抜け計画
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="card-hover rounded-3xl bg-white p-6 ring-1 ring-[var(--rose-light)]/30"
            >
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--ink)] px-6 py-16 text-[var(--cream)]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium">
            診断アプリではなく、
            <br />
            完成形までの伴走。
          </h2>
          <Link
            href="/app"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-bold text-[var(--ink)]"
          >
            Beautilyをはじめる
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-[var(--muted)]">
        © 2026 Beautily
      </footer>
    </div>
  );
}
