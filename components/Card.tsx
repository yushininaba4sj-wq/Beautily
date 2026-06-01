export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[var(--rose-light)]/25 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  sub,
  title,
}: {
  sub?: string;
  title: string;
}) {
  return (
    <div className="mb-4">
      {sub && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--rose)]">
          {sub}
        </p>
      )}
      <h2 className="font-display text-2xl font-medium text-[var(--ink)]">{title}</h2>
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-[var(--cream)] px-2.5 py-1 text-xs font-semibold text-[var(--rose-dark)]">
      {children}
    </span>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-bold text-[var(--ink)]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--cream)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--rose-light)] to-[var(--rose-dark)]"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
