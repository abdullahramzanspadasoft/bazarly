"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 flex-shrink-0">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" /> Dashboard
          </h2>
          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
