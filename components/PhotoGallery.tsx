"use client";

import type { UserPhoto } from "@/lib/types";

type PhotoGalleryProps = {
  photos: UserPhoto[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  maxPhotos?: number;
  compact?: boolean;
};

export function PhotoGallery({
  photos,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  maxPhotos = 10,
  compact = false,
}: PhotoGalleryProps) {
  const canAdd = photos.length < maxPhotos;
  const sizeClass = compact ? "h-16 w-16" : "h-20 w-20";

  const handleRemove = (photo: UserPhoto) => {
    if (!onRemove) return;
    const isLast = photos.length === 1;
    const ok = window.confirm(
      isLast
        ? "最後の写真を削除します。診断写真がなくなりますがよろしいですか？"
        : `「${photo.label}」を削除しますか？`
    );
    if (ok) onRemove(photo.id);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[var(--ink)]">
          マイフォト（{photos.length}/{maxPhotos}）
        </p>
        {onAdd && canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="text-xs font-bold text-[var(--rose-dark)]"
          >
            ＋ 写真を追加
          </button>
        )}
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-3">
        {photos.map((photo) => {
          const active = photo.id === activeId;
          return (
            <div key={photo.id} className="relative shrink-0">
              <button
                type="button"
                onClick={() => onSelect(photo.id)}
                className={`block overflow-hidden rounded-xl ring-2 transition ${
                  active
                    ? "ring-[var(--rose-dark)]"
                    : "ring-transparent opacity-85 hover:opacity-100"
                } ${sizeClass}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.label}
                  className="h-full w-full object-cover"
                />
              </button>
              {active && (
                <span className="absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[var(--rose-dark)] px-1.5 py-0.5 text-[8px] font-bold text-white">
                  選択中
                </span>
              )}
              {onRemove && (
                <button
                  type="button"
                  aria-label={`${photo.label}を削除`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(photo);
                  }}
                  className="absolute -right-1.5 -top-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-bold text-white shadow-md ring-2 ring-white"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        {onAdd && canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className={`flex shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--rose-light)] bg-[var(--cream)]/80 text-[var(--rose-dark)] ${sizeClass}`}
          >
            <span className="text-xl">＋</span>
            <span className="text-[9px] font-bold">追加</span>
          </button>
        )}
      </div>
      {onRemove && (
        <p className="text-[10px] text-[var(--muted)]">
          写真右上の × で削除できます
        </p>
      )}
    </div>
  );
}
