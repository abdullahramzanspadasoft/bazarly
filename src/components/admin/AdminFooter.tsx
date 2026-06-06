import Link from "next/link";
import { Store, BarChart3, CreditCard, Shield } from "lucide-react";

export default function AdminFooter() {
  const quickLinks = [
    { href: "/", label: "View Store", icon: Store },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/orders", label: "Orders", icon: Shield },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="px-3 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm tracking-wide">BAZAARLY ADMIN</p>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your store with confidence
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm border border-border hover:bg-muted transition-colors rounded-sm"
              >
                <link.icon className="w-3.5 h-3.5 shrink-0" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bazaarly. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Admin panel active
          </p>
        </div>
      </div>
    </footer>
  );
}
