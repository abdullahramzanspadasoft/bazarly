"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, CreditCard, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatPrice } from "@/lib/utils";

interface MessageNotification {
  type: "message";
  _id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  message: string;
  createdAt: string;
}

interface PaymentNotification {
  type: "payment";
  _id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  createdAt: string;
}

type Notification = MessageNotification | PaymentNotification;

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [panelStyle, setPanelStyle] = useState<{ top: number; right: number; left: number }>({
    top: 0,
    right: 12,
    left: 12,
  });
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
      setNotifications(data.notifications || []);

      if (!initialLoadRef.current) {
        for (const n of data.notifications || []) {
          const key = `${n.type}-${n._id}`;
          if (!seenIdsRef.current.has(key)) {
            seenIdsRef.current.add(key);
            if (n.type === "message") {
              toast(`New message from ${n.customerName}: ${n.message.slice(0, 50)}${n.message.length > 50 ? "…" : ""}`, {
                icon: "💬",
                duration: 5000,
              });
            } else {
              toast(`Payment successful — ${n.customerName} paid ${formatPrice(n.amount)} (${n.orderNumber})`, {
                icon: "💰",
                duration: 6000,
              });
            }
          }
        }
      } else {
        (data.notifications || []).forEach((n: Notification) =>
          seenIdsRef.current.add(`${n.type}-${n._id}`)
        );
        initialLoadRef.current = false;
      }
    } catch {
      // silent
    }
  };

  const markPaymentRead = async (paymentId: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
    } catch {
      // silent
    }
  };

  const updatePanelPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      setPanelStyle({ top: rect.bottom + 8, right: 12, left: 12 });
    } else {
      setPanelStyle({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
        left: Math.max(12, rect.right - 320),
      });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePanelPosition();
    const onResize = () => updatePanelPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const dropdown = open && mounted ? (
    <>
      <div
        className="fixed inset-0 z-[200] bg-transparent"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className="fixed z-[201] w-auto sm:w-80 bg-background border border-border shadow-xl max-h-[70vh] sm:max-h-96 overflow-hidden flex flex-col pointer-events-auto"
        style={{ top: panelStyle.top, right: panelStyle.right, left: panelStyle.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No new notifications</p>
          ) : (
            notifications.map((n) =>
              n.type === "message" ? (
                <Link
                  key={`message-${n._id}`}
                  href={`/admin?userId=${n.userId}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 border-b border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <p className="text-sm font-medium truncate">{n.customerName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{n.customerEmail}</p>
                  <p className="text-sm mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString("en-PK")}
                  </p>
                </Link>
              ) : (
                <Link
                  key={`payment-${n._id}`}
                  href="/admin/payments"
                  onClick={() => {
                    markPaymentRead(n._id);
                    setOpen(false);
                  }}
                  className="block px-4 py-3 border-b border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-green-600" />
                    <p className="text-sm font-medium truncate">Payment received</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {n.customerName} · {n.orderNumber}
                  </p>
                  <p className="text-sm font-semibold text-green-700 mt-1">
                    {formatPrice(n.amount)} · {n.method}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString("en-PK")}
                  </p>
                </Link>
              )
            )
          )}
        </div>

        <div className="border-t border-border grid grid-cols-2 text-center text-sm shrink-0 relative z-[202]">
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="py-3 font-medium hover:bg-muted border-r border-border"
          >
            Messages
          </Link>
          <Link
            href="/admin/payments"
            onClick={() => setOpen(false)}
            className="py-3 font-medium hover:bg-muted"
          >
            Payments
          </Link>
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 hover:bg-muted rounded-full transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className={cn("w-5 h-5", unreadCount > 0 && "animate-pulse")} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {mounted && dropdown ? createPortal(dropdown, document.body) : null}
    </div>
  );
}
