"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const isAdmin = session?.user?.role === "admin" && isAdminEmail(session.user.email || "");

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const iconBtnClass = "p-1.5 sm:p-2 hover:bg-muted transition-colors shrink-0";

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          <div className="flex items-center gap-2 sm:gap-8 min-w-0">
            <button
              className="lg:hidden p-1.5 -ml-1 shrink-0"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              href="/"
              className="text-lg sm:text-xl font-bold tracking-[0.15em] sm:tracking-tight truncate hover:opacity-80 transition-opacity"
            >
              BAZAARLY
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium px-3 py-1.5 rounded-sm transition-colors",
                      isActive
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-2 md:gap-3 shrink-0">
            <ThemeToggle className="hidden sm:inline-flex" />

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={iconBtnClass}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link href="/wishlist" className={cn(iconBtnClass, "relative")}>
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className={cn(iconBtnClass, "relative")}>
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAdmin && <AdminNotificationBell />}

            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={iconBtnClass}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <User className="w-5 h-5" />
                </button>
                <div
                  className={cn(
                    "absolute right-0 top-full pt-2 transition-all z-50",
                    userMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                  )}
                >
                  <div className="bg-background border border-border shadow-lg w-52 sm:w-56 py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" /> Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                    >
                      <User className="w-4 h-4 shrink-0" /> Profile
                    </Link>
                    {session.user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      >
                        <Shield className="w-4 h-4 shrink-0" /> Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted w-full text-left text-red-600"
                    >
                      <LogOut className="w-4 h-4 shrink-0" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex px-3 sm:px-4 py-1.5 sm:py-2 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-3 sm:pb-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-border bg-background text-foreground focus:outline-none focus:border-foreground text-sm sm:text-base"
                autoFocus
              />
            </div>
          </form>
        )}
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 top-14 sm:top-16 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "lg:hidden fixed top-14 sm:top-16 left-0 bottom-0 w-full max-w-sm bg-background z-40 transition-transform duration-300 overflow-y-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col p-4 gap-1">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border mb-2 sm:hidden">
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
              className="px-4 py-3 text-base font-medium hover:bg-muted rounded-sm"
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <div className="mt-4 pt-4 border-t border-border space-y-1">
              <p className="px-4 py-1 text-xs text-muted-foreground truncate">{session.user.email}</p>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-base font-medium hover:bg-muted rounded-sm"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-base font-medium hover:bg-muted rounded-sm"
              >
                <User className="w-4 h-4" /> Profile
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-base font-medium hover:bg-muted rounded-sm"
                >
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex items-center gap-2 px-4 py-3 text-base font-medium hover:bg-muted w-full text-left text-red-600 rounded-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base font-medium bg-foreground text-background text-center mt-4 rounded-sm"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
