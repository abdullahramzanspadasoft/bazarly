import Link from "next/link";
import { Share2, MessageCircle, Globe, Mail } from "lucide-react";

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

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-4">BAZAARLY</h3>
            <p className="text-background/60 text-sm leading-relaxed mb-4">
              Premium fashion and luxury timepieces for the discerning individual.
              Quality craftsmanship meets modern elegance.
            </p>
            <div className="flex gap-3">
              {[Share2, MessageCircle, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
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
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
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
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
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

        <div className="border-t border-background/20 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">
            &copy; {new Date().getFullYear()} Bazaarly. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-background/50">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>PayPal</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
