import type { BeautyProfile, UserPhoto } from "./types";

export const MAX_PHOTOS = 10;

export function getActivePhoto(profile: BeautyProfile | null): UserPhoto | null {
  if (!profile) return null;
  const photos = profile.photos ?? [];
  if (photos.length === 0) {
    if (profile.photoUrl) {
      return {
        id: "legacy",
        url: profile.photoUrl,
        label: "メイン",
        addedAt: profile.analyzedAt,
        analyzedAt: profile.analyzedAt,
      };
    }
    return null;
  }
  const active = photos.find((p) => p.id === profile.activePhotoId);
  return active ?? photos[0];
}

export function getActivePhotoUrl(profile: BeautyProfile | null): string | null {
  return getActivePhoto(profile)?.url ?? profile?.photoUrl ?? null;
}

export function ensurePhotosArray(profile: BeautyProfile): BeautyProfile {
  let photos = profile.photos ?? [];
  if (photos.length === 0 && profile.photoUrl) {
    photos = [
      {
        id: `photo_${profile.id}`,
        url: profile.photoUrl,
        label: "写真 1",
        addedAt: profile.analyzedAt,
        analyzedAt: profile.analyzedAt,
      },
    ];
  }
  const activePhoto = getActivePhoto({ ...profile, photos });
  const activePhotoId = profile.activePhotoId ?? activePhoto?.id ?? photos[0]?.id ?? null;
  const active = photos.find((p) => p.id === activePhotoId) ?? photos[0];
  return {
    ...profile,
    photos,
    activePhotoId,
    photoUrl: active?.url ?? profile.photoUrl,
  };
}

export function addPhotoToProfile(
  profile: BeautyProfile,
  url: string,
  options?: { label?: string; setActive?: boolean; analyzedAt?: string }
): BeautyProfile {
  const base = ensurePhotosArray(profile);
  const photos = [...(base.photos ?? [])];
  const photo: UserPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    url,
    label: options?.label ?? `写真 ${photos.length + 1}`,
    addedAt: new Date().toISOString(),
    analyzedAt: options?.analyzedAt,
  };
  photos.unshift(photo);
  const trimmed = photos.slice(0, MAX_PHOTOS);
  const activePhotoId =
    options?.setActive !== false ? photo.id : base.activePhotoId ?? trimmed[0]?.id ?? null;
  const active = trimmed.find((p) => p.id === activePhotoId) ?? trimmed[0];
  return {
    ...base,
    photos: trimmed,
    activePhotoId,
    photoUrl: active?.url ?? url,
  };
}

export function setActivePhotoOnProfile(
  profile: BeautyProfile,
  photoId: string
): BeautyProfile | null {
  const base = ensurePhotosArray(profile);
  const photo = base.photos?.find((p) => p.id === photoId);
  if (!photo) return null;
  return { ...base, activePhotoId: photoId, photoUrl: photo.url };
}

export function removePhotoFromProfile(
  profile: BeautyProfile,
  photoId: string
): BeautyProfile {
  const base = ensurePhotosArray(profile);
  const photos = (base.photos ?? []).filter((p) => p.id !== photoId);
  if (photos.length === 0) {
    return { ...base, photos: [], activePhotoId: null, photoUrl: null };
  }
  const activePhotoId =
    base.activePhotoId === photoId ? photos[0].id : base.activePhotoId ?? photos[0].id;
  const active = photos.find((p) => p.id === activePhotoId) ?? photos[0];
  return { ...base, photos, activePhotoId, photoUrl: active.url };
}

export function markPhotoAnalyzed(
  profile: BeautyProfile,
  photoId: string,
  analyzedAt: string
): BeautyProfile {
  const base = ensurePhotosArray(profile);
  const photos = (base.photos ?? []).map((p) =>
    p.id === photoId ? { ...p, analyzedAt } : p
  );
  return { ...base, photos };
}
