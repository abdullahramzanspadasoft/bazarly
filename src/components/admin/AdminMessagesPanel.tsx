"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageSquare, ArrowLeft, Users } from "lucide-react";
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

export default function AdminMessagesPanel() {
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

  const handleSelectConversation = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setMessages([]);
    setCustomer(null);
    setReply("");
  };

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Customer Messages</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""} · Live support inbox
        </p>
      </div>

      <div className="border border-border flex flex-col md:flex-row min-h-[420px] sm:min-h-[500px] md:min-h-[560px] bg-background rounded-sm overflow-hidden">
        <aside
          className={cn(
            "w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-border overflow-y-auto shrink-0",
            "max-h-[280px] md:max-h-none",
            selectedUser ? "hidden md:block" : "block"
          )}
        >
          <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">Inbox</span>
            {conversations.length > 0 && (
              <span className="ml-auto text-xs bg-foreground text-background px-2 py-0.5 rounded-full">
                {conversations.length}
              </span>
            )}
          </div>
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.userId}
                type="button"
                onClick={() => handleSelectConversation(conv.userId)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors",
                  selectedUser === conv.userId && "bg-muted"
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
                <p className="text-xs text-muted-foreground truncate">{conv.customer.email}</p>
                <p className="text-xs mt-1 truncate">{conv.lastMessage}</p>
              </button>
            ))
          )}
        </aside>

        <div
          className={cn(
            "flex-1 flex flex-col min-h-[360px] md:min-h-0",
            !selectedUser ? "hidden md:flex" : "flex"
          )}
        >
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
              <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm sm:text-base text-center">Select a conversation to reply</p>
            </div>
          ) : (
            <>
              <div className="px-3 sm:px-4 py-3 border-b border-border bg-muted/50 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="md:hidden p-1.5 -ml-1 hover:bg-muted rounded-md shrink-0"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">{customer?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{customer?.email}</p>
                </div>
              </div>

              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0"
              >
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[75%]",
                      msg.senderRole === "admin" ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <span className="text-[10px] text-muted-foreground mb-0.5">{msg.senderName}</span>
                    <div
                      className={cn(
                        "px-3 py-2 text-sm break-words",
                        msg.senderRole === "admin"
                          ? "bg-foreground text-background"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(msg.createdAt).toLocaleString("en-PK")}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleReply}
                className="flex gap-2 p-3 sm:p-4 border-t border-border bg-background shrink-0"
              >
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onBlur={() => selectedUser && stopTyping(selectedUser)}
                  placeholder="Type your reply..."
                  className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 border border-border bg-background text-sm focus:outline-none focus:border-foreground"
                />
                <Button type="submit" loading={sending} disabled={!reply.trim()} className="shrink-0">
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
