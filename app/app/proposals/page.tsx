"use client";

import Link from "next/link";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <p className="text-sm font-bold text-[var(--ink)]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((i) => (
          <Tag key={i}>{i}</Tag>
        ))}
      </div>
    </Card>
  );
}

export default function ProposalsPage() {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <div className="space-y-4">
        <SectionTitle title="美容提案" />
        <Card>
          <p className="text-sm text-[var(--muted)]">先に診断を完了してください。</p>
          <Link href="/app/scan" className="mt-3 inline-block text-sm font-bold text-[var(--rose-dark)]">
            診断へ →
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        sub="Proposals"
        title="あなたに似合う提案"
      />

      <Card>
        <p className="text-sm font-bold">似合うメイク</p>
        <div className="mt-3 space-y-3">
          {Object.entries(profile.makeup).map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-[var(--muted)]">{k}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {v.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ListBlock title="似合う髪型" items={profile.hairStyle} />
      <ListBlock title="似合う髪色" items={profile.hairColor} />
      <ListBlock title="似合うファッション" items={profile.fashion} />
      <ListBlock title="似合う小物" items={profile.accessories} />

      <Link
        href="/app/simulate"
        className="block rounded-xl bg-gradient-to-r from-[var(--rose-dark)] to-[var(--rose)] py-3 text-center text-sm font-bold text-white"
      >
        シミュレーションで試す →
      </Link>
      <Link
        href="/app/salon"
        className="block rounded-xl border border-[var(--rose-light)] py-3 text-center text-sm font-bold"
      >
        美容師に見せる資料を作る
      </Link>
    </div>
  );
}
