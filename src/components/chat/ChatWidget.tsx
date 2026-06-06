"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import TypingIndicator from "@/components/chat/TypingIndicator";

interface ChatMessage {
  _id: string;
  senderRole: "user" | "admin";
  senderName: string;
  message: string;
  createdAt: string;
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [adminTyping, setAdminTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAdminMsgRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async (markRead = false) => {
    if (!session?.user?.id) return;
    try {
      if (!markRead && !open) {
        const unreadRes = await fetch("/api/messages/unread");
        if (unreadRes.ok) {
          const unreadData = await unreadRes.json();
          setUnread(unreadData.unreadCount || 0);
        }
        return;
      }

      const res = await fetch("/api/messages");
      if (!res.ok) return;
      const data = await res.json();
      const msgs: ChatMessage[] = data.messages || [];
      setMessages(msgs);
      setUnread(0);

      const latestAdmin = [...msgs].reverse().find((m) => m.senderRole === "admin");
      if (latestAdmin && latestAdmin._id !== lastAdminMsgRef.current && !open) {
        lastAdminMsgRef.current = latestAdmin._id;
        toast(`Support: ${latestAdmin.message.slice(0, 60)}${latestAdmin.message.length > 60 ? "…" : ""}`, {
          icon: "💬",
        });
      }
    } catch {
      // silent
    }
  }, [session?.user?.id, open]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchMessages(open);
    const id = setInterval(() => fetchMessages(open), 3000);
    return () => clearInterval(id);
  }, [session?.user?.id, open, fetchMessages]);

  useEffect(() => {
    if (!session?.user?.id || !open) {
      setAdminTyping(false);
      return;
    }

    const fetchTyping = async () => {
      try {
        const res = await fetch("/api/messages/typing");
        if (!res.ok) return;
        const data = await res.json();
        setAdminTyping(!!data.isTyping);
      } catch {
        // silent
      }
    };

    fetchTyping();
    const id = setInterval(fetchTyping, 1500);
    return () => clearInterval(id);
  }, [session?.user?.id, open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages, adminTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send");
        return;
      }
      setInput("");
      setMessages((prev) => [...prev, data.message]);
      toast.success("Message sent!");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[340px] sm:w-[380px] bg-background border border-border shadow-2xl flex flex-col max-h-[480px] animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 bg-foreground text-background">
            <div>
              <p className="font-semibold text-sm">Bazaarly Support</p>
              <p className="text-xs opacity-80">
                {adminTyping ? "typing..." : "We typically reply within minutes"}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:opacity-70">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px] max-h-[320px]">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !session ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <p className="mb-3">Sign in to chat with our support team</p>
                <Link
                  href="/login"
                  className="inline-block px-4 py-2 bg-foreground text-background text-sm font-medium"
                >
                  Sign In
                </Link>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Hi! How can we help you today?
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.senderRole === "user" ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <span className="text-[10px] text-muted-foreground mb-0.5">
                    {msg.senderRole === "admin" ? "Support" : "You"}
                  </span>
                  <div
                    className={cn(
                      "px-3 py-2 text-sm",
                      msg.senderRole === "user"
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(msg.createdAt).toLocaleTimeString("en-PK", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
            {adminTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {session && (
            <form onSubmit={handleSend} className="flex border-t border-border p-2 gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:border-foreground"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="p-2 bg-foreground text-background disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && session) {
            setLoading(true);
            fetch("/api/messages")
              .then((r) => r.json())
              .then((data) => {
                setMessages(data.messages || []);
                setUnread(0);
              })
              .finally(() => setLoading(false));
          }
        }}
        className="relative w-14 h-14 bg-foreground text-background rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
