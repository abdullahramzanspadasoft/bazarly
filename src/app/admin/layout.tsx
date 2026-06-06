"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Package, FolderOpen, ShoppingCart, ShoppingBag, Heart, Users, UserCog, CreditCard, BarChart3, Trash2, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import AdminFooter from "@/components/admin/AdminFooter";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/deleted", label: "Deleted", icon: Trash2 },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/carts", label: "Carts", icon: ShoppingBag },
  { href: "/admin/wishlists", label: "Wishlists", icon: Heart },
  { href: "/admin/users", label: "Admins & Users", icon: UserCog },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = adminLinks.find((l) => l.href === pathname)?.label ?? "Admin Dashboard";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const renderNavLinks = (onNavigate?: () => void) =>
    adminLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 text-sm transition-colors",
          pathname === link.href
            ? "bg-white text-black"
            : "text-neutral-400 hover:text-white hover:bg-neutral-900"
        )}
      >
        <link.icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{link.label}</span>
      </Link>
    ));

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
      <aside className="w-56 bg-black text-white shrink-0 hidden md:flex md:flex-col">
        <div className="h-14 flex items-center px-4 border-b border-neutral-800 shrink-0">
          <h2 className="font-bold text-sm uppercase tracking-wider">Admin Panel</h2>
        </div>
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {renderNavLinks()}
        </nav>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 top-14 sm:top-16 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-14 sm:top-16 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-black text-white flex flex-col transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-800 shrink-0">
          <h2 className="font-bold text-sm uppercase tracking-wider">Admin Panel</h2>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-2 text-neutral-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {renderNavLinks(() => setMobileOpen(false))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="h-14 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 border-b border-border bg-background/95 backdrop-blur-sm sticky top-14 sm:top-16 z-30 shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 hover:bg-muted rounded-md md:hidden shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm font-medium text-muted-foreground truncate min-w-0 flex-1 md:flex-none">
            <span className="md:hidden">{currentPage}</span>
            <span className="hidden md:inline">Admin Dashboard</span>
          </p>
          <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
            <AdminNotificationBell />
          </div>
        </header>
        <div className="flex-1 p-3 sm:p-6 overflow-auto min-w-0">{children}</div>
        <AdminFooter />
      </div>
    </div>
  );
}
