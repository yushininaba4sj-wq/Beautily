import Link from "next/link";

const pillars = [
  {
    step: "01",
    title: "自分を知る",
    desc: "顔タイプ・骨格・魅力・顔面偏差値。今の自分を数値と言葉で把握。",
  },
  {
    step: "02",
    title: "可能性を見つける",
    desc: "診断から導く「3つの新しい私」。まだ試したことのない系統に出会える。",
  },
  {
    step: "03",
    title: "変化を試す",
    desc: "髪色・髪型・メイク・服を、あなたの写真で大胆プレビュー。",
  },
  {
    step: "04",
    title: "完成形へ",
    desc: "ロードマップ・美容秘書・買い物相談まで。一人で迷わない。",
  },
];

const features = [
  {
    title: "3つの新しい私",
    desc: "韓国きれいめ・大人モード・ガーリーなど、あなた専用の別バージョンを提案。",
  },
  {
    title: "本気シミュレーション",
    desc: "髪色・前髪・チーク・服の色まで、はっきり変わるプレビュー。",
  },
  {
    title: "顔面偏差値・有名人マッチ",
    desc: "タップで詳細。伸びしろ％まで、自分の立ち位置がわかる。",
  },
  {
    title: "変身ジャーニー",
    desc: "診断→発見→試す→完成。美容アプリを超えた、一気通貫の体験。",
  },
  {
    title: "複数写真対応",
    desc: "角度の違う写真で、いちばん似合う「新しい私」を探せる。",
  },
  {
    title: "女子大生のための設計",
    desc: "垢抜け・デート・友達に褒められる。リアルな悩みに寄り添う。",
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

      <section className="gradient-premium px-6 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
            Beyond Beauty Apps
          </p>
          <h1 className="font-display mt-6 text-4xl leading-[1.15] font-medium text-[var(--ink)] md:text-6xl">
            まだ出会っていない
            <br />
            <span className="text-shimmer">「新しい私」</span>
            <br />
            に出会う。
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-[var(--muted)]">
            診断で終わらない。3つの可能性を見つけ、鏡の前で試して、完成形まで伴走する。
            女子大生の「なりたい自分」を、ひとつのアプリで叶える。
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/app/scan"
              className="rounded-full bg-[var(--ink)] px-10 py-4 text-sm font-bold text-white shadow-lg"
            >
              無料で新しい私を探す
            </Link>
            <Link
              href="/app/discover"
              className="rounded-full border-2 border-[var(--rose-dark)] px-8 py-3.5 text-sm font-bold text-[var(--rose-dark)]"
            >
              体験の流れを見る
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="font-display text-center text-3xl font-medium md:text-4xl">
          4ステップで、別の自分に出会う
        </h2>
        <div className="mt-12 space-y-4">
          {pillars.map((p) => (
            <article
              key={p.step}
              className="card-hover flex gap-5 rounded-3xl bg-white p-6 ring-1 ring-[var(--rose-light)]/30"
            >
              <span className="font-display text-3xl font-semibold text-[var(--rose-light)]">
                {p.step}
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{p.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-center text-3xl font-medium">
          美容アプリを超える理由
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="shine-card rounded-3xl bg-white p-6 ring-1 ring-[var(--rose-light)]/30"
            >
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--ink)] px-6 py-20 text-[var(--cream)]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium md:text-4xl">
            診断アプリじゃない。
            <br />
            新しい自分に出会うアプリ。
          </h2>
          <p className="mt-6 text-sm leading-relaxed opacity-85">
            Beautilyは、あなたの「今」と「なりたい」をつなぐ美容プロデューサー。
            今日から、一番似合う完成形を探しにいこう。
          </p>
          <Link
            href="/app"
            className="mt-10 inline-block rounded-full bg-white px-10 py-4 text-sm font-bold text-[var(--ink)]"
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
