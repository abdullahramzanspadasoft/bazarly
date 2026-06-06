import Link from "next/link";
import { Share2, MessageCircle, Globe, Mail, Truck, Shield, RefreshCw, Headphones } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    shop: [
      { href: "/shop", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/shop?bestSeller=true", label: "Best Sellers" },
      { href: "/shop?featured=true", label: "Featured" },
    ],
    company: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
    legal: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  };

  const trustItems = [
    { icon: Truck, label: "Free Shipping", desc: "Orders over $100" },
    { icon: Shield, label: "Secure Payment", desc: "100% protected" },
    { icon: RefreshCw, label: "Easy Returns", desc: "30-day policy" },
    { icon: Headphones, label: "24/7 Support", desc: "Always here" },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="border-b border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="w-5 h-5 shrink-0 mt-0.5 text-background/70" />
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-background/50 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 sm:mb-4">BAZAARLY</h3>
            <p className="text-background/60 text-sm leading-relaxed mb-5 max-w-sm">
              Premium fashion and luxury timepieces for the discerning individual.
              Quality craftsmanship meets modern elegance.
            </p>
            <div className="flex gap-2 sm:gap-3">
              {[Share2, MessageCircle, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="w-9 h-9 border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors rounded-sm"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 sm:mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-background/50 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Bazaarly. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-background/50">
            <span className="px-2 py-1 border border-background/20 rounded-sm">Visa</span>
            <span className="px-2 py-1 border border-background/20 rounded-sm">Mastercard</span>
            <span className="px-2 py-1 border border-background/20 rounded-sm">PayPal</span>
            <span className="px-2 py-1 border border-background/20 rounded-sm">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
