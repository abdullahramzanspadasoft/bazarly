"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Search, ShoppingBag, Heart, User, Menu, X, LogOut, LayoutDashboard, Shield, Sun, Moon,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import { isAdminEmail } from "@/lib/admin-users";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const isAdmin = session?.user?.role === "admin" && isAdminEmail(session.user.email || "");

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="text-xl font-bold tracking-tight">
              BAZAARLY
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-muted transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link href="/wishlist" className="p-2 hover:bg-muted transition-colors relative">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="p-2 hover:bg-muted transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAdmin && <AdminNotificationBell />}

            {session ? (
              <div className="relative group">
                <button className="p-2 hover:bg-muted transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-background border border-border shadow-lg w-48 py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    {session.user.role === "admin" && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                        <Shield className="w-4 h-4" /> Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted w-full text-left text-red-600"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-border bg-background text-foreground focus:outline-none focus:border-foreground"
                autoFocus
              />
            </div>
          </form>
        )}
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-0 top-16 bg-background z-30 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col p-4 gap-1">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border mb-2">
            <span className="text-sm font-medium">Theme</span>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <ThemeToggle />
              <Moon className="w-4 h-4" />
            </div>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          {!session && (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base font-medium bg-foreground text-background text-center mt-4"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
