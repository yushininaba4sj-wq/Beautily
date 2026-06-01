"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { BeautyProfile } from "@/lib/types";
import { loadProfile, saveProfile } from "@/lib/storage";

type ProfileContextValue = {
  profile: BeautyProfile | null;
  setProfile: (p: BeautyProfile | null) => void;
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

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <p className="text-sm text-[var(--muted)]">読み込み中…</p>
      </div>
    );
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
