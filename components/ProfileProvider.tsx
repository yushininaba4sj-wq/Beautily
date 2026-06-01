"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  addPhotoToProfile,
  getActivePhoto,
  getActivePhotoUrl,
  removePhotoFromProfile,
  setActivePhotoOnProfile,
} from "@/lib/photos";
import { loadProfile, saveProfile } from "@/lib/storage";
import type { BeautyProfile, UserPhoto } from "@/lib/types";

type ProfileContextValue = {
  profile: BeautyProfile | null;
  photos: UserPhoto[];
  activePhoto: UserPhoto | null;
  activePhotoUrl: string | null;
  setProfile: (p: BeautyProfile | null) => void;
  setActivePhoto: (photoId: string) => void;
  addPhoto: (url: string, options?: { setActive?: boolean; label?: string }) => BeautyProfile | null;
  removePhoto: (photoId: string) => void;
  refresh: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<BeautyProfile | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setProfileState(loadProfile());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const setProfile = useCallback((p: BeautyProfile | null) => {
    if (p) saveProfile(p);
    setProfileState(p);
  }, []);

  const photos = profile?.photos ?? [];
  const activePhoto = getActivePhoto(profile);
  const activePhotoUrl = getActivePhotoUrl(profile);

  const setActivePhoto = useCallback(
    (photoId: string) => {
      if (!profile) return;
      const next = setActivePhotoOnProfile(profile, photoId);
      if (next) setProfile(next);
    },
    [profile, setProfile]
  );

  const addPhoto = useCallback(
    (url: string, options?: { setActive?: boolean; label?: string }) => {
      if (!profile) return null;
      const next = addPhotoToProfile(profile, url, options);
      setProfile(next);
      return next;
    },
    [profile, setProfile]
  );

  const removePhoto = useCallback(
    (photoId: string) => {
      if (!profile) return;
      setProfile(removePhotoFromProfile(profile, photoId));
    },
    [profile, setProfile]
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <p className="text-sm text-[var(--muted)]">読み込み中…</p>
      </div>
    );
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        photos,
        activePhoto,
        activePhotoUrl,
        setProfile,
        setActivePhoto,
        addPhoto,
        removePhoto,
        refresh,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
