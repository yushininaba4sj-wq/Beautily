import type {
  BeautyProfile,
  ChatMessage,
  ClosetItem,
  CosmeticItem,
  TimelineEntry,
} from "./types";

const PROFILE_KEY = "beautily_profile";
const TIMELINE_KEY = "beautily_timeline";
const CHAT_KEY = "beautily_chat";
const CLOSET_KEY = "beautily_closet";
const COSMETICS_KEY = "beautily_cosmetics";

function migrateProfile(p: BeautyProfile): BeautyProfile {
  const makeup = { ...p.makeup };
  if (makeup.アイメイク && !makeup.目元メイク) {
    makeup.目元メイク = makeup.アイメイク;
    delete makeup.アイメイク;
  }
  const beautyStyles = p.beautyStyles.map((s) => {
    const v = s as string;
    return v === "韓国アイドル系" ? "韓国スター系" : s;
  });
  return { ...p, makeup, beautyStyles };
}

export function loadProfile(): BeautyProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return migrateProfile(JSON.parse(raw) as BeautyProfile);
  } catch {
    return null;
  }
}

export function loadTimeline(): TimelineEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TIMELINE_KEY);
    return raw ? (JSON.parse(raw) as TimelineEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendTimelineEntry(p: BeautyProfile, label?: string): void {
  const entry: TimelineEntry = {
    id: "tl_" + Date.now(),
    profileId: p.id,
    analyzedAt: p.analyzedAt,
    label: label || `${p.animalFace} × ${p.personalColor}`,
    personalColor: p.personalColor,
    boneStructure: p.boneStructure,
    faceType: p.faceType,
    animalFace: p.animalFace,
    photoUrl: p.photoUrl,
  };
  const list = loadTimeline().filter((e) => e.profileId !== p.id);
  list.unshift(entry);
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(list.slice(0, 30)));
}

export function saveProfile(p: BeautyProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    appendTimelineEntry(p);
  } catch {
    const slim = { ...p, photoUrl: null };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(slim));
      appendTimelineEntry(slim);
    } catch {
      /* 診断テキストだけでもアプリは動く */
    }
  }
}

export function loadChat(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveChat(messages: ChatMessage[]): void {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-50)));
}

export function loadCloset(): ClosetItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLOSET_KEY);
    return raw ? (JSON.parse(raw) as ClosetItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCloset(items: ClosetItem[]): void {
  localStorage.setItem(CLOSET_KEY, JSON.stringify(items));
}

export function loadCosmetics(): CosmeticItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COSMETICS_KEY);
    return raw ? (JSON.parse(raw) as CosmeticItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCosmetics(items: CosmeticItem[]): void {
  localStorage.setItem(COSMETICS_KEY, JSON.stringify(items));
}
