"use client";

import { useState } from "react";
import { Search, Send, Paperclip, CheckCheck, MoreHorizontal, Phone, Video } from "lucide-react";
import Card from "@/components/ui/card";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";

type Thread = {
  id: number;
  name: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  online: boolean;
  messages: { from: "me" | "them"; text: string; time: string }[];
};

const threads: Thread[] = [
  {
    id: 1, name: "Sarah Mitchell", subject: "History Essay ORD-2048", preview: "Draft outline is ready for your review…",
    time: "10:42 AM", unread: true, online: true,
    messages: [
      { from: "them", text: "Hi Alex! I've shared the draft outline in the Deliverables tab.", time: "10:38 AM" },
      { from: "me", text: "Looks great! Can you expand the thesis in section 2?", time: "10:40 AM" },
      { from: "them", text: "Absolutely — will do and send back by this evening.", time: "10:42 AM" },
    ],
  },
  {
    id: 2, name: "David Kim", subject: "Calculus Problem Set 4", preview: "I added notes on problems 14–16…",
    time: "1h", unread: true, online: true,
    messages: [
      { from: "them", text: "Notes added on problems 14–16, same notation as the textbook.", time: "12:30 PM" },
      { from: "me", text: "Perfect, thanks. Reviewing now.", time: "1h" },
      { from: "them", text: "Let me know if you want me to walk through #15 step by step.", time: "1h" },
    ],
  },
  {
    id: 3, name: "Priya Raman", subject: "Lab Report ORD-2058", preview: "Final report uploaded — please review…",
    time: "Yesterday", unread: true, online: false,
    messages: [
      { from: "them", text: "Final report is uploaded. Originality report attached too.", time: "Yesterday" },
      { from: "me", text: "Great, reviewing tonight!", time: "Yesterday" },
    ],
  },
  {
    id: 4, name: "Grace Okafor", subject: "Annotated Bibliography", preview: "Re: citation format question…",
    time: "Mon", unread: false, online: false,
    messages: [
      { from: "me", text: "Hi Grace, quick question about citation format.", time: "Mon" },
      { from: "them", text: "Sure, I'm using APA 7th — happy to switch.", time: "Mon" },
      { from: "me", text: "APA works great, keep going!", time: "Mon" },
    ],
  },
  {
    id: 5, name: "Jon Bell", subject: "Psychology Summary", preview: "Congrats on the completion — see you next term!",
    time: "Sep 28", unread: false, online: false,
    messages: [
      { from: "them", text: "All set. Glad it helped!", time: "Sep 28" },
      { from: "me", text: "Thanks Jon, see you next term!", time: "Sep 28" },
    ],
  },
];

const smartReplies = ["Thanks, got it!", "Can we hop on a quick call?", "Looks good, keep me posted."];

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(1);
  const [draft, setDraft] = useState("");
  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">Messages</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Chat with helpers about your on-going work</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2.5 max-w-xs w-full">
          <Search size={15} className="text-on-surface-variant" />
          <input placeholder="Search conversations…" className="bg-transparent outline-none flex-1 text-sm text-on-surface placeholder:text-outline" />
        </div>
      </div>

      <Card className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-220px)] min-h-[560px] overflow-hidden">
        <aside className="lg:border-r border-outline-variant overflow-y-auto lg:max-h-full max-h-64">
          <div className="p-3">
            <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-semibold cursor-pointer">
              <span className="flex-1">All conversations</span>
              <Badge variant="primary" className="bg-white/20 text-on-primary">3 new</Badge>
            </button>
          </div>
          <div className="divide-y divide-outline-variant/50">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                  t.id === activeId ? "bg-surface-container-low" : "hover:bg-surface-container-low/60"
                }`}
              >
                <Avatar name={t.name} size="md" online={t.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-on-surface truncate">{t.name}</p>
                    <span className="text-[10px] text-on-surface-variant shrink-0">{t.time}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{t.subject}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-1">{t.preview}</p>
                </div>
                {t.unread && <span className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5" />}
              </button>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-outline-variant">
            <Avatar name={active.name} size="md" online={active.online} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-on-surface">{active.name}</p>
              <p className="text-[11px] text-on-surface-variant truncate">{active.subject}</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"><Phone size={15} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"><Video size={15} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"><MoreHorizontal size={15} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-surface-container-low/40">
            {active.messages.map((m, i) => {
              const mine = m.from === "me";
              return (
                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] ${mine ? "text-right" : ""}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        mine
                          ? "bg-primary-container text-on-primary rounded-br-sm"
                          : "bg-surface-container border border-outline-variant text-on-surface rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-on-surface-variant justify-end">
                      {m.time}
                      {mine && <CheckCheck size={12} className="text-primary" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-outline-variant px-4 py-3 bg-surface-container-lowest">
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {smartReplies.map((r) => (
                <button
                  key={r}
                  onClick={() => setDraft(r)}
                  className="shrink-0 px-3 py-1.5 rounded-full border border-outline-variant text-xs font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <label className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer">
                <Paperclip size={17} />
                <input type="file" className="hidden" multiple />
              </label>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 h-11 px-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
              <button
                disabled={!draft.trim()}
                className="w-10 h-10 shrink-0 rounded-xl bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        </section>
      </Card>
    </div>
  );
}