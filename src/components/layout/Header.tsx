"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import {
  Search, ShoppingBag, Heart, User, Menu, X, LogOut, LayoutDashboard, Shield,
  Sun, Moon, Store, Grid3X3, Info, Mail, ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import { isAdminEmail } from "@/lib/admin-users";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/categories", label: "Categories", icon: Grid3X3 },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const isAdmin = session?.user?.role === "admin" && isAdminEmail(session.user.email || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const mobileDrawer = (
    <>
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-[60] w-[min(100vw,20rem)] bg-foreground text-background flex flex-col shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="relative px-5 pt-6 pb-5 border-b border-background/10">
          <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-background/50 mb-1">Menu</p>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="text-xl font-bold tracking-[0.15em] hover:opacity-80 transition-opacity"
              >
                BAZAARLY
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-full border border-background/20 hover:bg-background/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {session ? (
            <div className="relative mt-4 flex items-center gap-3 rounded-lg bg-background/10 px-3 py-3">
              <div className="w-10 h-10 rounded-full bg-background text-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name || "Welcome back"}</p>
                <p className="text-xs text-background/50 truncate">{session.user.email}</p>
              </div>
            </div>
          ) : (
            <p className="relative mt-4 text-sm text-background/60 leading-relaxed">
              Sign in to track orders, save wishlists, and checkout faster.
            </p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.25em] text-background/40">Explore</p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground"
                    : "text-background/80 hover:bg-background/10 hover:text-background"
                )}
              >
                <span className="flex items-center gap-3">
                  <link.icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-background/10">
            <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.25em] text-background/40">Quick Access</p>
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium text-background/80 hover:bg-background/10 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="text-[10px] bg-background text-foreground px-1.5 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium text-background/80 hover:bg-background/10 transition-colors"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                Cart
                {cartCount > 0 && (
                  <span className="text-[10px] bg-background text-foreground px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          </div>

          {session && (
            <div className="pt-4 mt-2 border-t border-background/10 space-y-1">
              <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.25em] text-background/40">Account</p>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-background/80 hover:bg-background/10 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-background/80 hover:bg-background/10 transition-colors"
              >
                <User className="w-4 h-4" /> Profile
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-background/80 hover:bg-background/10 transition-colors"
                >
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
            </div>
          )}
        </nav>

        <div className="shrink-0 p-4 border-t border-background/10 space-y-3 bg-foreground">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-background/50">Appearance</span>
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-background/40" />
              <ThemeToggle />
              <Moon className="w-3.5 h-3.5 text-background/40" />
            </div>
          </div>

          {session ? (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                signOut({ callbackUrl: "/login" });
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center py-3 rounded-lg border border-background/30 text-sm font-medium hover:bg-background/10 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center py-3 rounded-lg bg-background text-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Join Us
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-8 min-w-0">
              <button
                type="button"
                className="lg:hidden p-1.5 -ml-1 shrink-0 hover:bg-muted rounded-md transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
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
                type="button"
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
                    type="button"
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
                        type="button"
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
      </header>

      {mounted ? createPortal(mobileDrawer, document.body) : null}
    </>
  );
}
