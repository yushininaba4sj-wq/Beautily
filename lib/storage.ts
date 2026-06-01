import type { BeautyProfile, ChatMessage, ClosetItem, CosmeticItem } from "./types";

const PROFILE_KEY = "beautily_profile";
const CHAT_KEY = "beautily_chat";
const CLOSET_KEY = "beautily_closet";
const COSMETICS_KEY = "beautily_cosmetics";

export function loadProfile(): BeautyProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as BeautyProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: BeautyProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
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
