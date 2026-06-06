"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i + 1)}
          className={cn(interactive && "cursor-pointer hover:scale-110 transition-transform")}
        >
          <Star
            className={cn(
              sizes[size],
              i < Math.round(rating)
                ? "fill-black text-black"
                : "fill-neutral-200 text-neutral-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}
