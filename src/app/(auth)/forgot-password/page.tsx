"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error);
        return;
      }

      setSent(true);
      toast.success("Reset link sent!");
      if (result.resetToken) {
        toast.success(`Dev token: ${result.resetToken}`, { duration: 10000 });
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <h2 className="text-2xl font-bold mb-2">Forgot password?</h2>
        <p className="text-neutral-500 mb-8">
          {sent
            ? "Check your email for a reset link. If you don't see it, check your spam folder."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {!sent && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Send Reset Link
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
