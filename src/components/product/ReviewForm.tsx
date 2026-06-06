"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import { reviewSchema } from "@/lib/validations";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  if (!session) {
    return (
      <p className="text-sm text-neutral-500">
        <Link href="/login" className="font-medium hover:underline">Sign in</Link> to leave a review.
      </p>
    );
  }

  const onSubmit = async (data: { comment: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: data.comment }),
      });

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error);
        return;
      }

      toast.success("Review submitted!");
      reset();
      window.location.reload();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4 p-4 border border-neutral-200">
      <h3 className="font-semibold">Write a Review</h3>
      <div>
        <label className="text-sm font-medium mb-1 block">Rating</label>
        <StarRating rating={rating} interactive onChange={setRating} />
      </div>
      <div>
        <textarea
          {...register("comment")}
          rows={3}
          placeholder="Share your experience..."
          className="w-full px-4 py-2.5 border border-neutral-300 focus:outline-none focus:border-black text-sm"
        />
        {errors.comment && (
          <p className="text-sm text-red-500 mt-1">{errors.comment.message as string}</p>
        )}
      </div>
      <Button type="submit" loading={loading} size="sm">
        Submit Review
      </Button>
    </form>
  );
}
