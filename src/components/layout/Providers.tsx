"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/layout/ThemeProvider";
import CartSyncProvider from "@/components/layout/CartSyncProvider";
import ChatWidgetWrapper from "@/components/chat/ChatWidgetWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CartSyncProvider>
          {children}
          <ChatWidgetWrapper />
        </CartSyncProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: "dark:!bg-neutral-900 dark:!text-white",
            style: {
              background: "var(--foreground)",
              color: "var(--background)",
              borderRadius: "0",
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
