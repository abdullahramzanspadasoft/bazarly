"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, ShoppingBag, ArrowRight, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface WelcomeModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, userName, onClose }: WelcomeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const firstName = userName.split(" ")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, -120],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 30],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute left-1/2 top-1/2 w-1 h-1 bg-white rounded-full"
                style={{ marginLeft: `${(i - 6) * 40}px` }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-background border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-transparent via-foreground to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-8 pt-10 pb-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, damping: 12 }}
                className="w-20 h-20 mx-auto mb-6 bg-foreground text-background flex items-center justify-center relative"
              >
                <Sparkles className="w-9 h-9" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 border-2 border-foreground/30"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2"
              >
                Welcome to
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold tracking-tight mb-2"
              >
                BAZAARLY
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-muted-foreground mb-6"
              >
                Hello, <span className="text-foreground font-semibold">{firstName}</span>!
                <br />
                Your account is ready.
              </motion.p>

              {/* Gift coupon card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="border border-dashed border-foreground/30 bg-muted p-4 mb-8"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Welcome Gift
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-widest mb-1">WELCOME10</p>
                <p className="text-xs text-muted-foreground">
                  10% off your first order
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link href="/shop" className="flex-1" onClick={onClose}>
                  <Button className="w-full" size="lg">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Start Shopping
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={onClose} className="flex-1">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
