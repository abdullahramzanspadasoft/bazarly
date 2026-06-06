"use client";

import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Conversation {
  userId: string;
  customer: { name: string; email: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ChatMessage {
  _id: string;
  senderRole: "user" | "admin";
  senderName: string;
  message: string;
  createdAt: string;
}

function AdminMessagesContent() {
  const searchParams = useSearchParams();
  const preselectedUser = searchParams.get("userId");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(preselectedUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingStopRef = useRef<(() => void) | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior });
    });
  };

  const updateTypingStatus = useCallback(async (userId: string, isTyping: boolean) => {
    try {
      await fetch("/api/admin/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isTyping }),
      });
    } catch {
      // silent
    }
  }, []);

  const stopTyping = useCallback((userId: string) => {
    if (typingStopRef.current) {
      typingStopRef.current();
      typingStopRef.current = null;
    }
    updateTypingStatus(userId, false);
  }, [updateTypingStatus]);

  const startTyping = useCallback((userId: string) => {
    if (typingStopRef.current) typingStopRef.current();

    updateTypingStatus(userId, true);
    const intervalId = setInterval(() => updateTypingStatus(userId, true), 2000);

    typingStopRef.current = () => {
      clearInterval(intervalId);
    };
  }, [updateTypingStatus]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/messages?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setCustomer(data.customer || null);
        fetchConversations();
      }
    } catch {
      toast.error("Failed to load messages");
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const id = setInterval(fetchConversations, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (preselectedUser) setSelectedUser(preselectedUser);
  }, [preselectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    fetchThread(selectedUser);
    const id = setInterval(() => fetchThread(selectedUser), 3000);
    return () => {
      clearInterval(id);
      stopTyping(selectedUser);
    };
  }, [selectedUser, fetchThread, stopTyping]);

  useEffect(() => {
    if (!selectedUser) return;
    if (reply.trim()) {
      startTyping(selectedUser);
    } else {
      stopTyping(selectedUser);
    }
  }, [reply, selectedUser, startTyping, stopTyping]);

  useEffect(() => {
    scrollToBottom(messages.length <= 1 ? "auto" : "smooth");
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      scrollToBottom("auto");
    }
  }, [selectedUser]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !reply.trim() || sending) return;

    setSending(true);
    stopTyping(selectedUser);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, message: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send");
        return;
      }
      setReply("");
      setMessages((prev) => [...prev, data.message]);
      toast.success("Reply sent");
      fetchConversations();
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Customer Messages</h1>
      <p className="text-sm text-neutral-500 mb-6">
        MongoDB <code className="text-xs bg-neutral-100 px-1">chatmessages</code> collection
      </p>

      <div className="border border-neutral-200 flex min-h-[500px]">
        <aside className="w-72 border-r border-neutral-200 overflow-y-auto flex-shrink-0">
          {conversations.length === 0 ? (
            <p className="text-sm text-neutral-500 p-4 text-center">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedUser(conv.userId)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors",
                  selectedUser === conv.userId && "bg-neutral-100"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate">{conv.customer.name}</p>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 truncate">{conv.customer.email}</p>
                <p className="text-xs text-neutral-600 mt-1 truncate">{conv.lastMessage}</p>
              </button>
            ))
          )}
        </aside>

        <div className="flex-1 flex flex-col min-h-0">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
              <p>Select a conversation to reply</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                <p className="font-semibold">{customer?.name}</p>
                <p className="text-xs text-neutral-500">{customer?.email}</p>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={cn(
                      "flex flex-col max-w-[75%]",
                      msg.senderRole === "admin" ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <span className="text-[10px] text-neutral-500 mb-0.5">{msg.senderName}</span>
                    <div
                      className={cn(
                        "px-3 py-2 text-sm",
                        msg.senderRole === "admin"
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-black"
                      )}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      {new Date(msg.createdAt).toLocaleString("en-PK")}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleReply} className="flex gap-2 p-4 border-t border-neutral-200">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onBlur={() => selectedUser && stopTyping(selectedUser)}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black"
                />
                <Button type="submit" loading={sending} disabled={!reply.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-16" />}>
      <AdminMessagesContent />
    </Suspense>
  );
}
