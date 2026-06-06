"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FolderOpen, ShoppingCart, ShoppingBag, Heart, Users, UserCog, CreditCard, BarChart3, Trash2, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/deleted", label: "Deleted", icon: Trash2 },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/carts", label: "Carts", icon: ShoppingBag },
  { href: "/admin/wishlists", label: "Wishlists", icon: Heart },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/users", label: "Admins & Users", icon: UserCog },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-56 bg-black text-white flex-shrink-0 hidden md:block">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="font-bold text-sm uppercase tracking-wider">Admin Panel</h2>
        </div>
        <nav className="p-2 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-white sticky top-16 z-30">
          <p className="text-sm font-medium text-neutral-600 hidden sm:block">
            Admin Dashboard
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/admin/messages"
              className="text-sm text-neutral-500 hover:text-black hidden sm:inline"
            >
              Messages
            </Link>
            <AdminNotificationBell />
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
