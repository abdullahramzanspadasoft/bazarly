"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ShopNowButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (status === "loading") return;
    if (session?.user) {
      router.push("/shop");
    } else {
      router.push("/login?callbackUrl=/shop");
    }
  };

  return (
    <Button
      size="lg"
      className="bg-white text-black hover:bg-neutral-200"
      onClick={handleClick}
      disabled={status === "loading"}
    >
      Shop Now <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
}
