import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import ThemeScript from "@/components/layout/ThemeScript";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Bazaarly - Premium Fashion & Luxury Watches",
    template: "%s | Bazaarly",
  },
  description:
    "Discover premium men's suits and luxury watches at Bazaarly. Quality craftsmanship meets modern elegance.",
  keywords: ["fashion", "suits", "watches", "luxury", "e-commerce"],
  openGraph: {
    title: "Bazaarly - Premium Fashion & Luxury Watches",
    description: "Discover premium men's suits and luxury watches at Bazaarly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
