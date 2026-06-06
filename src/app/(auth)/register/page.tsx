"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import WelcomeModal from "@/components/auth/WelcomeModal";
import { registerSchema, type RegisterInput } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    router.push("/");
    router.refresh();
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but login failed. Please sign in.");
        router.push("/login");
        return;
      }

      setUserName(data.name);
      setShowWelcome(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        userName={userName}
        onClose={handleWelcomeClose}
      />

      <div className="min-h-[calc(100vh-4rem)] flex">
        <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold tracking-tight mb-4">JOIN US</h1>
            <p className="text-background/60 text-lg max-w-md">
              Create an account to enjoy exclusive deals, track orders, and manage your wishlist.
            </p>
          </motion.div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-2">Create account</h2>
            <p className="text-muted-foreground mb-8">Join Bazaarly and start shopping</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
