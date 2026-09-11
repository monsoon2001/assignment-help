"use client";

import { useState } from "react";
import Card from "@/components/ui/card";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Send, Search } from "lucide-react";

const conversations = [
  { id: 1, name: "Alex Chen", lastMessage: "Thanks for the draft! Can we discuss the introduction?", time: "2m ago", unread: 2, online: true },
  { id: 2, name: "Sarah Kim", lastMessage: "I uploaded the additional research materials.", time: "15m ago", unread: 0, online: false },
  { id: 3, name: "James Liu", lastMessage: "The problem set looks great. Left a 5-star review!", time: "1h ago", unread: 0, online: true },
  { id: 4, name: "Emma Wilson", lastMessage: "When can we start working on the literature review?", time: "3h ago", unread: 1, online: false },
  { id: 5, name: "David Park", lastMessage: "Perfect, I'll review the calculus notes tonight.", time: "1d ago", unread: 0, online: false },
];

const chatMessages = [
  { id: 1, sender: "Alex Chen", message: "Hi Maya! I've reviewed the first draft of my research paper. The structure looks great, but I have a few questions about the introduction.", time: "10:32 AM", isMe: false },
  { id: 2, sender: "Me", message: "Thanks for reviewing! What specific changes would you like to see in the introduction?", time: "10:35 AM", isMe: true },
  { id: 3, sender: "Alex Chen", message: "I was thinking we could add a stronger hook at the beginning. Maybe something about the recent global energy summit? Also, the thesis statement could be more specific.", time: "10:38 AM", isMe: false },
  { id: 4, sender: "Me", message: "Great idea! I'll revise the opening with a reference to the 2026 Global Energy Summit and tighten up the thesis statement. I'll have the updated version ready by tonight.", time: "10:40 AM", isMe: true },
  { id: 5, sender: "Alex Chen", message: "Thanks for the draft! Can we discuss the introduction?", time: "10:42 AM", isMe: false },
];

export default function HelperMessages() {
  const [selectedConvo, setSelectedConvo] = useState(1);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-on-surface">Messages</h1>
        <p className="text-on-surface-variant mt-1">Communicate with your students.</p>
      </div>

      <Card className="flex h-[600px] overflow-hidden">
        <div className="w-80 border-r border-outline-variant/30 flex flex-col">
          <div className="p-4 border-b border-outline-variant/30">
            <Input placeholder="Search messages..." icon={<Search size={16} />} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo.id)}
                className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${
                  selectedConvo === convo.id ? "bg-primary-container/10" : "hover:bg-surface-container-low"
                }`}
              >
                <Avatar name={convo.name} size="sm" online={convo.online} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-on-surface truncate">{convo.name}</span>
                    <span className="text-xs text-on-surface-variant shrink-0 ml-2">{convo.time}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant truncate mt-0.5">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && (
                  <Badge variant="primary" className="shrink-0 mt-1">{convo.unread}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-outline-variant/30 flex items-center gap-3">
            <Avatar
              name={conversations.find((c) => c.id === selectedConvo)?.name}
              size="sm"
              online={conversations.find((c) => c.id === selectedConvo)?.online}
            />
            <div>
              <p className="text-sm font-medium text-on-surface">
                {conversations.find((c) => c.id === selectedConvo)?.name}
              </p>
              <p className="text-xs text-on-surface-variant">
                {conversations.find((c) => c.id === selectedConvo)?.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  msg.isMe ? "bg-primary-container text-on-primary rounded-br-md" : "bg-surface-container-high text-on-surface rounded-bl-md"
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.isMe ? "text-on-primary/70" : "text-on-surface-variant"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-outline-variant/30">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 h-10 px-4 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
              <Button size="md"><Send size={16} /></Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
