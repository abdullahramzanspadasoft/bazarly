"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "@/components/chat/ChatWidget";

export default function ChatWidgetWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <ChatWidget />;
}
