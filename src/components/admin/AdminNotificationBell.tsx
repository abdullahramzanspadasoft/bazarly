"use client";

import { useEffect, useRef, useState } from "react";
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

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

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className={cn("w-5 h-5", unreadCount > 0 && "animate-pulse")} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-neutral-200 shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">No new notifications</p>
              ) : (
                notifications.map((n) =>
                  n.type === "message" ? (
                    <Link
                      key={`message-${n._id}`}
                      href={`/admin/messages?userId=${n.userId}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <p className="text-sm font-medium truncate">{n.customerName}</p>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">{n.customerEmail}</p>
                      <p className="text-sm text-neutral-700 mt-1 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-neutral-400 mt-1">
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
                      className="block px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-green-600" />
                        <p className="text-sm font-medium truncate">Payment received</p>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {n.customerName} · {n.orderNumber}
                      </p>
                      <p className="text-sm font-semibold text-green-700 mt-1">
                        {formatPrice(n.amount)} · {n.method}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {new Date(n.createdAt).toLocaleString("en-PK")}
                      </p>
                    </Link>
                  )
                )
              )}
            </div>

            <div className="border-t border-neutral-200 grid grid-cols-2 text-center text-sm">
              <Link
                href="/admin/messages"
                onClick={() => setOpen(false)}
                className="py-3 font-medium hover:bg-neutral-50 border-r border-neutral-200"
              >
                Messages
              </Link>
              <Link
                href="/admin/payments"
                onClick={() => setOpen(false)}
                className="py-3 font-medium hover:bg-neutral-50"
              >
                Payments
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
