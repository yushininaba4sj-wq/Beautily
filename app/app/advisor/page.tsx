"use client";

import { useEffect, useRef, useState } from "react";
import { Card, SectionTitle } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { advisorReply } from "@/lib/diagnosis";
import { loadChat, saveChat } from "@/lib/storage";
import type { ChatMessage } from "@/lib/types";

const samples = [
  "この服似合う？",
  "このリップ買うべき？",
  "前髪切るべき？",
  "明日のデート何着る？",
];

export default function AdvisorPage() {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadChat());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      role: "user",
      text: text.trim(),
      at: new Date().toISOString(),
    };
    const reply: ChatMessage = {
      id: "a_" + Date.now(),
      role: "assistant",
      text: advisorReply(text, profile),
      at: new Date().toISOString(),
    };
    const next = [...messages, userMsg, reply];
    setMessages(next);
    saveChat(next);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-4" style={{ minHeight: "calc(100dvh - 140px)" }}>
      <SectionTitle sub="24/7" title="美容秘書" />

      <div className="flex-1 space-y-3 overflow-y-auto pb-2">
        {messages.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--muted)]">
              何でも聞いてください。画像付き相談も可能（今後対応）。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {samples.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full bg-[var(--cream)] px-3 py-1.5 text-xs font-semibold"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
              m.role === "user"
                ? "ml-auto bg-[var(--ink)] text-white"
                : "bg-white ring-1 ring-[var(--rose-light)]/30"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-20 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="質問を入力…"
          className="flex-1 rounded-xl border border-[var(--rose-light)]/50 bg-white px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--rose-dark)] px-4 py-3 text-sm font-bold text-white"
        >
          送信
        </button>
      </form>
    </div>
  );
}
